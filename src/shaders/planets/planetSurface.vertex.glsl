// Procedural solid-body surface: fBm terrain displacement with crater dips.
// Requires the shared noise chunk (fbm3). Used for planets, moons, ice worlds,
// asteroids and (with zero displacement) metallic craft/debris.

#include <noise>

uniform float uDisplacement;
uniform float uSeed;

// Spaghettification (brief §8): deformation depends on each vertex's position
// relative to the black hole, not a single-axis scale of the whole object.
uniform float uTidalStrength; // 0 = intact, 1 = fully stretched
uniform vec3 uTidalDir;       // object-local unit vector toward the black hole
uniform float uObjectRadius;

varying vec3 vNormal;
varying float vElevation;
varying vec3 vSurfacePos;

float terrain(vec3 dir) {
    float base = fbm3(dir * 2.2 + uSeed, 5);
    // Craters: circular dips carved from a higher-frequency field.
    float craterField = fbm3(dir * 4.1 + uSeed * 1.7, 3);
    float craters = smoothstep(0.55, 0.78, craterField) * 0.5;
    return base - craters;
}

void main() {
    vec3 dir = normalize(position);
    float elevation = terrain(dir);
    vElevation = elevation;

    vec3 displaced = position + normal * elevation * uDisplacement;

    // Radial elongation toward the hole + tangential compression, with the near
    // side (aligned with uTidalDir) stretching more than the far side — the
    // characteristic teardrop of tidal disruption.
    //
    // The elongation is deliberately BOUNDED. Captured bodies are rendered into
    // the lensed background pass (so the black hole bends them); a body stretched
    // to many object-radii there both reads as a screen-crossing streak directly
    // and, once the field samples that background along the edge-on disk, projects
    // as a hard dark bar across the scene (its dim near-side, before thermal
    // emission catches up, sampled through the disk's opaque midplane). Keeping
    // the aspect modest (asymmetry capped, ~2.4x max on the near side) preserves
    // a clear teardrop without ever producing that bar. Squeeze stays mild so the
    // body remains a rounded filament rather than a razor-thin sheet that would
    // alias into a line.
    float along = dot(displaced, uTidalDir);
    vec3 axial = uTidalDir * along;
    vec3 tangential = displaced - axial;
    float asymmetry = clamp(0.7 + 0.6 * (along / max(uObjectRadius, 0.001)), 0.0, 1.4);
    float stretch = 1.0 + uTidalStrength * asymmetry * 1.0;
    float squeeze = 1.0 - uTidalStrength * 0.45;
    vec3 deformed = uTidalDir * (along * stretch) + tangential * squeeze;

    // Surface noise (speckle, cracks) samples the UNDEFORMED position: sampling
    // the stretched position instead makes the fBm oscillate many times along the
    // elongated axis, banding the filament into bright/dark stripes that read as
    // ghosted duplicate copies.
    vSurfacePos = displaced;
    vNormal = normalize(normalMatrix * normal);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(deformed, 1.0);
}
