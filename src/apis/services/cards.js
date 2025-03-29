import { api } from '@/apis/config'

export const medexCardsService = {
  listMedexCards: async () => {
    try {
      const response = await api.get('/discount-cards')

      return response.data
    } catch (error) {
      throw error
    }
  }
}
