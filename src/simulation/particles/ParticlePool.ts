import * as THREE from 'three';

/**
 * Pre-allocated particle pool for fragmentation debris, plasma and dust
 * (brief §9). Buffers are allocated once and recycled via a free list, so there
 * is no per-frame allocation. Integration draws particles into the accretion
 * flow: gravity toward the hole, a spring toward the disk plane, and drag.
 */

const PARTICLE_GM = 42;
const PLANE_PULL = 2.6; // spring pulling particles toward the disk plane (y=0)
const SOFTENING = 2.0;
const SUBSTEPS = 2;

export interface EmitOptions {
    /** Spawn jitter radius around the origin (world units). */
    readonly radius: number;
    /** Random velocity spread added to the base velocity. */
    readonly speedSpread: number;
    /** Initial temperature 0..1 (drives colour and brightness). */
    readonly temperature: number;
    /** Base point size. */
    readonly size: number;
    /** Lifetime in seconds. */
    readonly life: number;
    /** Orbital drag 0..1 per second. */
    readonly drag: number;
}

export class ParticlePool {
    readonly capacity: number;

    // Uploaded to the GPU each frame.
    readonly position: Float32Array;
    readonly temperature: Float32Array;
    readonly size: Float32Array;
    readonly alpha: Float32Array;

    // CPU-only state.
    private readonly velocity: Float32Array;
    private readonly age: Float32Array;
    private readonly life: Float32Array;
    private readonly drag: Float32Array;
    private readonly baseSize: Float32Array;
    private readonly baseTemperature: Float32Array;
    private readonly active: Uint8Array;
    private readonly freeList: number[];

    constructor(capacity: number) {
        this.capacity = capacity;
        this.position = new Float32Array(capacity * 3);
        this.temperature = new Float32Array(capacity);
        this.size = new Float32Array(capacity);
        this.alpha = new Float32Array(capacity);
        this.velocity = new Float32Array(capacity * 3);
        this.age = new Float32Array(capacity);
        this.life = new Float32Array(capacity);
        this.drag = new Float32Array(capacity);
        this.baseSize = new Float32Array(capacity);
        this.baseTemperature = new Float32Array(capacity);
        this.active = new Uint8Array(capacity);
        this.freeList = [];
        for (let i = capacity - 1; i >= 0; i--) {
            this.freeList.push(i);
        }
    }

    /** Emits up to `count` particles; silently caps at pool capacity. */
    emit(
        origin: THREE.Vector3,
        baseVelocity: THREE.Vector3,
        count: number,
        options: EmitOptions,
    ): void {
        for (let n = 0; n < count; n++) {
            const index = this.freeList.pop();
            if (index === undefined) {
                return;
            }
            const p = index * 3;
            this.position[p] = origin.x + (Math.random() - 0.5) * 2 * options.radius;
            this.position[p + 1] =
                origin.y + (Math.random() - 0.5) * 2 * options.radius;
            this.position[p + 2] =
                origin.z + (Math.random() - 0.5) * 2 * options.radius;

            // Base velocity preserves the object's orbital direction; the spread
            // is small so fragments do not form a spherical explosion.
            this.velocity[p] =
                baseVelocity.x + (Math.random() - 0.5) * options.speedSpread;
            this.velocity[p + 1] =
                baseVelocity.y + (Math.random() - 0.5) * options.speedSpread;
            this.velocity[p + 2] =
                baseVelocity.z + (Math.random() - 0.5) * options.speedSpread;

            this.age[index] = 0;
            this.life[index] = options.life * (0.7 + Math.random() * 0.6);
            this.drag[index] = options.drag;
            this.baseSize[index] = options.size * (0.6 + Math.random() * 0.8);
            this.baseTemperature[index] =
                options.temperature * (0.8 + Math.random() * 0.2);
            this.active[index] = 1;
            this.alpha[index] = 0;
        }
    }

    /** Integrates all active particles and recycles expired ones. */
    update(dt: number): void {
        const h = dt / SUBSTEPS;
        for (let i = 0; i < this.capacity; i++) {
            if (this.active[i] === 0) {
                continue;
            }
            const p = i * 3;

            for (let s = 0; s < SUBSTEPS; s++) {
                const x = this.position[p];
                const y = this.position[p + 1];
                const z = this.position[p + 2];
                const r = Math.max(Math.hypot(x, y, z), SOFTENING);
                const invR3 = 1 / (r * r * r);
                const gravity = PARTICLE_GM * invR3;

                let vx = this.velocity[p];
                let vy = this.velocity[p + 1];
                let vz = this.velocity[p + 2];

                vx += -gravity * x * h;
                vy += (-gravity * y - PLANE_PULL * y) * h;
                vz += -gravity * z * h;

                const dragFactor = 1 - this.drag[i] * h;
                vx *= dragFactor;
                vy *= dragFactor;
                vz *= dragFactor;

                this.velocity[p] = vx;
                this.velocity[p + 1] = vy;
                this.velocity[p + 2] = vz;

                this.position[p] = x + vx * h;
                this.position[p + 1] = y + vy * h;
                this.position[p + 2] = z + vz * h;
            }

            const age = this.age[i] + dt;
            this.age[i] = age;
            const t = age / this.life[i];
            if (t >= 1) {
                this.active[i] = 0;
                this.alpha[i] = 0;
                this.freeList.push(i);
                continue;
            }

            // Cool over lifetime; fade in quickly, fade out toward the end.
            this.temperature[i] = this.baseTemperature[i] * (1 - t * 0.7);
            const fadeIn = Math.min(1, t / 0.08);
            this.alpha[i] = Math.min(1, (1 - t) * 1.5) * fadeIn;
            this.size[i] = this.baseSize[i] * (0.85 + t * 0.5);
        }
    }
}
