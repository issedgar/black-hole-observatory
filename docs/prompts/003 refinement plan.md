# BLACK HOLE VISUAL REFINEMENT — AUDIT AND IMPLEMENTATION PLAN

Act as a Principal Web Graphics Engineer and Senior Cinematic Art Director specializing in:

* WebGL.
* Three.js.
* React Three Fiber.
* GLSL shaders.
* Real-time scientific visualization.
* Cinematic space rendering.
* Functional science-fiction interfaces.
* GPU performance optimization.

Your task in this phase is to perform a rigorous visual and technical audit of the current black-hole implementation and produce a complete, prioritized improvement plan.

Do not modify application source code during this phase.

Do not install packages.

Do not change the current technology stack.

Do not create deployment configuration, production builds, test suites, CI/CD workflows, backend services, or infrastructure.

## 1. MANDATORY PREPARATION

Before producing the audit:

1. Read `AGENTS.md` completely.
2. Read `docs/BLACK_HOLE_PROJECT_BRIEF.md` completely.
3. Read `docs/IMPLEMENTATION_PLAN.md` when it exists.
4. Inspect the current repository structure.
5. Inspect the actual implementation of:

   * The black-hole shadow.
   * The event horizon.
   * The photon ring.
   * The accretion disk.
   * Gravitational lensing.
   * The procedural star field.
   * Celestial objects.
   * Object deformation.
   * Fragmentation.
   * Particles.
   * Camera controls.
   * Cinematic camera.
   * Post-processing.
   * HUD integration.
6. Inspect the application visually in the browser when browser inspection is available.
7. Base every conclusion on the current code and rendered result, not on comments, filenames, previous descriptions, or assumed functionality.

## 2. CURRENT VISUAL PROBLEM

The current black hole is not yet visually convincing enough.

It reads too much like:

* A flat black circle.
* A dark sphere with a visible circular outline.
* A central disk with a glowing border.
* A conventional 3D object placed in front of a background.

It does not yet communicate strongly enough:

* A black-hole shadow.
* Extreme light concentration.
* A photon ring.
* Gravitational lensing.
* Warped space-time.
* Apparent duplication of the accretion disk.
* Light bending around the black hole.
* Strong relativistic depth.
* Cosmic scale.
* Cinematic realism.

The visual transition between the black central region and the surrounding light must feel like an optical and relativistic phenomenon, not like the edge of a circular mesh.

## 3. PRIMARY AUDIT AREAS

Analyze all of the following areas.

### 3.1 Black-hole shadow and event horizon

Determine:

* Why the center currently reads as a simple black circle.
* Whether a visible mesh silhouette, material edge, halo, or bloom artifact is creating an artificial outline.
* Whether the black region is being rendered as geometry, screen-space masking, ray intersection, or another method.
* Whether tone mapping, bloom, exposure, antialiasing, or compositing is weakening the black shadow.
* Whether the apparent size of the shadow is consistent with the lensing implementation.
* Whether the event horizon and the apparent black-hole shadow are being incorrectly treated as the same visual radius.

Propose how to make the central region:

* Absolutely black.
* Optically embedded in the surrounding distortion.
* Free from a simple graphic outline.
* More dimensional without making it look like a lit sphere.
* Visually integrated with the photon ring and lensing field.

### 3.2 Photon ring

Evaluate:

* Current thickness.
* Current sharpness.
* Current brightness.
* Radial falloff.
* Angular variation.
* Relativistic asymmetry.
* Interaction with bloom.
* Separation from the accretion disk.
* Stability during camera movement.

The photon ring should not look like:

* A circular border.
* A neon outline.
* A uniform halo.
* A blurred bloom artifact.

It should feel like a highly concentrated, narrow, unstable accumulation of bent light.

### 3.3 Gravitational lensing

Determine whether the current lensing implementation truly affects:

* The star field.
* The accretion disk.
* Nebulae.
* Planets.
* Asteroids.
* Spacecraft.
* Fragments.
* Particles behind the black hole.

Identify whether the current implementation is merely:

* A radial UV distortion.
* A curved disk mesh.
* A screen-space magnification.
* A circular warp without impact-parameter behavior.
* A decorative approximation that does not create a convincing lens.

Propose a stronger implementation using only the current stack.

The improved lensing should create:

* Apparent curvature of the disk above and below the shadow.
* Partial Einstein arcs.
* Image compression near the photon ring.
* Apparent duplication of portions of the disk.
* Stronger bending close to the critical region.
* Smooth falloff farther from the black hole.
* Correct interaction with camera angle and aspect ratio.
* Stable rendering without visible seams or circular borders.

### 3.4 Accretion disk

Audit:

* Geometry.
* Shader structure.
* Coordinate system.
* Procedural noise.
* Turbulence.
* Differential rotation.
* Temperature mapping.
* Density variation.
* Optical thickness.
* Vertical structure.
* Relativistic Doppler asymmetry.
* Relativistic beaming.
* Local contrast.
* Bloom contribution.
* Sharpness.
* Interaction with lensing.
* Interaction with incoming matter.

The accretion disk must feel less like:

* A flat ring.
* A transparent texture.
* A rotating disk.
* A uniform glowing band.
* A soft blurred torus.

It should feel like:

* Hot plasma under extreme orbital motion.
* A turbulent and radially differentiated structure.
* Matter with different velocities at different radii.
* A physically inspired luminous flow.
* A disk whose rear section is visibly bent around the black hole.

### 3.5 Objects being consumed

Audit the current quality of:

* Rocky planets.
* Ice worlds.
* Moons.
* Asteroids.
* Spacecraft.
* Orbital debris.
* Fragmented matter.

Evaluate:

* Silhouette.
* Scale.
* Surface detail.
* Procedural displacement.
* Material response.
* Roughness.
* Atmospheric effects.
* Thermal response.
* Interaction with the surrounding light.
* Visibility against the dark background.
* Motion trajectory.
* Tidal deformation.
* Fragmentation.
* Transition into accretion matter.

The objects currently being consumed should be treated as a major visual weakness requiring substantial improvement.

Determine whether they currently look like:

* Basic primitives.
* Low-detail spheres.
* Generic meshes.
* Objects moving linearly.
* Objects being uniformly stretched.
* Objects disappearing instead of being accreted.
* Conventional explosions rather than orbital fragmentation.

### 3.6 Spaghettification

Verify whether deformation is:

* Vertex-dependent.
* Radially oriented.
* Based on distance to the black hole.
* Based on the tidal gradient.
* Different on the near and far sides of the object.
* Combined with tangential compression.
* Combined with thermal and structural degradation.

Reject any implementation that only scales the whole object along one axis.

Propose how to improve:

* Radial elongation.
* Tangential compression.
* Surface cracking.
* Material heating.
* Progressive loss of structural integrity.
* Fragment detachment.
* Transition from object geometry to particle flow.

### 3.7 Fragmentation and accretion

Evaluate whether fragmented matter:

* Preserves orbital momentum.
* Produces coherent debris streams.
* Produces incandescent particles.
* Produces dark dust.
* Produces solid fragments.
* Becomes integrated into the disk.
* Generates visible disturbances in the disk.
* Changes local brightness and turbulence.

The object must not simply explode, fade out, or disappear.

### 3.8 Post-processing and image clarity

Audit:

* Bloom.
* Exposure.
* Tone mapping.
* Contrast.
* Color grading.
* Vignette.
* Chromatic aberration.
* Film grain.
* Resolution.
* Device Pixel Ratio.
* Antialiasing.
* Render-target resolution.
* Perceived sharpness.
* Detail preservation in highlights.
* Black-level preservation.

Determine whether the image is:

* Too blurred.
* Too soft.
* Too orange.
* Too uniformly bright.
* Too dark.
* Washed out.
* Overexposed.
* Lacking local contrast.
* Losing details because of bloom.

Propose exact visual corrections.

### 3.9 Camera and composition

Evaluate:

* Initial framing.
* Distance to the black hole.
* Camera focal length.
* Field of view.
* Disk inclination.
* Relative scale of captured objects.
* Visual hierarchy.
* Negative space.
* Cinematic orbit.
* Object tracking.
* Camera movement during destruction.
* Sense of cosmic scale.

The black hole must feel monumental and physically dominant.

Captured objects should reinforce scale instead of appearing disconnected or toy-like.

### 3.10 HUD integration

Ensure that the interface:

* Does not overpower the scene.
* Does not reduce perceived cinematic quality.
* Uses real values.
* Supports the visual event.
* Maintains readability.
* Uses critical red only when necessary.
* Does not introduce excessive glow, borders, or visual noise.

## 4. CURRENT STACK CONSTRAINT

Use only the already installed technology stack.

Do not install or recommend installing any additional npm package.

Do not recommend Leva or any alternative tuning library.

Do not change:

* React.
* TypeScript.
* Vite.
* Three.js.
* React Three Fiber.
* Drei.
* GLSL.
* `@react-three/postprocessing`.
* `postprocessing`.
* Zustand.
* The existing styling solution.

Any proposed improvement must be achievable through:

* Better architecture.
* Better shaders.
* Better Three.js usage.
* Better render-target composition.
* Better geometry.
* Better procedural generation.
* Better particle behavior.
* Better post-processing configuration.
* Better camera direction.
* Better tuning of existing parameters.

## 5. REQUIRED OUTPUT

Create or update:

`docs/VISUAL_REFINEMENT_PLAN.md`

The first line must be:

`Status: DRAFT`

The document must contain:

### A. Current-state assessment

A factual summary of what currently exists.

### B. Visual critique

A direct and technically grounded explanation of why the current result is not yet convincing.

### C. Root causes

Identify the implementation decisions causing each major weakness.

### D. Prioritized improvements

Organize improvements into:

* Critical.
* High priority.
* Medium priority.
* Optional polish.

### E. Implementation phases

Use this order unless the current code strongly justifies another sequence:

1. Black-hole shadow and optical structure.
2. Photon ring.
3. Gravitational lensing.
4. Accretion disk.
5. Post-processing and image clarity.
6. Camera and composition.
7. Captured-object visual quality.
8. Spaghettification.
9. Fragmentation and accretion response.
10. HUD visual integration.
11. Final visual polish.

### F. File-level change map

Identify:

* Files to modify.
* Files to create.
* Responsibilities of each file.
* Shaders that require changes.
* Components that require decomposition.
* Systems that must remain unchanged.

### G. Shader strategy

Define:

* Coordinate spaces.
* Required uniforms.
* Render targets.
* Lensing approach.
* Photon-ring computation.
* Disk turbulence model.
* Relativistic brightness approximation.
* Quality-level behavior.
* Performance risks.

### H. Object-quality strategy

Define separate improvements for:

* Planets.
* Asteroids.
* Spacecraft.
* Debris.
* Particles.
* Thermal degradation.
* Fragmentation.

### I. Performance strategy

Explain how the visual improvement will preserve acceptable real-time performance without installing packages.

### J. Acceptance criteria

Provide objective criteria for deciding whether the visual pass is successful.

At minimum:

* The black hole no longer reads as a simple outlined circle.
* The shadow remains absolutely black.
* The photon ring is distinct from the disk.
* The surrounding light reads as gravitational lensing.
* The rear section of the disk appears bent above and below the shadow.
* The disk contains visible procedural detail and differential motion.
* The image is sharper and preserves highlight detail.
* Captured objects have stronger silhouettes and materials.
* Spaghettification is vertex-dependent.
* Fragmentation preserves orbital movement.
* Matter visibly joins the accretion flow.
* The black hole feels monumental and cinematic.
* No additional npm packages are introduced.

## 6. PLANNING GATE

Do not implement any source-code change in this phase.

After completing `docs/VISUAL_REFINEMENT_PLAN.md`:

1. Present a concise summary in Spanish.
2. List the most important weaknesses found.
3. List the proposed implementation phases.
4. State clearly that no additional package is required.
5. Stop and wait for explicit approval.

Do not begin implementation until I explicitly approve `docs/VISUAL_REFINEMENT_PLAN.md`.
