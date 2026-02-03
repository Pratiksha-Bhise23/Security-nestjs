import { useState } from "react";
import { verifyOtp } from "../api/auth";

export default function Otp() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const email = localStorage.getItem("email");

  if (!email) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="p-8 border rounded-lg bg-white shadow-lg text-center">
          <h1 className="text-2xl font-bold text-red-600">Session Expired</h1>
          <p className="mt-2 text-gray-600">Please start from login again.</p>
          <button
            onClick={() => (window.location.href = "/")}
            className="mt-4 bg-blue-500 text-white p-2 px-6 rounded hover:bg-blue-600"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const handleVerify = async () => {
    setError("");

    if (!otp.trim()) {
      setError("Please enter OTP");
      return;
    }

    if (otp.length !== 6 || isNaN(Number(otp))) {
      setError("OTP must be 6 digits");
      return;
    }

    try {
      setLoading(true);
      const res = await verifyOtp(email, otp);

      if (res.success && res.token) {
        // Store JWT token
        localStorage.setItem("authToken", res.token);
        localStorage.setItem("user", JSON.stringify(res.user));
        
        // Store user role for navigation
        const userRole = res.role || res.user.role;
        localStorage.setItem("userRole", userRole);

        // Redirect based on role
        setTimeout(() => {
          if (userRole === "admin") {
            window.location.href = "/dashboard";
          } else {
            window.location.href = "/profile";
          }
        }, 1000);
      } else {
        setError(res.message || "Verification failed");
      }
    } catch (err: any) {
      console.error("Error verifying OTP:", err);
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <div className="p-8 border rounded-lg bg-white shadow-lg w-96">
        <h1 className="text-3xl font-bold mb-2 text-center text-gray-800">
          Verify OTP
        </h1>
        <p className="text-gray-600 text-center mb-6">
          Enter the OTP sent to {email}
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <input
          type="text"
          maxLength={6}
          className="border border-gray-300 p-3 w-full mb-4 rounded text-center text-2xl tracking-widest focus:outline-none focus:border-green-500"
          placeholder="000000"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
          onKeyPress={(e) => e.key === "Enter" && handleVerify()}
          disabled={loading}
        />

        <button
          className={`${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-500 hover:bg-green-600"
          } text-white p-3 w-full rounded font-semibold transition`}
          onClick={handleVerify}
          disabled={loading}
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>

        <button
          onClick={() => (window.location.href = "/")}
          className="mt-4 w-full text-blue-500 hover:text-blue-700 underline"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}
