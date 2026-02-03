import { useEffect, useState } from "react";
import { getDashboardStats } from "../api/auth";

interface DashboardStats {
  totalUsers: number;
  verifiedUsers: number;
  adminUsers: number;
  recentUsers: Array<{
    id: number;
    email: string;
    role: string;
    is_verified: boolean;
    created_at: string;
  }>;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const userRole = localStorage.getItem("userRole");

    if (!token || userRole !== "admin") {
      window.location.href = "/";
      return;
    }

    fetchDashboardStats(token);
  }, []);

  const fetchDashboardStats = async (token: string) => {
    try {
      const data = await getDashboardStats(token);
      setStats(data.stats);
      setError("");
    } catch (err) {
      console.error("Error fetching dashboard:", err);
      setError("Failed to load dashboard statistics");
    } finally {
      setLoading(false);
    }
  };

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

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="p-8 bg-red-50 border border-red-200 rounded-lg text-red-600">
          <h2 className="text-lg font-semibold mb-2">Error</h2>
          <p>{error}</p>
          <button
            onClick={handleLogout}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Users Card */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-gray-600 text-sm font-semibold mb-2">
              Total Users
            </h3>
            <p className="text-3xl font-bold text-blue-600">
              {stats?.totalUsers || 0}
            </p>
            <p className="text-gray-500 text-xs mt-2">All registered users</p>
          </div>

          {/* Verified Users Card */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-gray-600 text-sm font-semibold mb-2">
              Verified Users
            </h3>
            <p className="text-3xl font-bold text-green-600">
              {stats?.verifiedUsers || 0}
            </p>
            <p className="text-gray-500 text-xs mt-2">Users with verified OTP</p>
          </div>

          {/* Admin Users Card */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-gray-600 text-sm font-semibold mb-2">
              Admin Users
            </h3>
            <p className="text-3xl font-bold text-purple-600">
              {stats?.adminUsers || 0}
            </p>
            <p className="text-gray-500 text-xs mt-2">Total administrators</p>
          </div>
        </div>

        {/* Recent Users Table */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Users</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    ID
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Created At
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats?.recentUsers && stats.recentUsers.length > 0 ? (
                  stats.recentUsers.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-700">{user.id}</td>
                      <td className="px-4 py-3 text-gray-700">{user.email}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            user.role === "admin"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            user.is_verified
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {user.is_verified ? "Verified" : "Pending"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-3 text-center text-gray-500"
                    >
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
