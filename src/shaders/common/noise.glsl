// Shared procedural noise. Included via the minimal `#include <noise>` resolver
// (see utils/shader.ts). Reused across environment and, later, the accretion
// disk, so noise is defined once rather than duplicated per shader.
//
// Value-noise based: cheap hash, trilinear value noise, and fBm. Good enough for
// soft clouds/dust; not intended as gradient (Perlin/simplex) noise.

float hash13(vec3 p) {
    p = fract(p * 0.1031);
    p += dot(p, p.yzx + 33.33);
    return fract((p.x + p.y) * p.z);
}

float valueNoise3(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    // Quintic smoothing for continuous derivatives (fewer grid artifacts).
    vec3 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);

    float n000 = hash13(i + vec3(0.0, 0.0, 0.0));
    float n100 = hash13(i + vec3(1.0, 0.0, 0.0));
    float n010 = hash13(i + vec3(0.0, 1.0, 0.0));
    float n110 = hash13(i + vec3(1.0, 1.0, 0.0));
    float n001 = hash13(i + vec3(0.0, 0.0, 1.0));
    float n101 = hash13(i + vec3(1.0, 0.0, 1.0));
    float n011 = hash13(i + vec3(0.0, 1.0, 1.0));
    float n111 = hash13(i + vec3(1.0, 1.0, 1.0));

    float nx00 = mix(n000, n100, u.x);
    float nx10 = mix(n010, n110, u.x);
    float nx01 = mix(n001, n101, u.x);
    float nx11 = mix(n011, n111, u.x);

    float nxy0 = mix(nx00, nx10, u.y);
    float nxy1 = mix(nx01, nx11, u.y);

    return mix(nxy0, nxy1, u.z);
}

// Fractional Brownian motion. `octaves` is a compile-time-ish loop bound; callers
// pass a small constant so the shader compiler can unroll it.
float fbm3(vec3 p, int octaves) {
    float sum = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    for (int i = 0; i < 8; i++) {
        if (i >= octaves) {
            break;
        }
        sum += amplitude * valueNoise3(p * frequency);
        frequency *= 2.02;
        amplitude *= 0.5;
    }
    return sum;
}
