import { AxiosError, AxiosHeaders, type AxiosResponse } from 'axios'
import type { Card, Operation, TransferPayload, TransferResult } from '../../types'
import { bankApiSlice } from '../bankApiSlice'
import { apiClient } from '../client'
import { createTestStore } from './testStore'

jest.mock('../client', () => ({
  apiClient: {
    request: jest.fn(),
  },
}))

const requestMock = jest.mocked(apiClient.request)

const ok = <T,>(data: T): AxiosResponse<T> => ({
  data,
  status: 200,
  statusText: 'OK',
  headers: new AxiosHeaders(),
  config: { headers: new AxiosHeaders() },
})

const failed = (status: number, data: unknown): AxiosError => {
  const error = new AxiosError('Request failed')
  error.response = {
    status,
    data,
    statusText: 'Failed',
    headers: new AxiosHeaders(),
    config: { headers: new AxiosHeaders() },
  }
  return error
}

const card: Card = {
  id: 1,
  number: '2200000000000001',
  balance: 1000,
  currency: '₽',
  isBlocked: false,
  expiry: '12/29',
  type: 'Mir',
}

const otherCard: Card = {
  id: 2,
  number: '4400000000000002',
  balance: 100,
  currency: '₽',
  isBlocked: false,
  expiry: '06/28',
  type: 'Visa',
}

const operation: Operation = {
  id: 10,
  cardId: 1,
  title: 'Покупка в магазине',
  amount: -100,
  date: '2026-10-01',
}

const transferPayload: TransferPayload = {
  fromCardId: 1,
  toCardId: 2,
  amount: 500,
}

const transferResult: TransferResult = {
  fromCard: { ...card, balance: 500 },
  toCard: { ...otherCard, balance: 600 },
  operations: [
    { id: 11, cardId: 1, title: 'Перевод на карту', amount: -500, date: '2026-10-02' },
    { id: 12, cardId: 2, title: 'Перевод с карты', amount: 500, date: '2026-10-02' },
  ],
}

beforeEach(() => {
  requestMock.mockReset()
})

describe('getCards', () => {
  test('loads cards from the server', async () => {
    requestMock.mockResolvedValue(ok([card, otherCard]))

    const store = createTestStore()
    const result = await store.dispatch(bankApiSlice.endpoints.getCards.initiate(undefined)).unwrap()

    expect(result).toEqual([card, otherCard])
    expect(requestMock).toHaveBeenCalledWith({ url: '/api/cards', method: 'GET', data: undefined })
  })

  test('returns an error from the server', async () => {
    requestMock.mockRejectedValue(failed(500, { error: 'Server error' }))

    const store = createTestStore()

    await expect(
      store.dispatch(bankApiSlice.endpoints.getCards.initiate(undefined)).unwrap()
    ).rejects.toEqual({ status: 500, data: { error: 'Server error' } })
  })

  test('rejects an invalid response format', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined)
    requestMock.mockResolvedValue(ok({ cards: [card] }))

    const store = createTestStore()

    await expect(
      store.dispatch(bankApiSlice.endpoints.getCards.initiate(undefined)).unwrap()
    ).rejects.toMatchObject({ message: 'Invalid response format for cards' })
    expect(consoleErrorSpy).toHaveBeenCalled()
  })
})

describe('getOperations', () => {
  test('loads operations from the server', async () => {
    requestMock.mockResolvedValue(ok([operation]))

    const store = createTestStore()
    const result = await store
      .dispatch(bankApiSlice.endpoints.getOperations.initiate(undefined))
      .unwrap()

    expect(result).toEqual([operation])
    expect(requestMock).toHaveBeenCalledWith({ url: '/api/operations', method: 'GET', data: undefined })
  })

  test('returns an error from the server', async () => {
    requestMock.mockRejectedValue(failed(403, 'Forbidden'))

    const store = createTestStore()

    await expect(
      store.dispatch(bankApiSlice.endpoints.getOperations.initiate(undefined)).unwrap()
    ).rejects.toEqual({ status: 403, data: 'Forbidden' })
  })
})

describe('toggleCardBlock', () => {
  test('saves the blocked card', async () => {
    const blockedCard = { ...card, isBlocked: true }
    requestMock.mockResolvedValue(ok(blockedCard))

    const store = createTestStore()
    const result = await store
      .dispatch(bankApiSlice.endpoints.toggleCardBlock.initiate(card.id))
      .unwrap()

    expect(result).toEqual(blockedCard)
    expect(requestMock).toHaveBeenCalledWith({
      url: `/api/cards/${card.id}/toggle-block`,
      method: 'POST',
      data: undefined,
    })
  })

  test('returns an error when the card is not found', async () => {
    requestMock.mockRejectedValue(failed(404, 'Card not found'))

    const store = createTestStore()

    await expect(
      store.dispatch(bankApiSlice.endpoints.toggleCardBlock.initiate(card.id)).unwrap()
    ).rejects.toEqual({ status: 404, data: 'Card not found' })
  })
})

describe('createTransfer', () => {
  test('saves the transfer result', async () => {
    requestMock.mockResolvedValue(ok(transferResult))

    const store = createTestStore()
    const result = await store
      .dispatch(bankApiSlice.endpoints.createTransfer.initiate(transferPayload))
      .unwrap()

    expect(result).toEqual(transferResult)
    expect(requestMock).toHaveBeenCalledWith({
      url: '/api/transfers',
      method: 'POST',
      data: transferPayload,
    })
  })

  test('returns a validation error from the server', async () => {
    requestMock.mockRejectedValue(failed(400, { error: 'Недостаточно средств' }))

    const store = createTestStore()

    await expect(
      store.dispatch(bankApiSlice.endpoints.createTransfer.initiate(transferPayload)).unwrap()
    ).rejects.toEqual({ status: 400, data: { error: 'Недостаточно средств' } })
  })

  test('normalizes a non-Axios error', async () => {
    requestMock.mockRejectedValue(new Error('Network down'))

    const store = createTestStore()

    await expect(
      store.dispatch(bankApiSlice.endpoints.createTransfer.initiate(transferPayload)).unwrap()
    ).rejects.toEqual({ data: 'Network down' })
  })
})
