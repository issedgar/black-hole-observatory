// Fragment/plasma/dust point particle. Attributes come from the pooled buffers.

attribute float aTemp;
attribute float aSize;
attribute float aAlpha;

uniform float uPixelRatio;

varying float vTemp;
varying float vAlpha;

void main() {
    vTemp = aTemp;
    vAlpha = aAlpha;

    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * viewPosition;
    gl_PointSize = aSize * uPixelRatio * (200.0 / max(-viewPosition.z, 1.0));
}
