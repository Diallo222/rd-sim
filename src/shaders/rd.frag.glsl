precision highp float;

varying vec2 v_uv;

uniform sampler2D u_state;
uniform vec2 u_texelSize; // vec2(1/width, 1/height)
uniform float u_feed;     // feed rate  (f)
uniform float u_kill;     // kill rate  (k)
uniform float u_Da;       // diffusion rate for A
uniform float u_Db;       // diffusion rate for B
uniform float u_dt;       // time step

// 9-point isotropic Laplacian
// Weights: cardinal = 0.2, diagonal = 0.05, center = -1.0
vec2 laplacian(vec2 uv) {
  vec2 e = u_texelSize;
  vec2 sum = vec2(0.0);

  sum += texture2D(u_state, uv + vec2(-e.x,  0.0)).rg * 0.2;
  sum += texture2D(u_state, uv + vec2( e.x,  0.0)).rg * 0.2;
  sum += texture2D(u_state, uv + vec2( 0.0, -e.y)).rg * 0.2;
  sum += texture2D(u_state, uv + vec2( 0.0,  e.y)).rg * 0.2;

  sum += texture2D(u_state, uv + vec2(-e.x, -e.y)).rg * 0.05;
  sum += texture2D(u_state, uv + vec2( e.x, -e.y)).rg * 0.05;
  sum += texture2D(u_state, uv + vec2(-e.x,  e.y)).rg * 0.05;
  sum += texture2D(u_state, uv + vec2( e.x,  e.y)).rg * 0.05;

  sum -= texture2D(u_state, uv).rg * 1.0;

  return sum;
}

void main() {
  vec2 state = texture2D(u_state, v_uv).rg;
  float A = state.r;
  float B = state.g;

  vec2 lap = laplacian(v_uv);

  // Gray-Scott reaction terms
  float reaction = A * B * B;

  float dA = u_Da * lap.r - reaction + u_feed * (1.0 - A);
  float dB = u_Db * lap.g + reaction - (u_kill + u_feed) * B;

  float newA = clamp(A + dA * u_dt, 0.0, 1.0);
  float newB = clamp(B + dB * u_dt, 0.0, 1.0);

  gl_FragColor = vec4(newA, newB, 0.0, 1.0);
}
