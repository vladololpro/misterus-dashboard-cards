import { createApi } from '@reduxjs/toolkit/query/react'
import { BaseQueryFn } from '@reduxjs/toolkit/query'
import { apiClient } from './client'
import { Card, Operation, TransferPayload, TransferResult } from '../types'
import { isCardArray, isOperationArray } from './guards'

interface AxiosQueryArgs {
  url: string
  method: string
  data?: unknown
}

interface AxiosErrorData {
  status?: number
  data?: unknown
}

const request = async <T,>({ url, method, data }: AxiosQueryArgs): Promise<T> => {
  const result = await apiClient.request<T>({ url, method, data })
  return result.data
}

const axiosBaseQuery = (): BaseQueryFn<AxiosQueryArgs, unknown, AxiosErrorData> => 
  async (args) => {
    try {
      const data = await request<unknown>(args)
      return { data }
    } catch (axiosError) {
      const err = axiosError as { response?: { status?: number; data?: unknown }; message: string }
      return {
        error: {
          status: err.response?.status,
          data: err.response?.data || err.message,
        },
      }
    }
  }

export const bankApiSlice = createApi({
  reducerPath: 'bankApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Card', 'Operation'],
  endpoints: (builder) => ({
    getCards: builder.query<Card[], void>({
      query: () => ({ url: '/api/cards', method: 'GET' }),
      transformResponse: (response: unknown) => {
        if (!isCardArray(response)) {
          throw new Error('Invalid response format for cards')
        }
        return response
      },
      providesTags: (result) => 
        result 
          ? [...result.map(({ id }) => ({ type: 'Card' as const, id })), { type: 'Card' as const, id: 'LIST' }]
          : [{ type: 'Card' as const, id: 'LIST' }],
    }),

    getOperations: builder.query<Operation[], void>({
      query: () => ({ url: '/api/operations', method: 'GET' }),
      transformResponse: (response: unknown) => {
        if (!isOperationArray(response)) {
          throw new Error('Invalid response format for operations')
        }
        return response
      },
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Operation' as const, id })), { type: 'Operation' as const, id: 'LIST' }]
          : [{ type: 'Operation' as const, id: 'LIST' }],
    }),

    toggleCardBlock: builder.mutation<Card, number>({
      query: (cardId) => ({
        url: `/api/cards/${cardId}/toggle-block`,
        method: 'POST',
      }),
      invalidatesTags: [{ type: 'Card', id: 'LIST' }],
    }),

    createTransfer: builder.mutation<TransferResult, TransferPayload>({
      query: (payload) => ({
        url: '/api/transfers',
        method: 'POST',
        data: payload,
      }),
      invalidatesTags: [
        { type: 'Card', id: 'LIST' },
        { type: 'Operation', id: 'LIST' },
      ],
    }),
  }),
})

export const {
  useGetCardsQuery,
  useGetOperationsQuery,
  useToggleCardBlockMutation,
  useCreateTransferMutation,
} = bankApiSlice