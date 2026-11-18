import { formatMoney } from '../formatMoney'

const normalize = (value: string): string => value.replace(/[\u00a0\u202f]/g, ' ')

describe('formatMoney', () => {
  test('formats a regular amount with the default currency', () => {
    expect(normalize(formatMoney(12500))).toBe('12 500 ₽')
  })

  test('formats a negative amount', () => {
    expect(normalize(formatMoney(-640))).toBe('-640 ₽')
  })

  test('adds a plus sign only for positive amounts when requested', () => {
    expect(normalize(formatMoney(1500, '$', { withSign: true }))).toBe('+1 500 $')
    expect(normalize(formatMoney(-1500, '$', { withSign: true }))).toBe('-1 500 $')
    expect(normalize(formatMoney(0, '$', { withSign: true }))).toBe('0 $')
  })

  test('keeps an explicitly passed currency', () => {
    expect(normalize(formatMoney(999, 'USD'))).toBe('999 USD')
  })
})
