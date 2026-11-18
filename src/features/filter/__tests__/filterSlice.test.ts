import { FILTERS, isFilterValue, setFilter } from '../filterSlice'
import filterReducer from '../filterSlice'

describe('isFilterValue', () => {
  test.each(['all', 'income', 'expense'])('accepts %s', (value) => {
    expect(isFilterValue(value)).toBe(true)
  })

  test.each(['', 'ALL', 'unknown', null, undefined, 1, {}])('rejects %p', (value) => {
    expect(isFilterValue(value)).toBe(false)
  })
})

describe('FILTERS', () => {
  test('contains all filter values with labels', () => {
    expect(FILTERS).toEqual([
      { value: 'all', label: 'Все' },
      { value: 'income', label: 'Доходы' },
      { value: 'expense', label: 'Расходы' },
    ])
  })
})

describe('filterReducer', () => {
  test('updates the filter value', () => {
    expect(filterReducer({ value: 'all' }, setFilter('income'))).toEqual({ value: 'income' })
  })

  test('keeps state on an unknown action', () => {
    expect(filterReducer({ value: 'expense' }, { type: 'unknown' })).toEqual({ value: 'expense' })
  })
})
