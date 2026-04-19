precision highp float;

varying vec2 v_uv;

uniform sampler2D u_state;
uniform int u_colormap; // 0=mono, 1=thermal, 2=neon, 3=phosphor, 4=invert

vec3 paletteMono(float t) {
  vec3 c0 = vec3(0.04, 0.04, 0.04);
  vec3 c1 = vec3(0.40, 0.40, 0.40);
  vec3 c2 = vec3(1.00, 1.00, 1.00);
  return t < 0.5 ? mix(c0, c1, t * 2.0) : mix(c1, c2, (t - 0.5) * 2.0);
}

vec3 paletteThermal(float t) {
  vec3 c0 = vec3(0.00, 0.00, 0.00);
  vec3 c1 = vec3(0.80, 0.10, 0.00);
  vec3 c2 = vec3(1.00, 0.90, 0.00);
  vec3 c3 = vec3(1.00, 1.00, 1.00);
  if (t < 0.333) return mix(c0, c1, t * 3.0);
  if (t < 0.666) return mix(c1, c2, (t - 0.333) * 3.0);
  return mix(c2, c3, (t - 0.666) * 3.0);
}

vec3 paletteNeon(float t) {
  vec3 c0 = vec3(0.00, 0.00, 0.00);
  vec3 c1 = vec3(0.00, 0.10, 0.70);
  vec3 c2 = vec3(0.00, 0.90, 1.00);
  vec3 c3 = vec3(1.00, 1.00, 1.00);
  if (t < 0.333) return mix(c0, c1, t * 3.0);
  if (t < 0.666) return mix(c1, c2, (t - 0.333) * 3.0);
  return mix(c2, c3, (t - 0.666) * 3.0);
}

vec3 palettePhosphor(float t) {
  return mix(vec3(0.0), vec3(0.15, 1.0, 0.25), t);
}

vec3 paletteInvert(float t) {
  return paletteMono(1.0 - t);
}

void main() {
  vec2 state = texture2D(u_state, v_uv).rg;
  float t = clamp(state.r - state.g, 0.0, 1.0);

  vec3 color;
  if      (u_colormap == 1) color = paletteThermal(t);
  else if (u_colormap == 2) color = paletteNeon(t);
  else if (u_colormap == 3) color = palettePhosphor(t);
  else if (u_colormap == 4) color = paletteInvert(t);
  else                      color = paletteMono(t);

  gl_FragColor = vec4(color, 1.0);
}
