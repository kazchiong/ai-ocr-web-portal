'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface User {
    id: number;
    email: string;
    first_name: string;
    last_name?: string;
    role?: string;
    institution?: string;
    created_at?: Date;
}

export default function AdminDashboard() {
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [currentUser, setCurrentUser] = useState<{ id: number, role_id: number, institution_id?: number } | null>(null);

    useEffect(() => {
        fetch("/api/me", { method: "POST" })
            .then(res => res.json())
            .then(data => setCurrentUser(data.user));
    }, []);

    useEffect(() => {
        fetch("/api/admin/users/get", { method: "POST" })
            .then(res => res.json())
            .then(data => setUsers(data.users || []))
            .catch(err => console.error(err));
    }, []);

    const handleEdit = (user: User) => {
        router.push(`/admin/users/edit?id=${user.id}`);
    };

    const handleDelete = (user: User) => {
        if (!confirm(`ARE YOU SURE YOU WANT TO DELETE USER ${user.first_name}?`)) return;
        // handle delete API call
        fetch("/api/admin/users/delete", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ id: user.id })
        });
        window.location.reload();
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Admin Dashboard - Users</h1>
                {(currentUser?.role_id === 3 || currentUser?.role_id === 2) && (
                    <Link href="/admin/users/add">
                        <button className="px-2 py-1 rounded bg-green-500 text-white hover:bg-green-600">
                            + New User
                        </button>
                    </Link>
                )}
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300 dark:border-gray-700 mt-4">
                    <thead className="bg-gray-100 dark:bg-gray-800">
                        <tr>
                            <th className="border px-4 py-2">ID</th>
                            <th className="border px-4 py-2">Email</th>
                            <th className="border px-4 py-2">First Name</th>
                            <th className="border px-4 py-2">Last Name</th>
                            <th className="border px-4 py-2">Role</th>
                            <th className="border px-4 py-2">Institution</th>
                            <th className="border px-4 py-2">Created at</th>
                            <th className="border px-4 py-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user, index) => (
                            <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="border px-4 py-2">{user.id}</td>
                                <td className="border px-4 py-2">{user.email}</td>
                                <td className="border px-4 py-2">{user.first_name}</td>
                                <td className="border px-4 py-2">{user.last_name}</td>
                                <td className="border px-4 py-2">{user.role}</td>
                                <td className="border px-4 py-2">{user.institution}</td>
                                <td className="border px-4 py-2">{new Date(user.created_at || new Date(0)).toLocaleDateString()}</td>
                                <td className="border px-4 py-2 space-x-2">
                                    <button
                                        onClick={() => handleEdit(user)}
                                        disabled={currentUser?.id === user.id}
                                        className={`
                                            px-2 py-1 rounded transition
                                            ${currentUser?.id === user.id ? "bg-gray-400 cursor-not-allowed" : "bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 transition"}
                                        `}
                                        title={currentUser?.id === user.id ? "You cannot edit your own account" : ""}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(user)}
                                        disabled={currentUser?.id === user.id}
                                        className={`
                                            px-2 py-1 rounded transition
                                            ${currentUser?.id === user.id ? "bg-gray-400 cursor-not-allowed" : "bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition"}
                                        `}
                                        title={currentUser?.id === user.id ? "You cannot delete your own account" : ""}                                    
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
