// Fullscreen pass. The geometry is a 2x2 plane whose positions already span
// clip space [-1, 1], so we bypass the camera matrices entirely and forward the
// uv for the deflection lookup.

varying vec2 vUv;

void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
}
