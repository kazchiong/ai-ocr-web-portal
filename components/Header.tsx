'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type User = {
  id: number;
  email: string;
  first_name: string;
  role_id?: number; // 3 = System Admin, 2 = Administrator, 1 = regular user
};

export default function Header() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetch("/api/me", { method: "POST" })
      .then(res => res.json())
      .then(data => setUser(data.user || null))
      .catch(() => setUser(null));
  }, []);

  function handleLogout() {
    const confirmed = window.confirm("Are you sure you want to log out?");
    if (!confirmed) return;

    fetch("/api/logout", { method: "POST" }).then(() => {
      setUser(null);
      window.location.href = "/";
    });
  }

  // Only show Admin for System Admin (3) or Administrator (2)
  const isAdmin = user && (user.role_id === 3 || user.role_id === 2);

  return (
    <header className="bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link
            href={user ? "/profile" : "/"}
            className="flex items-center space-x-2 group"
          >
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent group-hover:from-blue-700 group-hover:to-purple-700 transition-all">
              MediVision AI
            </span>
          </Link>

          {/* Center: Navigation */}
          {user && (
            <nav className="flex items-center space-x-4">
              <Link
                href="/scan"
                className={`px-4 py-2 rounded-lg font-medium ${
                  pathname === "/scan"
                    ? "bg-blue-500 text-white"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
              >
                Scan
              </Link>

              <Link
                href="/history"
                className={`px-4 py-2 rounded-lg font-medium ${
                  pathname === "/history"
                    ? "bg-blue-500 text-white"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
              >
              History
              </Link>

              {isAdmin && (
                <Link
                  href="/admin"
                  className={`px-4 py-2 rounded-lg font-medium ${
                    pathname === "/admin"
                      ? "bg-blue-500 text-white"
                      : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  }`}
                >
                  Admin
                </Link>
              )}
            </nav>
          )}

          {/* Right: Logout */}
          <nav className="flex items-center space-x-2">
            {user ? (
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg font-medium transition-all duration-200 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                Logout
              </button>
            ) : (
              <Link
                href="/login"
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  pathname === "/login"
                    ? "bg-gray-100 text-gray-900 border border-gray-300"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                Login
              </Link>
            )}
          </nav>

        </div>
      </div>
    </header>
  );
}