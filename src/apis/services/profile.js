import { api } from '@/apis/config'

export const getProfile = async () => {
  try {
    const response = await api.get(`/patient/profile`)

    return response.data
  } catch (error) {
    throw error
  }
}
