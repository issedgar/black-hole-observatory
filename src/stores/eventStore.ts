import { create } from 'zustand';
import type {
    ActiveEvent,
    CelestialObjectType,
    EventPhase,
} from '../types/celestialObject';

export type NextEventType = CelestialObjectType | 'random';

/**
 * Reactive event state for the HUD and scheduler configuration. Per-frame
 * kinematics are NOT here — they live in the events runtime updated by the
 * EventsManager. The store only changes on spawn, phase transition, and despawn.
 */
export interface EventState {
    events: ActiveEvent[];
    autoSpawn: boolean;
    spawnIntervalSec: number;
    nextType: NextEventType;

    /** Incremented to request a manual spawn; consumed by the EventsManager. */
    manualSpawnNonce: number;

    addEvent: (event: ActiveEvent) => void;
    setPhase: (id: string, phase: EventPhase) => void;
    removeEvent: (id: string) => void;

    setAutoSpawn: (autoSpawn: boolean) => void;
    setSpawnIntervalSec: (seconds: number) => void;
    setNextType: (type: NextEventType) => void;
    triggerManualSpawn: () => void;
}

export const useEventStore = create<EventState>((set) => ({
    events: [],
    autoSpawn: true,
    spawnIntervalSec: 12,
    nextType: 'random',
    manualSpawnNonce: 0,

    addEvent: (event) => set((state) => ({ events: [...state.events, event] })),
    setPhase: (id, phase) =>
        set((state) => ({
            events: state.events.map((event) =>
                event.id === id ? { ...event, phase } : event,
            ),
        })),
    removeEvent: (id) =>
        set((state) => ({
            events: state.events.filter((event) => event.id !== id),
        })),

    setAutoSpawn: (autoSpawn) => set({ autoSpawn }),
    setSpawnIntervalSec: (spawnIntervalSec) => set({ spawnIntervalSec }),
    setNextType: (nextType) => set({ nextType }),
    triggerManualSpawn: () =>
        set((state) => ({ manualSpawnNonce: state.manualSpawnNonce + 1 })),
}));
