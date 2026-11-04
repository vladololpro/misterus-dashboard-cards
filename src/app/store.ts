import { configureStore } from '@reduxjs/toolkit'
import { bankApiSlice } from '../shared/api/bankApiSlice'
import filterReducer from '../features/filter/filterSlice'
import cardsReducer from '../features/cards/cardsSlice'

export const store = configureStore({
  reducer: {
    [bankApiSlice.reducerPath]: bankApiSlice.reducer,
    filter: filterReducer,
    cards: cardsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(bankApiSlice.middleware),
})

export type RootState = ReturnType<typeof store.getState>