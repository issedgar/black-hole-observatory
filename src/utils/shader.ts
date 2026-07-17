/**
 * Minimal GLSL include resolver. GLSL has no native include mechanism, so shared
 * chunks (e.g. noise) are imported as raw strings and spliced into a shader via
 * `#include <name>` tokens. This keeps common code defined once.
 *
 * Example:
 *   resolveIncludes(fragmentSource, { noise: noiseSource })
 * replaces every `#include <noise>` line with `noiseSource`.
 */
export function resolveIncludes(
    source: string,
    chunks: Record<string, string>,
): string {
    return source.replace(
        /^[ \t]*#include[ \t]+<([\w-]+)>[ \t]*$/gm,
        (_match, name: string) => {
            const chunk = chunks[name];
            if (chunk === undefined) {
                throw new Error(`Shader include not found: <${name}>`);
            }
            return chunk;
        },
    );
}
