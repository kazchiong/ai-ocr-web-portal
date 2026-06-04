'use client';

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Institution {
    id: number;
    name: string;
    active: number;
    active_boolean: boolean;
}

export default function AdminDashboard() {
    const router = useRouter();
    const [institutions, setInstitutions] = useState<Institution[]>([]);

    useEffect(() => {
        fetch("/api/admin/get/institutions", { method: "POST" })
            .then(res => res.json())
            .then(data => {
                const institutions = (data.institutions || [])
                    .map((i: Institution) => ({
                        ...i,
                        active_boolean: i.active === 1, // convert 0/1 to boolean
                    }));
                setInstitutions(institutions);
            })
            .catch(err => console.error(err));
    }, []);

    const handleEdit = (institution: Institution) => {
        router.push(`/admin/institutions/edit?id=${institution.id}`);
    };

    const handleActivate = (institution: Institution, action: string) => {
        const confirmMessage = action === "deactivate"
            ? `Do you want to deactivate ${institution.name}?`
            : `Activate ${institution.name}?`;

        if (!confirm(confirmMessage)) return;

        // handle API call
        fetch("/api/admin/institutions/deactivate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: institution.id, action })
        }).then(() => window.location.reload());
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Admin Dashboard - Institutions</h1>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300 dark:border-gray-700">
                    <thead className="bg-gray-100 dark:bg-gray-800">
                        <tr>
                            <th className="border px-4 py-2">ID</th>
                            <th className="border px-4 py-2">Name</th>
                            <th className="border px-4 py-2">Active</th>
                            <th className="border px-4 py-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {institutions.map((institution) => (
                            <tr key={institution.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="border px-4 py-2">{institution.id}</td>
                                <td className="border px-4 py-2">{institution.name}</td>
                                <td className="border px-4 py-2">{institution.active_boolean ? "Yes" : "No"}</td>
                                <td className="border px-4 py-2 space-x-2">
                                    <button
                                        onClick={() => handleEdit(institution)}
                                        className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 transition"
                                    >
                                        Edit
                                    </button>
                                    {institution.active_boolean && (
                                        <button
                                            onClick={() => handleActivate(institution, "deactivate")}
                                            className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition"
                                        >
                                            Deactivate
                                        </button>
                                    )}

                                    {!institution.active_boolean && (
                                        <button
                                            onClick={() => handleActivate(institution, "activate")}
                                            className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 transition"
                                        >
                                            Activate
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
