/**
 * End-to-end walkthrough of the whole Tall Poppies journey.
 *
 *   npm run build && npm run preview -- --port 4173
 *   node tests/e2e/walkthrough.mjs http://localhost:4173 ./screenshots
 *
 * Requires Playwright with Chromium (`npx playwright install chromium`).
 */
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import assert from 'node:assert/strict';

const { chromium } = createRequire(import.meta.url)('playwright');

const BASE = process.argv[2] ?? 'http://localhost:4173';
const OUT = process.argv[3] ?? './screenshots';
mkdirSync(OUT, { recursive: true });

const MOBILE = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true };
const DESKTOP = { viewport: { width: 1440, height: 900 } };
const results = [];
const errors = [];

async function test(name, fn) {
  const t0 = Date.now();
  try {
    await fn();
    results.push(`✓ ${name} (${Date.now() - t0}ms)`);
  } catch (e) {
    results.push(`✗ ${name}\n    ${e.message.split('\n').join('\n    ')}`);
    process.exitCode = 1;
  }
}

async function open(browser, opts = MOBILE, seed) {
  const ctx = await browser.newContext(opts);
  if (seed !== undefined) {
    await ctx.addInitScript((data) => {
      if (!sessionStorage.getItem('__seeded')) {
        localStorage.setItem('tall-poppies', typeof data === 'string' ? data : JSON.stringify(data));
        sessionStorage.setItem('__seeded', '1');
      }
    }, seed);
  }
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(`${e.message}`));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await page.goto(BASE);
  await page.waitForLoadState('networkidle');
  return { ctx, page };
}

function seededWins(n, { daysBack = n * 2 } = {}) {
  const cats = ['work', 'life', 'courage', 'learning', 'kindness', 'other', undefined];
  const now = new Date();
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - Math.round(daysBack - (i * daysBack) / n));
    const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const stamp = new Date(d.getTime() + i * 1000).toISOString();
    return {
      id: `00000000-0000-4000-8000-${String(i).padStart(12, '0')}`,
      text: [`Went for a walk in the rain`, `Asked a question in the meeting`, `Finished the chapter`, `Called my sister`, `Shipped the fix`, `Cooked something new`][i % 6] + ` (${i + 1})`,
      category: cats[i % cats.length],
      date,
      createdAt: stamp,
      updatedAt: stamp,
    };
  });
}

const stageText = (page) => page.locator('main p.eyebrow').first().textContent();

/** Hash navigation plus a beat for the screen transition. */
async function go(page, hash) {
  await page.goto(`${BASE}/${hash}`);
  await page.waitForTimeout(600);
}

async function plant(page, text, { category } = {}) {
  await page.getByRole('button', { name: /^Plant/ }).first().click();
  const dialog = page.getByRole('dialog', { name: /What went well today/ });
  await dialog.waitFor();
  await dialog.locator('textarea').fill(text);
  if (category) await dialog.getByRole('button', { name: category }).click();
  await dialog.getByRole('button', { name: 'Plant this win' }).click();
  const celebration = page.getByRole('dialog', { name: 'Your win has been planted' });
  await celebration.waitFor();
  return celebration;
}

const browser = await chromium.launch();

await test('first-time onboarding and first win', async () => {
  const { ctx, page } = await open(browser);
  await page.getByRole('heading', { name: "You're allowed to be proud of yourself." }).waitFor();
  assert.ok(await page.getByText('A little garden for all the things').isVisible());
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${OUT}/01-welcome.png` });

  await page.getByRole('button', { name: 'Plant your first win' }).click();
  const dialog = page.getByRole('dialog', { name: 'What went well today?' });
  await dialog.waitFor();
  const dateValue = await dialog.locator('input[type=date]').inputValue();
  assert.equal(dateValue, new Date().toLocaleDateString('en-CA'), 'date defaults to today');
  assert.ok(await dialog.getByRole('button', { name: 'Plant this win' }).isDisabled(), 'CTA disabled while empty');
  await dialog.locator('textarea').fill('I finally applied for that job.');
  await dialog.getByRole('button', { name: 'Courage' }).click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/02-plant-sheet.png` });
  const t0 = Date.now();
  await dialog.getByRole('button', { name: 'Plant this win' }).click();

  const celebration = page.getByRole('dialog', { name: 'Your win has been planted' });
  await celebration.waitFor();
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${OUT}/03-celebration-seed.png` });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${OUT}/04-celebration-bloom.png` });
  assert.ok(await celebration.getByText('Look what you grew.').isVisible());
  assert.ok(await celebration.getByText('your own poppy has sprouted').isVisible());
  await celebration.waitFor({ state: 'detached', timeout: 8000 });
  const elapsed = Date.now() - t0;
  assert.ok(elapsed > 2500 && elapsed < 6000, `first celebration auto-closes after its sequence (${elapsed}ms)`);

  await page.waitForTimeout(1400);
  assert.match(await stageText(page), /Sprout · 1 win/);
  await page.screenshot({ path: `${OUT}/05-home-sprout.png` });

  await page.reload();
  await page.waitForLoadState('networkidle');
  assert.equal(await page.getByRole('heading', { name: "You're allowed to be proud of yourself." }).count(), 0, 'no welcome after first win');
  assert.equal(await page.getByRole('dialog').count(), 0, 'celebration does not replay on refresh');
  assert.match(await stageText(page), /Sprout · 1 win/, 'persists across refresh');
  await ctx.close();
});

await test('growth stages change at 1, 3, 7 and 15 wins; later celebrations are shorter and skippable', async () => {
  const { ctx, page } = await open(browser, MOBILE, { version: 1, wins: [], preferences: { welcomed: true } });
  const expected = { 1: 'Sprout', 2: 'Sprout', 3: 'Bud', 6: 'Bud', 7: 'Bloom', 14: 'Bloom', 15: 'Tall poppy' };
  for (let n = 1; n <= 15; n++) {
    const celebration = await plant(page, `Win number ${n}`);
    if (n === 2) {
      const t0 = Date.now();
      await celebration.waitFor({ state: 'detached', timeout: 6000 });
      assert.ok(Date.now() - t0 < 3600, `later celebration is shorter (${Date.now() - t0}ms)`);
    } else {
      if ([3, 7, 15].includes(n)) assert.ok(await celebration.getByText(/Your poppy/).isVisible(), `stage-up line at ${n}`);
      await celebration.getByRole('button', { name: 'Skip' }).click();
      await celebration.waitFor({ state: 'detached' });
    }
    if (expected[n]) {
      assert.match(await stageText(page), new RegExp(`^${expected[n]}`, 'i'), `stage at ${n} wins`);
    }
    if ([3, 7, 15].includes(n)) {
      await page.waitForTimeout(1800);
      await page.screenshot({ path: `${OUT}/06-stage-${n}.png` });
    }
  }
  await page.getByRole('button', { name: /Your signature poppy/ }).click();
  const journey = page.getByRole('dialog', { name: "Your poppy's journey" });
  await journey.waitFor();
  assert.ok(await journey.getByText('15 wins').isVisible());
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/07-journey.png` });
  await page.keyboard.press('Escape');
  await journey.waitFor({ state: 'detached' });
  await ctx.close();
});

await test('edit and delete wins, with stage recalculated and undo', async () => {
  const { ctx, page } = await open(browser, MOBILE, { version: 1, wins: seededWins(15), preferences: { welcomed: true } });
  assert.match(await stageText(page), /Tall poppy · 15 wins/);
  await go(page, '#/journal');
  const first = page.locator('article').first();
  await first.getByRole('button', { name: 'Edit' }).click();
  const dialog = page.getByRole('dialog', { name: 'Tend to this win' });
  await dialog.waitFor();
  await dialog.locator('textarea').fill('I spoke up for myself.');
  await dialog.getByRole('button', { name: 'Save changes' }).click();
  await page.locator('article').getByText('I spoke up for myself.').waitFor();
  await page.screenshot({ path: `${OUT}/08-journal.png` });

  await page.locator('article').first().getByRole('button', { name: 'Remove' }).click();
  const confirm = page.getByRole('alertdialog', { name: 'Let this one go?' });
  await confirm.waitFor();
  await confirm.getByRole('button', { name: 'Keep it' }).click();
  assert.equal(await page.locator('article').count(), 15, 'cancel keeps the win');
  await page.locator('article').first().getByRole('button', { name: 'Remove' }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Remove' }).click();
  await page.waitForTimeout(400);
  assert.equal(await page.locator('article').count(), 14);
  await go(page, '#/');
  assert.match(await stageText(page), /Bloom · 14 wins/, 'stage recalculated after delete');
  await page.getByRole('button', { name: 'Undo' }).click();
  assert.match(await stageText(page), /Tall poppy · 15 wins/, 'undo restores');
  await page.reload();
  assert.match(await stageText(page), /15 wins/);
  await ctx.close();
});

await test('flower appearance and placement are stable after refresh', async () => {
  const { ctx, page } = await open(browser, MOBILE, { version: 1, wins: seededWins(20), preferences: { welcomed: true } });
  await go(page, '#/garden');
  await page.waitForTimeout(600);
  const snapshot = () =>
    page.$$eval('[data-win-id]', (els) => els.map((e) => [e.dataset.winId, e.getAttribute('style'), e.querySelector('svg')?.getAttribute('viewBox'), e.querySelectorAll('path').length].join('|')));
  const before = await snapshot();
  assert.equal(before.length, 20);
  await page.reload();
  await page.waitForTimeout(600);
  assert.deepEqual(await snapshot(), before);
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('tall-poppies')).wins.map((w) => w.flowerVariant));
  assert.ok(stored.every((v) => v && typeof v.color === 'string'), 'variants persisted');
  await page.screenshot({ path: `${OUT}/09-garden-20.png` });
  await page.locator('[data-win-id]').first().locator('.flower-hit circle').click({ force: true });
  const detail = page.getByRole('dialog');
  await detail.waitFor();
  assert.ok(await detail.getByText('Went for a walk in the rain (1)').isVisible(), 'tapping a flower reveals its win');
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/10-flower-detail.png` });
  await ctx.close();
});

await test('empty states', async () => {
  const { ctx, page } = await open(browser, MOBILE, { version: 1, wins: [], preferences: { welcomed: true } });
  assert.match(await stageText(page), /^Seed/);
  assert.ok(await page.getByText('Your seed is waiting').isVisible());
  await go(page, '#/garden');
  assert.ok(await page.getByText('Your garden is waiting for its first flower.').isVisible());
  await page.screenshot({ path: `${OUT}/11-garden-empty.png` });
  await go(page, '#/journal');
  assert.ok(await page.getByText("Nothing here yet, and that's okay.").isVisible());
  await ctx.close();
});

await test('corrupted or missing data is handled gracefully', async () => {
  const { ctx, page } = await open(browser, MOBILE, '{"version":1,"wins":[{"id":');
  await page.getByText(/couldn.t be read/).waitFor();
  assert.ok(await page.getByRole('button', { name: 'Plant your first win' }).isVisible());
  const backups = await page.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith('tall-poppies:backup')));
  assert.equal(backups.length, 1, 'unreadable data backed up');
  await ctx.close();
});

await test('garden scales to 130 wins with every flower reachable', async () => {
  const { ctx, page } = await open(browser, DESKTOP, { version: 1, wins: seededWins(130, { daysBack: 300 }), preferences: { welcomed: true } });
  await go(page, '#/garden');
  await page.waitForTimeout(800);
  const pager = page.getByRole('navigation', { name: 'Garden patches' });
  assert.ok(await pager.getByText(/Patch V/).isVisible(), 'newest patch shown first');
  const seen = new Set();
  for (let i = 0; i < 5; i++) {
    const ids = await page.$$eval('[data-win-id]', (els) => els.map((e) => e.dataset.winId));
    assert.ok(ids.length <= 28 && ids.length > 0);
    ids.forEach((id) => seen.add(id));
    if (i === 0) await page.screenshot({ path: `${OUT}/12-garden-130-desktop.png` });
    if (i < 4) {
      await pager.getByRole('button', { name: 'Older patch' }).click();
      await page.waitForTimeout(600);
    }
  }
  assert.equal(seen.size, 130, 'every win has a flower in some patch');
  await page.screenshot({ path: `${OUT}/13-garden-patch-1.png` });
  await go(page, '#/journal');
  assert.equal(await page.locator('article').count(), 130);
  await page.getByRole('button', { name: 'Kindness' }).click();
  await page.waitForTimeout(600);
  const kind = await page.locator('article').count();
  assert.ok(kind > 0 && kind < 130, 'category filter');
  const target = await page.locator('article').nth(3).getAttribute('id');
  await page.locator('article').nth(3).getByRole('button', { name: 'See its flower' }).click();
  const t0 = Date.now();
  await page.waitForFunction(() => document.activeElement?.dataset?.winId, null, { timeout: 4000 }).catch(() => {});
  console.log(`    (flower focused after ${Date.now() - t0}ms)`);
  const focused = await page.evaluate(() => document.activeElement?.dataset?.winId);
  assert.equal(`win-${focused}`, target, 'journal navigates to the exact flower');
  await page.screenshot({ path: `${OUT}/14-garden-focus.png` });
  await go(page, '#/');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${OUT}/15-home-mature-desktop.png` });
  await ctx.close();
});

await test('keyboard: plant, celebrate and close without a mouse', async () => {
  const { ctx, page } = await open(browser, DESKTOP, { version: 1, wins: seededWins(4), preferences: { welcomed: true } });
  let found = false;
  for (let i = 0; i < 12 && !found; i++) {
    await page.keyboard.press('Tab');
    found = (await page.evaluate(() => document.activeElement?.textContent?.trim())) === 'Plant a win';
  }
  assert.ok(found, 'Plant a win is reachable by Tab');
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog', { name: 'What went well today?' });
  await dialog.waitFor();
  await page.waitForTimeout(100);
  assert.equal(await page.evaluate(() => document.activeElement?.tagName), 'TEXTAREA', 'focus moves into the sheet');
  for (let i = 0; i < 15; i++) await page.keyboard.press('Tab');
  assert.ok(await page.evaluate(() => !!document.activeElement?.closest('[role=dialog]')), 'focus is trapped in the sheet');
  await page.keyboard.press('Escape');
  await dialog.waitFor({ state: 'detached' });
  await page.keyboard.press('Tab');
  await page.getByRole('button', { name: 'Plant a win' }).first().focus();
  await page.keyboard.press('Enter');
  await dialog.waitFor();
  await page.waitForTimeout(150);
  await page.keyboard.type('Planted with only a keyboard');
  await page.keyboard.press('Control+Enter');
  const celebration = page.getByRole('dialog', { name: 'Your win has been planted' });
  await celebration.waitFor();
  await page.keyboard.press('Escape');
  await celebration.waitFor({ state: 'detached' });
  await go(page, '#/garden');
  await page.waitForTimeout(500);
  await page.locator('[data-win-id]').first().focus();
  await page.keyboard.press('Enter');
  await page.getByRole('dialog').waitFor();
  await ctx.close();
});

await test('reduced motion: no drop, no sway, still celebrates', async () => {
  const { ctx, page } = await open(browser, { ...MOBILE, reducedMotion: 'reduce' }, { version: 1, wins: seededWins(6), preferences: { welcomed: true } });
  const celebration = await plant(page, 'Calm and steady');
  assert.equal(await celebration.locator('svg[viewBox="-20 -20 40 40"]').count(), 0, 'no falling seed');
  assert.ok(await celebration.getByText('Calm and steady').isVisible());
  await celebration.getByRole('button', { name: 'Skip' }).click();
  await go(page, '#/garden');
  await page.waitForTimeout(400);
  const anim = await page.$eval('.flower-sway', (el) => getComputedStyle(el).animationName);
  assert.equal(anim, 'none', 'ambient sway disabled');
  await ctx.close();
});

await test('responsive screenshots', async () => {
  const { ctx, page } = await open(browser, MOBILE, { version: 1, wins: seededWins(32, { daysBack: 40 }), preferences: { welcomed: true } });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${OUT}/16-home-mobile-32.png`, fullPage: true });
  await go(page, '#/garden');
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${OUT}/17-garden-mobile.png`, fullPage: true });
  await go(page, '#/journal');
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT}/18-journal-mobile.png` });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  assert.equal(overflow, false, 'no horizontal scroll on mobile');
  await ctx.close();
  const d = await open(browser, DESKTOP, { version: 1, wins: seededWins(9), preferences: { welcomed: true } });
  await d.page.waitForTimeout(1500);
  await d.page.screenshot({ path: `${OUT}/19-home-desktop-9.png` });
  await go(d.page, '#/journal');
  await d.page.waitForTimeout(500);
  await d.page.screenshot({ path: `${OUT}/20-journal-desktop.png` });
  await d.ctx.close();
});

await browser.close();
console.log(results.join('\n'));
const realErrors = errors.filter((e) => !/favicon|sw\.js/.test(e));
if (realErrors.length) {
  console.log('\nPage errors:\n' + [...new Set(realErrors)].join('\n'));
  process.exitCode = 1;
}
