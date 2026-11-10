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

  ctx.strokeStyle = layer.color;
  ctx.lineWidth = config.lineWidth;

  switch (config.patternType) {
    case "concentric-rings": {
      for (let i = 1; i <= steps; i++) {
        const baseR = i * spacing;
        if (config.warpAmplitude <= 0.5) {
          ctx.beginPath();
          ctx.arc(0, 0, baseR, 0, TAU);
          ctx.stroke();
        } else {
          // Deformed wave ring
          const segments = 72;
          ctx.beginPath();
          for (let s = 0; s <= segments; s++) {
            const angle = (s / segments) * TAU;
            const wave =
              Math.sin(angle * config.warpFrequency + TAU * timeNorm * 2) *
              config.warpAmplitude *
              Math.min(1, baseR / 200);
            const r = Math.max(1, baseR + wave);
            const px = Math.cos(angle) * r;
            const py = Math.sin(angle) * r;
            if (s === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.stroke();
        }
      }
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
      const lineCount = steps * 2;
      ctx.beginPath();
      for (let i = -steps; i <= steps; i++) {
        const y = i * spacing;
        ctx.moveTo(-maxRadius, y);
        ctx.lineTo(maxRadius, y);
      }
      ctx.stroke();
      break;
    }

    case "archimedean-spiral": {
      const spiralArms = Math.max(2, Math.min(8, Math.round(config.density / 10)));
      const pointsPerTurn = 60;
      const totalTurns = 12;
      const totalPoints = pointsPerTurn * totalTurns;

      for (let arm = 0; arm < spiralArms; arm++) {
        const armOffset = (arm * TAU) / spiralArms;
        ctx.beginPath();
        for (let p = 0; p < totalPoints; p++) {
          const theta = (p / pointsPerTurn) * TAU;
          const r = (theta / (totalTurns * TAU)) * maxRadius;
          const px = Math.cos(theta + armOffset) * r;
          const py = Math.sin(theta + armOffset) * r;
          if (p === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }
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

  // 1. Dark background
  ctx.fillStyle = scene.palette.background;
  ctx.fillRect(0, 0, width, height);

  // 2. Optical Interference Layers
  // We use "screen" or "lighter" for vibrant color combinations, or default for crisp monochrome
  ctx.save();
  if (scene.palette.id !== "op-art-mono") {
    ctx.globalCompositeOperation = "screen";
  }

  for (const layer of scene.layers) {
    ctx.globalAlpha = layer.opacity;

    if (config.chromaShift > 0 && scene.palette.id === "op-art-mono") {
      // Chromatic fringing on monochrome
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      ctx.strokeStyle = "rgba(0, 240, 255, 0.4)";
      renderPatternLayer(
        ctx,
        { ...layer, centerX: layer.centerX - config.chromaShift },
        config,
        scene.lineSpacing,
        width,
        height,
        scene.timeNormalized,
      );
      ctx.strokeStyle = "rgba(255, 0, 128, 0.4)";
      renderPatternLayer(
        ctx,
        { ...layer, centerX: layer.centerX + config.chromaShift },
        config,
        scene.lineSpacing,
        width,
        height,
        scene.timeNormalized,
      );
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

  // 3. Vignette Border (Soft focus towards edges)
  const grad = ctx.createRadialGradient(
    width / 2,
    height / 2,
    Math.min(width, height) * 0.35,
    width / 2,
    height / 2,
    Math.hypot(width, height) * 0.6,
  );
  grad.addColorStop(0, "rgba(0,0,0,0)");
  grad.addColorStop(1, "rgba(0,0,0,0.65)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  ctx.restore();
}
