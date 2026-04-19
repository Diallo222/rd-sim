precision highp float;

varying vec2 v_uv;

uniform sampler2D u_state;
uniform vec2  u_texelSize;
uniform float u_feed;
uniform float u_kill;
uniform float u_Da;
uniform float u_Db;
uniform float u_dt;
uniform float u_wrap;  // 1.0 = toroidal (fract), 0.0 = Neumann (clamp)
uniform vec3  u_brush; // xy = UV position, z = radius (0.0 = inactive)

// Sample with configurable boundary: wrap or clamp
vec2 sampleState(vec2 uv, vec2 offset) {
  vec2 c = uv + offset;
  vec2 wrapped = fract(c);
  vec2 clamped = clamp(c, vec2(0.0), vec2(1.0));
  return texture2D(u_state, mix(clamped, wrapped, u_wrap)).rg;
}

// 9-point isotropic Laplacian
vec2 laplacian(vec2 uv) {
  vec2 e = u_texelSize;
  vec2 sum = vec2(0.0);

  sum += sampleState(uv, vec2(-e.x,  0.0)) * 0.20;
  sum += sampleState(uv, vec2( e.x,  0.0)) * 0.20;
  sum += sampleState(uv, vec2( 0.0, -e.y)) * 0.20;
  sum += sampleState(uv, vec2( 0.0,  e.y)) * 0.20;

  sum += sampleState(uv, vec2(-e.x, -e.y)) * 0.05;
  sum += sampleState(uv, vec2( e.x, -e.y)) * 0.05;
  sum += sampleState(uv, vec2(-e.x,  e.y)) * 0.05;
  sum += sampleState(uv, vec2( e.x,  e.y)) * 0.05;

  sum -= texture2D(u_state, uv).rg * 1.0;

  return sum;
}

void main() {
  vec2 state = texture2D(u_state, v_uv).rg;
  float A = state.r;
  float B = state.g;

  vec2 lap = laplacian(v_uv);

  float reaction = A * B * B;
  float dA = u_Da * lap.r - reaction + u_feed * (1.0 - A);
  float dB = u_Db * lap.g + reaction - (u_kill + u_feed) * B;

  float newA = clamp(A + dA * u_dt, 0.0, 1.0);
  float newB = clamp(B + dB * u_dt, 0.0, 1.0);

  // Brush paint: inject B concentration at pointer position
  if (u_brush.z > 0.0) {
    float dist = length(v_uv - u_brush.xy);
    if (dist < u_brush.z) {
      float strength = 1.0 - smoothstep(0.0, u_brush.z, dist);
      newB = clamp(newB + strength * 0.5, 0.0, 1.0);
      newA = clamp(newA - strength * 0.3, 0.0, 1.0);
    }
  }

  gl_FragColor = vec4(newA, newB, 0.0, 1.0);
}
