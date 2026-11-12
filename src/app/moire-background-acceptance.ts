import type { ToolcraftComponentAcceptance, ToolcraftControlSectionInventoryEntry } from "./acceptance/types";

export const backgroundShapeInventory: readonly ToolcraftControlSectionInventoryEntry[] = [
  {
    id: "background",
    title: "Fondo",
    entityId: "background",
    entity: "Canvas background & shapes",
    targets: ["palette.backgroundColor", "backgroundShapes.items"],
    finiteSelectors: [],
    groupingReason: "The background color and underlying color shapes are configured together in the same panel section.",
  },
];

export const backgroundShapeAcceptance: readonly ToolcraftComponentAcceptance[] = [
  {
    id: "backgroundShapes.items",
    kind: "control",
    componentType: "collectionActions",
    target: "backgroundShapes.items",
    automated: true,
    automatedTestName: "preserves independent shape records and an explicitly empty collection",
    browser: {
      file: "e2e/product-background-shapes.spec.ts",
      testName: "browser: background shapes edit independently and persist",
      budget: "standard",
    },
    controlPartCoverage: [
      "collectionActions.add",
      "collectionActions.remove",
      "collectionActions.items",
    ],
    fixture: "Two blue and pink forms behind the linework; a new purple form.",
    userAction:
      "Add/remove records and edit color, opacity, position, width, height and softness, then reload.",
    expectedObservable:
      "Each form changes independently; empty stays empty; right/down values move artwork right/down; reloaded artwork matches.",
    evidence: "product-output",
  },
];
