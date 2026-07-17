import { Component, type ErrorInfo, type ReactNode } from 'react';
import styles from './App.module.css';

interface ErrorBoundaryProps {
    children: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    message: string;
}

/**
 * Catches render-time failures anywhere in the scene tree so a WebGL or shader
 * error degrades to a readable message instead of a blank screen. Runtime
 * context-loss handling (recreating GPU resources) is added with the render
 * loop in later phases; this is the last-resort UI boundary.
 */
export class ErrorBoundary extends Component<
    ErrorBoundaryProps,
    ErrorBoundaryState
> {
    state: ErrorBoundaryState = { hasError: false, message: '' };

    static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
        const message =
            error instanceof Error ? error.message : 'Error desconocido';
        return { hasError: true, message };
    }

    componentDidCatch(error: Error, info: ErrorInfo): void {
        console.error('[Observatory] Error de renderizado:', error, info);
    }

    render(): ReactNode {
        if (!this.state.hasError) {
            return this.props.children;
        }

        return (
            <div className={styles.fallback}>
                <div className={styles.fallbackCard} role="alert">
                    <h1 className={styles.fallbackTitle}>
                        Fallo en el renderizado
                    </h1>
                    <p className={styles.fallbackBody}>
                        La simulación se detuvo por un error inesperado. Recarga
                        la página para reiniciar el observatorio.
                    </p>
                    <p className={styles.fallbackBody}>
                        Detalle técnico: {this.state.message}
                    </p>
                </div>
            </div>
        );
    }
}
