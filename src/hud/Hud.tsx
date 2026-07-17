import { Header } from './Header';
import { PhysicalParametersPanel } from './PhysicalParametersPanel';
import { DetectedObjectPanel } from './DetectedObjectPanel';
import { ControlsPanel } from './ControlsPanel';
import { EventAlert } from './EventAlert';
import { EducationalPanel } from './educational/EducationalPanel';
import { AudioController } from './AudioController';
import styles from './hud.module.css';

/**
 * Functional UI overlay. Rendered as a DOM layer over the WebGL canvas; the root
 * is pointer-events:none so camera navigation reaches the canvas, and individual
 * panels re-enable interaction. All values come from throttled stores, never the
 * render loop.
 */
export function Hud() {
    return (
        <div className={styles.hud}>
            <Header />
            <PhysicalParametersPanel />
            <DetectedObjectPanel />
            <ControlsPanel />
            <EventAlert />
            <EducationalPanel />
            <AudioController />
        </div>
    );
}
