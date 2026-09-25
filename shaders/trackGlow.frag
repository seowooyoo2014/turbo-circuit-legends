varying vec2 vUv;
uniform vec3 glowColor;
void main() {
  float pulse = smoothstep(0.0, 0.5, vUv.y) * smoothstep(1.0, 0.5, vUv.y);
  gl_FragColor = vec4(glowColor * (0.45 + pulse), 1.0);
}
