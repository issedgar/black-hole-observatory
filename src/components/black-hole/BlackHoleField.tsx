import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useVisualStore } from '../../stores/visualStore';
import { QUALITY_SETTINGS } from '../../types/quality';
import { resolveIncludes } from '../../utils/shader';
import { simClock } from '../../simulation/runtime/simClock';
import { accretionRuntime } from '../../simulation/runtime/accretionRuntime';
import { GRAVITATIONAL_RADIUS } from '../../simulation/constants/blackHole';
import {
    DISK_INNER_RADIUS,
    DISK_OUTER_RADIUS,
    DISK_ROTATION_SPEED,
    DISK_THICKNESS,
    DISK_DENSITY,
} from '../../simulation/constants/accretionDisk';
import fieldVertexShader from '../../shaders/lensing/lensing.vertex.glsl?raw';
import fieldFragmentSource from '../../shaders/black-hole/blackHoleField.fragment.glsl?raw';
import diskSource from '../../shaders/accretion/disk.glsl?raw';
import noiseSource from '../../shaders/common/noise.glsl?raw';

const ORIGIN = new THREE.Vector3(0, 0, 0);

// The shadow and photon ring are analytic in the impact parameter, so bending
// only needs to be gentle (for the disk rear image and background arcs).
const FIELD_BEND = 2.6;
const FIELD_CAPTURE = 2.0; // event horizon (march termination)
const FIELD_BCRIT = 3 * Math.sqrt(3); // critical impact parameter ≈ 5.196 r_g

interface BlackHoleFieldProps {
    backgroundTexture: THREE.Texture;
}

/**
 * The unified black-hole field pass: one bent-ray march producing shadow, photon
 * ring, lensed background and accretion disk from a single light-bending model
 * (see the fragment shader). Rendered fullscreen into a reduced-resolution
 * target owned by the compositor.
 */
export function BlackHoleField({ backgroundTexture }: BlackHoleFieldProps) {
    const qualityProfile = useVisualStore((state) => state.qualityProfile);
    const marchSteps = QUALITY_SETTINGS[qualityProfile].diskMarchSteps;
    const diskDensity = useVisualStore((state) => state.diskDensity);
    const bend = useVisualStore((state) => state.lensingIntensity);
    const materialRef = useRef<THREE.ShaderMaterial>(null);

    const camRight = useMemo(() => new THREE.Vector3(), []);
    const camUp = useMemo(() => new THREE.Vector3(), []);
    const camForward = useMemo(() => new THREE.Vector3(), []);
    const ndc = useMemo(() => new THREE.Vector3(), []);

    const fragmentShader = useMemo(
        () =>
            resolveIncludes(fieldFragmentSource, {
                noise: noiseSource,
                disk: diskSource,
            }),
        [],
    );

    const uniforms = useMemo(
        () => ({
            uCamPos: { value: new THREE.Vector3() },
            uCamRight: { value: new THREE.Vector3() },
            uCamUp: { value: new THREE.Vector3() },
            uCamForward: { value: new THREE.Vector3() },
            uTanHalfFov: { value: 0.5 },
            uAspect: { value: 1 },
            uCenter: { value: new THREE.Vector2(0.5, 0.5) },
            uBackground: { value: backgroundTexture },
            uTime: { value: 0 },
            uRInner: { value: DISK_INNER_RADIUS },
            uROuter: { value: DISK_OUTER_RADIUS },
            uRg: { value: GRAVITATIONAL_RADIUS },
            uCapture: { value: FIELD_CAPTURE },
            uBCrit: { value: FIELD_BCRIT },
            uRotSpeed: { value: DISK_ROTATION_SPEED },
            uThickness: { value: DISK_THICKNESS },
            uDensity: { value: DISK_DENSITY },
            uBend: { value: FIELD_BEND },
            uReaction: { value: 0 },
            uSteps: { value: marchSteps },
            uPhotonColor: { value: new THREE.Color(0.85, 0.92, 1.0) },
            // Narrow and intense (brief §11): at 0.18 r_g the ring read as a
            // fat generic glow circle; 0.08 keeps it a thin, bright band whose
            // apparent thickness comes mostly from bloom.
            uPhotonIntensity: { value: 4.2 },
            uPhotonWidth: { value: 0.08 },
            uApproachDir: { value: new THREE.Vector2(1, 0) },
        }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    );

    useFrame((state) => {
        const material = materialRef.current;
        if (!material) {
            return;
        }
        const camera = state.camera as THREE.PerspectiveCamera;
        camera.matrixWorld.extractBasis(camRight, camUp, camForward);
        camForward.negate();

        const u = material.uniforms;
        u.uCamPos.value.copy(camera.position);
        u.uCamRight.value.copy(camRight);
        u.uCamUp.value.copy(camUp);
        u.uCamForward.value.copy(camForward);
        u.uTanHalfFov.value = Math.tan(
            (camera.fov * THREE.MathUtils.DEG2RAD) / 2,
        );
        u.uAspect.value = state.size.width / state.size.height;

        ndc.copy(ORIGIN).project(camera);
        u.uCenter.value.set(ndc.x * 0.5 + 0.5, ndc.y * 0.5 + 0.5);

        u.uBackground.value = backgroundTexture;
        u.uTime.value = simClock.time;
        u.uSteps.value = marchSteps;
        u.uDensity.value = DISK_DENSITY * diskDensity;
        u.uBend.value = FIELD_BEND * bend;
        u.uReaction.value = accretionRuntime.reaction;
    });

    return (
        <mesh frustumCulled={false}>
            <planeGeometry args={[2, 2]} />
            <shaderMaterial
                ref={materialRef}
                vertexShader={fieldVertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
                depthTest={false}
                depthWrite={false}
                blending={THREE.NoBlending}
            />
        </mesh>
    );
}
