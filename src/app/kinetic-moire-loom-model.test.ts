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

    // Progression rate is proportional to speed
    const deltaSeconds = 0.5;
    const progressNormal = (deltaSeconds * DEFAULT_MOIRE_CONFIG.speed) / 8;
    const progressSlow = (deltaSeconds * configAtMin.speed) / 8;
    expect(progressSlow).toBeLessThan(progressNormal);
    expect(progressSlow).toBeCloseTo(progressNormal / 100, 5);

    // Both guaranteed to loop seamlessly
    const sceneStart = evaluateMoireScene(configAtMin, 0.0);
    const sceneEnd = evaluateMoireScene(configAtMin, 1.0);
    expect(sceneStart.layers[0].centerX).toBeCloseTo(sceneEnd.layers[0].centerX, 4);
    expect(sceneStart.layers[0].centerY).toBeCloseTo(sceneEnd.layers[0].centerY, 4);
  });

  it("extracts blur and brightness filters with default and custom values", () => {
    const defaultConfig = extractMoireConfig({});
    expect(defaultConfig.blur).toBe(1.5);
    expect(defaultConfig.brightness).toBe(80);

    const customConfig = extractMoireConfig({
      "interference.blur": 50.0,
      "interference.brightness": 65,
    });
    expect(customConfig.blur).toBe(50.0);
    expect(customConfig.brightness).toBe(65);
  });

  it("extracts and applies custom editable colors", () => {
    const customColors = {
      "palette.paletteKey": "custom",
      "palette.backgroundColor": "#1a1a2e",
      "palette.layer1Color": "#e94560",
      "palette.layer2Color": "#0f3460",
      "palette.accentColor": "#16213e",
    };
    const config = extractMoireConfig(customColors);
    expect(config.backgroundColor).toBe("#1a1a2e");
    expect(config.layer1Color).toBe("#e94560");
    expect(config.layer2Color).toBe("#0f3460");
    expect(config.accentColor).toBe("#16213e");

    const scene = evaluateMoireScene(config, 0.5);
    expect(scene.palette.background).toBe("#1a1a2e");
    expect(scene.palette.layer1).toBe("#e94560");
    expect(scene.palette.layer2).toBe("#0f3460");
    expect(scene.layers[0].color).toBe("#e94560");
    expect(scene.layers[1].color).toBe("#0f3460");
  });

  it("limits default density to <= 50 and handles density and opacity extraction", () => {
    expect(DEFAULT_MOIRE_CONFIG.density).toBeLessThanOrEqual(50);
    expect(DEFAULT_MOIRE_CONFIG.lineWidth).toBe(6);
    expect(DEFAULT_MOIRE_CONFIG.layerOpacity).toBe(0.65);
    expect(DEFAULT_MOIRE_CONFIG.gradientIntensity).toBe(0.75);
    const configAtMax = extractMoireConfig({
      "density.density": 50,
      "density.layerOpacity": 80,
      "palette.gradientIntensity": 90,
    });
    expect(configAtMax.density).toBe(50);
    expect(configAtMax.layerOpacity).toBe(0.8);
    expect(configAtMax.gradientIntensity).toBe(0.9);
    const scene = evaluateMoireScene(configAtMax, 0.0);
    expect(scene.lineSpacing).toBeGreaterThan(0);
    expect(scene.layers[0].opacity).toBe(0.8);
  });
});
