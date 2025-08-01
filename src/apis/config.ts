import axios from 'axios'

// Create base axios instance
export const api = axios.create({
  timeout: 25000,
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://medex-backend-westus-b4hbd7eeg4d0bnbr.westus-01.azurewebsites.net/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor
api.interceptors.request.use(
  async config => {
    // Get token from secure storage
    const token = typeof window !== 'undefined' ? localStorage.getItem('userToken') : null

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  error => {
    return Promise.reject(error)
  }
)
