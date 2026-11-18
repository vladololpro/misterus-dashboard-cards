import { formatCardNumber } from '../formatCard'

describe('formatCardNumber', () => {
  test('masks all digits except the last four', () => {
    expect(formatCardNumber('2200240012345678')).toBe('**** 5678')
  })

  test('handles a short value', () => {
    expect(formatCardNumber('123')).toBe('**** 123')
  })

  test('handles an empty value', () => {
    expect(formatCardNumber('')).toBe('**** ')
  })
})
