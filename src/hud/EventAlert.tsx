import { useTelemetryStore } from '../stores/telemetryStore';
import { isDisruptionPhase } from '../simulation/events/eventPhases';
import styles from './hud.module.css';

/**
 * Critical-event banner. Appears (red, subtle blink, eased in) only while a body
 * is being torn apart, and disappears when the event ends.
 */
export function EventAlert() {
    const detected = useTelemetryStore((state) => state.detectedObject);

    if (!detected || !isDisruptionPhase(detected.phase)) {
        return null;
    }

    const name = detected.params.displayName.toUpperCase();

    return (
        <div className={styles.alert} role="alert">
            <span className={styles.alertDot} aria-hidden="true" />
            EVENTO CRÍTICO: DESTRUCCIÓN DE {name} EN PROGRESO
        </div>
    );
}
