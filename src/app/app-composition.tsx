import * as React from "react";
import { composeToolcraftApp } from "@/toolcraft/runtime/react";

import { appSchema } from "./app-schema";
import { KineticMoireLoomCanvas } from "./kinetic-moire-loom-canvas";
import {
  evaluateMoireScene,
  extractMoireConfig,
} from "./kinetic-moire-loom-model";
import { renderMoireScene } from "./kinetic-moire-loom-renderer";

export const appComposition = composeToolcraftApp(appSchema, {
  scene: {
    canvasContent: <KineticMoireLoomCanvas />,
    rasterFrameRenderer: {
      baseFileName: "kinetic-moire-loom",
      renderFrame: ({ context, frame, timelineProgress, state }) => {
        const config = extractMoireConfig(state.values);
        const scene = evaluateMoireScene(
          config,
          timelineProgress,
          frame.width,
          frame.height,
        );
        context.save();
        context.translate(frame.x, frame.y);
        if (config.blur > 0 || config.brightness !== 100) {
          context.filter = `blur(${config.blur}px) brightness(${config.brightness}%)`;
        }
        renderMoireScene(context, scene, config, frame.width, frame.height);
        context.restore();
      },
    },
  },
});
