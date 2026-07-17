// FXAA (Fast Approximate Anti-Aliasing, Timothy Lottes) applied to the final
// sRGB image. Edge-directed luma blur that removes the jaggies on the photon
// ring, object silhouettes and star field without a multisample target. The
// only division is floored by `dirReduce`, so it is finite on every GPU.

precision highp float;

uniform sampler2D uTexture;
uniform vec2 uTexel; // 1 / resolution

varying vec2 vUv;

const float SPAN_MAX = 8.0;
const float REDUCE_MUL = 1.0 / 8.0;
const float REDUCE_MIN = 1.0 / 128.0;

float luma(vec3 c) {
    return dot(c, vec3(0.299, 0.587, 0.114));
}

void main() {
    vec3 rgbM = texture2D(uTexture, vUv).rgb;
    vec3 rgbNW = texture2D(uTexture, vUv + vec2(-1.0, -1.0) * uTexel).rgb;
    vec3 rgbNE = texture2D(uTexture, vUv + vec2(1.0, -1.0) * uTexel).rgb;
    vec3 rgbSW = texture2D(uTexture, vUv + vec2(-1.0, 1.0) * uTexel).rgb;
    vec3 rgbSE = texture2D(uTexture, vUv + vec2(1.0, 1.0) * uTexel).rgb;

    float lM = luma(rgbM);
    float lNW = luma(rgbNW);
    float lNE = luma(rgbNE);
    float lSW = luma(rgbSW);
    float lSE = luma(rgbSE);

    float lMin = min(lM, min(min(lNW, lNE), min(lSW, lSE)));
    float lMax = max(lM, max(max(lNW, lNE), max(lSW, lSE)));

    vec2 dir = vec2(
        -((lNW + lNE) - (lSW + lSE)),
        ((lNW + lSW) - (lNE + lSE))
    );

    float dirReduce = max((lNW + lNE + lSW + lSE) * 0.25 * REDUCE_MUL, REDUCE_MIN);
    float rcpDirMin = 1.0 / (min(abs(dir.x), abs(dir.y)) + dirReduce);
    dir = clamp(dir * rcpDirMin, -SPAN_MAX, SPAN_MAX) * uTexel;

    vec3 rgbA = 0.5 * (
        texture2D(uTexture, vUv + dir * (1.0 / 3.0 - 0.5)).rgb +
        texture2D(uTexture, vUv + dir * (2.0 / 3.0 - 0.5)).rgb
    );
    vec3 rgbB = rgbA * 0.5 + 0.25 * (
        texture2D(uTexture, vUv + dir * -0.5).rgb +
        texture2D(uTexture, vUv + dir * 0.5).rgb
    );

    float lB = luma(rgbB);
    vec3 result = (lB < lMin || lB > lMax) ? rgbA : rgbB;
    gl_FragColor = vec4(result, 1.0);
}
