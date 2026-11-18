import { expect, test, type Locator } from '@playwright/test'

const ensureUnblocked = async (card: Locator) => {
  if (await card.getByText('Заблокирована').count()) {
    await card.getByRole('button', { name: 'Разблокировать' }).click()
    await expect(card.getByText('Заблокирована')).toHaveCount(0)
  }
}

test('загружает карты и операции на главную страницу', async ({ page }) => {
  await page.goto('/')

  const firstCard = page.locator('.card-item').filter({ hasText: '**** 1234' })
  await expect(firstCard).toBeVisible()
  await expect(page.locator('.dashboard-operations').getByText('Пятёрочка')).toBeVisible()
  await expect(page.getByText('Быстрый перевод')).toBeVisible()
})

test('блокирует и разблокирует карту', async ({ page }) => {
  await page.goto('/')

  const firstCard = page.locator('.card-item').filter({ hasText: '**** 1234' })
  await ensureUnblocked(firstCard)

  await firstCard.getByRole('button', { name: 'Заблокировать' }).click()
  await expect(firstCard.getByText('Заблокирована')).toBeVisible()
  await expect(firstCard.getByRole('button', { name: 'Разблокировать' })).toBeVisible()

  await firstCard.getByRole('button', { name: 'Разблокировать' }).click()
  await expect(firstCard.getByText('Заблокирована')).toHaveCount(0)
  await expect(firstCard.getByRole('button', { name: 'Заблокировать' })).toBeVisible()
})

test('выполняет перевод и показывает результат на странице', async ({ page }) => {
  await page.goto('/')

  const sourceCard = page.locator('.card-item').filter({ hasText: '**** 1234' })
  const targetCard = page.locator('.card-item').filter({ hasText: '**** 5678' })
  await ensureUnblocked(sourceCard)
  await ensureUnblocked(targetCard)

  await sourceCard.click()
  await expect(page.locator('.quick-transfer__source-number')).toHaveText('**** 1234')

  await page.locator('.quick-transfer__select').selectOption('2')
  await page.locator('.quick-transfer__input').fill('100')
  await page.locator('.quick-transfer__submit').click()

  const notice = page.locator('.notice-banner--success')
  await expect(notice).toContainText('Перевод на карту **** 5678')
  await expect(notice).toContainText(/100/)

  const newOperation = page
    .locator('.dashboard-operations li')
    .filter({ hasText: 'Перевод на карту **** 5678' })
    .first()
  await expect(newOperation).toBeVisible()
  await expect(newOperation).toContainText(/-100/)
})

test('фильтрует историю по доходам и расходам', async ({ page }) => {
  await page.goto('/operations')

  const filters = page.locator('.filter-bar--compact')
  const amounts = page.locator('.history-item__amount')

  await filters.getByRole('button', { name: 'Доходы' }).click()
  const incomeAmounts = await amounts.allTextContents()
  expect(incomeAmounts.length).toBeGreaterThan(0)
  for (const amount of incomeAmounts) {
    expect(amount.trim().startsWith('+')).toBe(true)
  }

  await filters.getByRole('button', { name: 'Расходы' }).click()
  const expenseAmounts = await amounts.allTextContents()
  expect(expenseAmounts.length).toBeGreaterThan(0)
  for (const amount of expenseAmounts) {
    expect(amount.trim().startsWith('-')).toBe(true)
  }
})

test('показывает страницу 404 для неизвестного маршрута', async ({ page }) => {
  await page.goto('/unknown-page')

  await expect(page.getByRole('heading', { name: '404' })).toBeVisible()
  await expect(page.getByText('Страница не найдена')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Вернуться на главную' })).toBeVisible()
})
