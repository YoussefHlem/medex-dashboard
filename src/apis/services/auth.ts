import { api } from '@/apis/config'

export const authService = {
  login: async (credentials: { email: string; password: string }): Promise<any> => {
    try {
      const response = await api.post('/auth/login', credentials)

      if (response.data.data._token) {
        localStorage.setItem('userToken', response.data.data._token)
      }

      return response
    } catch (error) {
      throw error
    }
  }
}
