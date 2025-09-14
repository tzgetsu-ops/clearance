"use client"

import { useState, useEffect, useCallback } from "react"
import { apiClient } from "../lib/api"
import type { ActivationRequest, TagScan, DeviceRead } from "../types/api"

export function useScanner() {
  const [isActive, setIsActive] = useState(false)
  const [activeDeviceId, setActiveDeviceId] = useState<number | null>(null)
  const [scannedTag, setScannedTag] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [devices, setDevices] = useState<DeviceRead[]>([])

  // Fetch available devices
  const fetchDevices = useCallback(async () => {
    try {
      const deviceList = await apiClient.get<DeviceRead[]>("/admin/devices/")
      setDevices(deviceList)
    } catch (err) {
      console.error("Failed to fetch devices:", err)
    }
  }, [])

  // Activate scanner for a specific device
  const activateScanner = async (deviceId: number) => {
    setLoading(true)
    setError(null)
    try {
      const activationData: ActivationRequest = { device_id: deviceId }
      await apiClient.post("/admin/scanners/activate", activationData)
      setIsActive(true)
      setActiveDeviceId(deviceId)
      setScannedTag(null)
      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to activate scanner"
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Deactivate scanner
  const deactivateScanner = () => {
    setIsActive(false)
    setActiveDeviceId(null)
    setScannedTag(null)
    setError(null)
  }

  // Poll for scanned tags
  const pollForScans = useCallback(async () => {
    if (!isActive) return

    try {
      const result = await apiClient.get<TagScan>("/admin/scanners/retrieve")
      if (result.tag_id && result.tag_id !== scannedTag) {
        setScannedTag(result.tag_id)
      }
    } catch (err) {
      // Silently handle polling errors to avoid spam
      console.debug("Polling error:", err)
    }
  }, [isActive, scannedTag])

  // Set up polling interval
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null

    if (isActive) {
      intervalId = setInterval(pollForScans, 2000) // Poll every 2 seconds
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [isActive, pollForScans])

  // Fetch devices on mount
  useEffect(() => {
    fetchDevices()
  }, [fetchDevices])

  // Clear scanned tag
  const clearScannedTag = () => {
    setScannedTag(null)
  }

  return {
    isActive,
    activeDeviceId,
    scannedTag,
    loading,
    error,
    devices,
    activateScanner,
    deactivateScanner,
    clearScannedTag,
    fetchDevices,
  }
}
