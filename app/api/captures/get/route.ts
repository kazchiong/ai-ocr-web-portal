import { NextResponse } from "next/server";
import { db } from "@/app/lib/db";
export async function POST(req: Request) {
    const { institution_id,role_id } = await req.json();
    try {
        let query = `
    SELECT 
        captures.id,
        captures.created_at,
        captures.file_name,
        captures.ocrText,
        users.first_name AS user,
        institutions.name AS institution
    FROM captures
    LEFT JOIN users ON captures.user_id = users.id
    LEFT JOIN institutions ON captures.institution_id = institutions.id
`;

        let params: any[] = [];

        if (role_id !== 3) {
            query += ` WHERE captures.institution_id = ?`;
            params.push(institution_id);
        }

        const [captures] = await db.query(query, params);

        return NextResponse.json({ captures });
    }
    catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Database error occurred" });
    }
}
