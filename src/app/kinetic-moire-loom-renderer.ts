import { drawBackgroundShapes } from "./moire-background";
/**
 * Kinetic Moiré Loom - 2D Canvas Optical Interference Renderer
 * High-performance rendering of concentric rings, radial spokes, parallel gratings,
 * and emergent moiré fringe fields.
 */

import {
  TAU,
  type EvaluatedMoireScene,
  type MoireConfig,
  type MoireLayerState,
} from "./kinetic-moire-loom-model";

function hexToRgb(hexColor: string): { r: number; g: number; b: number } {
  if (!hexColor || typeof hexColor !== "string") return { r: 255, g: 255, b: 255 };
  if (hexColor.startsWith("rgb")) {
    const match = hexColor.match(/\d+/g);
    if (match && match.length >= 3) {
      return { r: Number(match[0]), g: Number(match[1]), b: Number(match[2]) };
    }
  }
  const clean = hexColor.replace("#", "");
  const num = parseInt(clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean, 16);
  if (Number.isNaN(num)) return { r: 255, g: 255, b: 255 };
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

const layerGradientCaches = new WeakMap<CanvasRenderingContext2D, Map<string, CanvasGradient>>();

function renderPatternLayer(
  ctx: CanvasRenderingContext2D,
  layer: MoireLayerState,
  config: MoireConfig,
  spacing: number,
  viewWidth: number,
  viewHeight: number,
  timeNorm: number,
): void {
  ctx.save();
  ctx.translate(layer.centerX, layer.centerY);
  ctx.rotate(layer.rotationRad);

  const maxRadius = Math.hypot(viewWidth, viewHeight);
  const steps = Math.ceil(maxRadius / spacing);

  ctx.lineWidth = config.lineWidth;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  if (config.gradientIntensity <= 0.05) {
    ctx.strokeStyle = layer.color;
  } else {
    const intensity = config.gradientIntensity;
    const roundedR = Math.round(maxRadius);
    const roundedInt = Math.round(intensity * 100);
    const cacheKey = `${layer.color}_${roundedR}_${roundedInt}`;
    let layerGradientCache = layerGradientCaches.get(ctx);
    if (!layerGradientCache) {
      layerGradientCache = new Map();
      layerGradientCaches.set(ctx, layerGradientCache);
    }
    let grad = layerGradientCache.get(cacheKey);
    if (!grad) {
      if (layerGradientCache.size > 24) {
        layerGradientCache.clear();
      }
      grad = ctx.createRadialGradient(0, 0, 0, 0, 0, maxRadius);
      const { r, g, b } = hexToRgb(layer.color);
      const coreR = Math.min(255, Math.round(r + (255 - r) * 0.7 * intensity));
      const coreG = Math.min(255, Math.round(g + (255 - g) * 0.7 * intensity));
      const coreB = Math.min(255, Math.round(b + (255 - b) * 0.7 * intensity));
      grad.addColorStop(0, `rgba(${coreR}, ${coreG}, ${coreB}, 1)`);
      grad.addColorStop(0.3, `rgba(${r}, ${g}, ${b}, 0.95)`);
      grad.addColorStop(0.65, `rgba(${r}, ${g}, ${b}, 0.6)`);
      grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, ${Math.max(0.04, 0.9 - intensity * 0.8)})`);
      layerGradientCache.set(cacheKey, grad);
    }
    ctx.strokeStyle = grad;
  }

  switch (config.patternType) {
    case "concentric-rings": {
      ctx.beginPath();
      if (config.warpAmplitude <= 0.5) {
        for (let i = 1; i <= steps; i++) {
          const baseR = i * spacing;
          ctx.moveTo(baseR, 0);
          ctx.arc(0, 0, baseR, 0, TAU);
        }
      } else {
        // Deformed wave ring
        const segments = 72;
        for (let i = 1; i <= steps; i++) {
          const baseR = i * spacing;
          const damp = Math.min(1, baseR / 200);
          for (let s = 0; s <= segments; s++) {
            const angle = (s / segments) * TAU;
            const wave =
              Math.sin(angle * config.warpFrequency + TAU * timeNorm * 2) *
              config.warpAmplitude *
              damp;
            const r = Math.max(1, baseR + wave);
            const px = Math.cos(angle) * r;
            const py = Math.sin(angle) * r;
            if (s === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
        }
      }
      ctx.stroke();
      break;
    }

    case "radial-spokes": {
      const spokes = Math.max(12, Math.round(config.density));
      const angleStep = TAU / spokes;
      ctx.beginPath();
      for (let i = 0; i < spokes; i++) {
        const a = i * angleStep;
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(a) * maxRadius, Math.sin(a) * maxRadius);
      }
      ctx.stroke();
      break;
    }

    case "parallel-grate": {
      ctx.beginPath();
      for (let i = -steps; i <= steps; i++) {
        const y = i * spacing;
        ctx.moveTo(y, -maxRadius);
        ctx.lineTo(y, maxRadius);
      }
      ctx.stroke();
      break;
    }

    case "archimedean-spiral": {
      const spiralArms = Math.max(2, Math.min(8, Math.round(config.density / 10)));
      const pointsPerTurn = 60;
      const totalTurns = 12;
      const totalPoints = pointsPerTurn * totalTurns;

      ctx.beginPath();
      for (let arm = 0; arm < spiralArms; arm++) {
        const armOffset = (arm * TAU) / spiralArms;
        for (let p = 0; p < totalPoints; p++) {
          const theta = (p / pointsPerTurn) * TAU;
          const r = (theta / (totalTurns * TAU)) * maxRadius;
          const px = Math.cos(theta + armOffset) * r;
          const py = Math.sin(theta + armOffset) * r;
          if (p === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
      }
      ctx.stroke();
      break;
    }
  }

  ctx.restore();
}

export function renderMoireScene(
  ctx: CanvasRenderingContext2D,
  scene: EvaluatedMoireScene,
  config: MoireConfig,
  width: number,
  height: number,
): void {
  ctx.save();

  // 1. Base canvas background fill
  if (config.includeBackground !== false && scene.palette.background) {
    ctx.fillStyle = scene.palette.background;
    ctx.fillRect(0, 0, width, height);
  }

  // 2. Underlying color shapes behind the linework
  drawBackgroundShapes(ctx, config.backgroundShapes, width, height);

  // 3. Optical Interference Layers
  ctx.save();
  ctx.globalCompositeOperation = "source-over";

  for (const layer of scene.layers) {
    ctx.globalAlpha = layer.opacity;

    if (config.chromaShift > 0 && scene.palette.id === "op-art-mono") {
      // Chromatic fringing on monochrome op-art
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      ctx.strokeStyle = "rgba(0, 240, 255, 0.4)";
      ctx.save();
      ctx.translate(-config.chromaShift, 0);
      renderPatternLayer(ctx, layer, config, scene.lineSpacing, width, height, scene.timeNormalized);
      ctx.restore();

      ctx.strokeStyle = "rgba(255, 0, 128, 0.4)";
      ctx.save();
      ctx.translate(config.chromaShift, 0);
      renderPatternLayer(ctx, layer, config, scene.lineSpacing, width, height, scene.timeNormalized);
      ctx.restore();
      ctx.restore();
    }

    renderPatternLayer(
      ctx,
      layer,
      config,
      scene.lineSpacing,
      width,
      height,
      scene.timeNormalized,
    );
  }

  ctx.restore();

  ctx.restore();
}
