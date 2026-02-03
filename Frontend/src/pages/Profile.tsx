import { useEffect, useState } from "react";

interface User {
  id: string;
  email: string;
}

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("authToken");

    if (!storedUser || !token) {
      window.location.href = "/";
      return;
    }

    try {
      const userData = JSON.parse(storedUser);
      setUser(userData);
    } catch (error) {
      console.error("Error parsing user data:", error);
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

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <div className="p-8 border rounded-lg bg-white shadow-lg text-center w-96">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Welcome!</h1>

        <div className="bg-gray-50 p-4 rounded mb-6">
          <p className="text-gray-600 text-sm mb-2">Logged in as</p>
          <p className="text-2xl font-semibold text-blue-600">{user?.email}</p>
          {user?.id && (
            <p className="text-gray-500 text-sm mt-2">ID: {user.id}</p>
          )}
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleLogout}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white p-3 rounded font-semibold transition"
          >
            Logout
          </button>
          <button
            onClick={() => window.location.href = "/"}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white p-3 rounded font-semibold transition"
          >
            Home
          </button>
        </div>
      </div>
    </div>
  );
}
