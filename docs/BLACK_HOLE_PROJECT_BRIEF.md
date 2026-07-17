Act as a Principal Web Graphics Engineer specializing in WebGL, Three.js, React Three Fiber, GLSL, real-time scientific simulations, and cinematic visualization. Also act as a Senior UI/UX Designer specializing in functional science-fiction interfaces, commonly known as FUI.

Your objective is to design and develop an interactive, educational, cinematic, and visually spectacular web experience that represents a black hole consuming planets, moons, asteroids, spacecraft, and other forms of matter.

The experience should feel like a combination of:

* A scientific simulation.
* An advanced astronomical observatory.
* A cinematic space sequence.
* An interactive museum.
* A futuristic quantum-monitoring interface.

Do not build a simple decorative animation or screensaver. The result must convey cosmic scale, danger, depth, energy, and physical realism.

# 1. MANDATORY WORKFLOW

Before writing any code:

1. Fully analyze all requirements.
2. Deliver a detailed technical and visual implementation plan.
3. Define:

   * Component architecture.
   * Shader system.
   * Physical model.
   * Gravitational-lensing strategy.
   * Particle system.
   * Event state machine.
   * Performance strategy for desktop and mobile devices.
   * File structure.
4. Identify technical risks, physical simplifications, and WebGL limitations.
5. Explain which parts will be physically grounded and which will be real-time visual approximations.
6. Wait for explicit approval of the plan before implementing.

Do not begin coding before the planning phase has been approved.

# 2. TECHNOLOGY STACK

Build the project as a modular application using:

* React.
* TypeScript.
* Vite.
* Three.js.
* React Three Fiber.
* Drei only for relevant utilities.
* Custom GLSL through ShaderMaterial, RawShaderMaterial, or post-processing effects.
* @react-three/postprocessing or an equivalent effects-composition solution.
* Zustand for global simulation and HUD state when appropriate.
* CSS Modules, modern CSS, or an equivalent approach that clearly separates the 2D interface from the WebGL scene.

Do not use a single HTML file.

You may directly use Three.js APIs inside React Three Fiber whenever low-level control is required over render targets, post-processing, buffers, geometries, materials, or the rendering lifecycle.

Use English names for variables, components, functions, classes, types, and files. All user-facing interface content must be written in Spanish.

No backend is required. The application must run entirely in the browser.

# 3. SCIENTIFIC REALISM PRINCIPLE

The simulation must be mathematically grounded while remaining optimized for real-time execution.

Do not claim that a visual approximation is an exact physical simulation. Every simplification must be documented both in the code and in the educational mode of the interface.

Implement a Schwarzschild black hole or a configurable approximation of a Kerr black hole as the primary physical model.

At minimum, represent the following concepts:

* Black-hole mass.

* Schwarzschild radius:

  rs = 2GM / c²

* Event horizon.

* Photon sphere:

  r = 3GM / c² = 1.5rs

* Innermost stable circular orbit, ISCO, using the appropriate value for the selected model.

* Accretion disk.

* Gravitational redshift.

* Gravitational time dilation.

* Orbital velocity of matter.

* Relativistic Doppler effect.

* Relativistic beaming.

* Tidal forces.

* Spaghettification.

* Curvature of the apparent path of light.

* Visual difference between the side of the disk approaching the observer and the side moving away.

Use normalized internal units to maintain numerical stability. Display equivalent values in kilometers, solar masses, seconds, percentages, or astronomical units when appropriate.

It is not necessary to integrate complete relativistic geodesics per pixel when the computational cost is incompatible with real-time rendering. A calibrated approximation using ray marching, ray bending, screen-space distortion, deflection fields, or analytical functions is acceptable, provided that it:

* Respects the location of the event horizon.
* Visually respects the photon sphere.
* Produces multiple apparent images of the disk.
* Correctly bends light behind the black hole.
* Also distorts the background star field and objects located behind it.
* Is documented as an approximation.

# 4. ART DIRECTION

The visual direction must be:

* Hyperrealistic.
* Cinematic.
* Dark.
* Scientific.
* Monumental.
* Elegant.
* Immersive.
* Free from an arcade video-game appearance.
* Free from cartoon aesthetics.
* Free from unnecessary HUD clutter.

The background must be deep black, but not completely empty. It must contain:

* A multilayer procedural star field.
* Variations in intensity and color temperature.
* Extremely subtle interstellar dust.
* Barely perceptible distant nebulae.
* Stars distorted by gravitational lensing.
* A clear sense of depth through parallax.

Avoid using a simple flat texture as the background.

# 5. BLACK HOLE

## 5.1 Event Horizon

Represent the event horizon as an absolutely black region that does not receive or reflect conventional lighting.

It must:

* Have a perfectly defined silhouette.
* Correctly block light.
* Integrate with the gravitational-lensing shader.
* Present an intense, thin photon ring around its apparent edge.
* Remain black even when bloom, exposure, and post-processing are active.

The horizon must not look like a black plastic sphere.

## 5.2 Photon Ring

Implement a bright and sharply defined photon ring near the apparent shadow of the black hole.

It must include:

* Extreme concentration of light.
* Angular variations.
* Increased intensity on the side approaching the observer.
* Slight flickering caused by orbiting matter.
* Clear visual separation from the accretion disk.
* Controlled thickness so it does not resemble a simple glowing outline.

## 5.3 Accretion Disk

Build the disk using custom GLSL shaders.

Do not use a static rotating texture.

The disk must include:

* Animated procedural noise.
* Multiscale turbulence.
* Plasma filaments.
* Different orbital velocities depending on radius.
* Hot and unstable regions.
* Density variations.
* Spiraling matter.
* Partially transparent areas.
* Localized flares.
* Differential motion: inner regions must orbit faster than outer regions.
* Apparent volumetric thickness.
* Matter visible above and below the main plane.
* Gradual density reduction toward the outer edge.

The thermal distribution may be based on a thin-disk approximation such as:

T(r) ∝ r^(-3/4)

Visually adjust temperature to produce:

* Intense white in the hottest regions.
* Blue-white tones near the inner zones.
* Yellow and gold.
* Incandescent orange.
* Dark red.
* Cold, nearly invisible dust at the outer boundaries.

The disk must include relativistic Doppler effects:

* The side approaching the observer must appear brighter and slightly shifted toward higher frequencies.
* The receding side must appear dimmer and shifted toward lower frequencies.

Do not make the disk perfectly symmetrical.

## 5.4 Gravitational Lensing

Gravitational lensing must be one of the primary features of the experience.

It must not be limited to deforming the geometry of the disk.

Implement a full-screen effect or equivalent technique capable of affecting:

* The background star field.
* Nebulae.
* The accretion disk.
* Planets.
* Asteroids.
* Spacecraft.
* Particles.
* Any object located behind or around the black hole.

The lensing effect must produce:

* Visible curvature of the disk above and below the event horizon.
* Partial Einstein arcs.
* Apparent duplication of regions of the disk.
* Progressive distortion based on angular proximity to the center.
* Visual compression of light near the photon ring.
* Smooth transitions without obvious cuts or artifacts.

Avoid using a simple uniform radial distortion. Intensity must respond to an approximation of each ray’s impact parameter.

# 6. CAMERA AND NAVIGATION

The user must be able to explore the scene using the mouse.

Implement:

* Mouse drag to orbit.
* Mouse wheel to zoom in and out.
* Distance limits to prevent crossing the event horizon.
* Damped movement.
* Moderate, cinematic sensitivity.
* Touch interaction on mobile devices.
* A button to reset the camera.
* A button to activate an automatic cinematic camera.
* A button to pause the automatic camera and restore manual control.

The cinematic camera must include slow, carefully choreographed movements:

* An initial approach.
* A lateral orbit.
* A nearly edge-on view of the disk.
* A partial top-down view.
* Tracking of objects being captured.
* Pulling back during intense destruction events.

Camera transitions must not cause motion sickness or abrupt movement.

# 7. CAPTURED MATTER EVENTS

Implement a reusable event system based on explicit states.

Possible events must include:

* Rocky planet.
* Ice world.
* Moon.
* Asteroid swarm.
* Gas cloud.
* Spacecraft.
* Orbital-station debris.

Events must run automatically at configurable intervals and must also be manually triggerable from the interface.

Each event must move through clearly defined states:

1. Detection.
2. Approach.
3. Gravitational capture.
4. Unstable orbit.
5. Tidal deformation.
6. Fragmentation.
7. Accretion.
8. Dissipation.
9. System recovery.

Do not use a simple linear interpolation toward the center.

The trajectory must appear orbital:

* Curved approach.
* Progressive increase in speed.
* Loss of orbital energy.
* Variation in the orbital plane.
* Visual precession.
* Gradual orbital decay.
* Final capture.

A stable real-time approximate physical integration based on Newtonian gravity with visual corrections near the event horizon may be used, provided that the simplification is explained.

# 8. SPAGHETTIFICATION

Spaghettification must be implemented through a vertex shader or dynamic geometry deformation.

As an object approaches:

* It must elongate in the radial direction toward the black hole.
* It must compress along the tangential axes.
* Deformation must progressively increase according to the gravitational gradient.
* The side closest to the black hole must accelerate more than the rear side.
* The surface must crack.
* Fragments must detach.
* Materials must heat up.
* The color must gradually transition toward incandescent tones.
* The object must lose its recognizable shape before crossing the event horizon.

Do not simply scale the entire object along one axis. Deformation must depend on the position of each vertex relative to the black hole.

# 9. FRAGMENTATION AND PARTICLES

When an object is destroyed:

* Visually fragment its surface.
* Generate incandescent particles.
* Generate darker dust.
* Generate solid fragments.
* Generate plasma trails.
* Make the matter gradually merge into the accretion disk.
* Preserve a coherent orbital direction.
* Avoid conventional spherical explosions.

Use:

* Three.Points.
* InstancedMesh.
* BufferGeometry.
* Custom attributes.
* Particle shaders.
* Particle pooling to avoid continuous memory allocation.

Particles must have:

* Position.
* Velocity.
* Age.
* Lifetime.
* Temperature.
* Intensity.
* Size.
* Matter type.
* Orbital drag factor.

During accretion:

* The disk must temporarily increase in luminosity.
* Turbulence must intensify.
* The apparent velocity of the inner material must increase.
* Waves or disturbances must propagate through the disk.
* The HUD must register an increase in mass.
* Exposure must react in a controlled manner without overexposing the entire image.

# 10. PROCEDURAL OBJECTS

Planets, moons, and asteroids must be procedurally generated.

Include:

* Displacement noise.
* Approximate craters.
* Variable roughness.
* Continents, ice, rock, or metal depending on the object type.
* Optional atmosphere.
* Optional clouds.
* Progressive thermal emission.
* PBR materials when compatible with the desired effect.

Spacecraft and stations may be built from simple modular geometry, but they must maintain a convincing, realistic, and properly proportioned silhouette.

Do not use models or textures with uncertain licenses. Prioritize procedural content. Any external resource must document its source and license.

# 11. HUD INTERFACE

The interface must function as an advanced scientific observatory, not as a generic video-game HUD.

Use:

* Monospaced typography.
* Semi-transparent white.
* Extremely subtle blue or phosphor-green tones.
* Thin lines.
* Discreet indicators.
* Smooth animations.
* Clear visual hierarchy.
* Sufficient contrast.
* Panels with controlled transparency.
* Moderate background blur only when it does not harm performance.

Avoid filling the entire screen with interface elements.

## 11.1 Header

Display:

“SIMULACIÓN CÓSMICA // OBSERVATORIO DE AGUJERO NEGRO”

Also include:

* System identifier.
* Active physical model.
* Simulated coordinates.
* Local system time.
* Elapsed simulation time.
* Real measured FPS.
* Active graphics quality.
* Renderer status.

Do not permanently display “FPS: 60” as fake text. Calculate the actual FPS.

## 11.2 Physical Parameters Panel

Include:

* Mass in solar masses.
* Schwarzschild radius.
* Photon-sphere radius.
* ISCO radius.
* Rotation velocity or spin.
* Estimated maximum disk temperature.
* Accretion rate.
* Time-dilation factor.
* Estimated gravitational redshift.
* Camera distance.
* Visual exposure.

## 11.3 Detected Object Panel

When an object appears, display:

* Name.
* Type.
* Mass.
* Diameter.
* Composition.
* Distance to the event horizon.
* Velocity.
* Estimated tidal force.
* Structural integrity.
* Event state.
* Estimated time until disruption.

## 11.4 Alerts

During a critical event, display:

“EVENTO CRÍTICO: DESTRUCCIÓN DE EXOPLANETA EN PROGRESO”

The alert must:

* Appear with a controlled transition.
* Use red only for critical states.
* Include subtle blinking.
* Avoid intense flashes.
* Gradually disappear when the event ends.

## 11.5 Controls

Allow the user to modify:

* Black-hole mass.
* Approximate spin.
* Disk inclination.
* Disk density.
* Accretion rate.
* Lensing intensity.
* Time scale.
* Exposure.
* Bloom.
* Particle density.
* Graphics quality.
* Next event type.
* Event frequency.
* Automatic camera.
* Educational mode.
* Simulation pause.
* Reset.

Physical parameters and purely visual parameters must be displayed in separate sections.

# 12. EDUCATIONAL MODE

Include an educational mode that can be enabled and disabled.

This mode must explain, through brief contextual panels:

* What an event horizon is.
* What the Schwarzschild radius represents.
* What the photon sphere is.
* What ISCO is.
* How gravitational lensing works.
* Why the disk has different brightness on each side.
* What gravitational redshift is.
* What tidal forces are.
* What spaghettification is.
* Why a distant observer never sees an object fully cross the event horizon.
* Which parts of the simulation are approximations.

When a concept is selected, visually highlight the corresponding region without necessarily pausing the simulation.

Include simple overlay diagrams when they improve understanding:

* Event horizon.
* Photon sphere.
* ISCO.
* Orbital velocity vector.
* Tidal-force direction.
* Estimated object trajectory.

Educational text must be scientifically responsible, clear, and understandable to non-specialists.

# 13. SOUND

Include optional sound design, disabled initially until the user interacts with the page.

Sound may include:

* Low-frequency ambience.
* Synthetic vibrations.
* Plasma noise.
* Telemetry pulses.
* Discreet alerts.
* Increased intensity during critical events.

Clarify in educational mode that the sound is an artistic representation because outer space does not transmit sound as an atmosphere does.

Include a volume control and mute button.

# 14. POST-PROCESSING

Implement a carefully tuned post-processing pipeline:

* Selective bloom.
* Cinematic tone mapping.
* Exposure control.
* Minimal chromatic aberration only during extreme events.
* Very subtle vignette.
* Extremely light film grain.
* Color grading.
* Controlled flares.
* Motion blur only if it can be implemented without significantly degrading clarity or performance.

Do not overuse bloom. The event horizon must remain black, and the disk must retain internal texture even in its brightest regions.

# 15. PERFORMANCE

The objective is to maintain a fluid experience close to 60 FPS on compatible hardware, without claiming that this frame rate is guaranteed on all devices.

Implement:

* WebGL2 as the primary requirement.
* Device-capability detection.
* Limited and adaptive Device Pixel Ratio.
* Dynamic quality adjustment.
* Low, medium, high, and ultra quality levels.
* Automatic particle reduction on limited devices.
* Reduction of ray-marching steps when necessary.
* Instancing.
* Object pooling.
* Buffer reuse.
* Frustum culling.
* Avoid creating objects inside useFrame.
* Avoid unnecessary React updates during rendering.
* Update uniforms directly.
* Lazy-load secondary components.
* Pause or reduce rendering when the browser tab is not visible.
* ResizeObserver or an equivalent resize-management solution.
* Correct adaptation to portrait and landscape orientation.
* Explicit disposal of geometries, materials, textures, and render targets.

Do not automatically reduce resolution until the image becomes blurry. Prioritize reducing particles, shader steps, and secondary effects before significantly degrading resolution.

# 16. ACCESSIBILITY AND RESPONSIVENESS

The interface must work on:

* Desktop.
* Laptop.
* Tablet.
* Modern mobile phone.

Include:

* Responsive layout.
* Touch controls.
* Keyboard navigation for the UI.
* Adequate contrast.
* Accessible labels.
* An alternative for users who prefer reduced motion.
* An option to reduce flashes, vibrations, and camera movement.
* A clear message when WebGL2 is not available.

On small screens, simplify and reorganize the HUD into collapsible panels without hiding the main scene.

# 17. STATE AND ARCHITECTURE

Clearly separate:

* Simulation state.
* Physical parameters.
* Visual parameters.
* Camera state.
* Event state.
* Interface state.
* Performance metrics.
* User preferences.

Design an explicit state machine for every destruction event.

Avoid monolithic components.

The architecture must allow future expansion with:

* New object types.
* New events.
* New black-hole models.
* New educational modes.
* New cinematic cameras.
* New quality profiles.

# 18. SUGGESTED MINIMUM STRUCTURE

The planning phase must propose a structure similar to:

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

The final structure may be adjusted if there is a clear technical justification.

# 19. IMPLEMENTATION QUALITY

The code must be:

* Complete.
* Modular.
* Typed.
* Readable.
* Organized.
* Functional.
* Free from pseudocode.
* Free from placeholders.
* Free from omitted sections.
* Free from comments promising future implementation.
* Free from unexplained magic values.
* Free from unnecessary dependencies.

Comments must explain mathematical, graphical, or optimization decisions that are not obvious. Do not fill the code with redundant comments.

Correctly handle:

* Loading errors.
* WebGL context loss.
* WebGL context restoration.
* GPU resources.
* Browser events.
* Audio.
* Quality changes.
* Simulation reset.

# 20. DELIVERY CONTENT

After the planning phase has been approved, deliver the complete project with:

1. All source files.
2. package.json.
3. TypeScript configuration.
4. Vite configuration.
5. Complete GLSL shaders.
6. Complete styles.
7. Complete components.
8. State-management system.
9. Event system.
10. Approximate physical model.
11. HUD.
12. Educational mode.
13. Adaptive quality system.
14. README in Spanish.
15. Exact instructions to install and run the project locally.

The project must run using:

npm install
npm run dev

Do not include deployment configuration, infrastructure, backend services, or external services.

# 21. ACCEPTANCE CRITERIA

The result is considered correct only if:

* The black hole presents an absolutely black shadow.
* The accretion disk has differential motion and procedural turbulence.
* A clearly differentiated photon ring exists.
* Gravitational lensing affects the background and objects, not only the disk.
* The disk appears visually curved above and below the event horizon.
* The disk brightness is asymmetrical due to relativistic Doppler effects.
* The user can navigate using mouse and touch controls.
* Objects follow orbital trajectories rather than straight lines.
* Spaghettification progressively deforms vertices.
* Objects fragment and merge into the disk.
* The disk visually reacts to absorbed matter.
* The HUD displays dynamic values from the actual simulation.
* Educational mode explains the approximations.
* Graphics quality adapts to device performance.
* The interface works correctly on desktop and mobile.
* No placeholders exist.
* No functionality is simulated using text when it should be implemented.
* The final experience is visually cinematic, scientifically responsible, and technically robust.

Prioritize in this order:

1. Correct visual representation of the black hole.
2. Convincing gravitational lensing.
3. Hyperrealistic accretion disk.
4. Object trajectories and destruction.
5. Performance.
6. Educational value.
7. FUI interface.
8. Secondary effects and sound.
