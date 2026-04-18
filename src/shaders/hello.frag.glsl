precision highp float;

varying vec2 v_uv;

uniform sampler2D u_state;

void main() {
  vec4 cell = texture2D(u_state, v_uv);

  float a = cell.r;  // chemical A — stored in red channel
  float b = cell.g;  // chemical B — stored in green channel

  // display B as grayscale: 0 = black, 0.25 = bright white
  float brightness = b * 4.0;
  gl_FragColor = vec4(brightness, brightness, brightness, 1.0);
}