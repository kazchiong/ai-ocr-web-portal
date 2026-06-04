'use client';

import { useEffect, useState } from "react";
import Link from "next/link";

type User = {
  first_name: string;
  last_name?: string;
  email: string;
  role_id?: number;
};

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/me", { method: "POST" })
      .then(res => res.json())
      .then(data => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-6 text-gray-500">Loading profile...</div>;
  }

  if (!user) {
    return <div className="p-6 text-red-500">Failed to load profile</div>;
  }

  const fullName = `${user.first_name} ${user.last_name || ""}`;
  const isAdmin = user.role_id === 2 || user.role_id === 3;

  return (
    <div className="max-w-5xl mx-auto p-6">

      {/* Greeting */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Hello, {fullName} 👋
        </h1>
        <p className="text-gray-400">
          Welcome back to MediVision AI
        </p>
      </div>

      {/* Role badge */}
      <div className="mb-8">
        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium
          ${isAdmin ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}
        `}>
          <span>
            {user.role_id === 3
              ? "System Admin"
              : user.role_id === 2
                ? "Administrator"
                : "User"}
          </span>

        </span>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

        <ActionCard
          title="Scan"
          description="Upload and analyze medical images"
          href="/scan"
          color="from-blue-500 to-blue-600"
        />

        <ActionCard
          title="History"
          description="View previous scan results"
          href="/history"
          color="from-green-500 to-green-600"
        />

        {isAdmin && (
          <ActionCard
            title="Admin"
            description="Manage users and system settings"
            href="/admin"
            color="from-purple-500 to-purple-600"
          />
        )}

      </div>

      {/* Account Info */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold mb-4">Account Information</h2>
        <div className="space-y-2 text-gray-600 dark:text-gray-300">
          <p><strong>Name:</strong> {fullName}</p>
          <p><strong>Email:</strong> {user.email}</p>
        </div>
      </div>

    </div>
  );
}

function ActionCard({
  title,
  description,
  href,
  color,
}: {
  title: string;
  description: string;
  href: string;
  color: string;
}) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-lg transition"
    >
      <div
        className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition bg-gradient-to-r ${color}`}
      />
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-500">{description}</p>
      <span className="inline-block mt-4 text-blue-600 font-medium group-hover:underline">
        Open →
      </span>
    </Link>
  );
}
