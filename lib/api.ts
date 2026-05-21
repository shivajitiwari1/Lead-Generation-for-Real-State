import type { Lead } from "./types"

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(path, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  })
  if (!res.ok) {
    const errData = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(errData.error ?? errData.detail ?? "Request failed")
  }
  return res.json()
}

export const api = {
  auth: {
    register: (username: string, password: string) =>
      request("/api/auth/register", { method: "POST", body: JSON.stringify({ username, password }) }),
    login: (username: string, password: string) =>
      request("/api/auth/login", { method: "POST", body: JSON.stringify({ username, password }) }),
    logout: () => request("/api/auth/logout", { method: "POST" }),
    me: () => request("/api/auth/me"),
  },
  leads: {
    list: (params?: Record<string, string | number>) => {
      const qs = params ? "?" + new URLSearchParams(params as Record<string, string>).toString() : ""
      return request(`/api/leads${qs}`)
    },
    get: (id: string) => request(`/api/leads/${id}`),
    create: (data: Partial<Lead>) =>
      request("/api/leads", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Lead>) =>
      request(`/api/leads/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) => request(`/api/leads/${id}`, { method: "DELETE" }),
    exportUrl: (format: "json" | "csv") => `/api/leads/export?format=${format}`,
  },
}
