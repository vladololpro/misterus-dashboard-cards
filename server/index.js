import express from 'express'
import cors from 'cors'

const app = express()
app.use(cors())
app.use(express.json())

const cards = [
  { id: 1, number: '2202 1234 5678 1234', balance: 12500, currency: '₽', isBlocked: false, expiry: '12/28', type: 'Mir'},
  { id: 2, number: '5469 8765 4321 5678', balance: 3200, currency: '₽', isBlocked: false, expiry: '05/27', type: 'MasterCard'},
  { id: 3, number: '4276 9876 5432 9012', balance: 870, currency: '$', isBlocked: true, expiry: '09/26', type: 'Visa'},
]

const operations = [
  { id: 1, cardId: 1, title: 'Пятёрочка', amount: -640, date: '2026-10-12', createdAt: '2026-10-12T14:30:00Z' },
  { id: 2, cardId: 1, title: 'Зарплата', amount: 45000, date: '2026-10-10', createdAt: '2026-10-10T09:00:00Z' },
  { id: 3, cardId: 2, title: 'Кофейня', amount: -230, date: '2026-10-13', createdAt: '2026-10-13T12:15:00Z' },
  { id: 4, cardId: 3, title: 'Steam', amount: -12, date: '2026-10-11', createdAt: '2026-10-11T18:45:00Z' },
  { id: 5, cardId: 1, title: 'Перевод от Руслана', amount: 1500, date: '2026-10-14', createdAt: '2026-10-14T10:20:00Z' },
]

let nextOperationId = operations.reduce((maxId, operation) => Math.max(maxId, operation.id), 0) + 1

const roundMoney = (value) => Math.round(value * 100) / 100

const formatCardNumber = (number) => `**** ${number.slice(-4)}`

app.get('/api/cards', (req, res) => {
  res.json(cards)
})

app.get('/api/operations', (req, res) => {
  res.json(operations)
})

app.post('/api/cards/:id/toggle-block', (req, res) => {
  const id = Number(req.params.id)
  const card = cards.find((c) => c.id === id)

  if (!card) {
    return res.status(404).json({ error: 'Not found' })
  }

  card.isBlocked = !card.isBlocked
  res.json(card)
})

app.post('/api/transfers', (req, res) => {
  const { fromCardId, toCardId, amount } = req.body ?? {}

  if (typeof fromCardId !== 'number' || typeof toCardId !== 'number') {
    return res.status(400).json({ error: 'Некорректные карты для перевода' })
  }

  if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) {
    return res.status(400).json({ error: 'Введите корректную сумму больше нуля' })
  }

  const transferAmount = roundMoney(amount)
  if (transferAmount <= 0) {
    return res.status(400).json({ error: 'Введите корректную сумму больше нуля' })
  }

  const fromCard = cards.find((card) => card.id === fromCardId)
  const toCard = cards.find((card) => card.id === toCardId)

  if (!fromCard || !toCard) {
    return res.status(404).json({ error: 'Карта не найдена' })
  }

  if (fromCard.id === toCard.id) {
    return res.status(400).json({ error: 'Нельзя перевести на ту же карту' })
  }

  if (fromCard.currency !== toCard.currency) {
    return res.status(400).json({ error: 'Перевод возможен только между картами в одной валюте' })
  }

  if (fromCard.isBlocked) {
    return res.status(400).json({ error: 'Карта-источник заблокирована' })
  }

  if (toCard.isBlocked) {
    return res.status(400).json({ error: 'Карта-получатель заблокирована' })
  }

  if (transferAmount > fromCard.balance) {
    return res.status(400).json({ error: 'Недостаточно средств' })
  }

  fromCard.balance = roundMoney(fromCard.balance - transferAmount)
  toCard.balance = roundMoney(toCard.balance + transferAmount)

  const now = new Date()
  const date = now.toISOString().slice(0, 10)
  const createdAt = now.toISOString()
  const outgoing = {
    id: nextOperationId++,
    cardId: fromCard.id,
    title: `Перевод на карту ${formatCardNumber(toCard.number)}`,
    amount: -transferAmount,
    date,
    createdAt,
  }
  const incoming = {
    id: nextOperationId++,
    cardId: toCard.id,
    title: `Перевод с карты ${formatCardNumber(fromCard.number)}`,
    amount: transferAmount,
    date,
    createdAt,
  }

  operations.push(outgoing, incoming)

  res.json({
    fromCard,
    toCard,
    operations: [outgoing, incoming],
  })
})

const port = Number(process.env.PORT) || 3001

app.listen(port, () => {
  console.log(`Server on http://localhost:${port}`)
})