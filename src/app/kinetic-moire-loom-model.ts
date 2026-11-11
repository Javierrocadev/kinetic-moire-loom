/**
 * Kinetic Moiré Loom - Mathematical Model & Optical Interference Engine
 * Computes deterministic periodic interference patterns, harmonic rotations,
 * and emergent op-art waves.
 */

export const TAU = Math.PI * 2;

export type PatternGeometryType =
  | "concentric-rings"
  | "radial-spokes"
  | "parallel-grate"
  | "archimedean-spiral";

export interface MoirePalette {
  id: string;
  name: string;
  background: string;
  layer1: string;
  layer2: string;
  accent: string;
}

export const MOIRE_PALETTES: Record<string, MoirePalette> = {
  "op-art-mono": {
    id: "op-art-mono",
    name: "Op-Art Monochrome",
    background: "#080808",
    layer1: "#ffffff",
    layer2: "#e0e0e0",
    accent: "#ff0033",
  },
  "swiss-red": {
    id: "swiss-red",
    name: "Swiss Modernist",
    background: "#121214",
    layer1: "#ff3333",
    layer2: "#ffffff",
    accent: "#ffdd00",
  },
  "ultraviolet-pulse": {
    id: "ultraviolet-pulse",
    name: "Ultraviolet Pulse",
    background: "#050515",
    layer1: "#00f0ff",
    layer2: "#ff007f",
    accent: "#a855f7",
  },
  "solar-gold": {
    id: "solar-gold",
    name: "Solar Gold & Obsidian",
    background: "#0d0a06",
    layer1: "#f59e0b",
    layer2: "#fbbf24",
    accent: "#ef4444",
  },
  "blueprint-cobalt": {
    id: "blueprint-cobalt",
    name: "Blueprint Cobalt",
    background: "#0a1931",
    layer1: "#38bdf8",
    layer2: "#f8fafc",
    accent: "#4ade80",
  },
};

export interface MoireConfig {
  patternType: PatternGeometryType;
  density: number; // 20 to 140 lines
  layerCount: number; // 2 or 3
  angularOffsetDeg: number; // 0 to 90
  centerDistance: number; // 0 to 120 px
  rotationTurns: number; // 1, 2, or 3 full rotations per loop
  lineWidth: number; // 1 to 6 px
  warpFrequency: number; // 1 to 8
  warpAmplitude: number; // 0 to 40
  chromaShift: number; // 0 to 15
  paletteKey: string;
  speed: number;
}

export const DEFAULT_MOIRE_CONFIG: MoireConfig = {
  patternType: "concentric-rings",
  density: 64,
  layerCount: 2,
  angularOffsetDeg: 12,
  centerDistance: 35,
  rotationTurns: 1,
  lineWidth: 2,
  warpFrequency: 3,
  warpAmplitude: 12,
  chromaShift: 4,
  paletteKey: "op-art-mono",
  speed: 1.0,
};

export function extractMoireConfig(values: Record<string, unknown>): MoireConfig {
  return {
    patternType: (typeof values["geometry.patternType"] === "string" ? values["geometry.patternType"] : DEFAULT_MOIRE_CONFIG.patternType) as PatternGeometryType,
    paletteKey: typeof values["geometry.paletteKey"] === "string" ? values["geometry.paletteKey"] : DEFAULT_MOIRE_CONFIG.paletteKey,
    density: typeof values["density.density"] === "number" ? values["density.density"] : DEFAULT_MOIRE_CONFIG.density,
    lineWidth: typeof values["density.lineWidth"] === "number" ? values["density.lineWidth"] : DEFAULT_MOIRE_CONFIG.lineWidth,
    layerCount: typeof values["density.layerCount"] === "number" ? values["density.layerCount"] : DEFAULT_MOIRE_CONFIG.layerCount,
    angularOffsetDeg: typeof values["interference.angularOffsetDeg"] === "number" ? values["interference.angularOffsetDeg"] : DEFAULT_MOIRE_CONFIG.angularOffsetDeg,
    centerDistance: typeof values["interference.centerDistance"] === "number" ? values["interference.centerDistance"] : DEFAULT_MOIRE_CONFIG.centerDistance,
    warpAmplitude: typeof values["interference.warpAmplitude"] === "number" ? values["interference.warpAmplitude"] : DEFAULT_MOIRE_CONFIG.warpAmplitude,
    chromaShift: typeof values["interference.chromaShift"] === "number" ? values["interference.chromaShift"] : DEFAULT_MOIRE_CONFIG.chromaShift,
    speed: typeof values["interference.speed"] === "number" ? values["interference.speed"] / 100 : DEFAULT_MOIRE_CONFIG.speed,
    rotationTurns: DEFAULT_MOIRE_CONFIG.rotationTurns,
    warpFrequency: DEFAULT_MOIRE_CONFIG.warpFrequency,
  };
}

export interface MoireLayerState {
  index: number;
  centerX: number;
  centerY: number;
  rotationRad: number;
  color: string;
  opacity: number;
}

export interface EvaluatedMoireScene {
  layers: MoireLayerState[];
  palette: MoirePalette;
  timeNormalized: number;
  patternType: PatternGeometryType;
  lineSpacing: number;
}

/**
 * Pure deterministic evaluation function for Kinetic Moiré Loom.
 * Guaranteed periodic closure: evaluateMoireScene(config, 0) == evaluateMoireScene(config, 1).
 */
export function evaluateMoireScene(
  config: MoireConfig,
  t: number,
  viewWidth = 1000,
  viewHeight = 700,
): EvaluatedMoireScene {
  const normT = ((t % 1) + 1) % 1;
  const palette = MOIRE_PALETTES[config.paletteKey] ?? MOIRE_PALETTES["op-art-mono"];

  const cx = viewWidth / 2;
  const cy = viewHeight / 2;
  const layers: MoireLayerState[] = [];

  const turns = Math.max(1, Math.round(config.rotationTurns));
  const baseAngle = TAU * turns * normT;
  const offsetRad = (config.angularOffsetDeg * Math.PI) / 180;

  // Center orbit displacement: harmonic ellipse closed in t in [0, 1)
  const dist = config.centerDistance;
  const layerColors = [palette.layer1, palette.layer2, palette.accent];

  const count = Math.max(2, Math.min(3, config.layerCount));

  for (let i = 0; i < count; i++) {
    const direction = i % 2 === 0 ? 1 : -1;
    const phaseOffset = (i * TAU) / count;

    // Symmetric orbiting centers
    const lx = cx + Math.cos(TAU * normT + phaseOffset) * dist * direction;
    const ly = cy + Math.sin(TAU * normT + phaseOffset) * (dist * 0.6) * direction;

    const rotation = (baseAngle * direction) + (i * offsetRad);

    layers.push({
      index: i,
      centerX: lx,
      centerY: ly,
      rotationRad: rotation,
      color: layerColors[i % layerColors.length],
      opacity: 0.85,
    });
  }

  const maxRadius = Math.hypot(viewWidth, viewHeight) * 0.75;
  const lineSpacing = maxRadius / Math.max(10, config.density);

  return {
    layers,
    palette,
    timeNormalized: normT,
    patternType: config.patternType,
    lineSpacing,
  };
}
