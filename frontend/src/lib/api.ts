import type { Token, UserRead, LoginRequest } from "../types/api"

const API_BASE = "https://clearance-asce.onrender.com"

class ApiClient {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem("access_token")
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (response.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem("access_token")
      localStorage.removeItem("user")
      window.location.href = "/login"
      throw new Error("Unauthorized")
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "An error occurred" }))
      throw new Error(error.detail || error.message || "An error occurred")
    }

    if (response.status === 204) {
      return {} as T
    }

    return response.json()
  }

  async login(credentials: LoginRequest): Promise<Token> {
    const formData = new URLSearchParams()
    formData.append("username", credentials.username)
    formData.append("password", credentials.password)

    const response = await fetch(`${API_BASE}/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData,
    })

    return this.handleResponse<Token>(response)
  }

  async getCurrentUser(): Promise<UserRead> {
    const response = await fetch(`${API_BASE}/users/me`, {
      headers: this.getAuthHeaders(),
    })

    return this.handleResponse<UserRead>(response)
  }

  async get<T>(endpoint: string, params?: Record<string, string | number>): Promise<T> {
    const url = new URL(`${API_BASE}${endpoint}`)
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value.toString())
      })
    }

    const response = await fetch(url.toString(), {
      headers: this.getAuthHeaders(),
    })

    return this.handleResponse<T>(response)
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...this.getAuthHeaders(),
      },
      body: data ? JSON.stringify(data) : undefined,
    })

    return this.handleResponse<T>(response)
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify(data),
    })

    return this.handleResponse<T>(response)
  }

  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    })

    return this.handleResponse<T>(response)
  }
}

export const apiClient = new ApiClient()
