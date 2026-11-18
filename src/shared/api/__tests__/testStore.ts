import { configureStore } from '@reduxjs/toolkit'
import { bankApiSlice } from '../bankApiSlice'

export const createTestStore = () =>
  configureStore({
    reducer: {
      [bankApiSlice.reducerPath]: bankApiSlice.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(bankApiSlice.middleware),
  })
