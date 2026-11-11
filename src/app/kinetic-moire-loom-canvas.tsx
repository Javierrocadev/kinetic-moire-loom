import * as React from "react";
import {
  evaluateMoireScene,
  extractMoireConfig,
} from "./kinetic-moire-loom-model";
import { renderMoireScene } from "./kinetic-moire-loom-renderer";
import { getToolcraftTimelineLoopProgress } from "@/toolcraft/runtime";
import {
  useToolcraftEvaluatedValues,
  useToolcraftSelector,
} from "@/toolcraft/runtime/react";

export function KineticMoireLoomCanvas(): React.JSX.Element {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  // Read native Toolcraft values and timeline state
  const values = useToolcraftEvaluatedValues();
  const timeline = useToolcraftSelector((state) => state.timeline);

  const config = React.useMemo(() => {
    return extractMoireConfig(values);
  }, [values]);

  const loopProgress = getToolcraftTimelineLoopProgress(timeline);

  // Render to Canvas on parameter changes, timeline ticks, or container resize
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

    const scene = evaluateMoireScene(config, loopProgress, width, height);
    renderMoireScene(ctx, scene, config, width, height);

    ctx.restore();
  }, [config, loopProgress]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[500px] overflow-hidden select-none bg-black font-sans"
    >
      <canvas
        ref={canvasRef}
        className="block w-full h-full cursor-grab active:cursor-grabbing"
      />
    </div>
  );
}
