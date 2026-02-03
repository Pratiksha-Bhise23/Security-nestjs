import { useEffect, useState } from "react";

interface User {
  id: string;
  email: string;
  role?: string;
}

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("authToken");
    const userRole = localStorage.getItem("userRole");

    if (!storedUser || !token) {
      window.location.href = "/";
      return;
    }

    if (userRole === "admin") {
      window.location.href = "/dashboard";
      return;
    }

    try {
      const userData = JSON.parse(storedUser);
      setUser(userData);
    } catch (error) {
      console.error("Error parsing user data:", error);
      setError("Failed to load user data");
      localStorage.clear();
      window.location.href = "/";
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  /* ================= Loading ================= */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-600 font-medium">Loading...</span>
        </div>
      </div>
    );
  }

  /* ================= Error ================= */
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-sm w-full">
          <h2 className="text-xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-semibold"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  /* ================= Profile ================= */
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        
        {/* Logout Button (Top Right) */}
        <button
          onClick={handleLogout}
          className="absolute top-4 right-4 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 px-4 py-1.5 rounded-full transition"
        >
          Logout
        </button>

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-center text-white">
          <div className="mx-auto h-20 w-20 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold mb-3">
            {user?.email?.charAt(0).toUpperCase()}
          </div>
          <h1 className="text-2xl font-bold">User Profile</h1>
          <p className="text-blue-100 text-sm mt-1">Welcome back 👋</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm text-gray-500 mb-1">Email</p>
            <p className="text-lg font-semibold text-gray-800 break-all">
              {user?.email}
            </p>
          </div>

          {user?.id && (
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-500 mb-1">User ID</p>
              <p className="text-sm font-mono text-gray-700">
                {user.id}
              </p>
            </div>
          )}

          {user?.role && (
            <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-500">Role</p>
              <span className="px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-700 capitalize">
                {user.role}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
