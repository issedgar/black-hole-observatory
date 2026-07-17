import { useEffect, useMemo, useRef, type ComponentRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useCameraStore } from '../../stores/cameraStore';
import { usePrefsStore } from '../../stores/prefsStore';
import { accretionRuntime } from '../../simulation/runtime/accretionRuntime';

// Default framing (matches the Canvas camera). The minimum orbit distance keeps
// the camera well outside the event horizon and photon ring at all times.
const DEFAULT_POSITION = new THREE.Vector3(0, 4, 34);
const MIN_DISTANCE = 11;
const MAX_DISTANCE = 140;

/**
 * Camera controller. Manual mode uses damped orbit controls (mouse + touch) with
 * a hard minimum distance so the observer can never cross the horizon. Cinematic
 * mode drives a slow, eased choreography (orbit, edge-on and top-down passes,
 * distance breathing) and is interrupted by any direct interaction. All motion
 * is damped and honours the reduced-motion preference.
 */
export function CameraRig() {
    const mode = useCameraStore((state) => state.mode);
    const resetNonce = useCameraStore((state) => state.resetNonce);
    const setMode = useCameraStore((state) => state.setMode);
    const toggleCinematic = useCameraStore((state) => state.toggleCinematic);
    const toggleVista = useCameraStore((state) => state.toggleVista);
    const exitVista = useCameraStore((state) => state.exitVista);
    const requestReset = useCameraStore((state) => state.requestReset);
    const reducedMotion = usePrefsStore((state) => state.reducedMotion);

    const controlsRef = useRef<ComponentRef<typeof OrbitControls>>(null);
    const gl = useThree((state) => state.gl);

    const cineTime = useRef(0);
    const resetting = useRef(false);
    const pathPosition = useMemo(() => new THREE.Vector3(), []);

    // A reset request begins a smooth return to the default framing.
    useEffect(() => {
        if (resetNonce > 0) {
            resetting.current = true;
        }
    }, [resetNonce]);

    // Keyboard shortcuts (interim; Phase 8 HUD buttons drive the same store).
    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            const target = event.target;
            if (
                target instanceof HTMLInputElement ||
                target instanceof HTMLTextAreaElement
            ) {
                return;
            }
            if (event.key === 'c' || event.key === 'C') {
                toggleCinematic();
            } else if (event.key === 'v' || event.key === 'V') {
                toggleVista();
            } else if (event.key === 'r' || event.key === 'R') {
                requestReset();
            } else if (event.key === 'Escape') {
                // Esc leaves the immersive vista (deliberate exit only).
                exitVista();
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [toggleCinematic, toggleVista, exitVista, requestReset]);

    // Any direct interaction interrupts the cinematic camera.
    useEffect(() => {
        if (mode !== 'cinematic') {
            return;
        }
        const element = gl.domElement;
        const interrupt = () => setMode('manual');
        element.addEventListener('pointerdown', interrupt);
        element.addEventListener('wheel', interrupt, { passive: true });
        return () => {
            element.removeEventListener('pointerdown', interrupt);
            element.removeEventListener('wheel', interrupt);
        };
    }, [mode, gl, setMode]);

    useFrame((state, delta) => {
        const controls = controlsRef.current;
        const camera = state.camera;
        // Clamp delta so a stall (e.g. tab refocus) never produces a lurch.
        const dt = Math.min(delta, 0.05);

        const manualIdle = mode === 'manual' && !resetting.current;
        if (controls) {
            controls.enabled = manualIdle;
        }

        if (resetting.current) {
            const k = 1 - Math.exp(-dt * 3.0);
            camera.position.lerp(DEFAULT_POSITION, k);
            camera.lookAt(0, 0, 0);
            if (camera.position.distanceTo(DEFAULT_POSITION) < 0.05) {
                camera.position.copy(DEFAULT_POSITION);
                resetting.current = false;
                if (controls) {
                    controls.enabled = true;
                    controls.update();
                }
            }
            return;
        }

        if (mode === 'cinematic') {
            cineTime.current += dt;
            const t = cineTime.current;
            const slow = reducedMotion ? 0.4 : 1.0;

            const azimuth = t * 0.05 * slow;
            const elevation = THREE.MathUtils.lerp(
                0.12,
                reducedMotion ? 0.5 : 0.9,
                0.5 + 0.5 * Math.sin(t * 0.045 * slow),
            );
            const breathing = THREE.MathUtils.lerp(
                reducedMotion ? 26 : 22,
                reducedMotion ? 44 : 48,
                0.5 + 0.5 * Math.sin(t * 0.03 * slow + 1.0),
            );
            // Pull back during intense accretion/destruction events (brief §6).
            const distance = breathing + accretionRuntime.reaction * 7.0;

            const cosElevation = Math.cos(elevation);
            pathPosition.set(
                distance * cosElevation * Math.sin(azimuth),
                distance * Math.sin(elevation),
                distance * cosElevation * Math.cos(azimuth),
            );
            // Damped follow of the moving path: eases in smoothly from wherever
            // manual control left the camera, with no abrupt cut.
            camera.position.lerp(pathPosition, 1 - Math.exp(-dt * 1.6));
            camera.lookAt(0, 0, 0);
            return;
        }

        if (mode === 'vista') {
            cineTime.current += dt;
            const t = cineTime.current;
            const slow = reducedMotion ? 0.4 : 1.0;

            // Distant, near-edge-on contemplation: the hole sits small and
            // centred against the star field, disc seen almost on-edge. Very slow
            // azimuth drift and a gentle elevation/distance sway read as "watching
            // from afar" without any abrupt motion.
            const azimuth = t * 0.02 * slow;
            const elevation = THREE.MathUtils.lerp(
                0.12,
                reducedMotion ? 0.17 : 0.22,
                0.5 + 0.5 * Math.sin(t * 0.025 * slow),
            );
            const breathing = THREE.MathUtils.lerp(
                62,
                reducedMotion ? 72 : 78,
                0.5 + 0.5 * Math.sin(t * 0.02 * slow + 1.0),
            );
            const distance = breathing + accretionRuntime.reaction * 8.0;

            const cosElevation = Math.cos(elevation);
            pathPosition.set(
                distance * cosElevation * Math.sin(azimuth),
                distance * Math.sin(elevation),
                distance * cosElevation * Math.cos(azimuth),
            );
            // Gentle damped dolly-out from wherever the camera was, no cut.
            camera.position.lerp(pathPosition, 1 - Math.exp(-dt * 1.2));
            camera.lookAt(0, 0, 0);
            return;
        }

        // Manual: OrbitControls (with damping) owns the camera.
        cineTime.current = 0;
    });

    return (
        <OrbitControls
            ref={controlsRef}
            makeDefault
            enablePan={false}
            enableDamping
            dampingFactor={0.06}
            rotateSpeed={0.5}
            zoomSpeed={0.6}
            minDistance={MIN_DISTANCE}
            maxDistance={MAX_DISTANCE}
            target={[0, 0, 0]}
        />
    );
}
