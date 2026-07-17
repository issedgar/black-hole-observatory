/**
 * SI physical constants and unit conversions used to turn the simulation's
 * normalized quantities into human-readable values for the HUD.
 */

export const GRAVITATIONAL_CONSTANT = 6.6743e-11; // m³ kg⁻¹ s⁻²
export const SPEED_OF_LIGHT = 2.99792458e8; // m s⁻¹
export const SOLAR_MASS_KG = 1.98892e30; // kg
export const KM_PER_M = 1e-3;

/** Schwarzschild radius in kilometres for a given mass in solar masses. */
export function schwarzschildRadiusKm(massSolar: number): number {
    const massKg = massSolar * SOLAR_MASS_KG;
    const radiusM =
        (2 * GRAVITATIONAL_CONSTANT * massKg) /
        (SPEED_OF_LIGHT * SPEED_OF_LIGHT);
    return radiusM * KM_PER_M;
}
