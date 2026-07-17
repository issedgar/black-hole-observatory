import styles from './App.module.css';

/**
 * Shown when WebGL2 is unavailable. All user-facing copy is in Spanish, per the
 * project language rules. Accessible: announced as an alert with adequate
 * contrast, no reliance on color alone.
 */
export function WebGLFallback() {
    return (
        <div className={styles.fallback}>
            <div className={styles.fallbackCard} role="alert">
                <h1 className={styles.fallbackTitle}>
                    WebGL2 no disponible
                </h1>
                <p className={styles.fallbackBody}>
                    Este observatorio necesita WebGL2 para renderizar la
                    simulación del agujero negro en tiempo real, y tu navegador
                    o dispositivo no lo tiene activo.
                </p>
                <ul className={styles.fallbackList}>
                    <li>
                        Usa una versión reciente de Chrome, Edge, Firefox o
                        Safari.
                    </li>
                    <li>
                        Comprueba que la aceleración por hardware esté activada
                        en la configuración del navegador.
                    </li>
                    <li>
                        Actualiza los controladores de la tarjeta gráfica si el
                        problema continúa.
                    </li>
                </ul>
            </div>
        </div>
    );
}
