import { NextRequest, NextResponse } from "next/server";
import { createPrismaClient } from "@/lib/prisma";
import { verifikasiToken } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    // Ambil token login
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

    // Verifikasi token
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

    // Hanya Owner yang boleh membuat user
    if (user.role !== "owner") {
      return NextResponse.json(
        {
          berhasil: false,
          pesan: "Anda tidak memiliki izin membuat user",
        },
        { status: 403 }
      );
    }

    // Ambil data dari request
    const body = await request.json();

    const nama = body.nama;
    const username = body.username;
    const password = body.password;
    const role = body.role;

    // Validasi data wajib
    if (!nama || !username || !password || !role) {
      return NextResponse.json(
        {
          berhasil: false,
          pesan: "Semua data wajib diisi",
        },
        { status: 400 }
      );
    }

    // Validasi role
    if (role !== "owner" && role !== "washer") {
      return NextResponse.json(
        {
          berhasil: false,
          pesan: "Role tidak valid",
        },
        { status: 400 }
      );
    }

    // Validasi password
    if (typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        {
          berhasil: false,
          pesan: "Password minimal 6 karakter",
        },
        { status: 400 }
      );
    }

    // Bersihkan input
    const namaBersih = nama.trim();
    const usernameBersih = username.trim();

    if (!namaBersih || !usernameBersih) {
      return NextResponse.json(
        {
          berhasil: false,
          pesan: "Nama dan username wajib diisi",
        },
        { status: 400 }
      );
    }

    // Cek username
    const prisma = createPrismaClient();
    const userSudahAda = await prisma.users.findUnique({
      where: {
        username: usernameBersih,
      },
    });

    if (userSudahAda) {
      return NextResponse.json(
        {
          berhasil: false,
          pesan: "Username sudah digunakan",
        },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Simpan user
    const userBaru = await prisma.users.create({
      data: {
        nama: namaBersih,
        username: usernameBersih,
        password: passwordHash,
        role: role,
      },
    });

    return NextResponse.json(
      {
        berhasil: true,
        pesan: "User berhasil dibuat",
        data: {
          id_user: userBaru.id_user,
          nama: userBaru.nama,
          username: userBaru.username,
          role: userBaru.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        berhasil: false,
        pesan: "Gagal membuat user",
      },
      { status: 500 }
    );
  }
}