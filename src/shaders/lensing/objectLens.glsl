// Screen-space gravitational lensing for captured bodies (brief §12: a documented
// screen-space approximation, not geodesic integration). Each vertex is deflected
// radially OUTWARD from the black hole's projected centre — light bending makes a
// source near the hole appear displaced away from it, and a body passing directly
// behind smears into an arc around the shadow. Requires the three.js built-in
// `projectionMatrix`/`viewMatrix` uniforms (present in ShaderMaterial).
//
// The deflection is a Lorentzian in aspect-corrected screen distance, hard-capped
// at MAX_DEFLECT: it is strong only near the ring and its magnitude is bounded, so
// a captured body can never be smeared into a screen-crossing streak the way the
// field's single-bent-ray background reconstruction once was.
uniform float uLensAspect;

vec4 applyBlackHoleLens(vec4 clip) {
    if (clip.w <= 0.0) {
        return clip;
    }
    vec4 holeClip = projectionMatrix * viewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
    if (holeClip.w <= 0.0) {
        return clip;
    }

    vec2 p = clip.xy / clip.w;
    vec2 h = holeClip.xy / holeClip.w;
    vec2 rel = (p - h) * vec2(uLensAspect, 1.0);
    float d = length(rel);

    const float MAX_DEFLECT = 0.14; // NDC displacement cap
    const float SIGMA = 0.3;        // screen scale over which bending concentrates
    float defl = MAX_DEFLECT * (SIGMA * SIGMA) / (d * d + SIGMA * SIGMA);

    vec2 dir = rel / max(d, 1e-4);
    vec2 disp = (dir * defl) / vec2(uLensAspect, 1.0);
    p += disp;

    return vec4(p * clip.w, clip.z, clip.w);
}
