import { useMemo, type ReactNode } from 'react';
import { useVisualStore } from '../../stores/visualStore';
import { QUALITY_SETTINGS } from '../../types/quality';
import { ParticlePool } from '../../simulation/particles/ParticlePool';
import { ParticlePoolContext } from './particlePoolContext';

/** Creates the pooled particle system, sized by the active quality profile. */
export function ParticlesProvider({ children }: { children: ReactNode }) {
    const qualityProfile = useVisualStore((state) => state.qualityProfile);
    const pool = useMemo(
        () => new ParticlePool(QUALITY_SETTINGS[qualityProfile].particleCount),
        [qualityProfile],
    );

    return (
        <ParticlePoolContext.Provider value={pool}>
            {children}
        </ParticlePoolContext.Provider>
    );
}
