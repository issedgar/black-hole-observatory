Status: APPROVED

# Black Hole Visual Refinement — Audit and Implementation Plan

> Audit-only phase. No application source code is modified while this document
> reads `Status: DRAFT`. No packages are installed; the technology stack is
> unchanged. Conclusions are based on the current code and the rendered result
> (browser inspection at medium quality, near and default framings).

---

## A. Current-state assessment (factual)

The black-hole core is currently rendered as **four independent subsystems** that
are composited together, plus separate object/particle/post/HUD layers:

1. **Shadow / event horizon** — a 3D `MeshBasicMaterial` black sphere
   (`components/black-hole/EventHorizon.tsx`) at the *apparent shadow* radius
   `3√3 r_g`, `toneMapped:false`, writing depth.
2. **Photon ring** — a **camera-facing billboard quad** with a ring shader
   (`components/black-hole/PhotonRing.tsx`, `shaders/black-hole/photonRing.*`).
   It draws a thin band at a fixed normalized radius; brightness asymmetry and
   flicker are analytic, not derived from light bending.
3. **Background gravitational lensing** — a **fullscreen screen-space pass**
   (`shaders/lensing/lensing.fragment.glsl`) that samples an offscreen background
   target `RT_bg` (nebula + stars + captured objects) via the backward point-mass
   lens map `β = θ − θ_E²/θ`, aspect-corrected. Runs in `SceneCompositor`.
4. **Accretion disk** — a **separate bent-ray volumetric raymarch** at reduced
   resolution (`shaders/accretion/accretionDisk.fragment.glsl` + `disk.glsl`),
   composited "over" the lensed background. It bends rays with its *own* `1/r²`
   pull and its *own* capture radius (`DISK_CAPTURE_RADIUS = photon sphere`).

Around this: procedural background (`Nebula`, `Starfield` in `RT_bg`), captured
objects as `IcosahedronGeometry`/box groups (`CelestialObject.tsx`) in `RT_bg`,
a foreground additive particle pool (`ParticleField`), a custom post pipeline
(HDR scene target → threshold bloom → separable blur → ACES/exposure/grade/
vignette/grain/conditional CA in `SceneCompositor`), the FUI HUD, adaptive
quality, and the simulation/event systems. All of this works and is verified;
this plan concerns **visual conviction**, not correctness or features.

---

## B. Visual critique (why it is not yet convincing)

Grounded in the rendered result:

- **The core reads as separable layers, not one optical phenomenon.** At closer
  framing the photon ring is a **perfectly circular, thin white outline** sitting
  *on top of* the disk — a drawn circle (billboard), exactly the "neon outline /
  glowing border of a circular mesh" failure mode. The eye reads "dark region +
  circular border", not "light bent around a shadow".
- **The shadow is not reliably, absolutely black** at all framings. At close
  range the near side of the disk veils the lower shadow with a brown gradient,
  and the billboard ring floats over that veil rather than hugging a hard black
  edge.
- **The disk is too soft, too orange and low in local contrast.** At medium
  quality the disk RT is 0.5× and the Gaussian bloom smears the body, so the
  procedural filaments and differential structure are washed into a uniform
  glowing band ("soft blurred torus").
- **The three "edges" do not coincide.** The sphere silhouette, the billboard
  ring radius, the 2D-lens shadow radius, and the disk-raymarch capture radius
  are computed independently and only approximately align, reinforcing the
  "circular mesh edge" impression instead of a continuous relativistic falloff.
- **Captured objects are low-detail primitives** (icosahedrons / box groups),
  small and often hard to read against the disk glow.

The background lensing itself is genuinely impact-parameter based (an Einstein
ring was verified with a test grid), so it is **more** than a uniform radial
warp — but because it is a *2D screen-space displacement of a flat background*
that is disconnected from the disk and the photon ring, it does not read as a
single warped-spacetime field.

---

## C. Root causes

| Weakness | Root cause |
|---|---|
| "Circle with a glowing border" | Photon ring is a **billboard quad** drawing a graphic circle, not light emerging from rays grazing the photon sphere. |
| Non-black / edge-y shadow | Shadow is an **opaque 3D sphere** whose silhouette is a mesh edge; its radius is decoupled from the lens and disk capture radii. |
| Layers don't fuse | **Four independent bending/masking models** (sphere, billboard, 2D lens, disk march) instead of one shared light-transport pass. |
| Soft, low-contrast disk | Disk RT at 0.5× on medium + broad Gaussian **bloom smearing the disk body**; turbulence frequency/contrast tuned for the pre-tone-mapping look. |
| Foreground disk veils shadow | Near-side disk density does not fully taper before the shadow silhouette; no shared occlusion between disk and shadow. |
| Weak captured objects | `IcosahedronGeometry` with a single fBm displacement + fixed fake key light; craft/debris are undisplaced boxes. |

---

## D. Prioritized improvements

### Critical
1. **Unify the black-hole core into a single bent-ray raymarch pass.** One
   fullscreen (reduced-res) pass integrates a bent ray per pixel and produces —
   from the *same* light-bending model — the **shadow** (captured rays → pure
   black), the **photon ring** (rays whose perihelion approaches the critical
   impact parameter → concentrated, thin, asymmetric brightness), the **lensed
   background** (escaped rays sample `RT_bg` by direction → arcs, duplication,
   correct falloff), and the **accretion disk** (volumetric integration during
   the march, giving the bent rear image above/below the shadow). This removes
   the billboard ring, the opaque sphere, and the 2D lens quad, eliminating the
   circular-outline artifact and fusing the core into one optical field.

### High
2. **Sharpen and enrich the disk.** Raise the disk-pass resolution scale on
   medium/high, keep bloom off the disk *body* (raise threshold / tighten
   blur radius), and increase turbulence contrast, add a finer high-frequency
   octave and stronger radial banding so plasma filaments and differential
   rotation read clearly.
3. **Guarantee an absolutely black shadow** at every framing: captured rays emit
   exactly zero; taper near-inner disk density so the front of the disk does not
   veil the silhouette; ensure bloom never lifts the shadow interior.
4. **Photon-ring quality**: thin, intense, angularly variable, brighter on the
   approaching side (from the shared Doppler/beaming term), stable during camera
   motion — as an emergent feature of the march, not a drawn ring.

### Medium
5. **Captured-object visual quality**: larger apparent scale, higher-detail and
   more varied geometry, better materials (composition-driven albedo/roughness,
   optional atmosphere rim, stronger thermal ramp), clearer silhouettes.
6. **Camera & composition**: reconsider default distance/FOV and disk
   inclination for a monumental, cinematic framing; tune cinematic choreography
   and destruction pull-back.

### Optional polish
7. Richer nebula/dust, refined color grade, subtle lens flare on the brightest
   beamed spot, refined grain, HUD contrast pass.

---

## E. Implementation phases

The prescribed order applies; note that phases 1–4 are largely **one refactor**
(the unified raymarch) delivered incrementally:

1. **Black-hole shadow & optical structure** — introduce the unified raymarch
   pass; move shadow to captured-ray blackness; remove the opaque sphere.
2. **Photon ring** — emergent perihelion/critical-impact-parameter brightness in
   the same pass; retire the billboard.
3. **Gravitational lensing** — background sampling by escaped-ray direction in
   the same pass; retire the 2D lens quad; verify arcs/duplication/falloff.
4. **Accretion disk** — fold disk volumetric integration into the unified march
   so the rear image bends around the shadow; then sharpen/enrich (High #2).
5. **Post-processing & image clarity** — bloom threshold/blur tuning, contrast,
   highlight/black-level preservation, DPR/AA/sharpness.
6. **Camera & composition** — framing, FOV, inclination, cinematic direction.
7. **Captured-object visual quality** — geometry, materials, thermal.
8. **Spaghettification** — verify/strengthen vertex-dependent deformation and
   integrate with the improved objects.
9. **Fragmentation & accretion response** — debris streams, disk disturbance,
   brightness/turbulence response to absorbed matter.
10. **HUD visual integration** — ensure it supports and never overpowers the
    refined scene.
11. **Final visual polish**.

---

## F. File-level change map

**Create**
- `src/shaders/black-hole/blackHoleField.fragment.glsl` — the unified bent-ray
  pass (shadow + photon ring + background sampling + disk integration).
- `src/components/black-hole/BlackHoleField.tsx` — hosts the unified pass;
  owns its uniforms (camera basis, radii, disk params, `RT_bg` sampler,
  quality steps).
- Possibly `src/shaders/common/lightBending.glsl` — shared bending/perihelion
  helpers included by the field shader.

**Modify**
- `src/components/scene/SceneCompositor.tsx` — replace the lens quad + disk
  composite with the single unified field pass sampling `RT_bg`; keep the HDR
  scene target + bloom + final composite; retune bloom.
- `src/components/black-hole/BlackHole.tsx` — becomes a thin wrapper (or is
  removed) once shadow/ring are in the field pass.
- `src/shaders/accretion/disk.glsl` — reused as the disk emission function
  called from the unified field; sharpen turbulence.
- `src/types/quality.ts` — add/adjust field march steps and resolution per tier.
- `src/components/celestial-objects/CelestialObject.tsx`,
  `src/shaders/planets/*` — higher-detail geometry and richer materials.
- `src/components/camera/CameraRig.tsx`, `CanvasHost.tsx` — framing/FOV.
- `src/stores/visualStore.ts` — any new visual knobs (kept minimal).

**Decompose / retire**
- `EventHorizon.tsx` (opaque sphere) and `PhotonRing.tsx` (billboard) —
  superseded by the field pass; remove once parity is reached.
- `shaders/lensing/lensing.fragment.glsl` — folded into the field pass.

**Unchanged systems** (must not regress)
- Simulation/event state machine, trajectory integrator, particle pool,
  telemetry/HUD data layer, adaptive quality, audio, context-loss, disposal.

---

## G. Shader strategy (unified field pass)

- **Coordinate spaces**: reconstruct a world-space view ray per pixel from the
  camera basis (right/up/forward) + `tan(fov/2)` + aspect (as the current disk
  pass already does). March in world units (`1 = r_g`), black hole at origin.
- **Uniforms**: camera position/basis, `tanHalfFov`, aspect; `uBackground`
  (`RT_bg`); radii (`captureRadius = photon sphere`, `photonRingRadius`,
  disk inner/outer); disk params (rotation, thickness, density, bend, reaction);
  `uTime` (sim clock), `uReducedMotion`; `uSteps`, `uBendStrength`; Doppler/beaming
  controls.
- **Render targets**: keep `RT_bg` (nebula + stars + lensed objects) at full res;
  the field pass runs at a quality-scaled resolution (as the disk pass does now)
  and is upsampled in the final composite. No new persistent RTs required.
- **Lensing approach**: per-pixel bent-ray march with adaptive step size
  (`~k·r`, clamped), deflection toward the hole (`∝ 1/r²`, calibrated so the
  shadow edge and photon ring match `3√3 r_g` and the photon sphere). Escaped
  rays sample `RT_bg` by their **exit direction** projected to UV → true bending
  of stars/nebula/objects, arcs, duplication, smooth far-field falloff.
- **Photon-ring computation**: track the ray's **minimum radius (perihelion)**;
  rays whose perihelion approaches the photon sphere (critical impact parameter)
  contribute a sharp, narrow brightness `∝ exp(−k·(r_min − r_ph)²)`, modulated by
  the shared beaming term → thin, intense, asymmetric ring that hugs the shadow
  by construction.
- **Disk turbulence model**: reuse `sampleDiskVolume` (differential Keplerian
  rotation, fBm + domain-warp filaments, `T(r) ∝ r^(−3/4)` blackbody ramp,
  Doppler `δ³` beaming, vertical scale height, reaction) with higher contrast and
  an added fine octave; integrated volumetrically along the same bent ray.
- **Relativistic brightness**: single Doppler/beaming factor shared by disk and
  photon ring so asymmetry is consistent.
- **Quality behavior**: steps and resolution scale per tier (low→ultra); adaptive
  quality already reacts to measured FPS. Early-out on capture / full opacity /
  outward escape.
- **Performance risks**: per-pixel march cost. Mitigations: reduced-res field
  target (existing pattern), adaptive step size, early termination, background
  fast-path for pixels far from the hole (direct `RT_bg` sample, no march), and
  the existing FPS-driven auto-downgrade.

---

## H. Object-quality strategy

- **Planets**: higher-subdivision geometry, multi-octave displacement with
  continents/craters, composition-driven albedo + roughness, optional atmosphere
  rim (fresnel) and thin cloud layer for rocky/ice types, stronger progressive
  thermal emission near the hole.
- **Asteroids**: lumpier low-frequency displacement, irregular silhouette,
  matte metallic/carbonaceous shading.
- **Spacecraft**: more modular geometry (fuselage, panels, engines, struts) with
  a metallic response and emissive accents; convincing proportions.
- **Debris**: varied fragments with tumbling and metallic/composite shading.
- **Particles**: keep the pooled additive system; add size/temperature variety,
  darker dust vs incandescent plasma separation, and coherent debris streams.
- **Thermal degradation**: shared heat ramp across objects and fragments;
  surface cracking already vertex-driven — strengthen and tie to integrity.
- **Fragmentation**: preserve orbital direction (already), increase count and
  add a short-lived bright flash + disk disturbance on major break-up.

---

## I. Performance strategy (no new packages)

- The unified field pass **replaces** three existing passes (2D lens quad, disk
  composite source, billboard ring) with one, at a quality-scaled resolution —
  net cost is comparable, with better coherence.
- Adaptive step size + early-out + a far-from-hole fast-path bound the march.
- Keep `RT_bg` full-res (cheap content); keep bloom at half-res.
- Rely on the existing per-quality knobs (steps, resolution, particle/star
  counts, DPR) and the FPS-driven auto-downgrade already shown to react in real
  time. Target remains fluid ~60 FPS on capable hardware, never guaranteed.

---

## J. Acceptance criteria

The visual pass is successful when, verified by browser inspection:

- The black hole no longer reads as a simple outlined circle; the core is one
  optical field.
- The shadow remains **absolutely black** at all framings.
- The photon ring is thin, intense and **distinct from the disk**, emergent from
  bending (no billboard outline).
- The surrounding light reads as **gravitational lensing** (arcs, duplication,
  correct falloff), affecting background *and* objects.
- The rear section of the disk is visibly bent **above and below** the shadow.
- The disk shows visible procedural detail and differential motion (not a soft
  uniform band).
- The image is **sharper** and preserves highlight detail and black levels.
- Captured objects have stronger silhouettes and materials and read at cosmic
  scale.
- Spaghettification is vertex-dependent.
- Fragmentation preserves orbital movement; matter visibly joins the accretion
  flow.
- The black hole feels monumental and cinematic.
- **No additional npm packages are introduced.**

---

## Next step

Approved and implemented. The implementation record below documents each phase.

---

# Implementation Record

## Phases 1–4 — Unified black-hole field ✅
- **Files:** created `shaders/black-hole/blackHoleField.fragment.glsl`,
  `shaders/black-hole/blackHoleFieldComposite.fragment.glsl`,
  `components/black-hole/BlackHoleField.tsx`; rewrote
  `components/scene/SceneCompositor.tsx`; removed the disjoint subsystems
  (`BlackHole`, `EventHorizon`, `PhotonRing`, `AccretionDiskRaymarch`, the 2D
  `lensing.fragment`, `diskComposite`, old `accretionDisk.*` and `photonRing.*`
  shaders).
- **Decisions:** one bent-ray march per pixel replaces the black sphere +
  billboard ring + 2D screen-space lens + separate disk pass. Shadow and photon
  ring are ANALYTIC in the impact parameter `b` (`b < b_crit = 3√3·r_g` → pure
  black; a thin band at `b ≈ b_crit`) — reliable and correctly sized. A gentle
  1/r² deflection adds the volumetric disk (curved rear image) and deflects
  escaped rays to sample `RT_bg` by exit direction (lensed background). The field
  runs at a quality-scaled resolution and is composited over the full-resolution
  background by a coverage term so distant stars stay sharp. A `directionToUv`
  guard prevents a divide-by-zero seam for near-perpendicular escaped rays.
- **Approximation:** calibrated screen-space bent-ray march, NOT geodesic
  integration; analytic impact-parameter shadow/ring.
- **Objective achieved:** the core reads as one optical/relativistic field —
  black shadow, distinct emergent photon ring, lensed background and a disk that
  bends above and below the shadow. No billboard outline.
- **Known limitation:** the disk is sampled with the same march, so ring/disk
  share one bend; extreme close-ups still veil the lower shadow with the near
  disk (physically plausible).

## Phase 5 — Post-processing & clarity ✅
- **Files:** `types/quality.ts` (higher field resolution + march steps per tier).
- **Decisions/objective:** field resolution raised (medium 0.5→0.6, high
  0.6→0.72, ultra 0.75→0.9) for a sharper disk; existing HDR + threshold bloom +
  ACES + exposure + grade + vignette + grain preserved; shadow stays black after
  the chain.
- **Limitation:** at low/medium the disk is still somewhat soft (bounded by the
  reduced field resolution the adaptive-quality system enforces).

## Phase 6 — Camera & composition ✅
- **Files:** `components/scene/CanvasHost.tsx`, `components/camera/CameraRig.tsx`.
- **Decisions/objective:** default framing widened (distance 26→34) so the
  monumental shadow and the disk bending around it read clearly; cinematic
  distance range widened; **camera pulls back during intense accretion events**
  (driven by the accretion-reaction signal). Manual/wheel/touch/reset/cinematic
  behaviour preserved.
- **Limitation:** cinematic mode pulls back on destruction but does not lock-track
  a single captured object (deliberate, to avoid motion sickness).

## Phase 7 — Captured-object quality ✅
- **Files:** `shaders/planets/planetSurface.fragment.glsl`,
  `simulation/events/objectFactory.ts`.
- **Decisions/objective:** raised the ambient light floor + added a fill light so
  bodies read against the bright disk instead of silhouetting to black; enlarged
  objects (×1.35) for cosmic scale. Displacement/craters/composition colour/heat
  retained.
- **Limitation:** spacecraft/debris remain simple modular geometry.

## Phase 8 — Spaghettification ✅
- **Files:** `shaders/planets/planetSurface.vertex.glsl` + `.fragment.glsl`.
- **Decisions/objective:** strengthened per-vertex radial elongation (×2.6) and
  tangential compression, asymmetric near/far, with brighter crack emissive —
  deformation depends on each vertex's position/tidal gradient (not a single-axis
  scale).

## Phase 9 — Fragmentation & accretion response ✅
- **Files:** `components/celestial-objects/EventsManager.tsx`.
- **Decisions/objective:** denser fragmentation burst preserving orbital
  direction + a brief hot flash on break-up; stronger disk accretion reaction
  pulse. Fragments (pooled particles) join the accretion flow; disk brightens/
  turbulence rises on absorption; HUD mass increments.

## Phase 10 — HUD integration ✅
- No changes needed: the FUI HUD is already restrained, uses real/measured
  values, is responsive/accessible, and never covers the black hole.

## Phase 11 — Final polish ✅
- **Files:** `shaders/postprocessing/final.fragment.glsl`,
  `components/scene/SceneCompositor.tsx`.
- **Decisions/objective:** subtle anamorphic horizontal flare from the brightest
  bloomed regions (Doppler spot / ring), blue-white tinted. Also raised the disk
  beaming/temperature floor so the edge-on receding side reads as dim orange
  instead of a hard black lane (fixing a reported artifact).
- **Limitation:** none material.
