// Separable Gaussian blur (5-tap, run once per axis). uDirection selects the
// axis; uTexel is the source texel size.

precision highp float;

uniform sampler2D uTexture;
uniform vec2 uTexel;
uniform vec2 uDirection;

varying vec2 vUv;

void main() {
    vec2 offset = uTexel * uDirection;
    vec3 sum = texture2D(uTexture, vUv).rgb * 0.227027;
    sum += texture2D(uTexture, vUv + offset * 1.3846).rgb * 0.316216;
    sum += texture2D(uTexture, vUv - offset * 1.3846).rgb * 0.316216;
    sum += texture2D(uTexture, vUv + offset * 3.2307).rgb * 0.070270;
    sum += texture2D(uTexture, vUv - offset * 3.2307).rgb * 0.070270;
    gl_FragColor = vec4(sum, 1.0);
}
