export type MoireBackgroundShape = {
  color: { hex: string; opacity: number };
  x?: number;
  y?: number;
  position?: { x: number; y: number };
  width: number;
  height: number;
  softness: number;
};

export const DEFAULT_BACKGROUND_SHAPES: MoireBackgroundShape[] = [
  { color: { hex: "#0078E8", opacity: 90 }, x: -50, y: 30, position: { x: -0.5, y: 0.3 }, width: 60, height: 70, softness: 85 },
  { color: { hex: "#F77ED1", opacity: 80 }, x: 45, y: -45, position: { x: 0.45, y: -0.45 }, width: 60, height: 60, softness: 90 },
];

export function drawBackgroundShapes(
  ctx: CanvasRenderingContext2D,
  shapes: readonly MoireBackgroundShape[],
  width: number,
  height: number,
): void {
  for (const shape of shapes) {
    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = shape.color.opacity / 100;
    const posX = typeof shape.x === "number" ? shape.x / 100 : (shape.position?.x ?? 0);
    const posY = typeof shape.y === "number" ? shape.y / 100 : (shape.position?.y ?? 0);
    ctx.translate((posX + 1) * width / 2, (posY + 1) * height / 2);
    ctx.scale(shape.width * width / 100, shape.height * height / 100);
    // Finite-support falloff preserves color at the core, with no blur buffer or clipped filter tails.
    const innerRadius = Math.max(0, Math.min(0.999, 1 - shape.softness / 100));
    const gradient = ctx.createRadialGradient(0, 0, innerRadius, 0, 0, 1);
    gradient.addColorStop(0, shape.color.hex);
    gradient.addColorStop(0.5, `${shape.color.hex}99`);
    gradient.addColorStop(1, `${shape.color.hex}00`);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
