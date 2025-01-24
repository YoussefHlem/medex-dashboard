import { api } from '@/apis/config'

export const isntallmentsService = {
  listInstallments: async () => {
    try {
      const response = await api.get('/installments')

      return response.data
    } catch (error) {
      throw error
    }
  },
  updateInstallmentStatus: async (id, type) => {
    try {
      const response = await api.put(`/installments/${id}/${type}`)

      return response.data
    } catch (error) {
      throw error
    }
  }
}
