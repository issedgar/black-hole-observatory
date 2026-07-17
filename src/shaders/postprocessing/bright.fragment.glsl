// Bloom bright-pass: keep only the HDR energy above a threshold. Because the
// event horizon is exactly black it contributes nothing, so the bloom is
// naturally selective (disk, photon ring, incandescent particles).

precision highp float;

uniform sampler2D uScene;
uniform float uThreshold;

varying vec2 vUv;

void main() {
    vec3 color = texture2D(uScene, vUv).rgb;
    float luminance = dot(color, vec3(0.2126, 0.7152, 0.0722));
    float excess = max(0.0, luminance - uThreshold);
    // Soft, energy-preserving knee.
    float weight = excess / (luminance + 1e-4);
    gl_FragColor = vec4(color * weight, 1.0);
}
