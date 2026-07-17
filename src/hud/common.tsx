import type { ReactNode } from 'react';
import styles from './hud.module.css';

type PanelPlace = 'topLeft' | 'topRight' | 'bottomLeft';

const PLACE_CLASS: Record<PanelPlace, string> = {
    topLeft: styles.panelTopLeft,
    topRight: styles.panelTopRight,
    bottomLeft: styles.panelBottomLeft,
};

interface PanelProps {
    title: string;
    place: PanelPlace;
    children: ReactNode;
    collapsible?: boolean;
    open?: boolean;
    onToggle?: () => void;
}

export function Panel({
    title,
    place,
    children,
    collapsible = false,
    open = true,
    onToggle,
}: PanelProps) {
    return (
        <section className={`${styles.panel} ${PLACE_CLASS[place]}`}>
            <div className={styles.panelHeader}>
                <h2 className={styles.panelTitle}>{title}</h2>
                {collapsible && (
                    <button
                        type="button"
                        className={styles.collapseButton}
                        onClick={onToggle}
                        aria-expanded={open}
                        aria-label={open ? `Colapsar ${title}` : `Expandir ${title}`}
                    >
                        {open ? '–' : '+'}
                    </button>
                )}
            </div>
            {open && <div className={styles.panelBody}>{children}</div>}
        </section>
    );
}

interface ReadoutProps {
    label: string;
    value: string;
    unit?: string;
    approximate?: boolean;
}

export function Readout({ label, value, unit, approximate }: ReadoutProps) {
    return (
        <div className={styles.readout}>
            <span className={styles.readoutLabel}>{label}</span>
            <span className={styles.readoutValue}>
                {approximate && (
                    <span
                        className={styles.readoutApprox}
                        title="Valor estimado / aproximado"
                    >
                        ≈
                    </span>
                )}
                {value}
                {unit && <span className={styles.readoutUnit}>{unit}</span>}
            </span>
        </div>
    );
}

export function Section({
    title,
    children,
}: {
    title: string;
    children: ReactNode;
}) {
    return (
        <div className={styles.section}>
            <div className={styles.sectionTitle}>{title}</div>
            {children}
        </div>
    );
}

interface SliderProps {
    label: string;
    value: number;
    min: number;
    max: number;
    step: number;
    display: string;
    onChange: (value: number) => void;
}

export function Slider({
    label,
    value,
    min,
    max,
    step,
    display,
    onChange,
}: SliderProps) {
    return (
        <label className={styles.control}>
            <span className={styles.controlLabel}>
                <span>{label}</span>
                <span className={styles.controlValue}>{display}</span>
            </span>
            <input
                type="range"
                className={styles.slider}
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(event) => onChange(parseFloat(event.target.value))}
                aria-label={label}
            />
        </label>
    );
}

interface ToggleButtonProps {
    label: string;
    active: boolean;
    onClick: () => void;
}

export function ToggleButton({ label, active, onClick }: ToggleButtonProps) {
    return (
        <button
            type="button"
            className={`${styles.button} ${active ? styles.buttonActive : ''}`}
            onClick={onClick}
            aria-pressed={active}
        >
            {label}
        </button>
    );
}

export function ActionButton({
    label,
    onClick,
}: {
    label: string;
    onClick: () => void;
}) {
    return (
        <button type="button" className={styles.button} onClick={onClick}>
            {label}
        </button>
    );
}

interface SelectControlProps {
    label: string;
    value: string;
    options: readonly { value: string; label: string }[];
    onChange: (value: string) => void;
}

export function SelectControl({
    label,
    value,
    options,
    onChange,
}: SelectControlProps) {
    return (
        <label className={styles.control}>
            <span className={styles.controlLabel}>{label}</span>
            <select
                className={styles.select}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                aria-label={label}
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </label>
    );
}

export function ButtonRow({ children }: { children: ReactNode }) {
    return <div className={styles.buttonRow}>{children}</div>;
}
