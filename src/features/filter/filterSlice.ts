import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { FilterValue } from '../../shared/types'

export const FILTERS: ReadonlyArray<{ value: FilterValue; label: string }> = [
  { value: 'all', label: 'Все' },
  { value: 'income', label: 'Доходы' },
  { value: 'expense', label: 'Расходы' },
]

export const isFilterValue = (value: unknown): value is FilterValue =>
  typeof value === 'string' && FILTERS.some((filter) => filter.value === value)

interface FilterState {
  value: FilterValue
}

const getInitialFilter = (): FilterValue => {
  try {
    const saved = localStorage.getItem('app_filter')
    return isFilterValue(saved) ? saved : 'all'
  } catch {
    return 'all'
  }
}

const initialState: FilterState = {
  value: getInitialFilter(),
}

const filterSlice = createSlice({
  name: 'filter',
  initialState,
  reducers: {
    setFilter: (state, action: PayloadAction<FilterValue>) => {
      state.value = action.payload
      try {
        localStorage.setItem('app_filter', action.payload)
      } catch (e) {
        console.error(e)
      }
    },
  },
})

export const { setFilter } = filterSlice.actions
export default filterSlice.reducer
