import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

type UserType = 'Admin' | 'Doctor' | 'Hospital'

interface AuthState {
  userType: UserType | null
}

const initialState: AuthState = {
  userType: typeof window !== 'undefined' ? (localStorage.getItem('userType') as UserType) : null
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUserType: (state, action: PayloadAction<UserType>) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('userType', action.payload)
      }

      state.userType = action.payload
    }
  }
})

export const { setUserType } = authSlice.actions
export default authSlice.reducer
