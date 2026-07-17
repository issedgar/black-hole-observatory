// Apparent shadow radius in world units (critical impact parameter b_crit =
// 3√3 r_g). The field marks a ray as in-shadow when it passes within b_crit of
// the origin, so a sphere of exactly this radius projects to the visible shadow
// silhouette.
const SHADOW_RADIUS = 3 * Math.sqrt(3);

/**
 * An invisible depth-only sphere at the black hole. It writes depth but no colour,
 * so captured bodies and particles behind it are depth-culled — the shadow
 * correctly occludes matter passing behind the hole. Drawn after the fullscreen
 * field composite (renderOrder -10) and before the foreground bodies (0).
 */
export function HorizonOcclusion() {
    return (
        <mesh renderOrder={-5}>
            <sphereGeometry args={[SHADOW_RADIUS, 48, 48]} />
            <meshBasicMaterial colorWrite={false} />
        </mesh>
    );
}
