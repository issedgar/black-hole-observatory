import { Panel, Readout, Section } from './common';
import { usePhysicsStore } from '../stores/physicsStore';
import { useVisualStore } from '../stores/visualStore';
import { useTelemetryStore } from '../stores/telemetryStore';
import { useUiStore } from '../stores/uiStore';
import { schwarzschildRadiusKm } from '../simulation/constants/physicalUnits';
import {
    photonSphereRadiusRg,
    iscoRadiusRg,
    timeDilationFactor,
    gravitationalRedshift,
    estimatedMaxDiskTemperatureK,
    kmPerGravitationalRadius,
} from '../simulation/physics/blackHolePhysics';

const km = (value: number) =>
    value.toLocaleString('es-ES', { maximumFractionDigits: 1 });

export function PhysicalParametersPanel() {
    const massSolar = usePhysicsStore((state) => state.massSolar);
    const spin = usePhysicsStore((state) => state.spin);
    const exposure = useVisualStore((state) => state.exposure);
    const cameraDistanceRg = useTelemetryStore(
        (state) => state.cameraDistanceRg,
    );
    const open = useUiStore((state) => state.parametersOpen);
    const setOpen = useUiStore((state) => state.setParametersOpen);

    const kmPerRg = kmPerGravitationalRadius(massSolar);
    const rsKm = schwarzschildRadiusKm(massSolar);
    const photonKm = photonSphereRadiusRg(spin) * kmPerRg;
    const iscoRg = iscoRadiusRg(spin);
    const iscoKm = iscoRg * kmPerRg;
    const dilation = timeDilationFactor(iscoRg);
    const redshift = gravitationalRedshift(iscoRg);
    const tempMK = estimatedMaxDiskTemperatureK(massSolar) / 1e6;
    // Accretion rate: order-of-magnitude estimate (Eddington-fraction anchored).
    const accretionRate = 2.1e-8 * (massSolar / 10);

    return (
        <Panel
            title="Parámetros físicos"
            place="topLeft"
            collapsible
            open={open}
            onToggle={() => setOpen(!open)}
        >
            <Readout label="Masa" value={massSolar.toFixed(1)} unit="M☉" />
            <Readout label="Radio de Schwarzschild" value={km(rsKm)} unit="km" />
            <Readout label="Esfera de fotones" value={km(photonKm)} unit="km" />
            <Readout label="ISCO" value={km(iscoKm)} unit="km" />
            <Readout label="Espín a*" value={spin.toFixed(3)} />
            <Readout
                label="Temp. máx. disco"
                value={tempMK.toFixed(1)}
                unit="MK"
                approximate
            />
            <Readout
                label="Tasa de acreción"
                value={accretionRate.toExponential(1)}
                unit="M☉/año"
                approximate
            />
            <Readout
                label="Dilatación temporal (ISCO)"
                value={dilation.toFixed(3)}
                approximate
            />
            <Readout
                label="Redshift grav. (ISCO)"
                value={redshift.toFixed(3)}
                approximate
            />

            <Section title="Observador">
                <Readout
                    label="Distancia cámara"
                    value={(cameraDistanceRg / 2).toFixed(1)}
                    unit="r_s"
                />
                <Readout label="Exposición" value={exposure.toFixed(2)} />
            </Section>
        </Panel>
    );
}
