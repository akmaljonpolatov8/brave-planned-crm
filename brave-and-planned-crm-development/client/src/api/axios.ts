import axios from 'axios'

const instance = axios.create({
  baseURL: '/api',
  withCredentials: true,
})

// Add token to requests if available
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('bp_crm_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401 responses
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('bp_crm_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default instance
