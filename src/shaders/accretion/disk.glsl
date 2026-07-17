// Accretion-disk emission model. Requires the shared noise chunk (fbm3) to be
// included BEFORE this one. Coordinate space: world units (1 = r_g); the disk
// lies in the y = 0 plane, radius measured in the xz-plane.

// Perceptual blackbody-like ramp: white-hot core -> blue-white -> gold -> orange
// -> dark red, driven by the normalized thin-disk temperature T(r) ∝ r^(-3/4).
vec3 diskTemperatureColor(float temp) {
    vec3 darkRed = vec3(0.45, 0.06, 0.02);
    vec3 orange = vec3(1.0, 0.42, 0.12);
    vec3 gold = vec3(1.0, 0.78, 0.36);
    vec3 white = vec3(1.0, 0.98, 0.92);
    vec3 blueWhite = vec3(0.86, 0.94, 1.08);

    vec3 color = mix(darkRed, orange, smoothstep(0.30, 0.5, temp));
    color = mix(color, gold, smoothstep(0.5, 0.72, temp));
    color = mix(color, white, smoothstep(0.72, 0.92, temp));
    color = mix(color, blueWhite, smoothstep(0.92, 1.12, temp));
    return color;
}

// Samples the disk medium at a world-space point. Returns rgb emission (already
// Doppler-weighted) and a density (used as opacity per unit length).
vec4 sampleDiskVolume(
    vec3 pos,
    vec3 camPos,
    float time,
    float rInner,
    float rOuter,
    float rg,
    float rotSpeed,
    float thickness,
    float density,
    float reaction
) {
    float r = length(pos.xz);
    if (r < rInner || r > rOuter) {
        return vec4(0.0);
    }

    // Vertical (scale-height) falloff -> apparent volumetric thickness.
    float scaleHeight = thickness * r;
    float vertical = exp(-(pos.y * pos.y) / (scaleHeight * scaleHeight));
    if (vertical < 0.01) {
        return vec4(0.0);
    }

    float angle = atan(pos.z, pos.x);

    // Differential (Keplerian) rotation: inner material orbits faster. Freshly
    // accreted matter transiently speeds up the inner flow.
    float omega = rotSpeed * pow(r / rInner, -1.5) * (1.0 + reaction * 0.6);
    float rotated = angle + time * omega;

    // Spiral-sheared coordinate produces trailing plasma filaments. More turns
    // and higher frequency give visible filamentary structure.
    //
    // `rotated` (built from atan(pos.z, pos.x)) jumps by ±2π across its branch
    // cut, along the disk's -x world axis. Feeding that raw scalar into fbm3 —
    // which is not periodic in its input — teleports the sampled noise cell
    // across the jump, painting a fixed dark seam along that axis (opaque from
    // the density floor, but decorrelated to near-zero clumps/brightness).
    // cos/sin of the same angle are exactly periodic across the jump, so
    // build the spiral coordinate from them instead of the raw scalar.
    float swirl = rotated + log(r) * 3.6;
    vec2 swirlPos = vec2(cos(swirl), sin(swirl));
    float turbulence = fbm3(
        vec3(swirlPos * 2.4, r * 0.7 - time * 0.14),
        4
    );
    float fine = fbm3(
        vec3(swirlPos * 4.6, r * 1.3 + time * 0.06),
        3
    );
    float clumps = mix(turbulence, fine, 0.5);
    // Sharpen so filaments and voids read distinctly instead of a smooth haze.
    clumps = smoothstep(0.18, 0.82, clumps);

    // Radial density profile: dense inside, fading to cold dust outward. A short
    // taper at the very inner edge keeps the front of the disk from veiling the
    // shadow silhouette.
    float radial = pow(smoothstep(rOuter, rInner, r), 1.6);
    radial *= smoothstep(rInner, rInner * 1.35, r);
    float dens = density * radial * vertical * (0.18 + 1.05 * clumps);
    dens *= 1.0 + reaction * 0.5;
    dens = max(dens, 0.0);

    // Localized hot flares: sparse bright unstable regions.
    float flare = smoothstep(0.85, 0.99, clumps);

    // Thin-disk temperature, boosted slightly in flares.
    float temp = pow(rInner / r, 0.75) + flare * 0.25;

    // Relativistic Doppler beaming. Prograde tangential velocity in the plane;
    // speed from the (weak-field) circular-orbit relation v/c = sqrt(rg/r).
    vec3 velocityDir = normalize(vec3(-sin(angle), 0.0, cos(angle)));
    float beta = clamp(sqrt(rg / max(r, 1e-3)), 0.0, 0.6);
    vec3 toCamera = normalize(camPos - pos);
    float mu = dot(velocityDir, toCamera);
    float gamma = 1.0 / sqrt(1.0 - beta * beta);
    // Guard the denominator: (1 - beta*mu) stays >= 0.4 analytically, but on some
    // GPUs precision can drive it toward zero and blow doppler up to Inf/NaN,
    // which then propagates through pow()/clamp() below into a pure-black lane on
    // the edge-on receding limb (clamp(NaN) is implementation-defined — dim on
    // one GPU, black on another). Keep it strictly positive.
    float doppler = 1.0 / max(gamma * (1.0 - beta * mu), 1e-3);

    // Blueshift the perceived temperature on the approaching side (kept gentle
    // so the receding side does not collapse to near-black).
    vec3 color = diskTemperatureColor(temp * mix(1.0, doppler, 0.3));

    // Bolometric beaming I ∝ δ³ (documented artistic exponent choice), clamped
    // so the approaching side stays bright and the receding, edge-on side keeps
    // a visible dim glow instead of a hard black lane. The floor is raised
    // enough that this glow actually reads as dim on screen rather than
    // crushing to black once combined with a low turbulence value and the
    // scene's exposure — a too-low floor here was indistinguishable from a
    // rendering bug (a solid dark patch on the receding limb) even though the
    // brightness was technically nonzero.
    // max() before pow keeps the base strictly non-negative so pow can never
    // return NaN (pow of a negative base is undefined in GLSL); combined with the
    // guarded doppler above, beaming is always a finite value in [0.65, 2.6].
    float beaming = clamp(pow(max(doppler, 1e-4), 3.0), 0.65, 2.6);

    // Modulate emitted brightness by the turbulence so even the brightest,
    // most-beamed regions keep internal filament texture (brief §14).
    float brightness = beaming * (0.6 + 0.6 * clumps) * (1.0 + flare * 1.4);

    // Accretion reaction: a controlled luminosity boost with an outward-
    // propagating brightness ripple (brief §9), not a full-frame flash.
    float wave = 0.5 + 0.5 * sin(r * 0.6 - time * 5.0);
    brightness *= 1.0 + reaction * (0.7 + 0.7 * wave);

    return vec4(max(color * brightness, vec3(0.0)), max(dens, 0.0));
}
