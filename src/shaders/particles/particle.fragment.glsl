// Temperature-mapped soft particle. Additive; expired particles (alpha 0) are
// discarded.

precision mediump float;

varying float vTemp;
varying float vAlpha;

vec3 temperatureRamp(float t) {
    vec3 ash = vec3(0.25, 0.16, 0.12);
    vec3 red = vec3(0.9, 0.2, 0.05);
    vec3 orange = vec3(1.0, 0.55, 0.15);
    vec3 white = vec3(1.0, 0.95, 0.8);
    vec3 color = mix(ash, red, smoothstep(0.0, 0.35, t));
    color = mix(color, orange, smoothstep(0.35, 0.65, t));
    color = mix(color, white, smoothstep(0.65, 1.0, t));
    return color;
}

void main() {
    if (vAlpha <= 0.003) {
        discard;
    }
    vec2 uv = gl_PointCoord - 0.5;
    float soft = smoothstep(0.5, 0.0, length(uv));
    vec3 color = temperatureRamp(vTemp) * (0.5 + vTemp);
    gl_FragColor = vec4(color * soft * vAlpha, soft * vAlpha);
}
