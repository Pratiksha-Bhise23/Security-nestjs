import { getCsrfToken, setCsrfToken } from "../utils/csrf";

const BASE_URL = "http://localhost:3000/api";

export const sendOtp = async (email: string) => {
  const res = await fetch(`${BASE_URL}/auth/send-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Unknown error" }));
    throw new Error(error.message || `HTTP ${res.status}`);
  }

  return res.json();
};

export const logout = async () => {
  const res = await fetch(`${BASE_URL}/auth/logout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: 'include', // Include cookies
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Unknown error" }));
    throw new Error(error.message || `HTTP ${res.status}`);
  }

  return res.json();
};

export const verifyOtp = async (email: string, otp: string) => {
  const res = await fetch(`${BASE_URL}/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: 'include', // Include cookies in request
    body: JSON.stringify({ email, otp }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Unknown error" }));
    throw new Error(error.message || `HTTP ${res.status}`);
  }

  const data = await res.json();
  
  // Store CSRF token from auth response
  if (data.csrfToken) {
    setCsrfToken(data.csrfToken);
  }

  return data;
};

export const getProfile = async () => {
  const res = await fetch(`${BASE_URL}/user/profile`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: 'include', // Include cookies (authToken)
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Unknown error" }));
    throw new Error(error.message || `HTTP ${res.status}`);
  }

  return res.json();
};

export const updateProfile = async (updateData: any) => {
  const csrfToken = getCsrfToken();
  
  const res = await fetch(`${BASE_URL}/user/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": csrfToken || "",
    },
    credentials: 'include', // Include cookies (authToken)
    body: JSON.stringify(updateData),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Unknown error" }));
    throw new Error(error.message || `HTTP ${res.status}`);
  }

  const data = await res.json();
  
  // Update CSRF token from response
  if (data.csrfToken) {
    setCsrfToken(data.csrfToken);
  }

  return data;
};

export const updateProfileEmail = async (newEmail: string) => {
  const csrfToken = getCsrfToken();

  const res = await fetch(`${BASE_URL}/user/update-profile`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": csrfToken || "",
    },
    credentials: 'include', // Include cookies (authToken)
    body: JSON.stringify({ email: newEmail }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Unknown error" }));
    throw new Error(error.message || `HTTP ${res.status}`);
  }

  const data = await res.json();

  // Update CSRF token from response
  if (data.csrfToken) {
    setCsrfToken(data.csrfToken);
  }

  return data;
};

export const getDashboardStats = async () => {
  const res = await fetch(`${BASE_URL}/admin/dashboard`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: 'include', // Include cookies (authToken)
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Unknown error" }));
    throw new Error(error.message || `HTTP ${res.status}`);
  }

  return res.json();
};

export const getAllUsers = async (page: number = 1, limit: number = 10) => {
  const res = await fetch(`${BASE_URL}/admin/users?page=${page}&limit=${limit}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: 'include', // Include cookies (authToken)
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Unknown error" }));
    throw new Error(error.message || `HTTP ${res.status}`);
  }

  return res.json();
};

export const updateUserRole = async (userId: number, role: "user" | "admin") => {
  const csrfToken = getCsrfToken();
  
  const res = await fetch(`${BASE_URL}/admin/users/${userId}/role`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": csrfToken || "",
    },
    credentials: 'include', // Include cookies (authToken)
    body: JSON.stringify({ role }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Unknown error" }));
    throw new Error(error.message || `HTTP ${res.status}`);
  }

  const data = await res.json();
  
  // Update CSRF token from response
  if (data.csrfToken) {
    setCsrfToken(data.csrfToken);
  }

  return data;
};

export const deleteUser = async (userId: number) => {
  const csrfToken = getCsrfToken();
  
  const res = await fetch(`${BASE_URL}/admin/users/${userId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": csrfToken || "",
    },
    credentials: 'include', // Include cookies (authToken)
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Unknown error" }));
    throw new Error(error.message || `HTTP ${res.status}`);
  }

  const data = await res.json();
  
  // Update CSRF token from response
  if (data.csrfToken) {
    setCsrfToken(data.csrfToken);
  }

  return data;
};
