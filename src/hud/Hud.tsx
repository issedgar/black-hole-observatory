import { Header } from './Header';
import { PhysicalParametersPanel } from './PhysicalParametersPanel';
import { DetectedObjectPanel } from './DetectedObjectPanel';
import { ControlsPanel } from './ControlsPanel';
import { EventAlert } from './EventAlert';
import { EducationalPanel } from './educational/EducationalPanel';
import { AudioController } from './AudioController';
import { ViewModeToggle } from './ViewModeToggle';
import { useCameraStore } from '../stores/cameraStore';
import styles from './hud.module.css';

/**
 * Functional UI overlay. Rendered as a DOM layer over the WebGL canvas; the root
 * is pointer-events:none so camera navigation reaches the canvas, and individual
 * panels re-enable interaction. All values come from throttled stores, never the
 * render loop.
 *
 * In the immersive "vista" camera mode every panel fades out (aria-hidden, no
 * pointer events) so only the distant black hole remains; the ViewModeToggle sits
 * outside that group so it stays available as the exit control.
 */
export function Hud() {
    const hidden = useCameraStore((state) => state.mode === 'vista');
    return (
        <div className={styles.hud}>
            <div
                className={hidden ? styles.hudPanelsHidden : styles.hudPanels}
                aria-hidden={hidden}
            >
                <Header />
                <PhysicalParametersPanel />
                <DetectedObjectPanel />
                <ControlsPanel />
                <EventAlert />
                <EducationalPanel />
                <AudioController />
            </div>
            <ViewModeToggle />
        </div>
    );
}
