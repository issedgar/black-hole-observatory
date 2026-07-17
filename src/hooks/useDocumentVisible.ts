import { useEffect, useState } from 'react';

/**
 * Tracks page visibility so the render loop can be suspended while the tab is
 * hidden (brief §15). The listener is removed on unmount to avoid leaks.
 */
export function useDocumentVisible(): boolean {
    const [visible, setVisible] = useState(
        () => typeof document === 'undefined' || !document.hidden,
    );

    useEffect(() => {
        const handleVisibilityChange = () => setVisible(!document.hidden);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () =>
            document.removeEventListener(
                'visibilitychange',
                handleVisibilityChange,
            );
    }, []);

    return visible;
}
