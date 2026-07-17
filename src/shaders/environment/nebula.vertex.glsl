// Nebula backdrop, rendered on the inside of a large sphere centred on the
// origin. The object-space position doubles as the celestial-sphere direction
// used to sample the noise field.

varying vec3 vDirection;

void main() {
    vDirection = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
