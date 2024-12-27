import { api } from '@/apis/config'

export const specialitiesService = {
  listSpecialities: async () => {
    try {
      const response = await api.get('/specialities')

      return response.data
    } catch (error) {
      throw error
    }
  },
  createSpeciality: async payload => {
    try {
      const response = await api.post('/specialities', payload, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      return response.data
    } catch (error) {
      throw error
    }
  },
  getSpeciality: async id => {
    try {
      const response = await api.get(`/specialities/${id}`)

      return response.data
    } catch (error) {
      throw error
    }
  },
  updateSpeciality: async (id, payload) => {
    try {
      const response = await api.post(`/specialities/${id}`, payload, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      return response.data
    } catch (error) {
      throw error
    }
  },
  deleteSpeciality: async id => {
    try {
      const response = await api.delete(`/specialities/${id}`)

      return response.data
    } catch (error) {
      throw error
    }
  }
}
