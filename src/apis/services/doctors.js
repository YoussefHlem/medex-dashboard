import { api } from '@/apis/config'

export const doctorsService = {
  listDoctors: async () => {
    try {
      const response = await api.get('/doctors')

      return response.data
    } catch (error) {
      throw error
    }
  },
  createDoctor: async payload => {
    try {
      const response = await api.post('/doctors', payload, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      return response.data
    } catch (error) {
      throw error
    }
  },
  getDoctor: async id => {
    try {
      const response = await api.get(`/doctors/${id}`)

      return response.data
    } catch (error) {
      throw error
    }
  },
  updateDoctor: async (id, payload) => {
    try {
      const response = await api.post(`/doctors/${id}`, payload, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      return response.data
    } catch (error) {
      throw error
    }
  },
  deleteDoctor: async id => {
    try {
      const response = await api.delete(`/hospitals/${id}`)

      return response.data
    } catch (error) {
      throw error
    }
  },
  activeDoctor: async payload => {
    try {
      const response = await api.put(`/doctors/${payload.id}/${payload.status}`)

      return response.data
    } catch (error) {
      throw error
    }
  }
}
