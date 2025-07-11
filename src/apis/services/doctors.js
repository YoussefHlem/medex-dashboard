import { api } from '@/apis/config'

export const doctorsService = {
  listDoctors: async (page = 1, per_page = 10) => {
    try {
      const response = await api.get('/doctors', {
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
      const response = await api.delete(`/doctors/${id}`)

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
  },
  listBookings: async id => {
    try {
      const response = await api.get(`/doctors/${id}/bookings`)

      return response.data
    } catch (error) {
      throw error
    }
  },
  listSlots: async id => {
    try {
      const response = await api.get(`/doctors/${id}/schedules`)

      return response.data
    } catch (error) {
      throw error
    }
  },
  updateSlots: async (id, payload) => {
    try {
      const response = await api.post(`/doctors/${id}/schedules/update-slots`, payload)

      return response.data
    } catch (error) {
      throw error
    }
  },
  updateBooking: async (doctorId, bookingId, status) => {
    try {
      const response = await api.post(`doctors/${doctorId}/bookings/${bookingId}/${status}`)

      return response.data
    } catch (error) {
      throw error
    }
  }
}
