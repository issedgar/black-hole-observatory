import { useEffect } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { WebGLFallback } from './WebGLFallback';
import { CanvasHost } from '../components/scene/CanvasHost';
import { Hud } from '../hud/Hud';
import { useCapabilityDetection } from '../hooks/useCapabilityDetection';
import { useVisualStore } from '../stores/visualStore';
import { usePrefsStore } from '../stores/prefsStore';
import styles from './App.module.css';

/**
 * Application root. Gates the experience behind a WebGL2 check and seeds the
 * quality profile from the capability probe before the Canvas mounts.
 */
export function App() {
    const { webgl2, initialProfile } = useCapabilityDetection();
    const setQualityProfileAuto = useVisualStore(
        (state) => state.setQualityProfileAuto,
    );
    const setReducedMotion = usePrefsStore((state) => state.setReducedMotion);

    useEffect(() => {
        setQualityProfileAuto(initialProfile);
    }, [initialProfile, setQualityProfileAuto]);

    // Keep the reduced-motion preference in sync with the OS setting.
    useEffect(() => {
        const query = window.matchMedia('(prefers-reduced-motion: reduce)');
        const update = () => setReducedMotion(query.matches);
        update();
        query.addEventListener('change', update);
        return () => query.removeEventListener('change', update);
    }, [setReducedMotion]);

    if (!webgl2) {
        return <WebGLFallback />;
    }

    return (
        <div className={styles.shell}>
            <ErrorBoundary>
                <CanvasHost />
            </ErrorBoundary>
            <Hud />
        </div>
    );
}
