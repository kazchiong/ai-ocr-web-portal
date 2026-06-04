'use client';

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [user, setUser] = useState<{
    role_id?: number;
  } | null>(null);
  useEffect(() => {
    fetch("/api/me", { method: "POST" })
      .then(res => res.json())
      .then(data => setUser(data.user));
  }, []);

  const router = useRouter();

  const handleUsers = () => {
    router.push("/admin/users/view");
  };

  const handleInstitutions = () => {
    router.push("/admin/institutions/view");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            ⚡ Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage users, institutions, and other system settings
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Users */}
          <div
            onClick={handleUsers}
            className="cursor-pointer bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all"
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              👤 Manage Users
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              View, edit, or delete users in the system.
            </p>
          </div>

          {/* Institutions */}
          {user?.role_id === 3 && (
            <div
              onClick={handleInstitutions}
              className="cursor-pointer bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all"
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                🏢 Manage Institutions
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                View and edit institution details.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
