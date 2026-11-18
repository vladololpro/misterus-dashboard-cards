import { getMerchantIcon } from '../getMerchantIcon'

describe('getMerchantIcon', () => {
  test.each([
    ['Покупка в Steam', 'Развлечения', '#171a21'],
    ['STEAM кабинет', 'Развлечения', '#171a21'],
    ['Пятёрочка', 'Продукты', '#4CAF50'],
    ['Пятерочка', 'Продукты', '#4CAF50'],
    ['Магнит', 'Продукты', '#d32f2f'],
    ['Кофейня у дома', 'Кафе и рестораны', '#8D6E63'],
    ['Аптека 36,6', 'Здоровье', '#00BCD4'],
    ['Такси до дома', 'Транспорт', '#FFC107'],
    ['Метро', 'Транспорт', '#FFC107'],
    ['Перевод на карту', 'Переводы', '#1976D2'],
    ['Зарплата за октябрь', 'Доход', '#2E7D32'],
  ])('matches %s', (title, category, color) => {
    expect(getMerchantIcon(title)).toMatchObject({ category, color })
  })

  test('uses the first letter and neutral color for unknown merchants', () => {
    expect(getMerchantIcon('неизвестный магазин')).toMatchObject({
      icon: 'Н',
      color: '#78909c',
      category: 'Прочее',
    })
  })
})
