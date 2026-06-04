'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AddUserPage() {
  const router = useRouter();

  const [first_name, setFirstName] = useState("");
  const [last_name, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setError] = useState("");

  // ✅ Password rules
  const passwordRegex =
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[#?!@$%^&*-]).{8,}$/;

  const isPasswordValid = passwordRegex.test(password);
  const passwordsMatch = password === confirmPassword;

  useEffect(() => {
    fetch("/api/me", { method: "POST" })
      .then(res => res.json())
      .catch(() => {});
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!first_name || !last_name || !email || !password || !confirmPassword) {
      setMessage("⚠️ Please fill in all fields.");
      return;
    }

    if (!isPasswordValid) {
      setMessage("❌ Password does not meet requirements.");
      return;
    }

    if (!passwordsMatch) {
      setMessage("❌ Passwords do not match.");
      return;
    }

    try {
      setSaving(true);

      const res = await fetch("/api/admin/users/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // ⚠️ send PLAIN password — hash on backend
        body: JSON.stringify({
          first_name,
          last_name,
          email,
          password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push("/admin/users/view");
      } else {
        setError(data.message || "Failed to create user");
      }
    } catch (err) {
      console.error(err);
      setError("Server error");
    } finally {
      setSaving(false);
    }
  };

  if (errorMessage) {
    return <div className="p-6 text-red-500">{errorMessage}</div>;
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Add User</h1>

      {message && (
        <div className="mb-4 p-2 rounded bg-red-200 text-red-800">
          {message}
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSave}>
        {/* First Name */}
        <div>
          <label className="block mb-1">First Name</label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded bg-black text-white"
            value={first_name}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>

        {/* Last Name */}
        <div>
          <label className="block mb-1">Last Name</label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded bg-black text-white"
            value={last_name}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>

        {/* Email */}
        <div>
          <label className="block mb-1">Email</label>
          <input
            type="email"
            className="w-full px-3 py-2 border rounded bg-black text-white"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {/* Password */}
        <div>
          <label className="block mb-1">Password</label>
          <input
            type="password"
            className={`w-full px-3 py-2 border rounded bg-black text-white ${
              password && !isPasswordValid
                ? "border-red-500"
                : "border-gray-300"
            }`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {password && !isPasswordValid && (
            <p className="text-sm text-red-500 mt-1">
              Password must have a minimum 8 characters, including uppercase, lowercase, number, and special character.
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block mb-1">Confirm Password</label>
          <input
            type="password"
            className={`w-full px-3 py-2 border rounded bg-black text-white ${
              confirmPassword && !passwordsMatch
                ? "border-red-500"
                : "border-gray-300"
            }`}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          {confirmPassword && !passwordsMatch && (
            <p className="text-sm text-red-500 mt-1">
              Passwords do not match
            </p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-4 mt-6">
          <button
            type="submit"
            disabled={saving || !isPasswordValid || !passwordsMatch}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save"}
          </button>

          <Link href="/admin/users/view">
            <button
              type="button"
              className="px-4 py-2 bg-gray-500 text-white rounded"
            >
              Cancel
            </button>
          </Link>
        </div>
      </form>
    </div>
  );
}
