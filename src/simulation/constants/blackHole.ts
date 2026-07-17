/**
 * Black-hole scene constants, expressed in normalized units for numerical
 * stability (see plan §2). One gravitational radius r_g = GM/c² maps to one
 * world unit. Physical (kilometre / solar-mass) conversions for the HUD are
 * introduced with the physics layer in a later phase.
 *
 * Model: Schwarzschild. All radii below are the exact Schwarzschild relations.
 */

/** Gravitational radius r_g = GM/c², the base length unit (1 world unit). */
export const GRAVITATIONAL_RADIUS = 1;

/** Schwarzschild radius r_s = 2GM/c² = 2 r_g — the true event horizon. */
export const SCHWARZSCHILD_RADIUS = 2 * GRAVITATIONAL_RADIUS;

/** Photon sphere r_ph = 3GM/c² = 1.5 r_s — the innermost photon orbit. */
export const PHOTON_SPHERE_RADIUS = 3 * GRAVITATIONAL_RADIUS;

/** Innermost stable circular orbit for Schwarzschild: r_isco = 6 r_g = 3 r_s. */
export const ISCO_RADIUS = 6 * GRAVITATIONAL_RADIUS;

/**
 * Apparent shadow radius as seen by a distant observer: b_crit = 3√3 · r_g
 * ≈ 5.196 r_g ≈ 2.6 r_s. This is a lensing result — the black disk an observer
 * sees is larger than the event horizon because photons with impact parameter
 * below b_crit are captured.
 *
 * Approximation note (Phase 1): full gravitational lensing arrives in Phase 2.
 * Until then the black hole is rendered as an opaque sphere at this apparent
 * shadow radius, which reproduces the observed silhouette size while the true
 * event horizon at r_s remains enclosed within it.
 */
export const APPARENT_SHADOW_RADIUS = 3 * Math.sqrt(3) * GRAVITATIONAL_RADIUS;
