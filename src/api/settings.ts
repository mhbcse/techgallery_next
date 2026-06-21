import apiClient from './client'
import type { Settings, SingleResponse } from './types'

export async function getSettings(): Promise<Settings> {
  const res = await apiClient.get<SingleResponse<Settings>>('/api/v1/settings')
  return res.data.data
}
