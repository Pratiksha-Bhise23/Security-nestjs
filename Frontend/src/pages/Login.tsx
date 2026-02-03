import { useState } from "react";
import { sendOtp } from "../api/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSendOtp = async () => {
    setError("");
    setSuccess(false);

    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email");
      return;
    }

    try {
      setLoading(true);
      const res = await sendOtp(email);

      if (res.success) {
        setSuccess(true);
        localStorage.setItem("email", email);
        
        // Redirect to OTP page after 1.5 seconds
        setTimeout(() => {
          window.location.href = "/otp";
        }, 1500);
      } else {
        setError(res.message || "Failed to send OTP");
      }
    } catch (err: any) {
      console.error("Error sending OTP:", err);
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <div className="p-8 border rounded-lg bg-white shadow-lg w-96">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Login</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            OTP sent! Redirecting...
          </div>
        )}

        <input
          type="email"
          className="border border-gray-300 p-3 w-full mb-4 rounded focus:outline-none focus:border-blue-500"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSendOtp()}
          disabled={loading}
        />

        <button
          className={`${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600"
          } text-white p-3 w-full rounded font-semibold transition`}
          onClick={handleSendOtp}
          disabled={loading}
        >
          {loading ? "Sending..." : "Send OTP"}
        </button>
      </div>
    </div>
  );
}
