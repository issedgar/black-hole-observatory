// Unified black-hole field — one pass producing the shadow, photon ring, lensed
// background and accretion disk.
//
// The shadow and photon ring are ANALYTIC in the ray's impact parameter b
// (perpendicular distance of the undeflected ray to the hole): rays with
// b < b_crit = 3√3·r_g are captured -> pure black; a thin bright band sits at
// b ≈ b_crit. This is reliable and correctly sized. A gentle bent-ray march adds
// the volumetric disk (with its curved rear image) and deflects escaped rays to
// sample the lensed background. Documented approximation (not geodesics).
//
// Output is (rgb, coverage); coverage drives a full-resolution far-background
// blend in the composite pass so distant stars stay sharp.

precision highp float;

#include <noise>
#include <disk>

uniform vec3 uCamPos;
uniform vec3 uCamRight;
uniform vec3 uCamUp;
uniform vec3 uCamForward;
uniform float uTanHalfFov;
uniform float uAspect;
uniform vec2 uCenter;

uniform sampler2D uBackground;

uniform float uTime;
uniform float uRInner;
uniform float uROuter;
uniform float uRg;
uniform float uCapture;     // march-termination radius (event horizon)
uniform float uBCrit;       // critical impact parameter (shadow radius, r_g)
uniform float uRotSpeed;
uniform float uThickness;
uniform float uDensity;
uniform float uBend;
uniform float uReaction;
uniform int uSteps;

uniform vec3 uPhotonColor;
uniform float uPhotonIntensity;
uniform float uPhotonWidth;  // ring half-width in impact-parameter units
uniform vec2 uApproachDir;
uniform float uDiskDetail;   // 0 normally; ->1 in vista mode (defined lanes + flow)

varying vec2 vUv;

const int MAX_STEPS = 240;
const float MIN_STEP = 0.11;
const float MAX_STEP = 1.35;

vec2 directionToUv(vec3 dir) {
    float forward = dot(dir, uCamForward);
    // Rays exiting near-perpendicular to (or behind) the camera would divide by
    // ~0 and produce a seam. Rather than a hard branch that snaps to the
    // screen uv below a fixed threshold (which paints a sharp, precision-
    // sensitive seam exactly at that boundary), blend continuously into the
    // screen-uv fallback as forward shrinks, and clamp the divisor so the
    // projection itself never blows up.
    vec2 screen = vec2(dot(dir, uCamRight), dot(dir, uCamUp));
    vec2 projected = vec2(0.5) +
        screen / max(forward, 0.05) *
            vec2(0.5 / (uTanHalfFov * uAspect), 0.5 / uTanHalfFov);
    float blend = smoothstep(0.0, 0.2, forward);
    return mix(vUv, projected, blend);
}

void main() {
    vec2 ndc = vUv * 2.0 - 1.0;
    vec3 dir = normalize(
        uCamForward + ndc.x * uAspect * uTanHalfFov * uCamRight +
            ndc.y * uTanHalfFov * uCamUp
    );
    vec3 pos = uCamPos;

    // Impact parameter of the undeflected ray (perpendicular distance to origin).
    float impact = length(uCamPos - dir * dot(uCamPos, dir));
    bool inShadow = impact < uBCrit;

    vec3 accum = vec3(0.0);
    float alpha = 0.0;
    float verticalReach = uThickness * uROuter + 1.0;

    for (int i = 0; i < MAX_STEPS; i++) {
        if (i >= uSteps) {
            break;
        }
        float r = length(pos);
        if (r < uCapture) {
            break;
        }

        // The step cap stays tight near the disk/hole, where fine resolution
        // matters (photon-sphere bending, thin disk crossing). Far outside the
        // disk there is nothing to resolve finely, so relax the cap smoothly —
        // otherwise, at typical camera distances, the fixed 1.35 cap forces so
        // many steps to cross the empty approach/recede legs that the march
        // exhausts its step budget before ever reaching the escape check
        // below, leaving `dir` in an arbitrary mid-flight state that then gets
        // used as if it were the ray's true escaped direction (corrupting both
        // the background sample and the bend-based coverage everywhere on
        // screen, not just near the hole).
        float maxStep = mix(MAX_STEP, 6.0, smoothstep(uROuter, uROuter * 2.5, r));
        // Budget compensation: low quality tiers cut uSteps, but a ray still
        // has to cover the same total path to finish its bend and escape —
        // fewer steps of the same size just truncate the journey mid-flight,
        // which at low tiers turns the whole strongly-lensed region into a
        // smeared dark blob (rays never resolve their exit direction).
        // Scaling the step size up as the budget shrinks trades integration
        // accuracy (coarser bending, coarser disk sampling) for completeness,
        // which degrades far more gracefully.
        float budgetScale = clamp(130.0 / float(uSteps), 1.0, 2.5);
        float stepSize = clamp(0.06 * r, MIN_STEP, maxStep) * budgetScale;

        float rxz = length(pos.xz);
        if (rxz < uROuter + 2.0 && abs(pos.y) < verticalReach) {
            // Grazing-incidence correction: a single point sample at the
            // step's start approximates the path integral as
            // density(pos) * stepSize, which under-resolves the disk's thin
            // vertical layer (and its turbulent fine structure) when the ray
            // travels nearly parallel to the disk plane — the layer is
            // crossed within a fraction of the step, and a coarse march can
            // point-sample past its density peak entirely, producing a dark
            // seam exactly along the edge-on sightline. When the step's
            // vertical excursion is small relative to the local scale
            // height (a near-tangent ray), replace the single sample with a
            // few sub-samples spread across the step so the crossing is
            // actually resolved, independent of screen resolution.
            // Sub-step count scales continuously with how tangent the ray is
            // (no hard on/off threshold): an abrupt jump between a coarse and
            // a corrected sample count would itself paint a seam exactly at
            // the boundary where the correction switches off.
            // Capped at 4: enough to resolve the scale-height crossing (the
            // seam-causing failure was skipping it entirely), and the marginal
            // quality of 8 does not justify doubling the worst-case cost of
            // the most expensive rays (grazing rays already pay full noise
            // cost on every substep).
            float scaleHeightLocal = uThickness * rxz;
            float verticalExcursion = abs(dir.y) * stepSize;
            int subSteps = clamp(
                int(ceil(scaleHeightLocal / max(verticalExcursion, 1e-4))),
                1,
                4
            );
            float subStepSize = stepSize / float(subSteps);
            for (int s = 0; s < 4; s++) {
                if (s >= subSteps) {
                    break;
                }
                vec3 subPos = pos + dir * subStepSize * (float(s) + 0.5);
                vec4 diskSample = sampleDiskVolume(
                    subPos,
                    uCamPos,
                    uTime,
                    uRInner,
                    uROuter,
                    uRg,
                    uRotSpeed,
                    uThickness,
                    uDensity,
                    uReaction,
                    uDiskDetail
                );
                float aStep = clamp(diskSample.a * subStepSize, 0.0, 1.0);
                accum += (1.0 - alpha) * diskSample.rgb * aStep;
                alpha += (1.0 - alpha) * aStep;
            }
            if (alpha > 0.995) {
                break;
            }
        }

        // Gravitational deflection (for disk rear image + background arcs). The
        // base term is the weak-field 1/r^2 bend; the (1 + k*rg/r) factor is a
        // documented visual stand-in for the Schwarzschild geodesic's r^-3
        // correction (the term responsible for the strong bending near the
        // photon sphere), so near-critical rays curve enough to complete the
        // disk's lensed secondary image instead of leaving a gap above the
        // shadow. It is calibrated for appearance, not integrated from the
        // exact geodesic equation.
        float r2 = max(dot(pos, pos), uCapture * uCapture);
        float nearFieldBoost = 1.0 + 5.0 * uRg / sqrt(r2);
        dir = normalize(
            dir + normalize(-pos) * (uBend * uRg / r2) * nearFieldBoost * stepSize
        );
        pos += dir * stepSize;

        // Escaped once clearly outside the disk/hole's zone of influence AND
        // moving further away than the step before. `dot(dir, pos) > 0` looked
        // equivalent but isn't: the deflection term keeps rotating `dir` back
        // toward -pos every step (it never switches off), which can hold that
        // dot product pinned near/below zero indefinitely even while the ray
        // is genuinely receding — starving the loop of its step budget before
        // it ever reaches this check, so `dir` gets used mid-flight as if it
        // were the final escaped direction. Comparing successive radii is
        // immune to that: it only asks whether distance is still increasing.
        float rAfter = length(pos);
        if (rAfter > uROuter + 8.0 && rAfter > r) {
            break;
        }
    }

    // Analytic shadow: captured rays emit nothing; others carry the lensed
    // background (from the deflected exit direction).
    vec2 lensedUv = clamp(directionToUv(dir), 0.0, 1.0);
    vec3 background = inShadow ? vec3(0.0) : texture2D(uBackground, lensedUv).rgb;

    vec3 color = accum + (1.0 - alpha) * background;

    // Analytic photon ring: a thin, intense band at the critical impact
    // parameter, hugging the shadow edge by construction.
    //
    // Squared via multiplication, NOT pow(x, 2.0): the base (impact - uBCrit) is
    // negative for every ray inside the critical parameter (the whole shadow-side
    // half of the ring), and pow() of a negative base is undefined in GLSL — it
    // returns NaN on strict GPUs, which then propagates into the composited color
    // as scattered black pixels along the ring/edge-on disk. x*x is exact and
    // always finite.
    float ringArg = (impact - uBCrit) / uPhotonWidth;
    float ringBand = exp(-(ringArg * ringArg));
    vec2 screenDir = normalize((vUv - uCenter) * vec2(uAspect, 1.0) + 1e-5);
    float ringAngle = atan(screenDir.y, screenDir.x);
    float align = dot(screenDir, normalize(uApproachDir));
    // clamp the base to [0,1] before pow: `align` is a dot product of unit vectors
    // that precision can nudge just past ±1, and pow() of the resulting negative
    // base is undefined (NaN on strict GPUs).
    float asymmetry = mix(0.3, 1.0, pow(clamp(align * 0.5 + 0.5, 0.0, 1.0), 1.4));
    float flicker = 0.92 + 0.08 * sin(uTime * 3.0 + ringAngle * 7.0);

    // Vista core: break the clean photon ring into an uneven, asymmetric boundary
    // — angular turbulence + slow drift give local brightening and partially
    // occluded arcs instead of a smooth UI-like stroke. Off (=1) outside vista.
    float coreD = uDiskDetail;
    float ringTurb = fbm3(
        vec3(cos(ringAngle) * 2.5, sin(ringAngle) * 2.5, uTime * 0.06),
        3
    );
    float ringMod = mix(1.0, 0.45 + 1.25 * ringTurb, coreD);
    color += uPhotonColor * ringBand * uPhotonIntensity * asymmetry * flicker * ringMod;

    // Vista core: abstract cosmic iris — a couple of faint concentric arcs of
    // compressed light just outside the shadow, with angular density variation and
    // slow rotation, plus a soft dark "well" gradient into the shadow edge so the
    // centre reads as deep space folding inward rather than a flat black disc. The
    // shadow interior itself stays black (nothing added when inShadow).
    if (coreD > 0.001 && !inShadow) {
        float irisRot = uTime * 0.04;
        for (int a = 0; a < 2; a++) {
            float rArc = uBCrit * (1.16 + 0.22 * float(a));
            float w = uPhotonWidth * (3.5 + 2.0 * float(a));
            float t = (impact - rArc) / w;
            float band = exp(-(t * t));
            float angDensity = 0.55 + 0.45 * sin(ringAngle * (3.0 + float(a) * 2.0) + irisRot + rArc);
            color += uPhotonColor * band * angDensity * 0.22 * coreD;
        }
        // Compressed-light darkening just outside the shadow -> optical depth.
        float wellEdge = smoothstep(uBCrit * 1.5, uBCrit, impact); // 1 near edge
        color *= mix(1.0, mix(1.0, 0.82, wellEdge), coreD);
    }

    // Coverage is driven by real field content — the shadow, the disk's
    // opacity, the photon ring, and whether lensing actually displaced this
    // pixel's background sample — so empty sky far from the hole keeps the
    // sharp full-resolution direct background instead of the field's
    // resampled copy. The displacement test is in UV space, not deflection
    // angle: what matters visually is whether the lensed sample differs from
    // the direct one AT THIS PIXEL. An angle threshold gets this wrong in
    // both directions (a small deflection near the hole moves the sample a
    // lot; a large deflection of a ray that still lands on the same sky patch
    // moves it little), and any fixed angle cutoff paints a seam — a dark
    // band — exactly where bright lensed content sits just below the cutoff.
    float uvShift = length(lensedUv - vUv);
    float lensCoverage = smoothstep(0.0008, 0.006, uvShift);
    float coverage = inShadow ? 1.0 : max(alpha, lensCoverage);
    coverage = max(coverage, ringBand);

    // Safety net against GPU-specific precision failures in the bent-ray march.
    // A non-finite channel (NaN/Inf) paints a hard black lane along the edge-on
    // receding limb on some GPUs where a well-behaved GPU shows a dim disk. Use a
    // comparison-based finite test rather than isnan()/isinf(): those are legally
    // optimized away under the fast-math assumptions many mobile/desktop drivers
    // compile shaders with, whereas a range comparison (NaN fails every compare)
    // survives. On failure, drop coverage to 0 so the composite falls back to the
    // sharp direct background instead of compositing a black field.
    float finiteCheck = color.r + color.g + color.b;
    if (!(finiteCheck >= 0.0 && finiteCheck < 1.0e12)) {
        color = vec3(0.0);
        coverage = 0.0;
    }
    color = max(color, vec3(0.0));

    gl_FragColor = vec4(color, clamp(coverage, 0.0, 1.0));
}
