import { forwardRef, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useUiStore } from '../../stores/uiStore';
import { CONCEPTS, type RegionId } from '../../hud/educational/concepts';
import { eventsTelemetry } from '../../simulation/runtime/eventsTelemetry';
import {
    PHOTON_SPHERE_RADIUS,
    ISCO_RADIUS,
    APPARENT_SHADOW_RADIUS,
} from '../../simulation/constants/blackHole';

const ORBIT_RING_RADIUS = 12;
// HDR emissive intensity so the rings read over the bright disk (additive).
const ACTIVE_INTENSITY = 3.4;
const IDLE_INTENSITY = 0.7;

/**
 * Educational diagram overlay (brief §12). When educational mode is on it draws
 * labelled region rings (photon sphere, apparent shadow, ISCO, an orbital ring)
 * and, for tidal concepts, the orbital-velocity and tidal-force vectors on the
 * captured object. The selected concept's region is highlighted. Nothing pauses.
 * Rings render over the disk but are depth-occluded by the shadow sphere.
 */
export function DiagramOverlay() {
    const educationalMode = useUiStore((state) => state.educationalMode);
    const selectedConcept = useUiStore((state) => state.selectedConcept);

    if (!educationalMode) {
        return null;
    }

    const region: RegionId | null =
        CONCEPTS.find((concept) => concept.id === selectedConcept)?.region ??
        null;

    return (
        <group renderOrder={30}>
            <DiagramRing
                radius={PHOTON_SPHERE_RADIUS}
                color="#5ec8ff"
                active={region === 'photon'}
            />
            <DiagramRing
                radius={APPARENT_SHADOW_RADIUS}
                color="#ffffff"
                active={region === 'shadow'}
            />
            <DiagramRing
                radius={ISCO_RADIUS}
                color="#7cffc4"
                active={region === 'isco'}
            />
            <DiagramRing
                radius={ORBIT_RING_RADIUS}
                color="#ffcf6b"
                active={region === 'orbit'}
            />
            <ObjectVectors show={region === 'tidal'} />
        </group>
    );
}

interface DiagramRingProps {
    radius: number;
    color: string;
    active: boolean;
}

function DiagramRing({ radius, color, active }: DiagramRingProps) {
    // HDR colour (values > 1) so the additive ring glows over the bright disk.
    const emissive = useMemo(
        () =>
            new THREE.Color(color).multiplyScalar(
                active ? ACTIVE_INTENSITY : IDLE_INTENSITY,
            ),
        [color, active],
    );
    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} renderOrder={30}>
            <ringGeometry args={[radius - 0.14, radius + 0.14, 200]} />
            <meshBasicMaterial
                color={emissive}
                transparent
                toneMapped={false}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                side={THREE.DoubleSide}
            />
        </mesh>
    );
}

const UP = new THREE.Vector3(0, 1, 0);

function ObjectVectors({ show }: { show: boolean }) {
    const velocityRef = useRef<THREE.Group>(null);
    const tidalRef = useRef<THREE.Group>(null);
    const scratch = useMemo(() => new THREE.Vector3(), []);
    const quaternion = useMemo(() => new THREE.Quaternion(), []);

    useFrame(() => {
        const visible = show && eventsTelemetry.hasPrimary;
        if (velocityRef.current) {
            velocityRef.current.visible = visible;
        }
        if (tidalRef.current) {
            tidalRef.current.visible = visible;
        }
        if (!visible) {
            return;
        }
        const { position, velocity } = eventsTelemetry.pose;

        if (velocityRef.current) {
            velocityRef.current.position.copy(position);
            scratch.copy(velocity).normalize();
            quaternion.setFromUnitVectors(UP, scratch);
            velocityRef.current.quaternion.copy(quaternion);
        }
        if (tidalRef.current) {
            tidalRef.current.position.copy(position);
            scratch.copy(position).multiplyScalar(-1).normalize();
            quaternion.setFromUnitVectors(UP, scratch);
            tidalRef.current.quaternion.copy(quaternion);
        }
    });

    return (
        <>
            <Arrow ref={velocityRef} color="#7cffc4" length={3.5} />
            <Arrow ref={tidalRef} color="#ff6b6b" length={3} />
        </>
    );
}

interface ArrowProps {
    color: string;
    length: number;
}

// A simple +Y-aligned arrow (shaft + head), oriented via the group's quaternion.
const Arrow = forwardRef<THREE.Group, ArrowProps>(function Arrow(
    { color, length },
    ref,
) {
    const shaft = length * 0.7;
    const head = length * 0.3;
    return (
        <group ref={ref} visible={false}>
            <mesh position={[0, shaft / 2, 0]} renderOrder={31}>
                <cylinderGeometry args={[0.05, 0.05, shaft, 8]} />
                <meshBasicMaterial
                    color={color}
                    toneMapped={false}
                    depthTest={false}
                    depthWrite={false}
                    transparent
                />
            </mesh>
            <mesh position={[0, shaft + head / 2, 0]} renderOrder={31}>
                <coneGeometry args={[0.18, head, 12]} />
                <meshBasicMaterial
                    color={color}
                    toneMapped={false}
                    depthTest={false}
                    depthWrite={false}
                    transparent
                />
            </mesh>
        </group>
    );
});
