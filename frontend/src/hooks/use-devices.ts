"use client"

import { useState } from "react"
import { apiClient } from "../lib/api"
import type { DeviceRead, DeviceCreate } from "../types/api"

export function useDevices() {
  const [devices, setDevices] = useState<DeviceRead[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDevices = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiClient.get<DeviceRead[]>("/admin/devices/")
      setDevices(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch devices")
    } finally {
      setLoading(false)
    }
  }

  const createDevice = async (deviceData: DeviceCreate) => {
    try {
      const newDevice = await apiClient.post<DeviceRead>("/admin/devices/", deviceData)
      setDevices((prev) => [newDevice, ...prev])
      return { success: true, data: newDevice }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Failed to create device" }
    }
  }

  const deleteDevice = async (deviceId: number) => {
    try {
      await apiClient.delete(`/admin/devices/${deviceId}`)
      setDevices((prev) => prev.filter((d) => d.id !== deviceId))
      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Failed to delete device" }
    }
  }

  return {
    devices,
    loading,
    error,
    fetchDevices,
    createDevice,
    deleteDevice,
  }
}
