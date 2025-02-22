import { api } from '@/apis/config'

export const getProfile = async () => {
  try {
    const response = await api.get(`/patient/profile`)

    return response.data
  } catch (error) {
    throw error
  }
}

export const updateProfile = async payload => {
  try {
    const response = await api.post(`/patient/profile`, payload, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    return response.data
  } catch (error) {
    throw error
  }
}
