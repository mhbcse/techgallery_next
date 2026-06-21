import axios from 'axios'
import { API_BASE_URL } from '@/lib/constants'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

let isRefreshing = false
let failedQueue: { resolve: (token: string) => void; reject: (err: unknown) => void }[] = []

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error)
    else prom.resolve(token!)
  })
  failedQueue = []
}

// Request interceptor: attach access token
apiClient.interceptors.request.use((config) => {
  if (typeof window === 'undefined') return config
  const authData = localStorage.getItem('auth-storage')
  if (authData) {
    try {
      const parsed = JSON.parse(authData)
      const token = parsed?.state?.accessToken
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    } catch {}
  }
  return config
})

// Response interceptor: handle 401 + refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`
              resolve(apiClient(originalRequest))
            },
            reject,
          })
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        if (typeof window === 'undefined') throw new Error('No window')
        const authData = localStorage.getItem('auth-storage')
        if (!authData) throw new Error('No auth data')
        const parsed = JSON.parse(authData)
        const refreshToken = parsed?.state?.refreshToken
        if (!refreshToken) throw new Error('No refresh token')

        const { data } = await axios.post(`${API_BASE_URL}/api/v1/auth/refresh`, {
          refresh_token: refreshToken,
        })

        const newAccessToken = data.access_token
        const newRefreshToken = data.refresh_token

        // Update localStorage
        parsed.state.accessToken = newAccessToken
        parsed.state.refreshToken = newRefreshToken
        localStorage.setItem('auth-storage', JSON.stringify(parsed))

        processQueue(null, newAccessToken)

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        return apiClient(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        // Clear auth state on refresh failure
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth-storage')
          window.location.href = '/login'
        }
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default apiClient
