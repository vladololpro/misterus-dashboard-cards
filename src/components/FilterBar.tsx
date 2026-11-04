import { useDispatch, useSelector } from 'react-redux'
import { FILTERS, setFilter } from '../features/filter/filterSlice'
import { FilterValue } from '../shared/types'
import { RootState } from '../app/store'

function FilterBar() {
  const dispatch = useDispatch()
  const currentFilter = useSelector((state: RootState) => state.filter.value)

  const handleFilterClick = (value: FilterValue) => {
    dispatch(setFilter(value))
  }

  return (
    <div className="filter-bar">
      {FILTERS.map(({ value, label }) => (
        <button
          key={value}
          className={currentFilter === value ? 'filter-btn filter-btn--active' : 'filter-btn'}
          onClick={() => handleFilterClick(value)}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

export default FilterBar
