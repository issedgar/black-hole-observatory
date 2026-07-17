import {
    Panel,
    Section,
    Slider,
    SelectControl,
    ToggleButton,
    ActionButton,
    ButtonRow,
} from './common';
import { usePhysicsStore } from '../stores/physicsStore';
import { useVisualStore } from '../stores/visualStore';
import { useEventStore, type NextEventType } from '../stores/eventStore';
import { useCameraStore } from '../stores/cameraStore';
import { useUiStore } from '../stores/uiStore';
import { usePrefsStore } from '../stores/prefsStore';
import type { QualityProfile } from '../types/quality';

const EVENT_TYPE_OPTIONS = [
    { value: 'random', label: 'Aleatorio' },
    { value: 'rocky-planet', label: 'Exoplaneta rocoso' },
    { value: 'ice-world', label: 'Mundo helado' },
    { value: 'moon', label: 'Luna' },
    { value: 'asteroid-swarm', label: 'Enjambre de asteroides' },
    { value: 'gas-cloud', label: 'Nube de gas' },
    { value: 'spacecraft', label: 'Nave' },
    { value: 'station-debris', label: 'Restos de estación' },
] as const;

const QUALITY_OPTIONS = [
    { value: 'low', label: 'Baja' },
    { value: 'medium', label: 'Media' },
    { value: 'high', label: 'Alta' },
    { value: 'ultra', label: 'Ultra' },
] as const;

export function ControlsPanel() {
    const physics = usePhysicsStore();
    const visual = useVisualStore();
    const events = useEventStore();
    const cameraMode = useCameraStore((state) => state.mode);
    const toggleCinematic = useCameraStore((state) => state.toggleCinematic);
    const requestReset = useCameraStore((state) => state.requestReset);
    const educationalMode = useUiStore((state) => state.educationalMode);
    const toggleEducationalMode = useUiStore(
        (state) => state.toggleEducationalMode,
    );
    const open = useUiStore((state) => state.controlsOpen);
    const setOpen = useUiStore((state) => state.setControlsOpen);
    const soundEnabled = usePrefsStore((state) => state.soundEnabled);
    const setSoundEnabled = usePrefsStore((state) => state.setSoundEnabled);
    const volume = usePrefsStore((state) => state.volume);
    const setVolume = usePrefsStore((state) => state.setVolume);

    return (
        <Panel
            title="Controles"
            place="bottomLeft"
            collapsible
            open={open}
            onToggle={() => setOpen(!open)}
        >
            <Section title="Simulación">
                <ButtonRow>
                    <ToggleButton
                        label={physics.paused ? 'Reanudar' : 'Pausar'}
                        active={physics.paused}
                        onClick={physics.togglePaused}
                    />
                    <ActionButton
                        label="Generar evento"
                        onClick={events.triggerManualSpawn}
                    />
                </ButtonRow>
                <Slider
                    label="Escala de tiempo"
                    value={physics.timeScale}
                    min={0}
                    max={3}
                    step={0.1}
                    display={`${physics.timeScale.toFixed(1)}×`}
                    onChange={physics.setTimeScale}
                />
                <SelectControl
                    label="Próximo evento"
                    value={events.nextType}
                    options={EVENT_TYPE_OPTIONS}
                    onChange={(value) =>
                        events.setNextType(value as NextEventType)
                    }
                />
                <Slider
                    label="Frecuencia de eventos"
                    value={events.spawnIntervalSec}
                    min={4}
                    max={30}
                    step={1}
                    display={`${events.spawnIntervalSec}s`}
                    onChange={events.setSpawnIntervalSec}
                />
                <ButtonRow>
                    <ToggleButton
                        label="Auto-generación"
                        active={events.autoSpawn}
                        onClick={() => events.setAutoSpawn(!events.autoSpawn)}
                    />
                </ButtonRow>
            </Section>

            <Section title="Cámara y modo">
                <ButtonRow>
                    <ToggleButton
                        label="Cámara cinemática"
                        active={cameraMode === 'cinematic'}
                        onClick={toggleCinematic}
                    />
                    <ActionButton
                        label="Reiniciar cámara"
                        onClick={requestReset}
                    />
                </ButtonRow>
                <ButtonRow>
                    <ToggleButton
                        label="Modo educativo"
                        active={educationalMode}
                        onClick={toggleEducationalMode}
                    />
                </ButtonRow>
            </Section>

            <Section title="Sonido (representación artística)">
                <ButtonRow>
                    <ToggleButton
                        label={soundEnabled ? 'Silenciar' : 'Activar sonido'}
                        active={soundEnabled}
                        onClick={() => setSoundEnabled(!soundEnabled)}
                    />
                </ButtonRow>
                <Slider
                    label="Volumen"
                    value={volume}
                    min={0}
                    max={1}
                    step={0.05}
                    display={`${Math.round(volume * 100)}%`}
                    onChange={setVolume}
                />
            </Section>

            <Section title="Parámetros físicos">
                <Slider
                    label="Masa"
                    value={physics.massSolar}
                    min={5}
                    max={100}
                    step={1}
                    display={`${physics.massSolar.toFixed(0)} M☉`}
                    onChange={physics.setMassSolar}
                />
                <Slider
                    label="Espín a*"
                    value={physics.spin}
                    min={0}
                    max={0.998}
                    step={0.002}
                    display={physics.spin.toFixed(3)}
                    onChange={physics.setSpin}
                />
            </Section>

            <Section title="Parámetros visuales">
                <Slider
                    label="Densidad del disco"
                    value={visual.diskDensity}
                    min={0.2}
                    max={2}
                    step={0.05}
                    display={visual.diskDensity.toFixed(2)}
                    onChange={visual.setDiskDensity}
                />
                <Slider
                    label="Intensidad de lente"
                    value={visual.lensingIntensity}
                    min={0.3}
                    max={1.8}
                    step={0.05}
                    display={visual.lensingIntensity.toFixed(2)}
                    onChange={visual.setLensingIntensity}
                />
                <Slider
                    label="Densidad de partículas"
                    value={visual.particleDensity}
                    min={0}
                    max={2}
                    step={0.1}
                    display={visual.particleDensity.toFixed(1)}
                    onChange={visual.setParticleDensity}
                />
                <Slider
                    label="Exposición"
                    value={visual.exposure}
                    min={0.2}
                    max={1.2}
                    step={0.02}
                    display={visual.exposure.toFixed(2)}
                    onChange={visual.setExposure}
                />
                <Slider
                    label="Bloom"
                    value={visual.bloomStrength}
                    min={0}
                    max={1}
                    step={0.02}
                    display={visual.bloomStrength.toFixed(2)}
                    onChange={visual.setBloomStrength}
                />
                <SelectControl
                    label="Calidad gráfica"
                    value={visual.qualityProfile}
                    options={QUALITY_OPTIONS}
                    onChange={(value) =>
                        visual.setQualityProfile(value as QualityProfile)
                    }
                />
                <ButtonRow>
                    <ToggleButton
                        label="Calidad automática"
                        active={visual.autoQuality}
                        onClick={() =>
                            visual.setAutoQuality(!visual.autoQuality)
                        }
                    />
                </ButtonRow>
            </Section>
        </Panel>
    );
}
