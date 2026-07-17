import * as THREE from 'three';

/**
 * Approximate orbital dynamics for captured matter (brief §7). This is Newtonian
 * gravity with two documented corrections, NOT relativistic geodesic motion:
 *
 *  - a 1/r⁴ term that produces perihelion precession (a qualitative stand-in for
 *    the general-relativistic advance of the orbit),
 *  - a velocity drag that removes orbital energy so the orbit decays and the body
 *    spirals inward instead of tracing a closed ellipse.
 *
 * Values are in normalized units (1 world unit = r_g). GM is chosen for pleasing,
 * cinematic timescales rather than a specific physical mass.
 */

/** Gravitational parameter GM (tuned for cinematic orbital timescales). */
export const ORBIT_GM = 90;

/** Coefficient of the 1/r⁴ precession term. */
const PRECESSION_COEFFICIENT = 60.0;

/** Orbital-energy loss (drag) coefficient. */
const DRAG_COEFFICIENT = 0.11;

/** Sub-steps per frame for integration stability. */
const SUBSTEPS = 4;

const acceleration = new THREE.Vector3();

/**
 * Advances position and velocity in place by `dt` seconds. `softening` avoids a
 * singularity as r → 0.
 */
export function integrateOrbit(
    position: THREE.Vector3,
    velocity: THREE.Vector3,
    dt: number,
    softening: number,
): void {
    const h = dt / SUBSTEPS;
    for (let step = 0; step < SUBSTEPS; step++) {
        const r = Math.max(position.length(), softening);
        const r3 = r * r * r;
        const r5 = r3 * r * r;

        // a = -(GM/r³ + P/r⁵)·position  −  drag·velocity
        acceleration
            .copy(position)
            .multiplyScalar(-(ORBIT_GM / r3 + PRECESSION_COEFFICIENT / r5));
        acceleration.addScaledVector(velocity, -DRAG_COEFFICIENT);

        // Semi-implicit (symplectic) Euler: update velocity, then position.
        velocity.addScaledVector(acceleration, h);
        position.addScaledVector(velocity, h);
    }
}

/** Circular-orbit speed at radius r for the tuned GM. */
export function circularSpeed(radius: number): number {
    return Math.sqrt(ORBIT_GM / radius);
}
