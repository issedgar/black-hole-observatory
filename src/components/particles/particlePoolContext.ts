import { createContext, useContext } from 'react';
import type { ParticlePool } from '../../simulation/particles/ParticlePool';

/** Shared particle pool, so events can emit and the field can render/integrate. */
export const ParticlePoolContext = createContext<ParticlePool | null>(null);

export function useParticlePool(): ParticlePool {
    const pool = useContext(ParticlePoolContext);
    if (!pool) {
        throw new Error(
            'useParticlePool must be used within a ParticlesProvider',
        );
    }
    return pool;
}
