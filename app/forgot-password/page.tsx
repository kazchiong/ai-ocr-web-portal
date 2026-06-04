"use client";

import { useState } from "react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/auth/request-reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Something went wrong");
        setLoading(false);
        return;
      }

      setMessage(
        data.message ||
          "If this email exists, a password reset link has been sent."
      );
      setSent(true);
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Success Screen
  if (sent) {
    return (
      <div className="flex flex-col items-center mt-24 gap-4 text-center">
        <h1 className="text-2xl font-bold text-green-600">Email Sent</h1>
        <p className="text-gray-700 max-w-md">{message}</p>
        <p className="text-sm text-gray-500">
          Please check your inbox (and spam folder).
        </p>
        <p className="text-sm text-gray-500">
          As we have no way of making the email, all the password requests will be sent to the same email.
        </p>
      </div>
    );
  }

  // ✅ Form Screen
  return (
    <div className="flex flex-col items-center mt-24 gap-6">
      <h1 className="text-2xl font-bold">Forgot Password</h1>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 w-80 bg-white p-6 rounded shadow"
      >
        <input
          type="email"
          placeholder="Enter your email"
          className="
            border p-2 rounded 
            border-2 border-gray-300
            bg-white text-black
            focus:outline-none 
            focus:ring-2 
            focus:ring-blue-500
          "
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>

        {error && <p className="text-red-600 text-sm">{error}</p>}
        {message && !sent && (
          <p className="text-gray-600 text-sm">{message}</p>
        )}
      </form>
    </div>
  );
}
