import { schwarzschildRadiusKm } from '../constants/physicalUnits';

/**
 * Human-readable black-hole physics derived from mass (solar masses) and the
 * dimensionless spin a* ∈ [0, 1). Radii are returned in gravitational radii
 * (r_g = GM/c²) unless a name says otherwise; 1 r_g = 1 world unit in the scene.
 *
 * APPROXIMATIONS (surfaced in educational mode): the ISCO and photon-sphere use
 * the standard prograde-equatorial Kerr relations, but the rest of the
 * simulation is Schwarzschild with a visual spin; the disk temperature and
 * accretion rate shown are order-of-magnitude estimates, not calibrated values.
 */

/** Photon sphere radius (prograde equatorial), r_g. Schwarzschild → 3. */
export function photonSphereRadiusRg(spin: number): number {
    const a = clampSpin(spin);
    return 2 * (1 + Math.cos((2 / 3) * Math.acos(-a)));
}

/** Innermost stable circular orbit (Bardeen, prograde), r_g. a=0 → 6. */
export function iscoRadiusRg(spin: number): number {
    const a = clampSpin(spin);
    const z1 =
        1 +
        Math.cbrt(1 - a * a) *
            (Math.cbrt(1 + a) + Math.cbrt(1 - a));
    const z2 = Math.sqrt(3 * a * a + z1 * z1);
    return 3 + z2 - Math.sqrt((3 - z1) * (3 + z1 + 2 * z2));
}

/** Gravitational time-dilation factor dτ/dt = √(1 − r_s/r) at radius r (r_g). */
export function timeDilationFactor(radiusRg: number): number {
    return Math.sqrt(Math.max(0, 1 - 2 / radiusRg));
}

/** Gravitational redshift z = 1/√(1 − r_s/r) − 1 at radius r (r_g). */
export function gravitationalRedshift(radiusRg: number): number {
    return 1 / Math.sqrt(Math.max(1e-6, 1 - 2 / radiusRg)) - 1;
}

/** Weak-field circular-orbit speed as a fraction of c at radius r (r_g). */
export function orbitalVelocityFraction(radiusRg: number): number {
    return Math.min(0.99, Math.sqrt(1 / radiusRg));
}

/** Order-of-magnitude estimate of the peak disk temperature (kelvin). */
export function estimatedMaxDiskTemperatureK(massSolar: number): number {
    // Thin-disk peak temperature scales roughly as M^(-1/4); anchored to a
    // stellar-mass value. Documented as an estimate.
    return 1.2e7 * Math.pow(10 / massSolar, 0.25);
}

/** Kilometres per gravitational radius for a given mass. */
export function kmPerGravitationalRadius(massSolar: number): number {
    return schwarzschildRadiusKm(massSolar) / 2;
}

function clampSpin(spin: number): number {
    return Math.min(0.998, Math.max(0, spin));
}
