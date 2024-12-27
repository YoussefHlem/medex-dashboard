import { api } from '@/apis/config'

export const hospitalsService = {
  listHospitals: async () => {
    try {
      const response = await api.get('/hospitals')

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
