import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

type UserType = 'admin' | 'doctor' | 'hospital'

interface AuthState {
  userType: UserType | null
}

const initialState: AuthState = {
  userType: 'admin'
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUserType: (state, action: PayloadAction<UserType>) => {
      state.userType = action.payload
    }
  }
})

export const { setUserType } = authSlice.actions
export default authSlice.reducer
