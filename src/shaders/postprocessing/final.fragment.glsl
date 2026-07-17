// Final composite: combine the HDR scene with bloom, then apply exposure, ACES
// tone mapping, a restrained cinematic grade, vignette, film grain and a
// conditional chromatic aberration (only during intense accretion events).
// Outputs sRGB to the framebuffer.

precision highp float;

uniform sampler2D uScene;
uniform sampler2D uBloom;
uniform float uExposure;
uniform float uBloomStrength;
uniform float uStreak; // subtle anamorphic horizontal flare
uniform float uChromatic; // 0 normally; > 0 only during extreme events
uniform float uVignette;
uniform float uGrain;
uniform float uTime;

varying vec2 vUv;

// ACES filmic tone-mapping approximation (Narkowicz).
vec3 acesToneMap(vec3 x) {
    const float a = 2.51;
    const float b = 0.03;
    const float c = 2.43;
    const float d = 0.59;
    const float e = 0.14;
    return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);
}

float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

void main() {
    vec2 fromCenter = vUv - 0.5;

    vec3 scene;
    if (uChromatic > 0.001) {
        // Radial chromatic aberration, strongest at the edges.
        float amount = uChromatic * 0.004 * length(fromCenter) * 2.0;
        scene.r = texture2D(uScene, vUv + fromCenter * amount).r;
        scene.g = texture2D(uScene, vUv).g;
        scene.b = texture2D(uScene, vUv - fromCenter * amount).b;
    } else {
        scene = texture2D(uScene, vUv).rgb;
    }

    vec3 bloom = texture2D(uBloom, vUv).rgb;

    // Subtle anamorphic horizontal flare drawn from the brightest bloomed
    // regions (the Doppler-beamed spot and photon ring).
    vec3 streak = vec3(0.0);
    float streakTotal = 0.0;
    for (int i = -6; i <= 6; i++) {
        float weight = 1.0 - abs(float(i)) / 7.0;
        streak +=
            texture2D(uBloom, vUv + vec2(float(i) * 0.012, 0.0)).rgb * weight;
        streakTotal += weight;
    }
    streak = (streak / streakTotal) * vec3(0.7, 0.85, 1.0) * uStreak;

    vec3 hdr = (scene + bloom * uBloomStrength + streak) * uExposure;

    vec3 mapped = acesToneMap(hdr);

    // Restrained grade: slightly warm highlights, cool shadows.
    vec3 warm = mapped * vec3(1.06, 1.0, 0.94);
    vec3 cool = mapped * vec3(0.96, 1.0, 1.06);
    mapped = mix(cool, warm, smoothstep(0.2, 0.7, dot(mapped, vec3(0.333))));

    // Subtle vignette.
    float vignette = smoothstep(0.95, 0.35, length(fromCenter));
    mapped *= mix(1.0, vignette, uVignette);

    // Very light film grain.
    float grain = (hash(vUv * vec2(1920.0, 1080.0) + fract(uTime)) - 0.5);
    mapped += grain * uGrain;

    // Linear -> sRGB.
    mapped = pow(clamp(mapped, 0.0, 1.0), vec3(1.0 / 2.2));
    gl_FragColor = vec4(mapped, 1.0);
}
