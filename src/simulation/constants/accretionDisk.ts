import {
    ISCO_RADIUS,
    PHOTON_SPHERE_RADIUS,
    GRAVITATIONAL_RADIUS,
} from './blackHole';

/**
 * Accretion-disk scene constants, in the same normalized units as the black-hole
 * constants (1 world unit = r_g).
 *
 * APPROXIMATIONS (documented in educational mode):
 *  - The disk is rendered by a bent-ray volumetric pass, not radiative transfer.
 *  - Light bending uses a calibrated 1/r² pull, not geodesic integration.
 *  - Temperature follows the thin-disk relation T(r) ∝ r^(-3/4) mapped to a
 *    perceptual blackbody-like ramp, not a physically calibrated spectrum.
 */

/** Inner edge at the ISCO (matter inside plunges into the hole). */
export const DISK_INNER_RADIUS = ISCO_RADIUS; // 6 r_g

/** Outer edge where the disk fades into cold, tenuous dust. */
export const DISK_OUTER_RADIUS = 24 * GRAVITATIONAL_RADIUS;

/**
 * Ray-capture radius for the bent-ray march: rays reaching the photon sphere are
 * treated as captured (they would wind onto unstable photon orbits). This forms
 * the dark side of the disk shadow in the disk pass.
 */
export const DISK_CAPTURE_RADIUS = PHOTON_SPHERE_RADIUS; // 3 r_g

/** Base angular speed scale for the differential (Keplerian) rotation. */
export const DISK_ROTATION_SPEED = 0.35;

/** Vertical scale-height factor (H ≈ factor · r): the disk's apparent thickness. */
export const DISK_THICKNESS = 0.09;

/** Overall optical density multiplier of the disk medium. */
export const DISK_DENSITY = 1.0;

/**
 * Light-bending strength for the disk pass. Calibrated by eye so the far side of
 * the disk lenses over/under the shadow (the characteristic curved images) and
 * the visible inner edge aligns with the apparent shadow silhouette.
 */
export const DISK_BEND_STRENGTH = 1.7;
