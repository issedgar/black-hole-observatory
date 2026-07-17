# Black Hole Observatory — Agent Instructions

## 1. Mandatory Session Startup

At the beginning of every new session, before proposing changes or writing code:

1. Read this `AGENTS.md` file completely.
2. Read `docs/BLACK_HOLE_PROJECT_BRIEF.md` completely.
3. Read `docs/IMPLEMENTATION_PLAN.md` when it exists.
4. Inspect `package.json`, the current `src/` structure, and the current Git status.
5. Determine what is already implemented by inspecting the code. Never infer implementation status from filenames, comments, plans, or previous claims.
6. Summarize the current project state before starting substantial work.
7. Follow the planning gate defined below.

Do not skip the project brief because it is the primary functional, visual, scientific, and architectural specification.

## 2. Planning Gate

The implementation must be controlled through:

`docs/IMPLEMENTATION_PLAN.md`

The first line of that file must be exactly one of:

`Status: DRAFT`

or:

`Status: APPROVED`

Apply the following rules:

* If `docs/IMPLEMENTATION_PLAN.md` does not exist, create it with `Status: DRAFT`.
* While the plan status is `DRAFT`, do not modify application source code.
* While the plan status is `DRAFT`, only analyze the repository, research implementation constraints, and create or refine planning documentation.
* The plan must define architecture, rendering strategy, shader strategy, physics approximations, event states, quality levels, responsive behavior, risks, phases, and acceptance criteria.
* Wait for explicit user approval before changing the status to `APPROVED`.
* After explicit approval, update the status and begin implementation.
* Do not reopen approved decisions without a concrete technical reason.
* If an approved decision becomes infeasible, explain the conflict before replacing it.
* Implement one coherent phase at a time instead of attempting the entire simulation in one uncontrolled change.

## 3. Source-of-Truth Priority

When instructions conflict, apply this priority:

1. The user’s current explicit instruction.
2. `docs/BLACK_HOLE_PROJECT_BRIEF.md`.
3. Explicitly approved decisions in `docs/IMPLEMENTATION_PLAN.md`.
4. Existing architectural decisions documented in the repository.
5. This `AGENTS.md` file.
6. Installed agent skills.
7. General framework conventions.

Installed skills provide guidance, not authority. No skill may override the project brief, scientific requirements, approved architecture, or user instructions.

## 4. Project Objective

Build an interactive, educational, cinematic, and visually exceptional real-time black-hole observatory.

The experience must combine:

* A scientifically grounded simulation.
* A cinematic visualization.
* An advanced astronomical observatory.
* An educational interactive experience.
* A restrained, functional science-fiction interface.

The result must not resemble:

* A generic landing page.
* An arcade game.
* A screensaver.
* A static 3D composition.
* A collection of disconnected visual effects.
* A generic AI-generated dashboard.

The central experience is the black hole and its physical influence on light and matter. The HUD supports that experience and must never visually overpower it.

## 5. Required Technology Stack

Use:

* React.
* TypeScript.
* Vite.
* Three.js.
* React Three Fiber.
* Drei only for appropriate utilities.
* Custom GLSL shaders.
* `@react-three/postprocessing`.
* `postprocessing`.
* Zustand.
* Modern CSS or CSS Modules.

Do not introduce an alternative rendering framework without explicit approval.

Do not add:

* A backend.
* Authentication.
* A database.
* Server-side rendering.
* Deployment configuration.
* Cloud infrastructure.
* Analytics services.
* CI/CD configuration.

Do not introduce a large dependency when the required behavior can be implemented clearly with the existing stack.

## 6. Agent Skill Responsibilities

Use installed skills deliberately and only when relevant.

### frontend-design

Use as the primary visual-direction skill for:

* Overall visual identity.
* Composition.
* Typography.
* Hierarchy.
* HUD layout.
* Avoiding generic AI-generated aesthetics.

### high-end-visual-design

Use only for:

* Premium visual polish.
* Depth.
* Material treatment.
* Motion choreography.
* High-quality responsive presentation.
* Carefully controlled cinematic details.

Do not blindly apply its default layout archetypes, typography assumptions, whitespace rules, or landing-page patterns when they conflict with the full-screen observatory experience.

### emil-design-eng

Use for:

* Interaction timing.
* Easing.
* UI transitions.
* Camera-state transitions.
* Alert behavior.
* Motion restraint.
* Perceived interface quality.

### vercel-react-best-practices

Use for:

* React rendering performance.
* Avoiding unnecessary rerenders.
* State subscription design.
* Bundle awareness.
* Event listener management.
* Expensive computation control.

### vercel-composition-patterns

Use for:

* Component boundaries.
* Explicit component variants.
* Context design.
* Avoiding boolean-prop proliferation.
* Reusable HUD and scene APIs.
* Modular feature architecture.

### web-design-guidelines

Use as a review skill for:

* Accessibility.
* Responsive behavior.
* Keyboard interaction.
* Focus states.
* Touch targets.
* Text readability.
* Reduced-motion behavior.

It is not the source of art direction.

### webapp-testing

Use only after a functional browser-rendered implementation exists.

Use it for:

* Browser inspection.
* Console error detection.
* Interaction verification.
* Responsive verification.
* Visual-state verification.
* Local application reconnaissance.

Do not use every installed skill for every task. Select only the skills that materially apply.

## 7. Language Rules

Use English for:

* File names.
* Directory names.
* Variables.
* Functions.
* Classes.
* Components.
* Hooks.
* Stores.
* Types.
* Interfaces.
* Enums.
* Shader identifiers.
* Internal event names.

Use Spanish for:

* All visible interface content.
* HUD labels.
* Alerts.
* Educational explanations.
* Accessibility labels visible to users.
* README instructions intended for the project user.

Communicate with the user in Spanish unless explicitly asked to use another language.

## 8. TypeScript and Code Style

Apply these rules:

* Use TypeScript strict mode.
* Use four-space indentation.
* Do not introduce Prettier.
* Use the existing ESLint configuration.
* Avoid `any`.
* Prefer explicit domain types.
* Use discriminated unions for simulation and event states.
* Use readonly data where mutation is not required.
* Include physical units in constant and variable names when ambiguity is possible.
* Avoid unexplained magic numbers.
* Extract scientifically meaningful constants.
* Keep components focused and reasonably sized.
* Avoid monolithic scene components.
* Avoid generic utility abstractions without a real repeated use case.
* Add comments only when they explain non-obvious physics, shader mathematics, GPU behavior, numerical stability, or architectural constraints.
* Do not add comments that merely restate the code.
* Do not leave TODO placeholders for required functionality.

## 9. Required Architecture Boundaries

Keep these responsibilities separate:

* Application composition.
* WebGL scene.
* Black-hole model.
* Accretion disk.
* Gravitational lensing.
* Photon ring.
* Star field and environment.
* Captured celestial objects.
* Orbital trajectory integration.
* Tidal deformation.
* Fragmentation.
* Particle systems.
* Cinematic camera.
* Manual camera controls.
* Post-processing.
* HUD.
* Educational overlays.
* Simulation state.
* UI state.
* Performance metrics.
* Quality management.
* Audio.

Prefer a structure similar to:

```text
src/
  app/
  components/
    scene/
    black-hole/
    accretion-disk/
    celestial-objects/
    particles/
    camera/
    environment/
    postprocessing/
  hud/
  simulation/
    physics/
    events/
    trajectories/
    constants/
  shaders/
    lensing/
    accretion/
    particles/
    planets/
  stores/
  hooks/
  types/
  utils/
  styles/
```

The exact structure may evolve when the approved architecture provides a stronger alternative.

## 10. Scientific Integrity

The simulation must distinguish between:

* Physically derived values.
* Normalized simulation values.
* Numerically integrated approximations.
* Screen-space visual approximations.
* Purely artistic effects.

Never describe an approximation as an exact general-relativistic calculation.

At minimum, preserve the conceptual relationships between:

* Black-hole mass.
* Schwarzschild radius.
* Event horizon.
* Photon sphere.
* ISCO.
* Gravitational redshift.
* Time dilation.
* Orbital velocity.
* Relativistic Doppler shift.
* Relativistic beaming.
* Tidal-force gradient.
* Spaghettification.
* Light deflection.
* Accretion-disk temperature.

Use normalized units internally when needed for numerical stability. Convert values into understandable physical units for the HUD.

Document important approximations in both the implementation and educational interface.

## 11. Black-Hole Rendering Requirements

The event horizon must:

* Remain absolutely black.
* Not receive conventional lighting.
* Not become gray because of bloom or tone mapping.
* Occlude light correctly.
* Have a precise silhouette.
* Integrate with the lensing model.

The photon ring must:

* Remain visually distinct from the accretion disk.
* Be narrow and intense.
* Include controlled angular variation.
* Reflect relativistic brightness asymmetry.
* Avoid looking like a generic glow outline.

The accretion disk must:

* Use procedural shader-driven motion.
* Use radial differential rotation.
* Include multiscale turbulence.
* Include density variation.
* Include thermal color variation.
* Include relativistic brightness asymmetry.
* Include apparent depth and vertical structure.
* Respond to incoming matter.

Do not implement the accretion disk as a static texture rotating around the black hole.

## 12. Gravitational-Lensing Requirements

Gravitational lensing is a core rendering system, not a decorative effect.

It must affect:

* The star field.
* Nebulae.
* The accretion disk.
* Celestial objects.
* Spacecraft.
* Fragments.
* Relevant particles located behind the black hole.

The implementation must support:

* Curved apparent disk images above and below the horizon.
* Progressive deflection near the black hole.
* Partial Einstein arcs.
* Apparent image duplication.
* Strong compression near the photon ring.
* Stable transitions without obvious seams.

Do not use a simple uniform radial screen distortion and describe it as gravitational lensing.

When full geodesic integration is not practical, use and document a calibrated analytical, ray-bending, ray-marching, or screen-space approximation.

## 13. Shader Rules

Keep substantial shader logic in dedicated shader files or modules.

Shader implementations must:

* Use descriptive uniforms.
* Document coordinate spaces.
* Avoid unnecessary branches in hot fragment paths.
* Avoid excessive precision where it provides no visible value.
* Keep configurable quality step counts.
* Handle resolution and aspect ratio correctly.
* Avoid frame-rate-dependent animation.
* Avoid duplicating procedural noise implementations without justification.
* Maintain visual stability during camera movement.
* Expose physically meaningful and visual parameters separately.

Do not place large shader strings inside unrelated React components.

## 14. Render-Loop Rules

React is not the animation engine.

Inside per-frame execution:

* Do not create new arrays, vectors, matrices, colors, objects, or closures unnecessarily.
* Reuse temporary Three.js objects.
* Update object refs and shader uniforms directly.
* Avoid React state updates every frame.
* Avoid Zustand subscriptions that cause frame-rate UI rerenders.
* Sample performance metrics at controlled intervals.
* Keep DOM telemetry updates throttled.
* Keep physics integration independent from display refresh when practical.
* Use delta-time clamping to avoid unstable simulation jumps.

Create GPU resources once whenever possible.

Explicitly dispose of:

* Geometries.
* Materials.
* Textures.
* Render targets.
* Post-processing resources.
* Event listeners.

## 15. Performance Strategy

Target a fluid experience near 60 FPS on capable hardware, but never guarantee a fixed frame rate.

Implement:

* Adaptive Device Pixel Ratio.
* Low, medium, high, and ultra quality profiles.
* Runtime capability detection.
* Particle-count scaling.
* Shader-step scaling.
* Post-processing scaling.
* Instancing.
* Particle pooling.
* Buffer reuse.
* Frustum culling.
* Visibility-based render reduction.
* Controlled telemetry sampling.
* Resource disposal.
* Context-loss handling.

When performance degrades, reduce quality in this order:

1. Secondary particle density.
2. Distant environmental detail.
3. Shader iteration count.
4. Secondary post-processing effects.
5. Shadow or volumetric detail.
6. Render resolution.

Do not immediately reduce resolution until the image becomes visibly blurry.

Do not display fake FPS values. Measure them.

## 16. Captured-Matter Event System

Implement captured-matter events using an explicit state model.

Required states:

* Detection.
* Approach.
* Gravitational capture.
* Unstable orbit.
* Tidal deformation.
* Fragmentation.
* Accretion.
* Dissipation.
* Recovery.

Represent these states with a discriminated union or an equally explicit typed model.

Do not move captured objects toward the center using only linear interpolation.

Trajectories must include:

* Curved approach.
* Orbital motion.
* Progressive velocity increase.
* Orbital-energy loss.
* Orbital decay.
* Approximate precession.
* Final capture.

Each event type must reuse a shared event contract while preserving object-specific behavior.

## 17. Spaghettification and Fragmentation

Spaghettification must depend on each vertex’s position relative to the black hole.

It must not be implemented by simply scaling the complete object along one axis.

The deformation must include:

* Radial elongation.
* Tangential compression.
* Gradient-dependent intensity.
* Unequal acceleration between the near and far sides.
* Progressive thermal response.
* Surface disruption.
* Fragment release.

Fragmentation must preserve orbital direction and must not resemble a conventional spherical explosion.

Fragments and particles should gradually enter the accretion flow.

## 18. UI and HUD Rules

The HUD must be restrained, scientific, and functional.

It must:

* Preserve the visibility of the black hole.
* Use a clear hierarchy.
* Use red only for critical events.
* Display real simulation values.
* Display measured performance values.
* Provide readable responsive panels.
* Support keyboard navigation.
* Support touch input.
* Support reduced motion.
* Avoid excessive decorative elements.
* Avoid a generic video-game appearance.
* Avoid a generic dashboard appearance.

The full-screen WebGL canvas is the visual priority.

The user must be able to:

* Orbit with the mouse.
* Zoom with the mouse wheel.
* Use equivalent touch gestures.
* Reset the camera.
* Enable cinematic camera mode.
* Return to manual camera control.
* Pause the simulation.
* Trigger supported events.
* Change approved physical and visual parameters.

## 19. Visual Motion Rules

Motion must communicate physical or interface state.

Use motion for:

* Orbital behavior.
* Camera transitions.
* Alert escalation.
* Panel state.
* Data changes.
* Object detection.
* Tidal disruption.
* Accretion response.

Avoid:

* Constant decorative UI movement.
* Excessive parallax.
* Abrupt camera cuts.
* Linear easing.
* Intense flashing.
* Uncontrolled screen shake.
* Chromatic aberration as a permanent effect.
* Bloom that removes disk detail.

Respect reduced-motion preferences.

## 20. Asset Rules

Prefer procedural assets.

Do not introduce external models, textures, fonts, audio, or images without:

* A clear purpose.
* A known source.
* A compatible license.
* Documentation of attribution requirements.
* Approval when the asset materially changes the project.

Do not use an external asset to replace a required procedural or shader-driven implementation.

## 21. Scope Control

Do not add features merely because a library makes them easy.

Do not add:

* Generic landing-page sections.
* Marketing content.
* User accounts.
* Leaderboards.
* Game scoring.
* Achievements.
* Monetization.
* Deployment services.
* Analytics tracking.
* Unrequested social features.
* Unrequested frameworks.
* Unrequested test frameworks.

Do not replace the selected package manager or project framework without approval.

## 22. Verification Before Completion Claims

Before claiming that a phase or feature is complete:

1. Inspect the implementation.
2. Confirm that no required part is represented only by text or placeholder UI.
3. Check the browser console for runtime errors when browser inspection is available.
4. Verify that the main interaction works.
5. Verify desktop and mobile layout behavior when relevant.
6. Run existing lint and build commands when they exist and are relevant.
7. Do not add a new testing framework unless explicitly requested.
8. Report any remaining approximation, limitation, or incomplete behavior clearly.

Never claim:

* Physically exact general relativity when using an approximation.
* Stable 60 FPS without measurement.
* Mobile compatibility without checking the responsive behavior.
* Implemented gravitational lensing when only the disk geometry is curved.
* Implemented spaghettification when only object scale changes.
* Implemented accretion when particles only disappear.

## 23. Definition of Done

The project is not complete unless:

* The event horizon remains black.
* The photon ring is distinct.
* The accretion disk is procedural and differentially rotating.
* Disk brightness is relativistically asymmetric.
* Lensing affects the background and relevant objects.
* Objects follow orbital trajectories.
* Spaghettification is spatially dependent.
* Fragmented matter joins the accretion flow.
* The disk reacts to absorbed matter.
* Camera navigation works with mouse and touch.
* The HUD displays dynamic simulation values.
* Educational content identifies physical approximations.
* Quality adapts to device capability.
* The interface remains usable on desktop and mobile.
* Required functionality is implemented rather than represented by placeholders.
* GPU resources and browser listeners are managed correctly.

## 24. Communication

When communicating progress:

* Use Spanish.
* Be precise.
* State what was actually inspected or changed.
* Distinguish completed work from planned work.
* Surface technical risks early.
* Explain important physics approximations.
* Avoid claiming completion based only on visual appearance.
* Do not hide limitations behind cinematic terminology.
