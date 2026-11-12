# Toolcraft App Agent Worklog

## Status

Mode: product

This is a neutral template. Before first product delivery, replace this status with `Mode: product` and record concrete decisions. Keep later entries compact. Detailed requests and results belong in `docs/agent-journal/changes`; text command attempts live in `.toolcraft/journal/runs`.

## Decision Trail
Active change: editable-background-shapes-2026-11-12

### Editable background shapes

- Change ID: editable-background-shapes-2026-11-12
- Entry type: focused
- Request: "lo de degradado interior veo que cambia el color pero de todo ... modificar el fondo para tener formas y que sean editables, y el color de fondo tambien ... aplica este cambio"
- Changed owner: `moire-background.ts`, `moire-background-controls.ts`, model, renderer, canvas, composition, schema, and focused acceptance.
- Reference inputs: User-supplied still image `image_2c0d9724-bdf7-492c-be4c-66aa1e3a5db0`; blue lower-left/pink upper-right forms with vertical white striations. No motion preprocessing applies.
- Decision: Built-in compound collection owns up to eight forms, each with colorOpacity, position Vector, width, height and softness. Panel owns all property and collection operations; no duplicated canvas handles or Layers module. Position is directly authored in screen coordinates (positive X right, positive Y down).
- Renderer: Finite 1000x700 graphic panel from the reference is an intentional artistic domain. Shape falloff has finite support; the shared renderer draws forms then lines, never the base fill. Runtime owns Background in finite/Infinity modes and export. Preview clears its own bitmap; export preserves the runtime destination.
- Compatibility: Preserve existing targets and saved values. Keep the old layer gradient with an accurate label. A reversible `Aplicar referencia` action prepares the composition rather than overwriting persisted work on load.
- Performance: At most eight radial ellipse fills in the existing Canvas2D path. No new dependencies, per-pixel CPU loops, offscreen blur buffers, measured performance, or FPS claims.
- Verification plan: Later feature-focused work: RED/GREEN model-renderer tests; protected feature browser checks for the two new acceptance IDs, plus type checking for the schema/composition integration. No aggregate delivery or performance audit.
### Full canvas background and unified shapes

- Change ID: canvas-background-unified-shapes-2026-11-12
- Entry type: focused
- Request: "quita el boton de aplicar referencia y haz que las 2 formas que hay esten junto a la edicion del background color. y arregla eso del espacio en blanco que queda alrededor. has hecho que no haya mas de un gropo de lineas."
- Changed owner: `moire-background-controls.ts`, `moire-background.ts`, `app-schema.ts`, `app-composition.tsx`, `kinetic-moire-loom-renderer.ts`, `kinetic-moire-loom-model.ts`, `moire-background-acceptance.ts`.
- Decision: Remove fixed 1000x700 `MOIRE_FRAME` bounds provider so the product scene expands to the full artboard without margins. Remove the "Aplicar referencia" button. Unify background color and background shapes into a single "Fondo" section. Default `centerDistance` to 35px with 2 layers of concentric rings so multiple groups of lines clearly intersect to form dynamic moiré interference.
- Verification: GREEN 11/11 focused unit tests; Playwright browser test passed (`browser: background shapes edit independently and persist`); `npm run build` compiled cleanly.
- Risks: None identified.

Active change: canvas-background-unified-shapes-2026-11-12

Product delivery has not started. Add one entry per coherent request. Give entries a stable `Change ID` and select the current one with `Active change: <id>` outside this section. Keep every entry inside this section; display order is not execution authority.

A first delivery records request, references, applied contracts, decisions, alternatives, state/output mapping, checks and risks. A later `Entry type: focused` records `Change ID`, `Request`, `Changed owner`, `User-visible result`, `Verification` and `Risks`. `Verification` describes the actual checks and their results; command mentions never authorize execution.

For a localized, user-authorized performance iteration, record only this separate domain authority in the selected entry:

```md
- Performance intent: performance-iteration
- Performance request evidence: "<verbatim exact Request quote>"
- Performance paths: ["performance-path:%5B...%5D"]
```

Missing performance intent means ordinary work. Performance evidence must be an exact nontrivial raw Request substring; paths must be unique canonical IDs. Unresolved localization creates no path authority. Run `npm run verify:delivery` for initial functional delivery or one authorized targeted iteration; full performance certification requires a separate explicit request.

## Decisions

### Renderer

- Decision: No product renderer yet.
- Reason: The starter is intentionally neutral.
- Evidence: Replace with concrete product schema, implementation and focused evidence before first delivery.

### View Interaction

- Decision: No spatial product view yet.
- Reason: The starter is intentionally neutral.
- Evidence: Replace with concrete product schema, implementation and focused evidence before first delivery.

### Interaction Ownership

- Decision: No product interaction ownership yet.
- Reason: The starter is intentionally neutral.
- Evidence: Replace with concrete product schema, implementation and focused evidence before first delivery.

### Timeline

- Decision: No product animation yet.
- Reason: The starter is intentionally neutral.
- Evidence: Replace with concrete product schema, implementation and focused evidence before first delivery.

### Layers

- Decision: No product layer workflow yet.
- Reason: The starter is intentionally neutral.
- Evidence: Replace with concrete product schema, implementation and focused evidence before first delivery.

### Controls

- Decision: No product control sections yet.
- Reason: The starter is intentionally neutral.
- Evidence: Replace with concrete product schema, implementation and focused evidence before first delivery.

### Export

- Decision: No product output yet.
- Reason: The starter is intentionally neutral.
- Evidence: Replace with concrete product schema, implementation and focused evidence before first delivery.

### Performance

- Decision: No product workload yet.
- Reason: The starter is intentionally neutral.
- Evidence: Replace with concrete product schema, implementation and focused evidence before first delivery.

Canonical control values and selected-entity isolation must follow runtime representations and the declared selection owner. Render-scale-enabled products record functional `renderScaleCoverage`; prose never substitutes for asserted backing-quality proof.

## Evidence

- Source reviewed: neutral starter schema and local Toolcraft docs.
- Contract applied: product decisions belong to the generated app; platform development history is not copied into this template.

## Verification

Protected receipts own initial/performance proof. Later edits record focused checks and text journal run IDs. Failed attempts and their retries remain separate; no screenshots, videos or binary traces are required by the journal.

## Risks

- Risk: Replace neutral decisions before first product delivery. Historical source revisions or message references that are unknown must remain explicitly unknown.
