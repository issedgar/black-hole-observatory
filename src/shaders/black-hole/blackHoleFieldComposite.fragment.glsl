// Composites the reduced-resolution black-hole field over the full-resolution
// direct background. Where the hole has no influence (coverage 0) the sharp
// direct background shows through; near the hole the lensed field takes over.

precision highp float;

uniform sampler2D uField;
uniform sampler2D uBackground;

varying vec2 vUv;

void main() {
    vec3 direct = texture2D(uBackground, vUv).rgb;
    vec4 field = texture2D(uField, vUv);
    vec3 color = mix(direct, field.rgb, field.a);
    gl_FragColor = vec4(color, 1.0);
}
