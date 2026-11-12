import type { ToolcraftControlSectionSchema } from "@/toolcraft/runtime";
import { DEFAULT_BACKGROUND_SHAPES } from "./moire-background";

export const backgroundSection = {
  id: "background",
  title: "Fondo",
  description: "Color de base y formas de color independientes detrás de la trama cinética.",
  controls: {
    color: {
      type: "color",
      target: "palette.backgroundColor",
      label: "Color de fondo",
      defaultValue: "#080c14",
      applicability: { mode: "always" },
      performanceRole: "responsiveness",
    },
    items: {
      type: "collectionActions",
      target: "backgroundShapes.items",
      label: "Formas de fondo",
      addLabel: "Añadir forma",
      removeLabel: "Eliminar forma",
      minItems: 0,
      hardMaxItems: 8,
      defaultValue: DEFAULT_BACKGROUND_SHAPES,
      applicability: { mode: "always" },
      performanceRole: "responsiveness",
      performanceReason: "At most eight finite radial fills; edits reuse the existing frame renderer.",
      itemControls: {
        color: { type: "colorOpacity", label: "Color", defaultValue: { hex: "#8C63EC", opacity: 85 } },
        x: { type: "slider", label: "Posición X", defaultValue: 0, min: -100, max: 100, step: 1, unit: "%", sliderValueKind: "continuous" },
        y: { type: "slider", label: "Posición Y", defaultValue: 0, min: -100, max: 100, step: 1, unit: "%", sliderValueKind: "continuous" },
        width: { type: "slider", label: "Anchura", defaultValue: 60, min: 5, max: 100, step: 1, unit: "%", sliderValueKind: "continuous" },
        height: { type: "slider", label: "Altura", defaultValue: 60, min: 5, max: 100, step: 1, unit: "%", sliderValueKind: "continuous" },
        softness: { type: "slider", label: "Difuminado", defaultValue: 85, min: 0, max: 100, step: 1, unit: "%", sliderValueKind: "continuous" },
      },
    },
  },
} satisfies ToolcraftControlSectionSchema;
