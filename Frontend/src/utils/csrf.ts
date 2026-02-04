/**
 * CSRF Token Management Utility
 * Handles CSRF token from HTTP cookies set by backend
 * Tokens are managed by backend at port 3000
 */

const CSRF_TOKEN_KEY = "csrfToken";

/**
 * Get CSRF token from browser cookies
 * Backend sets this cookie at port 3000
 */
export const getCsrfToken = (): string | null => {
  const name = CSRF_TOKEN_KEY + "=";
  const decodedCookie = decodeURIComponent(document.cookie);
  const cookieArray = decodedCookie.split(";");

  for (let cookie of cookieArray) {
    cookie = cookie.trim();
    if (cookie.indexOf(name) === 0) {
      return cookie.substring(name.length, cookie.length);
    }
  }

  return null;
};

/**
 * Set CSRF token in browser cookies
 * Note: This is mainly for backward compatibility
 * Backend handles cookie setting at port 3000
 */
export const setCsrfToken = (token: string): void => {
  // Cookies are now set by backend, but keep this for fallback
  // Set for 10 minutes (same as backend)
  const date = new Date();
  date.setTime(date.getTime() + 10 * 60 * 1000);
  document.cookie = `${CSRF_TOKEN_KEY}=${token}; expires=${date.toUTCString()}; path=/`;
};

/**
 * Clear CSRF token from browser cookies
 */
export const clearCsrfToken = (): void => {
  // Clear all related cookies
  document.cookie = `${CSRF_TOKEN_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
};

/**
 * Get headers object with CSRF token included
 */
export const getHeadersWithCsrf = (token: string): HeadersInit => {
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
    "X-CSRF-Token": getCsrfToken() || "",
  };
};

/**
 * Check if CSRF token exists in cookies
 */
export const hasCsrfToken = (): boolean => {
  return getCsrfToken() !== null;
};
