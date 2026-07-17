// Gas cloud: additive, soft-edged procedural glow that fades at the silhouette.

#include <noise>

uniform vec3 uBaseColor;
uniform vec3 uAccentColor;
uniform float uHeat;
uniform float uSeed;

varying vec3 vDirection;
varying vec3 vViewNormal;

void main() {
    float n = fbm3(vDirection * 3.0 + uSeed, 4);
    float density = smoothstep(0.28, 0.82, n);

    // Fade toward the silhouette (view normal nearly perpendicular to view).
    float rim = pow(clamp(abs(vViewNormal.z), 0.0, 1.0), 1.5);
    float glow = density * rim;

    vec3 color = mix(uBaseColor, uAccentColor, n);
    vec3 hot = mix(
        vec3(0.8, 0.2, 0.1),
        vec3(1.0, 0.82, 0.5),
        smoothstep(0.3, 1.0, uHeat)
    );
    color = mix(color, hot, smoothstep(0.2, 0.9, uHeat));

    gl_FragColor = vec4(color * glow * (0.6 + 0.8 * uHeat), 1.0);
}
