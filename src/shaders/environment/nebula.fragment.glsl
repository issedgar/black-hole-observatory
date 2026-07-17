// Extremely subtle interstellar nebula + dust (brief §4). Rendered faintly so it
// adds depth and gives gravitational lensing continuous structure to bend,
// without ever competing with the black hole.

precision highp float;

#include <noise>

uniform vec3 uColorA;   // cool base tint
uniform vec3 uColorB;   // secondary tint for variation
uniform float uIntensity;

varying vec3 vDirection;

void main() {
    vec3 dir = normalize(vDirection);

    // Large-scale cloud structure. Domain warping breaks up obvious repetition.
    vec3 domain = dir * 2.4;
    vec3 warp = vec3(
        fbm3(domain + vec3(11.2, 3.7, 0.0), 3),
        fbm3(domain + vec3(0.0, 5.1, 9.3), 3),
        fbm3(domain + vec3(7.4, 0.0, 2.8), 3)
    );
    float clouds = fbm3(domain + warp * 1.5, 5);

    // Shape into soft patches; most of the sky stays empty.
    float density = smoothstep(0.55, 0.95, clouds);

    // Fine dust: high-frequency, very low amplitude.
    float dust = fbm3(dir * 9.0, 4);
    density += smoothstep(0.6, 0.9, dust) * 0.15;

    vec3 color = mix(uColorA, uColorB, clamp(clouds, 0.0, 1.0));
    gl_FragColor = vec4(color * density * uIntensity, 1.0);
}
