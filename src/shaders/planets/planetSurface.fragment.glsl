// Solid-body shading. There is no star in the scene, so lighting is a simple
// fixed key + ambient fill; the dominant dynamic cue is progressive thermal
// emission (uHeat) as the body is torn apart near the black hole (brief §8).

#include <noise>

uniform vec3 uBaseColor;
uniform vec3 uAccentColor;
uniform float uHeat; // 0 = cold, 1 = incandescent
uniform float uSeed;
uniform float uTidalStrength; // surface cracking as the body is torn apart

varying vec3 vNormal;
varying float vElevation;
varying vec3 vSurfacePos;

void main() {
    vec3 N = normalize(vNormal);
    vec3 keyDir = normalize(vec3(0.5, 0.7, 0.45));
    vec3 fillDir = normalize(vec3(-0.45, -0.2, 0.55));
    float diffuse = clamp(dot(N, keyDir), 0.0, 1.0);
    float fill = clamp(dot(N, fillDir), 0.0, 1.0) * 0.3;
    // Raised ambient floor so bodies read against the bright disk instead of
    // silhouetting to pure black.
    float light = 0.34 + diffuse * 0.75 + fill;

    float mixT = smoothstep(-0.05, 0.25, vElevation);
    vec3 surface = mix(uBaseColor, uAccentColor, mixT);

    // Fine surface speckle (undeformed coords: see vertex shader note).
    float speckle = fbm3(vSurfacePos * 8.0 + uSeed, 3);
    surface *= 0.85 + 0.3 * speckle;

    vec3 color = surface * light;

    // Thermal emission ramps with heat: dull red glow -> incandescent white.
    // The emission driver is the max of the driven heat and the tidal stress:
    // a strongly stretched body must never render cold — the same tidal work
    // that elongates it heats it, and a dark, screen-crossing spaghettified
    // slab in front of the bright disk reads as a rendering artifact.
    float stress = max(uHeat, uTidalStrength * 0.85);
    vec3 hot = mix(
        vec3(0.7, 0.06, 0.0),
        vec3(1.0, 0.85, 0.55),
        smoothstep(0.3, 1.0, stress)
    );
    color = mix(color, hot, smoothstep(0.15, 0.9, stress));
    color += hot * stress * stress * 0.6;

    // Surface cracking: as tidal stress rises, fissures open and reveal a
    // glowing interior.
    float crackField = fbm3(vSurfacePos * 5.0 + uSeed * 2.3, 3);
    float cracks =
        smoothstep(0.5 - uTidalStrength * 0.36, 0.53, crackField) *
        uTidalStrength;
    color = mix(color, vec3(1.0, 0.42, 0.1), cracks * 0.85);
    color += vec3(1.0, 0.35, 0.08) * cracks * 2.4;

    gl_FragColor = vec4(color, 1.0);
}
