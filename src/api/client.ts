import axios from 'axios'
import { API_BASE_URL } from '@/lib/constants'
import { useAuthStore } from '@/stores/authStore'

// Read the access token from the in-memory store first (set synchronously on
// login/register), falling back to persisted storage. Reading only localStorage
// raced the persist write right after login — getMe() went out tokenless, 401'd,
// and the refresh path hard-redirected to /login.
function getAccessToken(): string | null {
  const fromStore = useAuthStore.getState().accessToken
  if (fromStore) return fromStore
  if (typeof window === 'undefined') return null
  try {
    return JSON.parse(localStorage.getItem('auth-storage') || '{}')?.state?.accessToken ?? null
  } catch {
    return null
  }
}

function getRefreshToken(): string | null {
  const fromStore = useAuthStore.getState().refreshToken
  if (fromStore) return fromStore
  if (typeof window === 'undefined') return null
  try {
    return JSON.parse(localStorage.getItem('auth-storage') || '{}')?.state?.refreshToken ?? null
  } catch {
    return null
  }
}

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
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor: handle 401 + refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // A 401 from the auth endpoints themselves is a credential error (e.g. wrong
    // password) — not an expired session. Let it propagate to the caller so the
    // page can show an error, instead of triggering the refresh-and-redirect path.
    const url: string = originalRequest?.url || ''
    const isAuthEndpoint =
      url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/refresh')

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
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
        const refreshToken = getRefreshToken()
        if (!refreshToken) throw new Error('No refresh token')

        const { data } = await axios.post(`${API_BASE_URL}/api/v1/auth/refresh`, {
          refresh_token: refreshToken,
        })

        const newAccessToken = data.access_token
        const newRefreshToken = data.refresh_token

        // Keep the in-memory store and persisted storage in sync.
        useAuthStore.getState().setTokens(newAccessToken, newRefreshToken)

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
