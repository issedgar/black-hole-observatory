// Gas cloud: soft additive volume approximated on a sphere shell.

varying vec3 vDirection;
varying vec3 vViewNormal;

void main() {
    vDirection = normalize(position);
    vViewNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
