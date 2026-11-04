import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface CardsState {
  activeCardId: number | null
}

const getInitialCardId = (): number | null => {
  try {
    const saved = localStorage.getItem('app_active_card')
    if (!saved) return null

    const id = Number(saved)
    return Number.isInteger(id) ? id : null
  } catch {
    return null
  }
}

const initialState: CardsState = {
  activeCardId: getInitialCardId(),
}

const cardsSlice = createSlice({
  name: 'cards',
  initialState,
  reducers: {
    setActiveCardId: (state, action: PayloadAction<number>) => {
      state.activeCardId = action.payload
      try {
        localStorage.setItem('app_active_card', String(action.payload))
      } catch (e) {
        console.error(e)
      }
    },
  },
})

export const { setActiveCardId } = cardsSlice.actions
export default cardsSlice.reducer