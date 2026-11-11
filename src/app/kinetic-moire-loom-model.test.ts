import { describe, expect, it } from "vitest";
import {
  DEFAULT_MOIRE_CONFIG,
  evaluateMoireScene,
  extractMoireConfig,
  MOIRE_PALETTES,
} from "./kinetic-moire-loom-model";

describe("Kinetic Moiré Loom Mathematical Model", () => {
  it("guarantees seamless loop continuity between t=0 and t=1", () => {
    const sceneStart = evaluateMoireScene(DEFAULT_MOIRE_CONFIG, 0.0);
    const sceneEnd = evaluateMoireScene(DEFAULT_MOIRE_CONFIG, 1.0);

    expect(sceneStart.layers.length).toBe(sceneEnd.layers.length);
    for (let i = 0; i < sceneStart.layers.length; i++) {
      expect(sceneStart.layers[i].centerX).toBeCloseTo(sceneEnd.layers[i].centerX, 4);
      expect(sceneStart.layers[i].centerY).toBeCloseTo(sceneEnd.layers[i].centerY, 4);
      // Rotation should complete an exact integer number of cycles modulo TAU
      const rotDiff =
        Math.abs(sceneStart.layers[i].rotationRad - sceneEnd.layers[i].rotationRad) %
        (Math.PI * 2);
      expect(rotDiff).toBeCloseTo(0, 4);
    }
  });

  it("produces valid, finite layers and line spacing", () => {
    const scene = evaluateMoireScene(DEFAULT_MOIRE_CONFIG, 0.35, 1200, 800);

    expect(scene.layers.length).toBe(DEFAULT_MOIRE_CONFIG.layerCount);
    expect(scene.lineSpacing).toBeGreaterThan(0);
    for (const layer of scene.layers) {
      expect(Number.isFinite(layer.centerX)).toBe(true);
      expect(Number.isFinite(layer.centerY)).toBe(true);
      expect(Number.isFinite(layer.rotationRad)).toBe(true);
    }
  });

  it("contains all curated op-art palettes", () => {
    expect(MOIRE_PALETTES["op-art-mono"]).toBeDefined();
    expect(MOIRE_PALETTES["swiss-red"]).toBeDefined();
    expect(MOIRE_PALETTES["ultraviolet-pulse"]).toBeDefined();
    expect(MOIRE_PALETTES["solar-gold"]).toBeDefined();
    expect(MOIRE_PALETTES["blueprint-cobalt"]).toBeDefined();
  });

  it("extracts and scales ultra-low minimum speed correctly", () => {
    const configAtMin = extractMoireConfig({ "interference.speed": 1 });
    expect(configAtMin.speed).toBeCloseTo(0.01, 4);

    const sceneDefault = evaluateMoireScene(DEFAULT_MOIRE_CONFIG, 0.5);
    const sceneUltraSlow = evaluateMoireScene(configAtMin, 0.5);

    // At 1% speed, angular progression should be 1/100th of default speed
    const defaultRotLayer0 = sceneDefault.layers[0].rotationRad;
    const slowRotLayer0 = sceneUltraSlow.layers[0].rotationRad;
    expect(slowRotLayer0).toBeLessThan(defaultRotLayer0);
    expect(slowRotLayer0).toBeCloseTo(sceneUltraSlow.layers[0].rotationRad, 4);
  });
});
