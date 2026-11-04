import { formatMoney } from '@shared/lib/formatMoney'
import { CategoryStat } from '@shared/lib/operationsStats'

interface CategoryPieChartProps {
  data: CategoryStat[]
  total: number
  emptyMessage: string
}

const CHART_COLORS = ['#4CAF50', '#2196F3', '#FF9800', '#E91E63', '#9C27B0', '#795548']
const FALLBACK_COLOR = '#78909c'

const getColor = (index: number): string =>
  CHART_COLORS[index % CHART_COLORS.length] ?? FALLBACK_COLOR

function CategoryPieChart({ data, total, emptyMessage }: CategoryPieChartProps) {
  if (data.length === 0 || total <= 0) {
    return <p className="load-empty">{emptyMessage}</p>
  }

  const gradient = data
    .map((category, index) => {
      const start = data
        .slice(0, index)
        .reduce((sum, item) => sum + (item.total / total) * 100, 0)
      const end = start + (category.total / total) * 100

      return `${getColor(index)} ${start}% ${end}%`
    })
    .join(', ')

  return (
    <div className="chart-container">
      <div
        className="pie-chart"
        role="img"
        aria-label={`Диаграмма: ${data.map((category) => category.category).join(', ')}`}
        style={{ background: `conic-gradient(${gradient})` }}
      />
      <div className="chart-legend">
        {data.map((category, index) => (
          <div key={category.category} className="legend-item">
            <span
              className="legend-color"
              style={{ background: getColor(index) }}
            ></span>
            <span>{category.category} — {formatMoney(category.total, '₽')}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CategoryPieChart
