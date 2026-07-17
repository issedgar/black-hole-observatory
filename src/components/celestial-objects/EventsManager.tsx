import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useParticlePool } from '../particles/particlePoolContext';
import { useEventStore, type NextEventType } from '../../stores/eventStore';
import { useSimulationStore } from '../../stores/simulationStore';
import { useVisualStore } from '../../stores/visualStore';
import { pulseAccretion } from '../../simulation/runtime/accretionRuntime';
import { simClock } from '../../simulation/runtime/simClock';
import { eventsTelemetry } from '../../simulation/runtime/eventsTelemetry';
import { orbitalVelocityFraction } from '../../simulation/physics/blackHolePhysics';
import type {
    CelestialObjectParams,
    CelestialObjectType,
    EventPhase,
} from '../../types/celestialObject';
import {
    createInitialKinematics,
    createObjectParams,
    pickRandomType,
} from '../../simulation/events/objectFactory';
import {
    advancePhase,
    isDisruptionPhase,
    isTerminalPhase,
} from '../../simulation/events/eventPhases';
import { integrateOrbit } from '../../simulation/trajectories/orbitIntegrator';
import { CelestialObject } from './CelestialObject';

const MAX_ACTIVE_EVENTS = 3;
const INTEGRATION_SOFTENING = 2.0;

interface EventKinematics {
    position: THREE.Vector3;
    velocity: THREE.Vector3;
    phase: EventPhase;
    phaseEnteredAt: number;
    heat: number;
    integrity: number;
    spin: number;
    params: CelestialObjectParams;
    emitAccumulator: number;
    accounted: boolean;
}

interface ObjectRegistration {
    group: THREE.Group;
    material: THREE.ShaderMaterial;
}

/**
 * Drives the captured-matter events: schedules spawns, integrates each body's
 * orbit, runs the state machine, and updates the object transforms and thermal
 * uniform each frame. Reactive descriptors live in the event store (for the HUD);
 * per-frame kinematics live in the local runtime map (AGENTS.md §14).
 */
export function EventsManager() {
    const events = useEventStore((state) => state.events);
    const autoSpawn = useEventStore((state) => state.autoSpawn);
    const spawnIntervalSec = useEventStore((state) => state.spawnIntervalSec);
    const manualSpawnNonce = useEventStore((state) => state.manualSpawnNonce);
    const addEvent = useEventStore((state) => state.addEvent);
    const setPhase = useEventStore((state) => state.setPhase);
    const removeEvent = useEventStore((state) => state.removeEvent);
    const triggerManualSpawn = useEventStore(
        (state) => state.triggerManualSpawn,
    );

    const pool = useParticlePool();
    const registerAccretion = useSimulationStore(
        (state) => state.registerAccretion,
    );
    const runtime = useRef(new Map<string, EventKinematics>());
    const registry = useRef(new Map<string, ObjectRegistration>());
    const idCounter = useRef(0);
    const simTime = useRef(0);
    const lastSpawn = useRef(0);

    // Reusable temporaries (no per-frame allocation).
    const worldDir = useMemo(() => new THREE.Vector3(), []);
    const localDir = useMemo(() => new THREE.Vector3(), []);
    const invQuat = useMemo(() => new THREE.Quaternion(), []);

    const spawn = useCallback(
        (requested: NextEventType) => {
            const type: CelestialObjectType =
                requested === 'random' ? pickRandomType() : requested;
            const params = createObjectParams(type);
            const { position, velocity } = createInitialKinematics();
            const id = `evt-${++idCounter.current}`;
            const now = simTime.current;

            runtime.current.set(id, {
                position,
                velocity,
                phase: 'detection',
                phaseEnteredAt: now,
                heat: 0,
                integrity: 1,
                spin: (Math.random() - 0.5) * 0.7,
                params,
                emitAccumulator: 0,
                accounted: false,
            });
            addEvent({ id, type, params, phase: 'detection', spawnedAt: now });
            lastSpawn.current = now;
        },
        [addEvent],
    );

    // Seed one event shortly after load so the scene is never empty.
    useEffect(() => {
        spawn('random');
    }, [spawn]);

    // Manual trigger (store nonce; keyboard 'E' below, HUD button in Phase 8).
    const firstNonce = useRef(manualSpawnNonce);
    useEffect(() => {
        if (manualSpawnNonce !== firstNonce.current) {
            spawn(useEventStore.getState().nextType);
        }
    }, [manualSpawnNonce, spawn]);

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            const target = event.target;
            if (
                target instanceof HTMLInputElement ||
                target instanceof HTMLTextAreaElement
            ) {
                return;
            }
            if (event.key === 'e' || event.key === 'E') {
                triggerManualSpawn();
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [triggerManualSpawn]);

    const onReady = useCallback(
        (id: string, group: THREE.Group, material: THREE.ShaderMaterial) => {
            registry.current.set(id, { group, material });
            const kinematics = runtime.current.get(id);
            if (kinematics) {
                group.position.copy(kinematics.position);
            }
        },
        [],
    );

    const onRelease = useCallback((id: string) => {
        registry.current.delete(id);
    }, []);

    // Reusable emit options object (ref, not memo) to avoid per-frame allocation.
    const emitOptions = useRef({
        radius: 0,
        speedSpread: 0,
        temperature: 0,
        size: 0,
        life: 0,
        drag: 0,
    });

    const emitFragmentBurst = useCallback(
        (kinematics: EventKinematics) => {
            const r = kinematics.params.radiusWorld;
            const speed = kinematics.velocity.length();
            const options = emitOptions.current;
            const density = useVisualStore.getState().particleDensity;

            // Main debris burst: preserves the orbital direction (no explosion).
            options.radius = r;
            options.speedSpread = speed * 0.25 + 0.15;
            options.temperature = 1;
            options.size = r * 2.2;
            options.life = 2.8;
            options.drag = 0.15;
            pool.emit(
                kinematics.position,
                kinematics.velocity,
                Math.round((95 + r * 26) * density),
                options,
            );

            // A brief, larger, hotter flash marking the break-up.
            options.radius = r * 1.4;
            options.speedSpread = speed * 0.35 + 0.2;
            options.temperature = 1;
            options.size = r * 4.5;
            options.life = 0.7;
            options.drag = 0.25;
            pool.emit(
                kinematics.position,
                kinematics.velocity,
                Math.round(24 * density),
                options,
            );
        },
        [pool],
    );

    const emitTrail = useCallback(
        (kinematics: EventKinematics) => {
            const r = kinematics.params.radiusWorld;
            const speed = kinematics.velocity.length();
            const options = emitOptions.current;
            options.radius = r * 0.6;
            options.speedSpread = speed * 0.15 + 0.1;
            options.temperature = 0.85;
            options.size = r * 1.5;
            options.life = 2.2;
            options.drag = 0.2;
            pool.emit(kinematics.position, kinematics.velocity, 2, options);
        },
        [pool],
    );

    useFrame(() => {
        const now = simClock.time;
        simTime.current = now;
        const dt = simClock.scaledDelta;

        // Scheduler (respects pause via the frozen clock).
        if (
            autoSpawn &&
            runtime.current.size < MAX_ACTIVE_EVENTS &&
            now - lastSpawn.current > spawnIntervalSec
        ) {
            spawn('random');
        }

        const toRemove: string[] = [];
        let primary: EventKinematics | null = null;
        let primaryRadius = Infinity;

        runtime.current.forEach((kinematics, id) => {
            integrateOrbit(
                kinematics.position,
                kinematics.velocity,
                dt,
                INTEGRATION_SOFTENING,
            );

            const radius = kinematics.position.length();
            if (radius < primaryRadius) {
                primaryRadius = radius;
                primary = kinematics;
            }

            // Thermal response: heat rises as the body nears the hole and, once
            // it is being disrupted, must be HIGH from the very first frame of
            // stretching.
            //
            // Captured bodies are rendered into the lensed background, so the
            // black-hole field samples them (bent rays that pass above/below the
            // edge-on disk pick up the body's image and duplicate it — the
            // intended Einstein-arc lensing). A *bright* elongated body smears
            // into those arcs and reads as lensing; a *dark* one smears into a
            // hard black bar across the scene. The disruption stretch begins the
            // instant the phase does, so if the glow ramps in behind it the body
            // spends its first stretched frames dark and paints that bar. Snap
            // the glow to a high floor on the whole disruption sequence (not a
            // slow ramp) so a deforming body is never dark while elongated.
            const proximityHeat = THREE.MathUtils.clamp(
                (30 - radius) / 26,
                0,
                1,
            );
            const disrupting = isDisruptionPhase(kinematics.phase);
            const targetHeat = disrupting
                ? 1.0
                : proximityHeat * 0.6;
            const heatRate = disrupting ? 8.0 : 1.5;
            kinematics.heat +=
                (targetHeat - kinematics.heat) * Math.min(1, dt * heatRate);
            if (disrupting) {
                kinematics.integrity = Math.max(
                    0,
                    kinematics.integrity - dt * 0.25,
                );
            }

            // State machine.
            const timeInPhase = now - kinematics.phaseEnteredAt;
            const nextPhase = advancePhase(
                kinematics.phase,
                radius,
                timeInPhase,
            );
            if (nextPhase !== kinematics.phase) {
                kinematics.phase = nextPhase;
                kinematics.phaseEnteredAt = now;
                setPhase(id, nextPhase);

                // Entering disruption: jump the glow to a high floor on the same
                // frame the stretch starts, so the body is never dark while
                // elongated (see the thermal-response note above).
                if (isDisruptionPhase(nextPhase)) {
                    kinematics.heat = Math.max(kinematics.heat, 0.85);
                }

                if (nextPhase === 'fragmentation') {
                    emitFragmentBurst(kinematics);
                }
                if (nextPhase === 'accretion' && !kinematics.accounted) {
                    kinematics.accounted = true;
                    pulseAccretion(1.0);
                    registerAccretion(kinematics.params.massSolar);
                }
            }

            // Trailing plasma while the body is disrupted / accreting.
            if (
                kinematics.phase === 'fragmentation' ||
                kinematics.phase === 'accretion'
            ) {
                kinematics.emitAccumulator += dt;
                while (kinematics.emitAccumulator > 0.04) {
                    kinematics.emitAccumulator -= 0.04;
                    emitTrail(kinematics);
                }
            }

            if (isTerminalPhase(kinematics.phase) && timeInPhase > 1.2) {
                toRemove.push(id);
                return;
            }

            const registration = registry.current.get(id);
            if (registration) {
                registration.group.position.copy(kinematics.position);
                registration.group.rotation.y += kinematics.spin * dt;
                // During dissipation the remnant shrinks away as it is absorbed.
                const dissipating = kinematics.phase === 'dissipation';
                const scale = dissipating
                    ? Math.max(0, 1 - timeInPhase / 1.8)
                    : 1;
                registration.group.scale.setScalar(scale);

                const uniforms = registration.material.uniforms;
                uniforms.uHeat.value = kinematics.heat;
                // Feed the object-local direction to the hole and the tidal
                // stress so the vertex shader stretches the body correctly.
                if (uniforms.uTidalStrength) {
                    uniforms.uTidalStrength.value = 1 - kinematics.integrity;
                    worldDir
                        .copy(kinematics.position)
                        .multiplyScalar(-1)
                        .normalize();
                    invQuat.copy(registration.group.quaternion).invert();
                    localDir.copy(worldDir).applyQuaternion(invQuat);
                    uniforms.uTidalDir.value.copy(localDir);
                }
            }
        });

        for (const id of toRemove) {
            runtime.current.delete(id);
            registry.current.delete(id);
            removeEvent(id);
        }

        // Publish the primary (closest) object for the HUD telemetry sampler.
        if (primary) {
            const p: EventKinematics = primary;
            const radialInward =
                -p.position.dot(p.velocity) / Math.max(primaryRadius, 1e-3);
            let seconds: number | null = null;
            if (isDisruptionPhase(p.phase)) {
                seconds = 0;
            } else if (radialInward > 0.05 && primaryRadius > 7.2) {
                seconds = Math.min(999, (primaryRadius - 7.2) / radialInward);
            }
            eventsTelemetry.primary = {
                params: p.params,
                phase: p.phase,
                distanceRg: primaryRadius,
                speedFraction: orbitalVelocityFraction(primaryRadius),
                integrity: p.integrity,
                tidal: 1 - p.integrity,
                secondsToDisruption: seconds,
            };
            eventsTelemetry.hasPrimary = true;
            eventsTelemetry.pose.position.copy(p.position);
            eventsTelemetry.pose.velocity.copy(p.velocity);
        } else {
            eventsTelemetry.primary = null;
            eventsTelemetry.hasPrimary = false;
        }
    });

    // Captured bodies render in the MAIN scene, composited over the black-hole
    // field — NOT into the lensed background pass.
    //
    // Rendering them into the background (so the field would bend them into
    // Einstein arcs) had a fatal side effect: the field reconstructs each pixel
    // from a single bent-ray background sample, and a finite body straddling the
    // edge-on disk plane gets smeared by that sampling into a hard, screen-
    // crossing black bar along the receding midplane — present whenever a body is
    // near the disk plane, independent of its own shading (making it bright did
    // not remove it). Drawing the bodies in the foreground instead keeps them as
    // solid lit geometry over the disk. The cost is that they are not themselves
    // gravitationally lensed (brief §12) — an acceptable trade against a constant
    // black-bar artifact (§18/§22); their fragments still feed the accretion flow.
    return (
        <>
            {events.map((event) => (
                <CelestialObject
                    key={event.id}
                    event={event}
                    onReady={onReady}
                    onRelease={onRelease}
                />
            ))}
        </>
    );
}
