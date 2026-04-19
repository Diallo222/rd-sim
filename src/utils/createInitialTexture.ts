import { DataTexture, RGBAFormat, FloatType, NearestFilter } from "three";
import type { SeedPattern } from "../constants/presets";

function fillBase(data: Float32Array, size: number) {
  for (let i = 0; i < size * size; i++) {
    data[i * 4 + 0] = 1.0;
    data[i * 4 + 1] = 0.0;
    data[i * 4 + 2] = 0.0;
    data[i * 4 + 3] = 1.0;
  }
}

function seedPatch(data: Float32Array, size: number, cx: number, cy: number, half: number) {
  for (let dy = -half; dy <= half; dy++) {
    for (let dx = -half; dx <= half; dx++) {
      const x = ((cx + dx) % size + size) % size;
      const y = ((cy + dy) % size + size) % size;
      const i = (y * size + x) * 4;
      data[i + 0] = 0.5 + (Math.random() - 0.5) * 0.1;
      data[i + 1] = 0.5 + (Math.random() - 0.5) * 0.1;
    }
  }
}

export function createInitialTexture(size: number, pattern: SeedPattern = "random"): DataTexture {
  const data = new Float32Array(size * size * 4);
  fillBase(data, size);

  const half = Math.max(3, Math.floor(size / 64));
  const c = Math.floor(size / 2);

  if (pattern === "random") {
    for (let s = 0; s < 30; s++) {
      seedPatch(data, size, Math.floor(Math.random() * size), Math.floor(Math.random() * size), 4);
    }
  } else if (pattern === "center") {
    seedPatch(data, size, c, c, half * 2);
  } else if (pattern === "grid") {
    const spacing = Math.floor(size / 8);
    for (let gy = 0; gy < 8; gy++) {
      for (let gx = 0; gx < 8; gx++) {
        seedPatch(data, size, gx * spacing + Math.floor(spacing / 2), gy * spacing + Math.floor(spacing / 2), 3);
      }
    }
  } else if (pattern === "ring") {
    const radius = size * 0.35;
    const N = 12;
    for (let i = 0; i < N; i++) {
      const angle = (2 * Math.PI * i) / N;
      seedPatch(data, size, Math.round(c + radius * Math.cos(angle)), Math.round(c + radius * Math.sin(angle)), 4);
    }
  } else if (pattern === "cross") {
    const step = Math.floor(size / 16);
    for (let x = 0; x < size; x += step) {
      seedPatch(data, size, x, c, 3);
    }
    for (let y = 0; y < size; y += step) {
      seedPatch(data, size, c, y, 3);
    }
  }

  const texture = new DataTexture(data, size, size, RGBAFormat, FloatType);
  texture.minFilter = NearestFilter;
  texture.magFilter = NearestFilter;
  texture.needsUpdate = true;
  return texture;
}
