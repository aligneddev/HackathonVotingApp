const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

export const adminAuthApi = {
  login: async (password: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
      credentials: "include",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  },

  logout: async (): Promise<void> => {
    const res = await fetch(`${API_BASE}/api/admin/logout`, {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  },

  checkStatus: async (): Promise<{ authenticated: boolean }> => {
    const res = await fetch(`${API_BASE}/api/admin/auth-status`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },
};
