import * as React from "react";
import { composeToolcraftApp } from "@/toolcraft/runtime/react";

import { appSchema } from "./app-schema";
import { KineticMoireLoomCanvas } from "./kinetic-moire-loom-canvas";
import { evaluateMoireScene, DEFAULT_MOIRE_CONFIG } from "./kinetic-moire-loom-model";
import { renderMoireScene } from "./kinetic-moire-loom-renderer";

export const appComposition = composeToolcraftApp(appSchema, {
  scene: {
    canvasContent: <KineticMoireLoomCanvas />,
    rasterFrameRenderer: {
      baseFileName: "kinetic-moire-loom",
      renderFrame: ({ context: ctx, frame, timelineProgress }) => {
        const w = frame.width;
        const h = frame.height;
        const scene = evaluateMoireScene(DEFAULT_MOIRE_CONFIG, timelineProgress, w, h);
        renderMoireScene(ctx, scene, DEFAULT_MOIRE_CONFIG, w, h);
      },
    },
  },
});
