precision highp float;

varying vec2 v_uv;

uniform sampler2D u_state;

// 3-stop gradient: dark navy → teal → warm white
// t = 0  →  high B (pattern)   →  dark
// t = 1  →  high A (background) →  light
vec3 palette(float t) {
  vec3 c0 = vec3(0.02, 0.02, 0.08);  // dark navy
  vec3 c1 = vec3(0.08, 0.38, 0.48);  // teal
  vec3 c2 = vec3(1.00, 0.96, 0.88);  // warm white

  return t < 0.5
    ? mix(c0, c1, t * 2.0)
    : mix(c1, c2, (t - 0.5) * 2.0);
}

void main() {
  vec2 state = texture2D(u_state, v_uv).rg;
  float A = state.r;
  float B = state.g;

  float t = clamp(A - B, 0.0, 1.0);
  gl_FragColor = vec4(palette(t), 1.0);
}
