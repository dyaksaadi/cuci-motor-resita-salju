
import { createPrismaClient } from "@/lib/prisma";
import { buatToken } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const username = body?.username;
    const password = body?.password;

    if (
      typeof username !== "string" ||
      !username.trim() ||
      typeof password !== "string" ||
      !password
    ) {
      return Response.json(
        {
          berhasil: false,
          pesan: "Username dan password wajib diisi",
        },
        { status: 400 }
      );
    }

    const prisma = createPrismaClient();

    const user = await prisma.users.findUnique({
      where: {
        username: username.trim(),
      },
    });

    if (!user) {
      return Response.json(
        {
          berhasil: false,
          pesan: "Username atau password salah",
        },
        { status: 401 }
      );
    }

    const passwordBenar = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordBenar) {
      return Response.json(
        {
          berhasil: false,
          pesan: "Username atau password salah",
        },
        { status: 401 }
      );
    }

    const token = await buatToken({
      id_user: user.id_user,
      nama: user.nama,
      username: user.username,
      role: user.role,
    });

    const response = Response.json({
      berhasil: true,
      pesan: "Login berhasil",
      user: {
        id_user: user.id_user,
        nama: user.nama,
        username: user.username,
        role: user.role,
      },
    });

    response.headers.append(
      "Set-Cookie",
      `auth_token=${token}; HttpOnly; Path=/; Max-Age=28800; SameSite=Lax; Secure`
    );

    return response;
  } catch (error) {
    console.error("Login route error:", error);

    return Response.json(
      {
        berhasil: false,
        pesan: "Terjadi kesalahan saat login",
        detail:
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan server internal.",
      },
      { status: 500 }
    );
  }
}
