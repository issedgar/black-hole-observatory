import { useCameraStore } from '../stores/cameraStore';
import { usePrefsStore } from '../stores/prefsStore';
import styles from './hud.module.css';

/**
 * Floating enter/exit control for the immersive "vista" camera mode. It lives
 * outside the fading panel group so it stays reachable as the exit affordance,
 * and it dims itself while vista is active so it never competes with the scene.
 * A brief "Esc para salir" hint fades in and out on its own (CSS keyframe) each
 * time vista is entered; it unmounts when vista is left.
 */
export function ViewModeToggle() {
    const active = useCameraStore((state) => state.mode === 'vista');
    const toggleVista = useCameraStore((state) => state.toggleVista);
    const reducedMotion = usePrefsStore((state) => state.reducedMotion);

    return (
        <>
            <button
                type="button"
                className={`${styles.viewToggle} ${
                    active ? styles.viewToggleActive : ''
                }`}
                onClick={toggleVista}
                aria-pressed={active}
                aria-label={active ? 'Salir del modo vista' : 'Entrar en modo vista'}
            >
                {active ? 'Salir' : 'Vista'}
            </button>
            {active && (
                <div
                    className={`${styles.viewHint} ${
                        reducedMotion ? '' : styles.viewHintAnimated
                    }`}
                    role="status"
                >
                    Esc para salir
                </div>
            )}
        </>
    );
}
