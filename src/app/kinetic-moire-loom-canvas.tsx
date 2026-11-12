import * as React from "react";
import {
  evaluateMoireScene,
  extractMoireConfig,
} from "./kinetic-moire-loom-model";
import { renderMoireScene } from "./kinetic-moire-loom-renderer";
import { useToolcraftProductSceneFrame, useToolcraftSelector } from "@/toolcraft/runtime/react";

export function KineticMoireLoomCanvas(): React.JSX.Element {
  const productFrame = useToolcraftProductSceneFrame();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  // Read native Toolcraft values and playback state.
  // ONLY subscribe to scrubbed position when paused, eliminating 60fps React re-renders during playback.
  const values = useToolcraftSelector((state) => state.values);
  const timelineIsPlaying = useToolcraftSelector((state) => state.timeline?.isPlaying ?? true);
  const scrubbedProgress = useToolcraftSelector((state) => {
    if (state.timeline?.isPlaying) {
      return null;
    }
    const time = state.timeline?.currentTimeSeconds ?? 0;
    const duration = state.timeline?.durationSeconds ?? 8;
    return duration > 0 ? (time / duration) % 1 : 0;
  });

  const config = React.useMemo(() => {
    return extractMoireConfig(values);
  }, [values]);

  const configRef = React.useRef(config);
  configRef.current = config;

  const isPlayingRef = React.useRef(timelineIsPlaying);
  isPlayingRef.current = timelineIsPlaying;

  const sizeRef = React.useRef<{ width: number; height: number }>({
    width: 1000,
    height: 700,
  });

  const progressRef = React.useRef(0);
  const lastTimeRef = React.useRef(performance.now());

  const drawFrame = React.useCallback((t: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = sizeRef.current;
    const dpr = typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 1.5) : 1;

    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const scene = evaluateMoireScene(configRef.current, t, width, height);
    renderMoireScene(ctx, scene, configRef.current, width, height);

    ctx.restore();
  }, []);

  // Track container sizing with ResizeObserver to eliminate layout thrashing in the draw loop
  React.useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const applySize = (w: number, h: number) => {
      const width = Math.max(1, Math.floor(w));
      const height = Math.max(1, Math.floor(h));
      sizeRef.current = { width, height };

      const dpr = typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 1.5) : 1;
      const targetW = Math.floor(width * dpr);
      const targetH = Math.floor(height * dpr);

      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      drawFrame(progressRef.current);
    };

    if (productFrame.kind === "ready") {
      applySize(productFrame.rect.width, productFrame.rect.height);
    }
  }, [drawFrame, productFrame]);

  // Infinite, smooth, continuous animation loop at full hardware refresh rate
  React.useEffect(() => {
    let animId: number;

    const tick = (now: number) => {
      const deltaSeconds = Math.min(0.1, (now - lastTimeRef.current) / 1000);
      lastTimeRef.current = now;

      if (isPlayingRef.current) {
        // Base cycle of 8 seconds at 100% speed.
        // Effective speed scales the rate so that the animation loops infinitely and seamlessly.
        const speed = typeof configRef.current.speed === "number" && Number.isFinite(configRef.current.speed)
          ? Math.max(0.001, configRef.current.speed)
          : 1.0;
        const rate = speed / 8; // cycles per second
        progressRef.current = (progressRef.current + deltaSeconds * rate) % 1;
        drawFrame(progressRef.current);
      }

      animId = requestAnimationFrame(tick);
    };

    lastTimeRef.current = performance.now();
    animId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(animId);
  }, [drawFrame]);

  // When paused, allow scrubbing the timeline smoothly
  React.useEffect(() => {
    if (scrubbedProgress !== null) {
      progressRef.current = scrubbedProgress;
      drawFrame(scrubbedProgress);
    }
  }, [scrubbedProgress, drawFrame]);

  // Re-draw immediately when controls change while paused
  React.useEffect(() => {
    if (!timelineIsPlaying) {
      drawFrame(progressRef.current);
    }
  }, [config, timelineIsPlaying, drawFrame]);

  // Hardware-accelerated visual comfort filters (blur and brightness)
  const filterStyle = React.useMemo(() => {
    const parts: string[] = [];
    if (config.blur > 0.1) {
      parts.push(`blur(${config.blur}px)`);
    }
    if (config.brightness !== 100) {
      parts.push(`brightness(${config.brightness}%)`);
    }
    return parts.length > 0 ? parts.join(" ") : "none";
  }, [config.blur, config.brightness]);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%" }}
    >
      <canvas
        ref={canvasRef}
        data-toolcraft-product-output="moire"
        style={filterStyle !== "none" ? { filter: filterStyle } : undefined}
        className="block"
      />
    </div>
  );
}
