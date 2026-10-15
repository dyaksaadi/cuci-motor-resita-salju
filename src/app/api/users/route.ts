import { NextRequest, NextResponse } from "next/server";
import { createPrismaClient } from "@/lib/prisma";
import { verifikasiToken } from "@/lib/auth";

async function cekOwner(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;

  if (!token) {
    return null;
  }

  const user = await verifikasiToken(token);

  if (!user) {
    return null;
  }

  if (user.role !== "owner") {
    return null;
  }

  return user;
}

export async function GET(request: NextRequest) {
  try {
    const user = await cekOwner(request);

    if (!user) {
      return NextResponse.json(
        {
          berhasil: false,
          pesan: "Anda tidak memiliki akses",
        },
        { status: 403 }
      );
    }

    const prisma = createPrismaClient();
    const users = await prisma.users.findMany({
      select: {
        id_user: true,
        nama: true,
        username: true,
        role: true,
      },
      orderBy: {
        id_user: "asc",
      },
    });

    return NextResponse.json({
      berhasil: true,
      data: users,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        berhasil: false,
        pesan: "Gagal mengambil daftar pengguna",
      },
      { status: 500 }
    );
  }
}