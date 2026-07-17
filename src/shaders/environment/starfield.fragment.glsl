// Procedural star sprite: soft circular disc with a brighter core.

precision mediump float;

varying vec3 vColor;
varying float vBrightness;

void main() {
    // gl_PointCoord is in [0, 1]; centre the sprite.
    vec2 uv = gl_PointCoord - 0.5;
    float dist = length(uv);

    // Soft outer disc plus a concentrated core so bright stars keep a sharp centre.
    float disc = smoothstep(0.5, 0.0, dist);
    float core = smoothstep(0.16, 0.0, dist);

    float alpha = disc * vBrightness;
    if (alpha <= 0.002) {
        discard;
    }

    vec3 color = vColor * (vBrightness + core * 0.9);
    gl_FragColor = vec4(color, alpha);
}
