'use client';

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

interface InstitutionForm {
  id: number;
  name: string;
}

export default function EditInstitutionPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const idParam = searchParams.get("id");

  const [form, setForm] = useState<InstitutionForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Load user and reference data
  useEffect(() => {
    if (!idParam) {
      setMessage("No ID provided");
      setLoading(false);
      return;
    }
    const id = Number(idParam);

    const fetchData = async () => {
      try {
        const [res] = await Promise.all([
          fetch("/api/admin/institutions/edit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "get", id }),
          }),
        ]);

        const instData = await res.json();

        setForm(instData.institution);
      } catch (err) {
        console.error(err);
        setMessage("Failed to load user or reference data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [idParam]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!form) return;
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };
  
  const handleSave = async () => {
    if (!form) return;
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/institutions/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update", ...form }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage("Saved successfully");
        router.push("/admin/institutions/view");
      } else {
        setMessage(data.error || "Failed to save");
      }
    } catch (err) {
      console.error(err);
      setMessage("Server error");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push("/admin/institutions/view");
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!form) return <div className="p-6 text-red-500">{message}</div>;

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Edit Instituition</h1>
      {message && <div className="mb-4 text-red-500">{message}</div>}

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

        {/* Name */}
        <div>
          <label className="block mb-1">Institution Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded bg-black text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
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
  );
}
