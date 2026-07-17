import * as THREE from 'three';
import { CameraRig } from '../camera/CameraRig';
import { EventsManager } from '../celestial-objects/EventsManager';
import { SceneCompositor } from './SceneCompositor';
import { CompositorScenesProvider } from './CompositorScenesProvider';
import { SimulationClock } from './SimulationClock';
import { TelemetrySampler } from './TelemetrySampler';
import { AdaptiveQuality } from './AdaptiveQuality';
import { ContextLossHandler } from './ContextLossHandler';
import { ParticlesProvider } from '../particles/ParticlesProvider';
import { ParticleField } from '../particles/ParticleField';
import { DiagramOverlay } from '../educational/DiagramOverlay';

/**
 * Root of the 3D scene graph.
 *
 * Phase 3: the SceneCompositor renders the lensed background and the bent-ray
 * accretion disk (offscreen passes + composite); the black-hole core (shadow +
 * photon ring) is drawn between them. Camera navigation and captured-matter
 * events arrive in later phases.
 */
export function SceneRoot() {
    return (
        <CompositorScenesProvider>
            <ParticlesProvider>
                <color attach="background" args={[VOID_COLOR]} />
                <SimulationClock />
                <TelemetrySampler />
                <AdaptiveQuality />
                <ContextLossHandler />
                <CameraRig />
                <SceneCompositor />
                <EventsManager />
                <ParticleField />
                <DiagramOverlay />
            </ParticlesProvider>
        </CompositorScenesProvider>
    );
}

// Near-black with a barely perceptible cold-blue bias, so the void never reads
// as a flat pure-black fill under tone mapping.
const VOID_COLOR = new THREE.Color(0x04060c);
