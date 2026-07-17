import { useEffect, useState } from 'react';
import { useTelemetryStore } from '../stores/telemetryStore';
import { useVisualStore } from '../stores/visualStore';
import { usePhysicsStore } from '../stores/physicsStore';
import styles from './hud.module.css';

const QUALITY_LABEL: Record<string, string> = {
    low: 'BAJA',
    medium: 'MEDIA',
    high: 'ALTA',
    ultra: 'ULTRA',
};

function formatElapsed(seconds: number): string {
    const total = Math.floor(seconds);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export function Header() {
    const fps = useTelemetryStore((state) => state.fps);
    const simTime = useTelemetryStore((state) => state.simTimeSec);
    const quality = useVisualStore((state) => state.qualityProfile);
    const spin = usePhysicsStore((state) => state.spin);

    const [localTime, setLocalTime] = useState(() =>
        new Date().toLocaleTimeString('es-ES'),
    );
    useEffect(() => {
        const id = window.setInterval(
            () => setLocalTime(new Date().toLocaleTimeString('es-ES')),
            1000,
        );
        return () => window.clearInterval(id);
    }, []);

    return (
        <header className={styles.header}>
            <div className={styles.headerTitle}>
                SIMULACIÓN CÓSMICA <b>//</b> OBSERVATORIO DE AGUJERO NEGRO
            </div>
            <div className={styles.headerSpacer} />
            <div className={styles.headerItem}>
                SYS <span>OBS-01</span>
            </div>
            <div className={styles.headerItem}>
                MODELO <span>Schwarzschild · a*≈{spin.toFixed(2)}</span>
            </div>
            <div className={styles.headerItem}>
                COORD <span>RA 17h45m · DEC −29°00′</span>
            </div>
            <div className={styles.headerItem}>
                HORA <span>{localTime}</span>
            </div>
            <div className={styles.headerItem}>
                T <span>{formatElapsed(simTime)}</span>
            </div>
            <div className={styles.headerItem}>
                FPS <span>{fps}</span>
            </div>
            <div className={styles.headerItem}>
                CAL <span>{QUALITY_LABEL[quality] ?? quality}</span>
            </div>
            <div className={styles.headerItem}>
                RENDER <span className={styles.headerOk}>NOMINAL</span>
            </div>
        </header>
    );
}
