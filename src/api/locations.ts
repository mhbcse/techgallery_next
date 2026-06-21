import apiClient from './client'
import type { Location, SingleResponse } from './types'

export async function listDistricts(): Promise<Location[]> {
  const res = await apiClient.get<SingleResponse<Location[]>>('/api/v1/locations/districts')
  return res.data.data
}

export async function listAreas(districtId: number | string): Promise<Location[]> {
  const res = await apiClient.get<SingleResponse<Location[]>>(
    `/api/v1/locations/districts/${districtId}/areas`
  )
  return res.data.data
}
