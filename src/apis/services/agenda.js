import { api } from '@/apis/config'

export const agendaService = {
  listAgendas: async id => {
    try {
      const response = await api.get(`/doctors/${id}/agendas`)

      return response.data
    } catch (error) {
      throw error
    }
  },
  createAgenda: async (id, payload) => {
    try {
      const response = await api.post(`/doctors/${id}/agendas`, payload, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      return response.data
    } catch (error) {
      throw error
    }
  },
  deleteAgenda: async id => {
    try {
      const response = await api.delete(`/agenda/${id}`)

      return response.data
    } catch (error) {
      throw error
    }
  }
}
