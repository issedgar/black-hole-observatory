import { useEffect, useMemo, useRef } from 'react';
import { createPortal, useFrame, useThree } from '@react-three/fiber';
import { useFBO } from '@react-three/drei';
import * as THREE from 'three';
import { Starfield } from '../environment/Starfield';
import { Nebula } from '../environment/Nebula';
import { BlackHoleField } from '../black-hole/BlackHoleField';
import { useVisualStore } from '../../stores/visualStore';
import { usePrefsStore } from '../../stores/prefsStore';
import { QUALITY_SETTINGS } from '../../types/quality';
import { useCompositorScenes } from './compositorScenes';
import { accretionRuntime } from '../../simulation/runtime/accretionRuntime';
import fullscreenVertexShader from '../../shaders/lensing/lensing.vertex.glsl?raw';
import fieldCompositeFragmentShader from '../../shaders/black-hole/blackHoleFieldComposite.fragment.glsl?raw';
import brightFragmentShader from '../../shaders/postprocessing/bright.fragment.glsl?raw';
import blurFragmentShader from '../../shaders/postprocessing/blur.fragment.glsl?raw';
import finalFragmentShader from '../../shaders/postprocessing/final.fragment.glsl?raw';

const BLOOM_SCALE = 0.5;
const BLOOM_THRESHOLD = 1.8;

const VOID_COLOR = new THREE.Color(0x04060c);
const BLACK = new THREE.Color(0x000000);

/**
 * Owns the offscreen render passes and the final composite. Each frame:
 *   1. background (nebula + stars + captured objects) -> RT_bg,
 *   2. the unified black-hole field (bent-ray march: shadow + photon ring +
 *      lensed background + disk) -> reduced-resolution fieldRT,
 *   3. the main scene -> HDR scene target: the field composited over the
 *      full-resolution background (by coverage), then foreground particles and
 *      educational diagrams,
 *   4. bloom + tone-mapped final composite -> screen.
 *
 * Rendering is taken over manually (priority useFrame) to sequence the passes.
 */
export function SceneCompositor() {
    const { size, viewport } = useThree();
    const qualityProfile = useVisualStore((state) => state.qualityProfile);
    const exposure = useVisualStore((state) => state.exposure);
    const bloomStrength = useVisualStore((state) => state.bloomStrength);
    const reducedMotion = usePrefsStore((state) => state.reducedMotion);
    const fieldResolutionScale =
        QUALITY_SETTINGS[qualityProfile].diskResolutionScale;
    const bufferWidth = Math.floor(size.width * viewport.dpr);
    const bufferHeight = Math.floor(size.height * viewport.dpr);
    const bloomWidth = Math.max(1, Math.floor(bufferWidth * BLOOM_SCALE));
    const bloomHeight = Math.max(1, Math.floor(bufferHeight * BLOOM_SCALE));

    const backgroundTarget = useFBO(bufferWidth, bufferHeight);
    const fieldTarget = useFBO(
        Math.max(1, Math.floor(bufferWidth * fieldResolutionScale)),
        Math.max(1, Math.floor(bufferHeight * fieldResolutionScale)),
        { depthBuffer: false, type: THREE.HalfFloatType },
    );
    const sceneTarget = useFBO(bufferWidth, bufferHeight, {
        type: THREE.HalfFloatType,
    });
    const bloomTargetA = useFBO(bloomWidth, bloomHeight, {
        type: THREE.HalfFloatType,
        depthBuffer: false,
    });
    const bloomTargetB = useFBO(bloomWidth, bloomHeight, {
        type: THREE.HalfFloatType,
        depthBuffer: false,
    });

    const { backgroundScene, diskScene: fieldScene } = useCompositorScenes();

    const compositeMaterialRef = useRef<THREE.ShaderMaterial>(null);

    const compositeUniforms = useMemo(
        () => ({
            uField: { value: fieldTarget.texture },
            uBackground: { value: backgroundTarget.texture },
        }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    );

    // Fullscreen post-processing setup (materials swapped per pass).
    const postRef = useRef<{
        scene: THREE.Scene;
        quad: THREE.Mesh;
        bright: THREE.ShaderMaterial;
        blur: THREE.ShaderMaterial;
        final: THREE.ShaderMaterial;
    } | null>(null);

    useEffect(() => {
        const scene = new THREE.Scene();
        const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2));
        quad.frustumCulled = false;
        scene.add(quad);

        const bright = new THREE.ShaderMaterial({
            vertexShader: fullscreenVertexShader,
            fragmentShader: brightFragmentShader,
            uniforms: {
                uScene: { value: null },
                uThreshold: { value: BLOOM_THRESHOLD },
            },
            depthTest: false,
            depthWrite: false,
        });
        const blur = new THREE.ShaderMaterial({
            vertexShader: fullscreenVertexShader,
            fragmentShader: blurFragmentShader,
            uniforms: {
                uTexture: { value: null },
                uTexel: { value: new THREE.Vector2() },
                uDirection: { value: new THREE.Vector2() },
            },
            depthTest: false,
            depthWrite: false,
        });
        const final = new THREE.ShaderMaterial({
            vertexShader: fullscreenVertexShader,
            fragmentShader: finalFragmentShader,
            uniforms: {
                uScene: { value: null },
                uBloom: { value: null },
                uExposure: { value: 1.15 },
                uBloomStrength: { value: 0.85 },
                uStreak: { value: 0.5 },
                uChromatic: { value: 0 },
                uVignette: { value: 0.35 },
                uGrain: { value: 0.035 },
                uTime: { value: 0 },
            },
            depthTest: false,
            depthWrite: false,
        });

        postRef.current = { scene, quad, bright, blur, final };
        return () => {
            bright.dispose();
            blur.dispose();
            final.dispose();
            quad.geometry.dispose();
            postRef.current = null;
        };
    }, []);

    useFrame((state) => {
        const { gl, scene, camera } = state;

        if (compositeMaterialRef.current) {
            const u = compositeMaterialRef.current.uniforms;
            u.uField.value = fieldTarget.texture;
            u.uBackground.value = backgroundTarget.texture;
        }

        // Pass 1: background (nebula + stars + objects).
        gl.setClearColor(VOID_COLOR, 1);
        gl.setRenderTarget(backgroundTarget);
        gl.clear();
        gl.render(backgroundScene, camera);

        // Pass 2: unified black-hole field at reduced resolution.
        gl.setClearColor(BLACK, 0);
        gl.setRenderTarget(fieldTarget);
        gl.clear();
        gl.render(fieldScene, camera);

        // Pass 3: main scene (field composite + foreground) into the HDR target.
        gl.setClearColor(VOID_COLOR, 1);
        gl.setRenderTarget(sceneTarget);
        gl.clear();
        gl.render(scene, camera);

        const post = postRef.current;
        if (!post) {
            return;
        }

        // Pass 4: bloom bright extract.
        post.bright.uniforms.uScene.value = sceneTarget.texture;
        post.quad.material = post.bright;
        gl.setRenderTarget(bloomTargetA);
        gl.render(post.scene, camera);

        // Pass 5: separable Gaussian blur.
        post.blur.uniforms.uTexel.value.set(1 / bloomWidth, 1 / bloomHeight);
        post.blur.uniforms.uTexture.value = bloomTargetA.texture;
        post.blur.uniforms.uDirection.value.set(1, 0);
        post.quad.material = post.blur;
        gl.setRenderTarget(bloomTargetB);
        gl.render(post.scene, camera);

        post.blur.uniforms.uTexture.value = bloomTargetB.texture;
        post.blur.uniforms.uDirection.value.set(0, 1);
        gl.setRenderTarget(bloomTargetA);
        gl.render(post.scene, camera);

        // Pass 6: final tone-mapped composite to screen.
        const finalUniforms = post.final.uniforms;
        finalUniforms.uScene.value = sceneTarget.texture;
        finalUniforms.uBloom.value = bloomTargetA.texture;
        finalUniforms.uExposure.value = exposure;
        finalUniforms.uBloomStrength.value = bloomStrength;
        finalUniforms.uChromatic.value = reducedMotion
            ? 0
            : Math.min(1, accretionRuntime.reaction * 1.3);
        finalUniforms.uGrain.value = reducedMotion ? 0 : 0.035;
        finalUniforms.uTime.value = state.clock.elapsedTime;
        post.quad.material = post.final;
        gl.setRenderTarget(null);
        gl.render(post.scene, camera);
    }, 1);

    return (
        <>
            {createPortal(
                <>
                    <Nebula />
                    <Starfield />
                </>,
                backgroundScene,
            )}
            {createPortal(
                <BlackHoleField backgroundTexture={backgroundTarget.texture} />,
                fieldScene,
            )}

            {/* Unified field composited over the full-resolution background. */}
            <mesh renderOrder={-10} frustumCulled={false}>
                <planeGeometry args={[2, 2]} />
                <shaderMaterial
                    ref={compositeMaterialRef}
                    vertexShader={fullscreenVertexShader}
                    fragmentShader={fieldCompositeFragmentShader}
                    uniforms={compositeUniforms}
                    depthTest={false}
                    depthWrite={false}
                />
            </mesh>
        </>
    );
}
