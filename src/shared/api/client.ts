import axios from 'axios'
import { API_URL } from '@shared/config/api'

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    Accept: 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const method = config.method?.toUpperCase() ?? 'GET'
  const url = `${config.baseURL ?? ''}${config.url ?? ''}`
  console.log(`[API Request] ${method} ${url}`)
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.log(
        `[API Error] ${error.response.status} ${error.config.method?.toUpperCase()} ${error.config.url}`
      )
    } else {
      console.log(`[API Error] ${error.message}`)
    }
    return Promise.reject(error)
  }
)