import axios from 'axios'

// Create base axios instance
export const api = axios.create({
  timeout: 25000,
  baseURL: 'https://medex-backend-westus-b4hbd7eeg4d0bnbr.westus-01.azurewebsites.net/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor
api.interceptors.request.use(
  async config => {
    // Get token from secure storage
    const token = localStorage.getItem('userToken')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  error => {
    return Promise.reject(error)
  }
)
