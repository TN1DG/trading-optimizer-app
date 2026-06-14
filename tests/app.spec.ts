import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
})

// ── Header ──────────────────────────────────────────────────────────────────

test('header shows FX BOYZ TOOL', async ({ page }) => {
  await expect(page.locator('h1')).toHaveText('FX BOYZ TOOL')
})

test('subtitle is double-click editable', async ({ page }) => {
  const subtitle = page.locator('.subtitle')
  await subtitle.dblclick()
  await page.locator('.subtitle-input').fill('MY CUSTOM TITLE')
  await page.keyboard.press('Enter')
  await expect(page.locator('.subtitle')).toHaveText('MY CUSTOM TITLE')
})

// ── Session checklist — template reset ─────────────────────────────────────

test('session checklist resets to MARK POIs on reload', async ({ page }) => {
  const item = page.locator('#session-list .item-text').first()
  await expect(item).toHaveText('MARK POIs')

  // add an item, reload, should be gone
  await page.locator('input[placeholder="Add session item..."]').fill('Temp item')
  await page.locator('input[placeholder="Add session item..."]').press('Enter')
  await expect(page.locator('#session-list .item-text')).toHaveCount(2)

  await page.reload()
  await expect(page.locator('#session-list .item-text')).toHaveCount(1)
  await expect(page.locator('#session-list .item-text').first()).toHaveText('MARK POIs')
})

test('MARK POIs has chip options', async ({ page }) => {
  await expect(page.locator('#session-list .chip')).toHaveCount(6)
})

// ── Trade checklist — persists ──────────────────────────────────────────────

test('trade checklist persists across reloads', async ({ page }) => {
  await page.locator('input[placeholder="Add trade item..."]').fill('Persist me')
  await page.locator('input[placeholder="Add trade item..."]').press('Enter')
  await page.reload()
  await expect(page.locator('#trade-list .item-text').last()).toHaveText('Persist me')
})

// ── Checklist interactions ──────────────────────────────────────────────────

test('clicking checklist item toggles checked state', async ({ page }) => {
  const item = page.locator('#session-list .item').first()
  await item.click()
  await expect(item).toHaveClass(/checked/)
  await item.click()
  await expect(item).not.toHaveClass(/checked/)
})

test('chip selection toggles', async ({ page }) => {
  const chip = page.locator('#session-list .chip').first()
  await chip.click()
  await expect(chip).toHaveClass(/selected/)
  await chip.click()
  await expect(chip).not.toHaveClass(/selected/)
})

test('can add and delete a trade item', async ({ page }) => {
  await page.locator('input[placeholder="Add trade item..."]').fill('Delete me')
  await page.locator('input[placeholder="Add trade item..."]').press('Enter')
  const newItem = page.locator('#trade-list .item-wrap').last()
  await expect(newItem.locator('.item-text')).toHaveText('Delete me')
  await newItem.locator('.del-btn').click()
  const texts = await page.locator('#trade-list .item-text').allTextContents()
  expect(texts).not.toContain('Delete me')
})

// ── Rules column ───────────────────────────────────────────────────────────

test('can add a rule', async ({ page }) => {
  await page.locator('#rules-input').fill('NEW RULE')
  await page.locator('#rules-input').press('Enter')
  await expect(page.locator('#rules-list .item-text').last()).toHaveText('NEW RULE')
})

test('rules persist across reloads', async ({ page }) => {
  await page.locator('#rules-input').fill('PERSISTENT RULE')
  await page.locator('#rules-input').press('Enter')
  await page.reload()
  await expect(page.locator('#rules-list .item-text').last()).toHaveText('PERSISTENT RULE')
})

// ── Market Structure panel ─────────────────────────────────────────────────

test('market condition buttons are mutually exclusive', async ({ page }) => {
  const ranging = page.locator('.market-btn').filter({ hasText: 'Ranging' })
  const trending = page.locator('.market-btn').filter({ hasText: 'Trending' })
  await ranging.click()
  await expect(ranging).toHaveClass(/ranging/)
  await trending.click()
  await expect(trending).toHaveClass(/trending/)
  await expect(ranging).not.toHaveClass(/ranging/)
})

test('market bias buttons are mutually exclusive', async ({ page }) => {
  const bull = page.locator('.market-btn').filter({ hasText: 'Bullish' })
  const bear = page.locator('.market-btn').filter({ hasText: 'Bearish' })
  await bull.click()
  await expect(bull).toHaveClass(/bull/)
  await bear.click()
  await expect(bear).toHaveClass(/bear/)
  await expect(bull).not.toHaveClass(/bull/)
})

// ── Research panel ─────────────────────────────────────────────────────────

test('News button toggles active class', async ({ page }) => {
  const btn = page.locator('.news-btn')
  await btn.click()
  await expect(btn).toHaveClass(/active/)
  await btn.click()
  await expect(btn).not.toHaveClass(/active/)
})

test('Low Imp and High Imp are mutually exclusive', async ({ page }) => {
  const low = page.locator('.imp-btn.low')
  const high = page.locator('.imp-btn.high')
  await low.click()
  await expect(low).toHaveClass(/active/)
  await expect(high).not.toHaveClass(/active/)
  await high.click()
  await expect(high).toHaveClass(/active/)
  await expect(low).not.toHaveClass(/active/)
})

// ── Undo / Redo ────────────────────────────────────────────────────────────

test('undo removes last added trade item', async ({ page }) => {
  await page.locator('input[placeholder="Add trade item..."]').fill('Undo me')
  await page.locator('input[placeholder="Add trade item..."]').press('Enter')
  await expect(page.locator('#trade-list .item-text').last()).toHaveText('Undo me')
  await page.keyboard.press('Control+z')
  await expect(page.locator('#trade-list .item-text').last()).not.toHaveText('Undo me')
})

test('redo restores undone item', async ({ page }) => {
  await page.locator('input[placeholder="Add trade item..."]').fill('Redo me')
  await page.locator('input[placeholder="Add trade item..."]').press('Enter')
  await page.keyboard.press('Control+z')
  await page.keyboard.press('Control+y')
  await expect(page.locator('#trade-list .item-text').last()).toHaveText('Redo me')
})

// ── Aims panel ─────────────────────────────────────────────────────────────

test('currency toggle switches symbol', async ({ page }) => {
  await page.locator('.currency-btn').filter({ hasText: '£' }).click()
  await expect(page.locator('.currency-btn.active')).toHaveText('£')
})

test('aims inputs persist across reload', async ({ page }) => {
  await page.locator('.currency-btn').filter({ hasText: '£' }).click()
  const firstInput = page.locator('.side-table-input').first()
  await firstInput.fill('500')
  await page.reload()
  await expect(page.locator('.currency-btn.active')).toHaveText('£')
})

// ── Drag within session checklist ──────────────────────────────────────────

test('session checklist items reorder within section', async ({ page }) => {
  // add a second item so we have two to reorder
  await page.locator('input[placeholder="Add session item..."]').fill('Second item')
  await page.locator('input[placeholder="Add session item..."]').press('Enter')

  const items = page.locator('#session-list .item')
  const first = items.nth(0)
  const second = items.nth(1)

  const firstBox = await first.boundingBox()
  const secondBox = await second.boundingBox()

  await page.mouse.move(firstBox!.x + firstBox!.width / 2, firstBox!.y + firstBox!.height / 2)
  await page.mouse.down()
  await page.mouse.move(secondBox!.x + secondBox!.width / 2, secondBox!.y + secondBox!.height / 2, { steps: 10 })
  await page.mouse.up()

  const texts = await page.locator('#session-list .item-text').allTextContents()
  expect(texts[0]).toBe('Second item')
})

// ── Reset all checks ───────────────────────────────────────────────────────

test('reset all checks clears all checked items', async ({ page }) => {
  await page.locator('#session-list .item').first().click()
  await expect(page.locator('#session-list .item').first()).toHaveClass(/checked/)
  await page.locator('.reset-btn').click()
  await expect(page.locator('#session-list .item').first()).not.toHaveClass(/checked/)
})
