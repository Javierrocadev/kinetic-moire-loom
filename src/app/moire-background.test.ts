import { describe, expect, it, vi } from "vitest";
import { extractMoireConfig, evaluateMoireScene } from "./kinetic-moire-loom-model";
import { renderMoireScene } from "./kinetic-moire-loom-renderer";

const blue = { color: { hex: "#0077EE", opacity: 85 }, position: { x: -0.4, y: 0.3 }, width: 45, height: 35, softness: 70 };
const pink = { ...blue, color: { hex: "#FF66CC", opacity: 60 }, position: { x: 0.5, y: -0.5 } };

function context() {
  const stops: Array<[number, string]> = [];
  return {
    save: vi.fn(), restore: vi.fn(), translate: vi.fn(), rotate: vi.fn(), scale: vi.fn(),
    beginPath: vi.fn(), moveTo: vi.fn(), lineTo: vi.fn(), arc: vi.fn(), rect: vi.fn(), clip: vi.fn(),
    fill: vi.fn(), stroke: vi.fn(), fillRect: vi.fn(),
    createRadialGradient: vi.fn(() => ({ addColorStop: (n: number, s: string) => stops.push([n, s]) })),
    stops, globalAlpha: 1, globalCompositeOperation: "source-over", fillStyle: "", strokeStyle: "",
  };
}

describe("editable background shapes and background fill", () => {
  it("preserves independent shape records and an explicitly empty collection", () => {
    const config = extractMoireConfig({ "backgroundShapes.items": [blue, pink] });
    expect(config.backgroundShapes).toEqual([blue, pink]);
    expect(extractMoireConfig({ "backgroundShapes.items": [] }).backgroundShapes).toEqual([]);
    expect(extractMoireConfig({}).backgroundShapes).toHaveLength(2);
  });

  it("draws canvas background and localized color shapes before linework", () => {
    const config = extractMoireConfig({
      "backgroundShapes.items": [blue],
      "palette.gradientIntensity": 0,
      "palette.backgroundColor": "#123456",
    });
    const ctx = context();
    renderMoireScene(ctx as unknown as CanvasRenderingContext2D, evaluateMoireScene(config, 0), config, 1000, 700);
    expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, 1000, 700);
    expect(ctx.translate).toHaveBeenCalledWith(300, 455);
    expect(ctx.scale).toHaveBeenCalledWith(450, 245);
    expect(ctx.fill).toHaveBeenCalledTimes(1);
    expect(ctx.fill.mock.invocationCallOrder[0]).toBeLessThan(ctx.stroke.mock.invocationCallOrder[0]);
    expect(ctx.stops.at(-1)).toEqual([1, "#0077EE00"]);
  });

  it("keeps runtime background independent from palette presets", () => {
    const config = extractMoireConfig({ "palette.paletteKey": "swiss-red", "palette.backgroundColor": "#123456" });
    expect(evaluateMoireScene(config, 0).palette.background).toBe("#123456");
  });

  it("renders an empty shape collection without replacing it with defaults and respects background toggle", () => {
    const config = extractMoireConfig({ "backgroundShapes.items": [], "palette.gradientIntensity": 0, "export.includeBackground": false });
    const ctx = context();
    renderMoireScene(ctx as unknown as CanvasRenderingContext2D, evaluateMoireScene(config, 0), config, 1000, 700);
    expect(ctx.fill).not.toHaveBeenCalled();
    expect(ctx.fillRect).not.toHaveBeenCalled();
    expect(ctx.stroke).toHaveBeenCalledTimes(config.layerCount);
  });
});
