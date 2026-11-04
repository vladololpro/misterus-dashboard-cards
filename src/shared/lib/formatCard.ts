export function formatCardNumber(number: string): string {
  return `**** ${number.slice(-4)}`
}