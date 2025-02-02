// Third-party Imports
import { configureStore } from '@reduxjs/toolkit'

// Slice Imports
import calendarReducer from '@/redux-store/slices/calendar'
import authReducer from '@/redux-store/slices/auth'

export const store = configureStore({
  reducer: {
    calendarReducer,
    authReducer
  },
  middleware: getDefaultMiddleware => getDefaultMiddleware({ serializableCheck: false })
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
