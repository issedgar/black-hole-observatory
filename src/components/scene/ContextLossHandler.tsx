import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';

/**
 * Handles WebGL context loss/restore (brief §19). Preventing the default on loss
 * lets the browser and renderer restore the context instead of leaving a dead
 * canvas. Offscreen render targets are recreated by their owners on the next
 * frames after restoration.
 */
export function ContextLossHandler() {
    const gl = useThree((state) => state.gl);

    useEffect(() => {
        const canvas = gl.domElement;
        const onLost = (event: Event) => {
            event.preventDefault();
            console.warn('[Observatory] Contexto WebGL perdido; esperando restauración.');
        };
        const onRestored = () => {
            console.info('[Observatory] Contexto WebGL restaurado.');
        };
        canvas.addEventListener('webglcontextlost', onLost);
        canvas.addEventListener('webglcontextrestored', onRestored);
        return () => {
            canvas.removeEventListener('webglcontextlost', onLost);
            canvas.removeEventListener('webglcontextrestored', onRestored);
        };
    }, [gl]);

    return null;
}
