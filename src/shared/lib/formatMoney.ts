export function formatMoney(
  value: number, 
  currency: string = '₽', 
  { withSign = false }: { withSign?: boolean } = {}
): string {
  const sign = withSign && value > 0 ? '+' : ''
  return `${sign}${value.toLocaleString('ru-RU')} ${currency}`
}