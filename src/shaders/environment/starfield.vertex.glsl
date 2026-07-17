// Procedural starfield points.
//
// Each star carries a size, a base brightness, a colour, and a twinkle phase.
// Point size attenuates with view-space distance so nearer depth shells read as
// larger, giving parallax when the camera moves.

attribute float aSize;
attribute float aBrightness;
attribute float aTwinklePhase;
attribute vec3 aColor;

uniform float uTime;
uniform float uPixelRatio;
uniform float uMotionScale; // 1 = full animation, 0 = reduced motion

varying vec3 vColor;
varying float vBrightness;

void main() {
    vColor = aColor;

    // Gentle, per-star twinkle. Kept low-amplitude so the field stays calm, and
    // frozen under reduced motion.
    float twinkle = 0.8 + 0.2 * uMotionScale * sin(uTime * 1.4 + aTwinklePhase);
    vBrightness = aBrightness * twinkle;

    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * viewPosition;

    // Perspective size attenuation; the constant sets the reference distance.
    gl_PointSize = aSize * uPixelRatio * (320.0 / max(-viewPosition.z, 1.0));
}
