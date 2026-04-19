precision highp float;

varying vec2 v_uv;

uniform sampler2D u_state;

// 3-stop grayscale palette: near-black → mid grey → bright white
// t = 0  →  high B (pattern)    →  dark
// t = 1  →  high A (background) →  white
vec3 palette(float t) {
  vec3 c0 = vec3(0.04, 0.04, 0.04);  // near-black
  vec3 c1 = vec3(0.40, 0.40, 0.40);  // mid grey
  vec3 c2 = vec3(1.00, 1.00, 1.00);  // pure white

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
