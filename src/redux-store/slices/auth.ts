import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

type UserType = 'Admin' | 'Doctor' | 'Hospital'

interface AuthState {
  userType: UserType | null
}

const initialState: AuthState = {
  userType: localStorage.getItem('userType') as UserType
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUserType: (state, action: PayloadAction<UserType>) => {
      localStorage.setItem('userType', action.payload)
      state.userType = action.payload
    }
  }
})

export const { setUserType } = authSlice.actions
export default authSlice.reducer
