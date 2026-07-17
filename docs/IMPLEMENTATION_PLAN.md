Status: APPROVED

# Black Hole Observatory — Implementation Plan

> This document is the controlling implementation plan required by `AGENTS.md`
> (Planning Gate) and by section 1 of `docs/BLACK_HOLE_PROJECT_BRIEF.md`.
> While the first line reads `Status: DRAFT`, no application source code is
> modified. Only analysis and planning documentation are produced.
>
> Written in English to stay consistent with `AGENTS.md` and the project brief.
> All user-facing interface strings defined here are examples and remain in
> Spanish, per the language rules.

---

## 0. Current Repository State (verified by inspection)

- Default Vite + React 19 + TypeScript scaffold. `src/App.tsx`, `src/main.tsx`,
  `src/App.css`, `src/index.css` are Vite boilerplate. No simulation code exists.
- Dependencies already installed and locked (`package-lock.json` → **npm**):
  `three@^0.185.1`, `@react-three/fiber@^9.6.1`, `@react-three/drei@^10.7.7`,
  `@react-three/postprocessing@^3.0.4`, `postprocessing@^6.39.2`,
  `zustand@^5.0.14`, `react@^19.2.7`, `react-dom@^19.2.7`. Node `>=24`.
- Build tooling: Vite 8, TypeScript ~6.0, ESLint 10 flat config.
- **Gap:** `tsconfig.app.json` does not set `"strict": true`; AGENTS.md §8 requires
  strict mode. Enabling it is Phase 0 work.
- Not a Git repository. Version control is out of scope unless requested.

**Consequence:** we build on the existing stack as-is. No framework or package
manager changes. Phase 0 replaces the boilerplate with the real application shell.

---

## 1. Guiding Principles

1. **The black hole is the experience.** Rendering fidelity of the horizon,
   photon ring, disk, and lensing takes priority (brief §21 order).
2. **React composes; it does not animate.** All per-frame work happens in
   `useFrame` against refs and uniforms. Zustand never drives frame-rate rerenders.
3. **Scientific honesty.** Every value is tagged as physically-derived,
   normalized, integrated-approximation, screen-space-approximation, or artistic.
   The educational mode names each approximation.
4. **One coherent phase at a time.** Each phase ends in a runnable, inspectable
   state with acceptance checks, before the next begins.
5. **Budget-driven quality.** Every heavy system exposes a quality knob
   (shader steps, particle counts, effect toggles) driven by a central profile.

---

## 2. Physical Model & Units

### 2.1 Model choice

Primary model: **Schwarzschild** black hole, with a **configurable spin
parameter `a*` (0–0.998)** used as a *visual and analytical* Kerr-like
approximation (asymmetric photon ring, ISCO shift), **not** a full Kerr metric.
This is documented as an approximation in code and in educational mode.

### 2.2 Internal units (normalized, for numerical stability)

- Length unit: **gravitational radius** `r_g = GM/c²`. Schwarzschild radius
  `r_s = 2 r_g`. The scene places `r_g = 1` in world space (configurable scale).
- Time unit: normalized simulation seconds; a `timeScale` multiplier maps to it.
- Mass: normalized to 1 internally; physical display via `M_sun`.

### 2.3 Derived quantities (physically grounded)

| Quantity | Relation | Notes |
|---|---|---|
| Schwarzschild radius | `r_s = 2GM/c²` | exact for chosen M |
| Photon sphere | `r_ph = 1.5 r_s` (Schwarzschild) | Kerr: interpolate toward `r_g` for prograde as `a*→1` (approx.) |
| ISCO | `6 r_g` (Schwarzschild) → down to `~1 r_g` (extremal prograde Kerr, Bardeen formula) | analytical Bardeen `r_isco(a*)` |
| Orbital velocity | `v(r) = c·√(r_g/r)` (Newtonian/weak-field form) | flagged approximation near horizon |
| Disk temperature | `T(r) ∝ r^(-3/4)` (Shakura–Sunyaev thin disk) | normalized, mapped to blackbody color |
| Gravitational redshift | `1+z = 1/√(1 − r_s/r)` | diverges at horizon → clamped |
| Time dilation | `dτ/dt = √(1 − r_s/r)` | shown as factor in HUD |
| Doppler factor | relativistic `δ = 1/[γ(1 − β·n̂)]` | drives disk brightness asymmetry |
| Relativistic beaming | `I ∝ δ³` (bolometric) or `δ⁴` (monochromatic); we use `δ³` | artistic-calibrated exponent, documented |
| Tidal gradient | `Δg ∝ 2GM·L / r³` | L = object size; drives spaghettification |

**Classification is explicit:** each HUD value carries a provenance tag
(`derived | normalized | integrated | screen-space | artistic`) so educational
mode and code comments can state honestly what is exact vs. approximate.

### 2.4 What is NOT modeled (documented limitations)

- No per-pixel geodesic integration in the Schwarzschild metric.
- No frame dragging beyond the analytical ISCO/photon-ring shift.
- No self-consistent radiative transfer; disk emission is a calibrated shader.
- Newtonian orbital integration with near-horizon visual corrections, not full GR.

---

## 3. Target Architecture

Directory layout (aligned with AGENTS.md §9 and brief §18):

```text
src/
  app/                      # App shell, Canvas host, providers, error boundaries
  components/
    scene/                  # Scene root, lighting rig, frame orchestration
    black-hole/             # Horizon mesh, photon ring, shadow occluder
    accretion-disk/         # Disk mesh + material binding
    celestial-objects/      # Procedural planets/moons/asteroids/craft/debris
    particles/              # Fragment + plasma + dust particle systems (pooled)
    camera/                 # Manual controls + cinematic rig + transitions
    environment/            # Starfield, nebulae, dust layers
    postprocessing/         # Effect composer graph
  hud/
    header/  panels/  alerts/  controls/  educational/  common/
  simulation/
    physics/                # Constants derivation, orbital integrator, tidal model
    events/                 # Event state machine + scheduler + object factory
    trajectories/           # Orbit integration helpers, decay, precession
    constants/              # Physical + scene constants (units, radii)
  shaders/
    lensing/  accretion/  particles/  planets/  environment/  common/
  stores/                   # Zustand slices (see §4)
  hooks/                    # useFrame helpers, capability detection, resize, RAF
  types/                    # Domain types, discriminated unions
  utils/                    # Math, color/blackbody, pooling, disposal
  styles/                   # CSS Modules + design tokens
```

### 3.1 Rendering topology (multi-pass)

The lensing requirement (affect background *and* objects behind the hole) forces
a **screen-space post-lensing** approach rather than only bending disk geometry.

```
Pass A  "Background RT"   → starfield + nebulae + dust + distant objects
                            rendered to an offscreen render target (RT_bg).
Pass B  "Lensing"         → fullscreen shader samples RT_bg with an analytic
                            deflection field (impact-parameter based), producing
                            the lensed background (Einstein arcs, duplication).
Pass C  "Foreground"      → accretion disk, photon ring, near-field particles,
                            captured objects in front of / around the hole,
                            composited over the lensed background using the
                            horizon depth/shadow mask.
Pass D  "Post"            → EffectComposer: bloom (selective), tone mapping,
                            exposure, vignette, grain, conditional CA, flares.
```

Trade-off discussed in §7 (Lensing). Disk images that must appear *above/below*
the horizon (top and bottom secondary images) are produced by the lensing pass
sampling a disk contribution, plus a curved disk geometry for the primary image.

---

## 4. State Architecture (Zustand)

Separate slices; components subscribe with selectors. **No slice is read inside
`useFrame` in a way that triggers rerenders**; per-frame values live in refs /
mutable stores read imperatively.

| Slice | Owns | Update cadence |
|---|---|---|
| `physicsStore` | mass (M_sun), spin a*, derived radii, timeScale | user input (rare) |
| `visualStore` | disk density/inclination, lensing intensity, exposure, bloom, particle density, quality profile | user input (rare) |
| `cameraStore` | mode (manual/cinematic), target, reset token | user input + transitions |
| `eventStore` | active events list, per-event state tag, scheduler config, next event type | event ticks (throttled) |
| `hudStore` | derived display values snapshot | throttled (≈10 Hz) from sim |
| `metricsStore` | measured FPS, frame time, drawcalls, quality auto-adjust | sampled (≈2–4 Hz) |
| `prefsStore` | reduced motion, reduced flashes, sound on/off + volume, educational mode | user input, persisted to localStorage |

A dedicated **non-reactive `simulationRuntime`** (plain module object, not React)
holds hot mutable data: object positions/velocities, particle buffers, uniform
targets. The render loop writes here; HUD reads throttled snapshots.

---

## 5. Simulation Loop & Time

- Single `useFrame` orchestrator in `components/scene` calls subsystems in order:
  physics integrate → event FSM tick → geometry/uniform update → camera update.
- **Fixed-step physics** accumulator (e.g. 120 Hz internal) decoupled from render;
  delta clamped (e.g. max 1/30 s) to avoid jumps after tab throttling.
- Uniforms updated by direct mutation; **no allocations in the loop** (pre-allocated
  `THREE.Vector3`/`Color`/`Matrix4` scratch objects in `utils`).
- HUD/metrics sampled on interval timers, not every frame.
- Tab visibility (`document.hidden`) pauses/reduces the loop.

---

## 6. Shader Strategy

Shaders live in `src/shaders/**` as `.glsl` / `.ts` string modules with typed
uniform interfaces. Shared noise (simplex/curl) and color/blackbody helpers live
in `shaders/common` and are `#include`-composed (via a small string include
resolver) to avoid duplicated noise implementations.

Shader modules:

1. **`accretion/disk`** — procedural disk. Radial differential rotation
   (`ω(r) ∝ r^(-3/2)`), multiscale FBM + curl-noise turbulence, plasma
   filaments, density falloff, `T(r) ∝ r^(-3/4)` → blackbody color ramp,
   Doppler brightness/color asymmetry (`δ`), vertical thickness via view-dependent
   thickness term and a second offset plane for above/below matter. Quality knob:
   noise octaves + samples.
2. **`black-hole/photonRing`** — thin, intense ring at the apparent shadow edge;
   angular intensity variation; approaching-side brightening; subtle orbital
   flicker; kept visually distinct from the disk.
3. **`black-hole/horizonShadow`** — pure-black occluder that writes depth and a
   stencil/shadow mask so bloom/tone-mapping cannot lift it to gray; feeds the
   compositor mask.
4. **`lensing/deflection`** — fullscreen; analytic impact-parameter deflection
   sampling `RT_bg` (see §7). Quality knob: iteration/refinement steps.
5. **`environment/starfield`** — multilayer procedural stars, color-temperature
   variation, parallax depth; faint nebulae + dust as low-frequency noise layers.
6. **`particles/fragment`** — point/instanced sprites driven by buffer attributes
   (position, velocity, age, lifetime, temperature, intensity, size, type, drag);
   temperature→color, size attenuation, additive plasma.
7. **`planets/surface`** — displacement noise, craters, roughness/albedo by type,
   optional atmosphere rim, progressive thermal emission during spaghettification.
8. **`planets/spaghettification`** (vertex) — per-vertex radial elongation +
   tangential compression from the tidal gradient; near/far asymmetric
   acceleration; surface cracking mask; thermal emission ramp (see §9).

Rules enforced (AGENTS.md §13): documented coordinate spaces, descriptive
uniforms, minimal hot-path branching, configurable step counts, aspect-correct,
frame-rate-independent (time uniform, not per-frame accumulation of noise seeds),
stability during camera motion.

---

## 7. Gravitational Lensing Strategy

**Chosen approach:** calibrated **analytic screen-space deflection** driven by an
approximation of each ray's **impact parameter**, applied as a post pass over an
offscreen background RT — not a uniform radial warp, and not full geodesics.

### 7.1 Model

- For a screen ray, estimate the impact parameter `b` from the angular distance
  to the black-hole center in screen space, mapped through camera FOV/distance.
- Deflection angle approximated by the weak-field expression scaled to strong
  field near the shadow: `α(b) ≈ 2 r_s / b` in the weak regime, blended into a
  steep empirical curve as `b → b_photon` so rays near the photon sphere wrap,
  producing **Einstein arcs** and **apparent duplication**.
- Warp the sample coordinate in `RT_bg` by `α` along the radial direction toward
  the center. A **second, oppositely-offset sample** near the critical radius
  yields the secondary (duplicated) image and the top/bottom disk echoes.
- Inside the apparent shadow radius, output is forced black (horizon mask).
- Calibrated so: horizon location respected, photon sphere visually correct,
  multiple disk images, background stars visibly bent, smooth (no seams via
  smoothstep blending between weak/strong regimes).

### 7.2 What it lensing-affects

Background stars, nebulae, dust (in `RT_bg`); the disk's secondary images;
objects/particles/craft placed behind the hole are rendered into `RT_bg` when
their depth is behind the hole, so they are lensed too. The near/front disk
primary image also uses curved geometry for correct silhouette.

### 7.3 Honesty

Documented explicitly as a screen-space analytic approximation, not per-pixel
geodesic integration. Educational mode states this.

### 7.4 Fallback

If the multi-pass RT cost is too high on low profiles, degrade to a
single-image deflection (arcs preserved, duplication reduced) before touching
resolution.

---

## 8. Event System & State Machine

### 8.1 Object types (brief §7)

`rocky-planet | ice-world | moon | asteroid-swarm | gas-cloud | spacecraft |
station-debris`. Each produced by a **factory** yielding geometry + material
params + physical params (mass, size, composition) + behavior overrides.

### 8.2 State machine (discriminated union)

```
type EventState =
  | { phase: 'detection' }
  | { phase: 'approach' }
  | { phase: 'gravitational-capture' }
  | { phase: 'unstable-orbit' }
  | { phase: 'tidal-deformation' }
  | { phase: 'fragmentation' }
  | { phase: 'accretion' }
  | { phase: 'dissipation' }
  | { phase: 'recovery' }
```

Each active event holds a shared **event contract** (id, type, physical params,
trajectory state, timers, provenance) plus per-type behavior. Transitions are
driven by distance-to-horizon thresholds and elapsed time, not fixed timers only.
Scheduler auto-spawns at a configurable interval; manual trigger from HUD forces
the next spawn and lets the user pick the type (brief §7, §11.5).

### 8.3 Trajectories (no linear lerp)

Newtonian gravity integrator (semi-implicit Euler / velocity-Verlet) with:
curved approach, speeding up as `r` decreases, orbital-energy loss (drag term),
orbital-plane variation, approximate precession, orbital decay → capture. Near
the horizon, a visual correction slows apparent crossing (a distant observer
never sees full crossing — brief §12). Documented as Newtonian + visual GR
correction.

### 8.4 Disk reaction to accretion (brief §9)

On `accretion`, push a perturbation into disk uniforms: temporary luminosity
increase, turbulence intensification, inner-material speed-up, a propagating
wave term, HUD mass increment, controlled exposure reaction (no full-frame
overexposure).

---

## 9. Spaghettification & Fragmentation

- **Vertex-driven** (brief §8, AGENTS.md §17): deformation is a function of each
  vertex's world position relative to the hole, using the tidal gradient
  `∝ M·L/r³`. Radial elongation + tangential compression; near side accelerates
  more than far side (asymmetric term); progressive with gradient; surface crack
  mask grows; thermal emission ramps toward incandescent. **Not** a single-axis
  scale of the whole object.
- **Fragmentation:** at threshold, spawn fragments/particles from surface points
  that **inherit orbital velocity direction** (no spherical explosion). Fragments
  and dust drift into the accretion flow over their lifetime.
- **Particles:** pooled `InstancedMesh`/`Points` with `BufferGeometry` custom
  attributes (position, velocity, age, lifetime, temperature, intensity, size,
  matter type, orbital drag). Pool pre-allocated per quality profile; no per-frame
  allocation; recycled on death.

---

## 10. Camera & Navigation

- **Manual:** damped orbit (drag), wheel zoom with min distance clamp (cannot
  cross horizon), cinematic sensitivity, touch gestures (one-finger orbit,
  pinch zoom). Built on Drei `OrbitControls` (or a thin custom controller) with
  damping; reset button.
- **Cinematic:** scripted keyframe rig — approach, lateral orbit, near-edge-on
  disk, partial top-down, capture tracking, pull-back on destruction. Eased
  (no linear), interruptible; "return to manual" restores control smoothly.
- Transitions honor reduced-motion: shortened/eased or instant-settle.

---

## 11. HUD & Educational Mode

- FUI aesthetic: monospaced type, semi-transparent white, subtle blue/phosphor,
  thin lines, controlled blur, restrained. Canvas is the visual priority.
- Panels (brief §11): header (title, model, coords, times, **measured FPS**,
  quality, renderer status), physical parameters, detected-object, alerts
  (red only for critical, subtle blink, no harsh flashes), controls (physical vs
  visual separated).
- **Educational mode** (brief §12): toggle; contextual panels for horizon,
  Schwarzschild radius, photon sphere, ISCO, lensing, Doppler asymmetry,
  redshift, tidal forces, spaghettification, distant-observer crossing, and an
  explicit "approximations" section. Selecting a concept highlights the region
  and can show overlay diagrams without forcing pause.
- Responsive (brief §16): collapsible panels on small screens, never hiding the
  scene; keyboard nav, focus states, adequate contrast, touch targets, reduced
  motion/flash options; clear WebGL2-unavailable message.
- All HUD text in Spanish.

---

## 12. Post-Processing

`@react-three/postprocessing` composer: selective bloom (disk/photon ring/hot
particles only — horizon stays black via mask), ACES-style cinematic tone
mapping, exposure control, subtle vignette, very light grain, color grading,
controlled lens flares, **chromatic aberration only during extreme events**,
optional motion blur only if cheap and clear. Bloom tuned so disk retains
internal texture; horizon never lifts to gray.

---

## 13. Performance Strategy

- **WebGL2 required**; capability detection at boot; graceful message otherwise.
- Quality profiles **low / medium / high / ultra** driving: particle counts,
  shader step/octave counts, RT resolution scale, lensing sample count,
  post-effect toggles, DPR cap. Central `qualityProfile` in `visualStore`.
- Adaptive DPR + runtime auto-downgrade when measured frame time exceeds budget,
  degrading **in this order** (AGENTS.md §15): secondary particle density →
  distant env detail → shader iterations → secondary post effects →
  volumetric/shadow detail → render resolution (last).
- Instancing, particle pooling, buffer reuse, frustum culling, throttled
  telemetry, explicit disposal of geometries/materials/textures/RTs/effects and
  event listeners, WebGL context-loss/restore handling, tab-hidden throttle,
  `ResizeObserver` for canvas/orientation.
- **Measured** FPS only (rolling average); never hardcoded.

---

## 14. Responsive & Accessibility

Desktop / laptop / tablet / phone. Portrait + landscape via ResizeObserver.
Touch controls; keyboard navigation and visible focus for all HUD controls;
contrast-checked tokens; accessible Spanish labels; `prefers-reduced-motion`
plus in-app reduced-motion/flash toggles; collapsible HUD on small screens;
WebGL2 fallback screen.

---

## 15. Implementation Phases

Each phase is independently runnable and ends with the listed checks. Order
follows the brief's priority (§21): black hole → lensing → disk → events →
performance → education → FUI → secondary/sound.

**Phase 0 — Foundation & shell**
Replace boilerplate; enable `"strict": true`; set up `app/` Canvas host, error
boundary, WebGL2 detection + fallback screen, design tokens, Zustand slices
skeleton, constants/units, capability detection, resize + visibility hooks,
disposal utilities. → Checks: dev server runs, blank cinematic canvas, no console
errors, strict build passes, quality profile switch is wired.

**Phase 1 — Black hole core**
Horizon shadow (absolute black, depth/mask), photon ring shader (distinct,
asymmetric, flicker), basic starfield background. → Checks: horizon stays black
under bloom; photon ring distinct and asymmetric; silhouette precise.

**Phase 2 — Gravitational lensing**
Offscreen `RT_bg`, deflection post pass, compositor with horizon mask; Einstein
arcs, duplication, background star bending; smooth regime blend. → Checks:
background stars visibly bent; arcs + duplication present; horizon respected;
no seams; documented as approximation.
Adjustment (implemented): a faint procedural nebula/dust layer was pulled forward
from Phase 4 into the lensed background so the deflection has continuous
structure to bend (making lensing visible against the sparse starfield) and to
satisfy brief §4. A shared `shaders/common/noise.glsl` + minimal `#include`
resolver (`utils/shader.ts`) were introduced here and are reused by later
shaders. Reduced-motion (`prefsStore` + `prefers-reduced-motion`) now damps the
photon-ring flicker and star twinkle.

**Phase 3 — Accretion disk**
Procedural disk shader: differential rotation, turbulence, filaments, `T(r)`
color, Doppler asymmetry, vertical structure, curved primary image + lensed
secondary images (above/below). → Checks: differential motion; not a rotating
texture; brightness asymmetric; disk curves above/below horizon.

**Phase 4 — Camera & environment depth**
Manual damped orbit + zoom clamp + touch; cinematic rig + transitions; parallax
tuning of the starfield/nebula/dust (the nebula/dust layer itself was introduced
early in Phase 2). → Checks: mouse + touch navigation; cannot cross
horizon; cinematic mode eased and interruptible.

**Phase 5 — Objects, events, trajectories**
Procedural object factory; event FSM + scheduler + manual trigger; Newtonian
orbital integrator with decay/precession + near-horizon visual correction.
→ Checks: objects follow orbits (not lines); full state progression; manual
trigger works.
Adjustment (implemented): captured objects are rendered into the shared
background scene (via `CompositorScenesProvider`), so the gravitational-lensing
pass bends them — verified with a test marker forming an Einstein ring around
the shadow — and the shadow occludes those behind it. This applies the
far-field screen-space lens to finite-distance bodies (documented approximation,
strongest near the ring). The disk composite still draws over the lensed
background, so an object overlapping the disk is dimmed by it (acceptable; the
disk is semi-transparent).

**Phase 6 — Spaghettification, fragmentation, particles, disk reaction**
Vertex spaghettification; fragmentation preserving orbital direction; pooled
particle systems; disk luminosity/turbulence reaction to accretion. → Checks:
per-vertex deformation; fragments join disk flow; disk reacts to absorbed matter;
no per-frame allocations.

**Phase 7 — Post-processing pipeline**
Composer graph, selective bloom, tone mapping/exposure, vignette/grain/grading,
conditional CA/flares. → Checks: horizon black; disk keeps texture; effects
scale with quality.

**Phase 8 — HUD & FUI**
Header, physical params, detected-object, alerts, controls (physical vs visual),
responsive collapsible layout, keyboard/focus/touch. → Checks: HUD shows live
sim values + measured FPS; usable desktop + mobile.

**Phase 9 — Educational mode**
Concept panels + region highlighting + overlay diagrams + approximations section.
→ Checks: concepts explained; approximations named; highlight without forced pause.

**Phase 10 — Sound & polish**
Optional audio (off until interaction), volume/mute; final performance auto-tune,
disposal audit, context-loss test, responsive/reduced-motion audit, README (ES).
→ Checks: audio opt-in; disposal clean; acceptance criteria (§17) all met.

---

## 16. Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Multi-pass lensing cost (RT + post) | FPS on mid/low devices | RT resolution scale per profile; single-image fallback; degrade order keeps resolution last |
| Bloom graying the horizon | Breaks core requirement | Horizon mask excludes it from bloom; validated in Phase 1 & 7 |
| Disk secondary images (above/below) hard via screen-space only | Weak lensing realism | Combine curved primary geometry + lensing-pass disk echo; calibrate |
| Per-frame allocation creeping in | GC stutter | Scratch objects, pooled particles; lint/review gate; profile in Phase 6 |
| WebGL2 unsupported / context loss | Blank or crash | Detection + fallback screen; context-loss/restore handlers (Phase 0) |
| Zustand-driven frame rerenders | Perf regression | Runtime module for hot data; throttled HUD snapshots; selector discipline |
| Spin/Kerr expectations vs Schwarzschild base | Scientific overclaim | a* is analytic/visual approx only; documented in code + educational mode |
| Scope creep from library convenience | Timeline/quality | Phase gate; AGENTS.md §21 scope control |
| Strict mode retrofit late | Type churn | Enable strict in Phase 0 before feature code |

---

## 17. Acceptance Criteria (from brief §21 / AGENTS.md §23)

The project is done only when all hold, verified by inspection + browser check:

1. Absolutely black shadow (horizon), unaffected by bloom/tone mapping.
2. Distinct, asymmetric photon ring separate from the disk.
3. Procedural, differentially-rotating disk (not a rotating texture).
4. Relativistic Doppler brightness asymmetry on the disk.
5. Gravitational lensing affects background **and** objects, not only disk geometry.
6. Disk visibly curved above and below the horizon.
7. Mouse **and** touch navigation; camera cannot cross the horizon.
8. Objects follow orbital trajectories (not straight lines) through the full FSM.
9. Spaghettification deforms vertices spatially (not a single-axis scale).
10. Objects fragment and merge into the disk; disk reacts to absorbed matter.
11. HUD shows dynamic real simulation values and **measured** FPS.
12. Educational mode explains concepts and names approximations.
13. Quality adapts to device capability (low/medium/high/ultra + auto-downgrade).
14. Usable on desktop and mobile; reduced-motion respected.
15. No placeholders; no functionality faked with text; GPU resources + listeners
    disposed correctly; context loss handled.

---

## 18. Open Questions for the User

1. **Spin scope:** confirm Kerr stays a *visual/analytic approximation* over a
   Schwarzschild base (recommended), not a full Kerr metric.
2. **Sound:** implement the optional audio layer now (Phase 10) or defer as
   stretch? Brief lists it as lowest priority.
3. **Cinematic default:** should the experience auto-start in cinematic camera,
   or manual with a prompt to enable cinematic?
4. **Reduced-motion default:** honor OS `prefers-reduced-motion` automatically on
   first load (recommended), overridable in controls?

These do not block approval; defaults are chosen (recommended options) if unanswered.

---

## 19. Next Step

Awaiting explicit approval. On approval I will set `Status: APPROVED` and begin
**Phase 0** only, then proceed one phase at a time with checks between phases.
No application source code is modified until then.
