import axios from 'axios'

// Create base axios instance
export const api = axios.create({
  baseURL: 'https://medex.uni-act.org/medex-api/',
  timeout: 25000,
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
