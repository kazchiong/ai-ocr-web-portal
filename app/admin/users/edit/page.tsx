'use client';

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

interface UserForm {
  id: number;
  first_name: string;
  last_name?: string;
  email: string;
  role_id?: number;
  role_name?: string;
  institution_id?: number;
  institution_name?: string;
  created_at?: string;
}

interface Role {
  id: number;
  role_name: string;
}

interface Institution {
  id: number;
  name: string;
  active: boolean;
}

// ...rest of imports and interfaces

export default function EditUserPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const idParam = searchParams.get("id");

  const [form, setForm] = useState<UserForm | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setError] = useState("");
  const [user, setUser] = useState<{
    role_id?: number;
  } | null>(null);

  useEffect(() => {
    fetch("/api/me", { method: "POST" })
      .then(res => res.json())
      .then(data => setUser(data.user));
  }, []);
  useEffect(() => {
    if (!idParam) {
      setError("No user ID provided");
      setLoading(false);
      return;
    }
    const id = Number(idParam);

    const fetchData = async () => {
      try {
        const [userRes, rolesRes, instRes] = await Promise.all([
          fetch("/api/admin/users/edit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "get", id }),
          }),
          fetch("/api/admin/get/roles", { method: "POST" }),
          fetch("/api/admin/get/institutions", { method: "POST" }),
        ]);

        const userData = await userRes.json();
        const rolesData = await rolesRes.json();
        const instData = await instRes.json();

        if (userData.error) {
          setError(userData.error);
        } else {
          setForm(userData.user);
        }
        setRoles(rolesData.roles || []);

        setInstitutions(instData.institutions || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load user or reference data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [idParam]);

  const handleSave = async () => {
    if (!form) return;
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const res = await fetch("/api/admin/users/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update", ...form }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage("Saved successfully");
        router.push("/admin/users/view")
      } else {
        setError(data.error || "Failed to save");
      }
    } catch (err) {
      console.error(err);
      setError("Server error");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push("/admin/users/view");
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (errorMessage) return <div className="p-6 text-red-500">{errorMessage}</div>


  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Edit User</h1>

      {message && (
        <div className="mb-4 p-2 rounded bg-green-200 text-green-800">{message}</div>
      )}

      {!form && !errorMessage && <div>No user data available.</div>}

      {form && (
        <div className="space-y-4">
          {/* ID */}
          <div>
            <label className="block mb-1">ID</label>
            <input
              value={form.id}
              disabled
              className="w-full px-3 py-2 border rounded bg-gray-800 text-white cursor-not-allowed"
            />
          </div>

          {/* Created At */}
          <div>
            <label className="block mb-1">Created At</label>
            <input
              value={form.created_at || ""}
              disabled
              className="w-full px-3 py-2 border rounded bg-gray-800 text-white cursor-not-allowed"
            />
          </div>

          {/* First Name */}
          <div>
            <label className="block mb-1">First Name</label>
            <input
              name="first_name"
              value={form.first_name}
              onChange={(e) => {
                const { name, value } = e.target;
                setForm({ ...form, [name]: value });
              }}
              className="w-full px-3 py-2 border rounded bg-black text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="block mb-1">Last Name</label>
            <input
              name="last_name"
              value={form.last_name || ""}
              onChange={(e) => {
                const { name, value } = e.target;
                setForm({ ...form, [name]: value });
              }}
              className="w-full px-3 py-2 border rounded bg-black text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block mb-1">Email</label>
            <input
              name="email"
              type="email"
              disabled={user?.role_id !== 3}
              value={form.email}
              onChange={(e) => {
                const { name, value } = e.target;
                setForm({ ...form, [name]: value });
              }}
              className="w-full px-3 py-2 border rounded bg-black text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block mb-1">Role</label>
            <select
              name="role_id"
              value={form.role_id || 0}
              onChange={(e) => {
                const { name, value } = e.target;
                setForm({ ...form, [name]: Number(value) });
              }}
              className="w-full px-3 py-2 border rounded bg-black text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {roles
                .filter(r => !(user?.role_id !== 3 && r.id === 3))
                .map(r => (
                  <option key={r.id} value={r.id}>
                    {r.role_name}
                  </option>
                ))}

            </select>
          </div>

          {/* Institution */}
          <div>
            <label className="block mb-1">Institution</label>
            <select
              name="institution_id"
              disabled={user?.role_id !== 3}
              value={form.institution_id || 0}
              onChange={(e) => {
                const { name, value } = e.target;
                setForm({ ...form, [name]: Number(value) });
              }}
              className="w-full px-3 py-2 border rounded bg-black text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {institutions.map((i) => (
                <option key={i.id} value={i.id} disabled={!i.active}>
                  {i.name} {i.active ? "" : "(inactive)"}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-4 mt-6">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
