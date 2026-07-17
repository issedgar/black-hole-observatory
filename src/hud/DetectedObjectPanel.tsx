import { Panel, Readout } from './common';
import { useTelemetryStore } from '../stores/telemetryStore';
import { useUiStore } from '../stores/uiStore';
import type { EventPhase } from '../types/celestialObject';

const PHASE_LABEL: Record<EventPhase, string> = {
    detection: 'Detección',
    approach: 'Aproximación',
    'gravitational-capture': 'Captura gravitacional',
    'unstable-orbit': 'Órbita inestable',
    'tidal-deformation': 'Deformación de marea',
    fragmentation: 'Fragmentación',
    accretion: 'Acreción',
    dissipation: 'Disipación',
    recovery: 'Recuperación',
};

export function DetectedObjectPanel() {
    const detected = useTelemetryStore((state) => state.detectedObject);
    const open = useUiStore((state) => state.objectOpen);
    const setOpen = useUiStore((state) => state.setObjectOpen);

    if (!detected) {
        return null;
    }

    const { params, phase } = detected;
    const disruption =
        detected.secondsToDisruption === null
            ? '—'
            : detected.secondsToDisruption === 0
              ? 'En curso'
              : `${detected.secondsToDisruption.toFixed(1)} s`;

    return (
        <Panel
            title="Objeto detectado"
            place="topRight"
            collapsible
            open={open}
            onToggle={() => setOpen(!open)}
        >
            <Readout label="Nombre" value={params.displayName} />
            <Readout label="Composición" value={params.composition} />
            <Readout
                label="Masa"
                value={params.massSolar.toExponential(1)}
                unit="M☉"
            />
            <Readout
                label="Diámetro"
                value={params.diameterKm.toLocaleString('es-ES')}
                unit="km"
            />
            <Readout
                label="Distancia"
                value={(detected.distanceRg / 2).toFixed(1)}
                unit="r_s"
            />
            <Readout
                label="Velocidad"
                value={detected.speedFraction.toFixed(3)}
                unit="c"
            />
            <Readout
                label="Fuerza de marea"
                value={`${Math.round(detected.tidal * 100)}%`}
                approximate
            />
            <Readout
                label="Integridad estructural"
                value={`${Math.round(detected.integrity * 100)}%`}
            />
            <Readout label="Estado" value={PHASE_LABEL[phase]} />
            <Readout label="Tiempo a disrupción" value={disruption} approximate />
        </Panel>
    );
}
