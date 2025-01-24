import { api } from '@/apis/config'

export const patientsService = {
  listPatients: async () => {
    try {
      const response = await api.get('/patients')

      return response.data
    } catch (error) {
      throw error
    }
  }
}
