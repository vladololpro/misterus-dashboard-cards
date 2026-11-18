import type { Card, Operation } from '@shared/types'
import { isCardArray, isOperationArray } from '../guards'

const validCard: Card = {
  id: 1,
  number: '2200000000000001',
  balance: 1000,
  currency: '₽',
  isBlocked: false,
  expiry: '12/29',
  type: 'Mir',
}

const validOperation: Operation = {
  id: 1,
  cardId: 1,
  title: 'Покупка в магазине',
  amount: -100,
  date: '2026-10-01',
}

describe('isCardArray', () => {
  test('accepts an empty array', () => {
    expect(isCardArray([])).toBe(true)
  })

  test('accepts valid cards', () => {
    expect(isCardArray([validCard, { ...validCard, id: 2, type: 'Visa' }])).toBe(true)
  })

  test('rejects non-arrays', () => {
    expect(isCardArray(null)).toBe(false)
    expect(isCardArray({})).toBe(false)
    expect(isCardArray(validCard)).toBe(false)
  })

  test.each([
    ['missing id', { ...validCard, id: undefined }],
    ['string balance', { ...validCard, balance: '100' }],
    ['string isBlocked', { ...validCard, isBlocked: 'false' }],
    ['unknown type', { ...validCard, type: 'PayPal' }],
    ['null item', null],
  ])('rejects %s', (_label, value) => {
    expect(isCardArray([value])).toBe(false)
  })
})

describe('isOperationArray', () => {
  test('accepts an empty array', () => {
    expect(isOperationArray([])).toBe(true)
  })

  test('accepts valid operations with and without createdAt', () => {
    expect(
      isOperationArray([validOperation, { ...validOperation, id: 2, createdAt: '2026-10-01T10:00:00Z' }])
    ).toBe(true)
  })

  test('rejects non-arrays', () => {
    expect(isOperationArray(null)).toBe(false)
    expect(isOperationArray({})).toBe(false)
    expect(isOperationArray(validOperation)).toBe(false)
  })

  test.each([
    ['string amount', { ...validOperation, amount: '-100' }],
    ['numeric createdAt', { ...validOperation, createdAt: 123 }],
    ['missing date', { ...validOperation, date: undefined }],
    ['missing cardId', { ...validOperation, cardId: undefined }],
    ['null item', null],
  ])('rejects %s', (_label, value) => {
    expect(isOperationArray([value])).toBe(false)
  })
})
