import { useUiStore } from '../../stores/uiStore';
import { CONCEPTS, APPROXIMATIONS } from './concepts';
import styles from '../hud.module.css';

/**
 * Educational overlay panel. Shown when educational mode is on: a selectable set
 * of concepts with clear Spanish explanations and a documented-approximations
 * section. Selecting a concept highlights its region in the scene (via the
 * DiagramOverlay) without pausing the simulation.
 */
export function EducationalPanel() {
    const educationalMode = useUiStore((state) => state.educationalMode);
    const selected = useUiStore((state) => state.selectedConcept);
    const setSelected = useUiStore((state) => state.setSelectedConcept);

    if (!educationalMode) {
        return null;
    }

    const concept = CONCEPTS.find((item) => item.id === selected) ?? null;

    return (
        <section className={styles.eduPanel} aria-label="Modo educativo">
            <h2 className={styles.panelTitle}>Modo educativo</h2>
            <div className={styles.eduChips} role="tablist">
                {CONCEPTS.map((item) => (
                    <button
                        key={item.id}
                        type="button"
                        role="tab"
                        aria-selected={selected === item.id}
                        className={`${styles.eduChip} ${
                            selected === item.id ? styles.eduChipActive : ''
                        }`}
                        onClick={() =>
                            setSelected(selected === item.id ? null : item.id)
                        }
                    >
                        {item.title}
                    </button>
                ))}
            </div>

            {concept && <p className={styles.eduText}>{concept.body}</p>}

            <details className={styles.eduApprox}>
                <summary>Aproximaciones del modelo</summary>
                <ul>
                    {APPROXIMATIONS.map((item) => (
                        <li key={item}>{item}</li>
                    ))}
                </ul>
            </details>
        </section>
    );
}
