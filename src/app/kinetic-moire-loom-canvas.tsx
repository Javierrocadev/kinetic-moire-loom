import * as React from "react";
import {
  DEFAULT_MOIRE_CONFIG,
  evaluateMoireScene,
  MOIRE_PALETTES,
  type MoireConfig,
  type PatternGeometryType,
} from "./kinetic-moire-loom-model";
import { renderMoireScene } from "./kinetic-moire-loom-renderer";

const PATTERN_OPTIONS: { id: PatternGeometryType; label: string }[] = [
  { id: "concentric-rings", label: "Anillos Concéntricos" },
  { id: "radial-spokes", label: "Rayos Radiales" },
  { id: "parallel-grate", label: "Rejilla Paralela" },
  { id: "archimedean-spiral", label: "Espiral de Arquímedes" },
];

export function KineticMoireLoomCanvas(): React.JSX.Element {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const [config, setConfig] = React.useState<MoireConfig>(DEFAULT_MOIRE_CONFIG);
  const [isPlaying, setIsPlaying] = React.useState<boolean>(true);
  const [loopTime, setLoopTime] = React.useState<number>(0);
  const [panelOpen, setPanelOpen] = React.useState<boolean>(true);

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

  const handleExportPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `kinetic-moire-loom-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  };

  const updateConfig = <K extends keyof MoireConfig>(key: K, value: MoireConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[500px] overflow-hidden select-none bg-black font-sans"
    >
      <canvas
        ref={canvasRef}
        className="block w-full h-full cursor-crosshair"
      />

      {/* Floating Transport Bar */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-2.5 rounded-full bg-neutral-900/80 backdrop-blur-xl border border-white/10 shadow-2xl z-20">
        <button
          type="button"
          onClick={() => setIsPlaying(!isPlaying)}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all text-sm font-semibold active:scale-95"
          title={isPlaying ? "Pausar" : "Reproducir"}
        >
          {isPlaying ? "❚❚" : "▶"}
        </button>

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
            className="w-full accent-red-500 cursor-pointer h-1.5 bg-white/20 rounded-lg"
          />
          <span className="text-[11px] font-mono text-neutral-300 w-10 text-right">
            {(loopTime * 100).toFixed(0)}%
          </span>
        </div>

        <button
          type="button"
          onClick={() => setPanelOpen(!panelOpen)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            panelOpen
              ? "bg-red-600/80 text-white shadow-lg shadow-red-500/20"
              : "bg-white/10 text-neutral-200 hover:bg-white/20"
          }`}
        >
          {panelOpen ? "Ocultar Controles" : "Ajustes"}
        </button>

        <button
          type="button"
          onClick={handleExportPng}
          className="px-3 py-1.5 rounded-full bg-emerald-600/80 hover:bg-emerald-500 text-white text-xs font-medium transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
          title="Exportar fotograma como imagen PNG"
        >
          Exportar PNG
        </button>
      </div>

      {/* Floating Settings Sidebar */}
      {panelOpen && (
        <aside className="absolute top-4 right-4 w-80 max-h-[calc(100%-6rem)] overflow-y-auto rounded-2xl bg-neutral-950/85 backdrop-blur-2xl border border-white/10 shadow-2xl p-5 text-neutral-200 z-30 flex flex-col gap-4 text-xs scrollbar-thin">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div>
              <h2 className="text-sm font-semibold text-white tracking-wide">
                Kinetic Moiré Loom
              </h2>
              <p className="text-[10px] text-neutral-400">
                Interferencia óptica y patrones de onda
              </p>
            </div>
            <button
              type="button"
              onClick={() => setConfig(DEFAULT_MOIRE_CONFIG)}
              className="text-[10px] text-red-400 hover:text-red-300 hover:underline"
            >
              Resetear
            </button>
          </div>

          {/* Pattern Geometry Selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium text-neutral-300">
              Geometría de Trama
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {PATTERN_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => updateConfig("patternType", opt.id)}
                  className={`p-2 rounded-lg border text-left transition-all ${
                    config.patternType === opt.id
                      ? "border-red-500 bg-red-500/15 text-white font-medium"
                      : "border-white/5 bg-white/5 hover:bg-white/10 text-neutral-300"
                  }`}
                >
                  <span className="truncate text-[10px] block">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Color Palettes */}
          <div className="flex flex-col gap-1.5 pt-2 border-t border-white/10">
            <label className="text-[11px] font-medium text-neutral-300">
              Esquema Cromático
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {Object.entries(MOIRE_PALETTES).map(([key, pal]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => updateConfig("paletteKey", key)}
                  className={`flex items-center gap-2 p-2 rounded-lg border text-left transition-all ${
                    config.paletteKey === key
                      ? "border-red-500 bg-red-500/15 text-white"
                      : "border-white/5 bg-white/5 hover:bg-white/10 text-neutral-300"
                  }`}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full shrink-0 shadow border border-white/20"
                    style={{ background: pal.layer1 }}
                  />
                  <span className="truncate text-[10px]">{pal.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Density & Scale */}
          <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Densidad & Capas
            </span>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between">
                <span>Densidad de Líneas</span>
                <span className="font-mono text-neutral-400">{config.density}</span>
              </div>
              <input
                type="range"
                min={20}
                max={140}
                step={2}
                value={config.density}
                onChange={(e) => updateConfig("density", parseInt(e.target.value, 10))}
                className="accent-red-500 cursor-pointer"
              />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between">
                <span>Grosor de Línea</span>
                <span className="font-mono text-neutral-400">{config.lineWidth}px</span>
              </div>
              <input
                type="range"
                min={1}
                max={5}
                step={0.5}
                value={config.lineWidth}
                onChange={(e) => updateConfig("lineWidth", parseFloat(e.target.value))}
                className="accent-red-500 cursor-pointer"
              />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between">
                <span>Número de Capas</span>
                <span className="font-mono text-neutral-400">{config.layerCount}</span>
              </div>
              <div className="flex gap-2">
                {[2, 3].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => updateConfig("layerCount", num)}
                    className={`flex-1 py-1 rounded text-center text-[11px] font-mono border ${
                      config.layerCount === num
                        ? "border-red-500 bg-red-500/20 text-white"
                        : "border-white/10 bg-white/5 text-neutral-300"
                    }`}
                  >
                    {num} Capas
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Interference & Dynamics */}
          <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Dinámica de Interferencia
            </span>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between">
                <span>Desfase Angular</span>
                <span className="font-mono text-neutral-400">{config.angularOffsetDeg}°</span>
              </div>
              <input
                type="range"
                min={0}
                max={90}
                step={1}
                value={config.angularOffsetDeg}
                onChange={(e) => updateConfig("angularOffsetDeg", parseFloat(e.target.value))}
                className="accent-red-500 cursor-pointer"
              />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between">
                <span>Distancia entre Centros</span>
                <span className="font-mono text-neutral-400">{config.centerDistance}px</span>
              </div>
              <input
                type="range"
                min={0}
                max={120}
                step={2}
                value={config.centerDistance}
                onChange={(e) => updateConfig("centerDistance", parseFloat(e.target.value))}
                className="accent-red-500 cursor-pointer"
              />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between">
                <span>Deformación de Onda</span>
                <span className="font-mono text-neutral-400">{config.warpAmplitude}px</span>
              </div>
              <input
                type="range"
                min={0}
                max={35}
                step={1}
                value={config.warpAmplitude}
                onChange={(e) => updateConfig("warpAmplitude", parseFloat(e.target.value))}
                className="accent-red-500 cursor-pointer"
              />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between">
                <span>Aberración Cromática</span>
                <span className="font-mono text-neutral-400">{config.chromaShift}px</span>
              </div>
              <input
                type="range"
                min={0}
                max={12}
                step={1}
                value={config.chromaShift}
                onChange={(e) => updateConfig("chromaShift", parseFloat(e.target.value))}
                className="accent-red-500 cursor-pointer"
              />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between">
                <span>Velocidad de Giro</span>
                <span className="font-mono text-neutral-400">{config.speed.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min={0.2}
                max={3.0}
                step={0.1}
                value={config.speed}
                onChange={(e) => updateConfig("speed", parseFloat(e.target.value))}
                className="accent-red-500 cursor-pointer"
              />
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}
