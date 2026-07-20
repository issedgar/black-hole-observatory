// Accretion-disk emission model. Requires the shared noise chunk (fbm3/hash13) to
// be included BEFORE this one. Coordinate space: world units (1 = r_g); the disk
// lies in the y = 0 plane, radius measured in the xz-plane.
//
// Two looks share this one function, selected by `detail` (0 = default, 1 = vista):
//  - detail = 0 reproduces the baseline disk exactly (turbulent volumetric haze).
//  - detail -> 1 builds the "orbital highways": differentiated concentric lanes of
//    matter with per-lane speed/brightness/density, advected directional streaks
//    (long-exposure look), sparse hot traffic knots with tangential tails, a
//    radius-dependent velocity hierarchy, an inner-hot/outer-cool palette, tamed
//    Doppler blow-out and slight per-lane vertical parallax. Everything vista-only
//    is multiplied by `detail`, so the baseline is untouched outside vista.

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

// Per-lane pseudo-random in [0,1] (reuses the shared hash to avoid duplication).
float laneHash(float x) {
    return hash13(vec3(x, x * 1.37 + 3.1, x * 0.71 + 7.7));
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
    float reaction,
    float detail
) {
    float r = length(pos.xz);
    if (r < rInner || r > rOuter) {
        return vec4(0.0);
    }

    float angle = atan(pos.z, pos.x);
    float logr = log(r / rInner); // 0 at the inner edge, grows outward

    // ---- Orbital lanes (vista): distinct concentric streams -------------------
    // Lane index in log-radius; each lane gets its own brightness, density, speed
    // and a small vertical offset (parallax). Lanes fade in only past the inner,
    // strongly-lensed zone where a radial grating would alias.
    float laneCoord = logr * 3.0;
    float laneId = floor(laneCoord);
    float laneFrac = fract(laneCoord);
    float lh = laneHash(laneId);
    float lh2 = laneHash(laneId + 17.0);
    // Cross-section: bright core with dark gaps between lanes.
    float laneCore =
        smoothstep(0.0, 0.34, laneFrac) * (1.0 - smoothstep(0.60, 1.0, laneFrac));
    float laneBrightV = 0.55 + 0.95 * lh;
    float laneDensV = 0.55 + 0.95 * lh2;
    float laneSpeedV = 0.78 + 0.55 * lh; // per-lane angular speed spread
    float bandFade = smoothstep(rInner, rInner * 2.4, r);

    // Per-lane vertical offset -> lanes sit at slightly different elevations.
    float laneY = (lh - 0.5) * 0.6 * detail * bandFade;

    // Vertical (scale-height) falloff -> apparent volumetric thickness; thinner in
    // vista so the layered lanes read as a crisp band, not a soft glow.
    float scaleHeight = thickness * r * (1.0 - detail * 0.38);
    float dy = pos.y - laneY * scaleHeight;
    float vertical = exp(-(dy * dy) / (scaleHeight * scaleHeight));
    if (vertical < 0.01) {
        return vec4(0.0);
    }

    // Differential (Keplerian) rotation: inner material orbits faster. Freshly
    // accreted matter transiently speeds up the inner flow. In vista the flow
    // streams faster and each lane runs at its own speed.
    float omega = rotSpeed * pow(r / rInner, -1.5)
        * (1.0 + reaction * 0.6)
        * (1.0 + detail * 1.15)
        * mix(1.0, laneSpeedV, detail);
    float rotated = angle + time * omega;

    // ---- Turbulent filament texture (shared by both looks) --------------------
    // cos/sin keep the spiral coordinate periodic across atan's branch cut.
    float swirl = rotated + logr * 3.6;
    vec2 swirlPos = vec2(cos(swirl), sin(swirl));
    float turbulence = fbm3(
        vec3(swirlPos * (2.4 + detail * 1.8), r * 0.7 - time * (0.14 + detail * 0.22)),
        4
    );
    float fine = fbm3(
        vec3(swirlPos * (4.6 + detail * 3.0), r * 1.3 + time * (0.06 + detail * 0.15)),
        3
    );
    float clumps = mix(turbulence, fine, 0.5);
    float clumpLo = mix(0.18, 0.40, detail);
    float clumpHi = mix(0.82, 0.62, detail);
    clumps = smoothstep(clumpLo, clumpHi, clumps);

    // ---- Traffic knots (vista): sparse hot cores with tangential tails --------
    // A sparse advected field of compact bright cores; a second, tangentially
    // stretched field smears them into comma-shaped trails along the flow. The
    // whole thing is advected by `time * omega`, so it circulates along the lanes
    // (long-exposure traffic), not a rotating isotropic texture.
    float traffic = 0.0;
    if (detail > 0.001) {
        float along = angle + time * omega; // advected tangential coordinate
        vec2 alongPos = vec2(cos(along), sin(along));
        float coreField = fbm3(vec3(alongPos * 6.0, logr * 7.0 + laneId * 3.1), 3);
        float cores = smoothstep(0.66, 0.92, coreField);
        // Tail: low tangential frequency + advection -> streaks behind the cores.
        float tailField = fbm3(
            vec3(alongPos * 2.2, logr * 7.0 + laneId * 3.1 - time * omega * 0.015),
            2
        );
        float tail = smoothstep(0.5, 0.85, tailField);
        traffic = max(cores, tail * 0.55) * laneCore * bandFade;
    }

    // ---- Density ---------------------------------------------------------------
    float radial = pow(smoothstep(rOuter, rInner, r), 1.6);
    radial *= smoothstep(rInner, rInner * 1.35, r);

    float baseClumpMix = 0.18 + 1.05 * clumps;
    // Vista: lanes carve denser cores and darker gaps; traffic adds local density.
    float laneClumpMix =
        (0.08 + 1.15 * clumps) * mix(0.35, 1.0, laneCore) * laneDensV
        + traffic * 0.5;
    float densMix = mix(baseClumpMix, mix(baseClumpMix, laneClumpMix, bandFade), detail);

    float dens = density * radial * vertical * densMix;
    dens *= 1.0 + reaction * 0.5;
    dens = max(dens, 0.0);

    // ---- Emission / colour -----------------------------------------------------
    float flare = smoothstep(0.85, 0.99, clumps);
    float hotSpot = traffic; // already lane/bandFade masked

    // Thin-disk temperature; hotter inner, cooler outer, plus localized hot cores.
    float temp = pow(rInner / r, 0.75) + flare * 0.25 + hotSpot * 0.5 * detail;

    // Relativistic Doppler beaming. Prograde tangential velocity in the plane;
    // speed from the (weak-field) circular-orbit relation v/c = sqrt(rg/r).
    vec3 velocityDir = normalize(vec3(-sin(angle), 0.0, cos(angle)));
    float beta = clamp(sqrt(rg / max(r, 1e-3)), 0.0, 0.6);
    vec3 toCamera = normalize(camPos - pos);
    float mu = dot(velocityDir, toCamera);
    float gamma = 1.0 / sqrt(1.0 - beta * beta);
    // Guarded denominator (see prior notes): keeps doppler finite on strict GPUs.
    float doppler = 1.0 / max(gamma * (1.0 - beta * mu), 1e-3);

    vec3 color = diskTemperatureColor(temp * mix(1.0, doppler, 0.3));

    // max() before pow keeps the base non-negative (pow of a negative base is NaN
    // in GLSL). In vista the beaming is capped tighter so the approaching side
    // stops blowing out into a featureless white spot and internal lane structure
    // survives.
    float beaming = clamp(pow(max(doppler, 1e-4), 3.0), 0.65, 2.6);
    // Cap the beaming in vista so the approaching side keeps internal structure
    // instead of a featureless white spot — but not so tight that the band goes
    // dim (2.0 keeps it bright and readable).
    beaming = mix(beaming, clamp(beaming, 0.65, 2.0), detail);

    float brightness = beaming * (0.6 + 0.6 * clumps) * (1.0 + flare * 1.4);
    // Vista: per-lane brightness and bright traffic cores; overall lift so the
    // thinner, groove-darkened band still reads as a bright accretion disk.
    brightness *= mix(1.0, laneBrightV * (0.95 + 1.8 * hotSpot), detail * bandFade);
    brightness *= 1.0 + detail * 0.55;

    // Accretion reaction: a controlled luminosity boost with an outward-
    // propagating brightness ripple (brief §9), not a full-frame flash.
    float wave = 0.5 + 0.5 * sin(r * 0.6 - time * 5.0);
    brightness *= 1.0 + reaction * (0.7 + 0.7 * wave);

    return vec4(max(color * brightness, vec3(0.0)), max(dens, 0.0));
}
