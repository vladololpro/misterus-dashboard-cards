import type { Card } from '@shared/types'
import { getCardById } from '../getCardById'

const cards: Card[] = [
  {
    id: 1,
    number: '2200000000000001',
    balance: 1000,
    currency: '₽',
    isBlocked: false,
    expiry: '12/29',
    type: 'Mir',
  },
  {
    id: 2,
    number: '4400000000000002',
    balance: 50,
    currency: '$',
    isBlocked: true,
    expiry: '06/28',
    type: 'Visa',
  },
]

describe('getCardById', () => {
  test('returns the matching card', () => {
    expect(getCardById(cards, 2)).toBe(cards[1])
  })

  test('returns undefined for an unknown id', () => {
    expect(getCardById(cards, 999)).toBeUndefined()
  })

  test('returns undefined for a negative id', () => {
    expect(getCardById(cards, -1)).toBeUndefined()
  })

  test('returns undefined for an empty list', () => {
    expect(getCardById([], 1)).toBeUndefined()
  })
})
