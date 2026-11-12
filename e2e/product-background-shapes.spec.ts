import { expect, test } from "./toolcraft-product-test";
import { createToolcraftBrowserProofSession } from "./browser-proof-session";
import { expectToolcraftProductObservableToChange } from "./product-observable-helpers";
import { expectToolcraftCompoundControlPartOutcome } from "./browser-state-evidence-helpers";
import type { Locator } from "@playwright/test";

const output = '[data-toolcraft-product-output="moire"]';
const shapes = '[data-toolcraft-control-target="backgroundShapes.items"]';

async function setHex(field: Locator, value: string) {
  const input = field.getByRole("textbox", { name: /hex$/i }).first();
  await input.fill(value);
  await input.press("Enter");
}

test("browser: background shapes edit independently and persist", async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 1100 });
  await page.goto("/");
  const session = await createToolcraftBrowserProofSession(page);
  const pause = page.getByRole("button", { name: "Pause playback", exact: true });
  if (await pause.count()) await pause.click();
  await expect(page.locator(output)).toBeVisible();

  const collection = page.locator(shapes);
  const items = collection.locator('[data-toolcraft-collection-item-index]');
  await expect(items).toHaveCount(2);
  const pinkBefore = await items.nth(1).getByRole("textbox", { name: /hex$/i }).inputValue();

  await expectToolcraftProductObservableToChange(
    session,
    session.controlAction("backgroundShapes.items", async () => {
      await setHex(items.first(), "00BB44");
    }),
    { requirementId: "backgroundShapes.items", selector: output },
  );
  expect(await items.nth(1).getByRole("textbox", { name: /hex$/i }).inputValue()).toBe(pinkBefore);

  const purpleAtCenter = session.observe((root) => {
    const c = root.querySelector<HTMLCanvasElement>('[data-toolcraft-product-output="moire"]')!;
    const [r, g, b, a] = c.getContext("2d")!.getImageData(
      Math.round(c.width * 0.503),
      Math.round(c.height * 0.5),
      1,
      1,
    ).data;
    return b > g + 20 && r > g + 10 && a > 100;
  });

  await expectToolcraftCompoundControlPartOutcome(
    purpleAtCenter,
    session.controlAction("backgroundShapes.items", async () => {
      await page.getByRole("button", { name: "Añadir forma", exact: true }).click();
    }),
    true,
    { requirementId: "backgroundShapes.items", part: "collectionActions.add" },
  );
  await expect(items).toHaveCount(3);

  await expectToolcraftCompoundControlPartOutcome(
    purpleAtCenter,
    session.controlAction("backgroundShapes.items", async () => {
      await setHex(items.nth(2), "00CC33");
    }),
    false,
    { requirementId: "backgroundShapes.items", part: "collectionActions.items" },
  );

  await setHex(items.nth(2), "8C63EC");

  await expectToolcraftCompoundControlPartOutcome(
    purpleAtCenter,
    session.controlAction("backgroundShapes.items", async () => {
      await page.getByRole("button", { name: "Eliminar forma", exact: true }).click();
    }),
    false,
    { requirementId: "backgroundShapes.items", part: "collectionActions.remove" },
  );

  await expect(page.locator('[data-toolcraft-persistence-status="success"]')).toHaveCount(1);
  await page.reload();

  const pauseAfterReload = page.getByRole("button", { name: "Pause playback", exact: true });
  if (await pauseAfterReload.count()) await pauseAfterReload.click();

  await expect(items).toHaveCount(2);
  await expect(items.first().getByRole("textbox", { name: /hex$/i })).toHaveValue("#00BB44");
  await expect(items.nth(1).getByRole("textbox", { name: /hex$/i })).toHaveValue(pinkBefore);

  const canvas = page.locator(output);
  const reloadedGreen = await canvas.evaluate((el: HTMLCanvasElement) => {
    const ctx = el.getContext("2d")!;
    const data = ctx.getImageData(0, 0, el.width, el.height).data;
    let count = 0;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
      if (g > 100 && g > r + 30 && g > b + 30 && a > 50) {
        count++;
      }
    }
    return count;
  });
  expect(reloadedGreen).toBeGreaterThan(1000);
});
