import { NextRequest, NextResponse } from "next/server";
import { verifikasiToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          berhasil: false,
          pesan: "Belum login",
        },
        { status: 401 }
      );
    }

    const user = await verifikasiToken(token);

    if (!user) {
      return NextResponse.json(
        {
          berhasil: false,
          pesan: "Session tidak valid",
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      berhasil: true,
      data: {
        id_user: user.id_user,
        nama: user.nama,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        berhasil: false,
        pesan: "Gagal mengambil data user",
      },
      { status: 500 }
    );
  }
}