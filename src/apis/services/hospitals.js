import { api } from '@/apis/config'

export const hospitalsService = {
  listHospitals: async (page = 1, per_page = 10) => {
    try {
      const response = await api.get('/hospitals', {
        params: {
          page,
          per_page
        }
      })

      return response.data
    } catch (error) {
      throw error
    }
  },
  createHospital: async payload => {
    try {
      const response = await api.post('/hospitals', payload, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      return response.data
    } catch (error) {
      throw error
    }
  },
  getHospital: async id => {
    try {
      const response = await api.get(`/hospitals/${id}`)

      return response.data
    } catch (error) {
      throw error
    }
  },
  updateHospital: async (id, payload) => {
    try {
      const response = await api.post(`/hospitals/${id}`, payload, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      return response.data
    } catch (error) {
      throw error
    }
  },
  deleteHospital: async id => {
    try {
      const response = await api.delete(`/hospitals/${id}`)

      return response.data
    } catch (error) {
      throw error
    }
  },
  activeHospital: async payload => {
    try {
      const response = await api.put(`/hospitals/${payload.id}/${payload.status}`)

      return response.data
    } catch (error) {
      throw error
    }
  }
}
