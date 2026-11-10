import * as React from "react";
import {
  DEFAULT_MOIRE_CONFIG,
  evaluateMoireScene,
  type MoireConfig,
  type PatternGeometryType,
} from "./kinetic-moire-loom-model";
import { renderMoireScene } from "./kinetic-moire-loom-renderer";
import { useToolcraftEvaluatedValues } from "@/toolcraft/runtime/react";

export function KineticMoireLoomCanvas(): React.JSX.Element {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  // Read native Toolcraft values from the state store
  const values = useToolcraftEvaluatedValues();

  // Map Toolcraft schema values into the model MoireConfig
  const config: MoireConfig = React.useMemo(() => {
    return {
      patternType: (typeof values["geometry.patternType"] === "string" ? values["geometry.patternType"] : "concentric-rings") as PatternGeometryType,
      paletteKey: typeof values["geometry.paletteKey"] === "string" ? values["geometry.paletteKey"] : "op-art-mono",
      density: typeof values["density.density"] === "number" ? values["density.density"] : 64,
      lineWidth: typeof values["density.lineWidth"] === "number" ? values["density.lineWidth"] : 2,
      layerCount: typeof values["density.layerCount"] === "number" ? values["density.layerCount"] : 2,
      angularOffsetDeg: typeof values["interference.angularOffsetDeg"] === "number" ? values["interference.angularOffsetDeg"] : 12,
      centerDistance: typeof values["interference.centerDistance"] === "number" ? values["interference.centerDistance"] : 35,
      warpAmplitude: typeof values["interference.warpAmplitude"] === "number" ? values["interference.warpAmplitude"] : 12,
      chromaShift: typeof values["interference.chromaShift"] === "number" ? values["interference.chromaShift"] : 4,
      speed: typeof values["interference.speed"] === "number" ? values["interference.speed"] / 100 : 1.0,
      rotationTurns: DEFAULT_MOIRE_CONFIG.rotationTurns,
      warpFrequency: DEFAULT_MOIRE_CONFIG.warpFrequency,
    };
  }, [values]);

  const [isPlaying, setIsPlaying] = React.useState<boolean>(true);
  const [loopTime, setLoopTime] = React.useState<number>(0);

  const animFrameRef = React.useRef<number | null>(null);
  const lastTimeRef = React.useRef<number>(performance.now());
  const loopDurationMs = 8000 / Math.max(0.1, config.speed);

  // Animation Loop
  React.useEffect(() => {
    let active = true;

    const tick = (now: number) => {
      if (!active) return;
      const delta = now - lastTimeRef.current;
      lastTimeRef.current = now;

      if (isPlaying) {
        setLoopTime((prev) => (prev + delta / loopDurationMs) % 1);
      }

      animFrameRef.current = requestAnimationFrame(tick);
    };

    lastTimeRef.current = performance.now();
    animFrameRef.current = requestAnimationFrame(tick);

    return () => {
      active = false;
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isPlaying, loopDurationMs]);

  // Render to Canvas
  React.useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const width = container.clientWidth || 1000;
    const height = container.clientHeight || 700;
    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.save();
    ctx.scale(dpr, dpr);

    const scene = evaluateMoireScene(config, loopTime, width, height);
    renderMoireScene(ctx, scene, config, width, height);

    ctx.restore();
  }, [config, loopTime]);

  // Export current frame as PNG
  const handleExportPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `kinetic-moire-loom-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[500px] overflow-hidden select-none bg-black font-sans"
    >
      {/* Visual Canvas Viewport */}
      <canvas
        ref={canvasRef}
        className="block w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Subtle Floating Transport Bar (Bottom Center) without duplicating sidebar controls */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-2 rounded-full bg-slate-900/80 backdrop-blur-xl border border-white/10 shadow-2xl z-20">
        <button
          type="button"
          onClick={() => setIsPlaying(!isPlaying)}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all text-sm font-semibold active:scale-95"
          title={isPlaying ? "Pausar" : "Reproducir"}
        >
          {isPlaying ? "❚❚" : "▶"}
        </button>

        {/* Time Scrubber */}
        <div className="flex items-center gap-2 w-48 sm:w-64">
          <input
            type="range"
            min={0}
            max={1}
            step={0.001}
            value={loopTime}
            onChange={(e) => {
              setIsPlaying(false);
              setLoopTime(parseFloat(e.target.value));
            }}
            className="w-full accent-fuchsia-500 cursor-pointer h-1.5 bg-white/20 rounded-lg"
          />
          <span className="text-[11px] font-mono text-slate-300 w-10 text-right">
            {(loopTime * 100).toFixed(0)}%
          </span>
        </div>

        <button
          type="button"
          onClick={handleExportPng}
          className="px-3 py-1 rounded-full bg-fuchsia-600/80 hover:bg-fuchsia-500 text-white text-xs font-medium transition-all shadow-lg shadow-fuchsia-500/20 active:scale-95"
          title="Exportar fotograma como imagen PNG"
        >
          Exportar PNG
        </button>
      </div>
    </div>
  );
}
