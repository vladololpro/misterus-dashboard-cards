interface MerchantInfo {
  icon: string
  color: string
  category: string
}

export function getMerchantIcon(title: string): MerchantInfo {
  const t = title.toLowerCase()

  if (t.includes('steam')) return { icon: '🎮', color: '#171a21', category: 'Развлечения' }
  if (t.includes('пятёрочка') || t.includes('пятерочка')) return { icon: '🛒', color: '#4CAF50', category: 'Продукты' }
  if (t.includes('кофейня') || t.includes('кофе')) return { icon: '☕', color: '#8D6E63', category: 'Кафе и рестораны' }
  if (t.includes('зарплата')) return { icon: '💼', color: '#2E7D32', category: 'Доход' }
  if (t.includes('магнит')) return { icon: '🛍️', color: '#d32f2f', category: 'Продукты' }
  if (t.includes('аптека')) return { icon: '💊', color: '#00BCD4', category: 'Здоровье' }
  if (t.includes('такси') || t.includes('метро')) return { icon: '🚕', color: '#FFC107', category: 'Транспорт' }
  if (t.includes('перевод')) return { icon: '💸', color: '#1976D2', category: 'Переводы' }
  
  return { icon: title.charAt(0).toUpperCase(), color: '#78909c', category: 'Прочее' }
}