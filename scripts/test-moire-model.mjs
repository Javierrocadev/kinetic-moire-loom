import test from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_MOIRE_CONFIG,
  evaluateMoireScene,
  MOIRE_PALETTES,
} from "../src/app/kinetic-moire-loom-model.ts";

test("Kinetic Moire Loom: seamless loop continuity between t=0 and t=1", () => {
  const sceneStart = evaluateMoireScene(DEFAULT_MOIRE_CONFIG, 0.0);
  const sceneEnd = evaluateMoireScene(DEFAULT_MOIRE_CONFIG, 1.0);

  assert.equal(sceneStart.layers.length, sceneEnd.layers.length);
  for (let i = 0; i < sceneStart.layers.length; i++) {
    assert.ok(Math.abs(sceneStart.layers[i].centerX - sceneEnd.layers[i].centerX) < 0.001);
    assert.ok(Math.abs(sceneStart.layers[i].centerY - sceneEnd.layers[i].centerY) < 0.001);
    const rotDiff = Math.abs(sceneStart.layers[i].rotationRad - sceneEnd.layers[i].rotationRad) % (Math.PI * 2);
    assert.ok(rotDiff < 0.001);
  }
});

test("Kinetic Moire Loom: valid layer states and spacing", () => {
  const scene = evaluateMoireScene(DEFAULT_MOIRE_CONFIG, 0.35, 1200, 800);
  assert.equal(scene.layers.length, DEFAULT_MOIRE_CONFIG.layerCount);
  assert.ok(scene.lineSpacing > 0);
  for (const layer of scene.layers) {
    assert.ok(Number.isFinite(layer.centerX));
    assert.ok(Number.isFinite(layer.centerY));
    assert.ok(Number.isFinite(layer.rotationRad));
  }
});

test("Kinetic Moire Loom: all 5 op-art palettes exist", () => {
  assert.ok(MOIRE_PALETTES["op-art-mono"]);
  assert.ok(MOIRE_PALETTES["swiss-red"]);
  assert.ok(MOIRE_PALETTES["ultraviolet-pulse"]);
  assert.ok(MOIRE_PALETTES["solar-gold"]);
  assert.ok(MOIRE_PALETTES["blueprint-cobalt"]);
});
