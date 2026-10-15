import { NextRequest, NextResponse } from "next/server";
import { createPrismaClient } from "@/lib/prisma";
import { verifikasiToken } from "@/lib/auth";
import bcrypt from "bcryptjs";

async function cekOwner(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;

  if (!token) {
    return { diizinkan: false, status: 401, pesan: "Belum login. Silakan masuk terlebih dahulu." };
  }

  const user = await verifikasiToken(token);

  if (!user) {
    return { diizinkan: false, status: 401, pesan: "Sesi login telah kedaluwarsa atau tidak valid." };
  }

  if (user.role !== "owner") {
    return { diizinkan: false, status: 403, pesan: "Akses ditolak. Hanya owner yang diizinkan mengelola data pengguna." };
  }

  return { diizinkan: true, user };
}

export async function GET(request: NextRequest) {
  try {
    const auth = await cekOwner(request);
    if (!auth.diizinkan) {
      return NextResponse.json(
        { message: auth.pesan },
        { status: auth.status }
      );
    }

    const prisma = createPrismaClient();
    const pengguna = await prisma.users.findMany({
      select: {
        id_user: true,
        nama: true,
        username: true,
        role: true,
      },
      orderBy: {
        id_user: "desc",
      },
    });

    return NextResponse.json(pengguna);
  } catch (error) {
    console.error("GAGAL GET PENGGUNA:", error);

    return NextResponse.json(
      {
        message: "Gagal mengambil data pengguna.",
        detail: error instanceof Error ? error.message : "Terjadi kesalahan server internal.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await cekOwner(request);
    if (!auth.diizinkan) {
      return NextResponse.json(
        { message: auth.pesan },
        { status: auth.status }
      );
    }

    const body = await request.json();

    const nama = String(body.nama ?? "").trim();
    const username = String(body.username ?? "").trim();
    const password = String(body.password ?? "");
    const role = String(body.role ?? "").trim().toLowerCase();

    if (!nama || !username || !password || !role) {
      return NextResponse.json(
        { message: "Nama, username, password, dan role wajib diisi." },
        { status: 400 }
      );
    }

    if (!["owner", "washer"].includes(role)) {
      return NextResponse.json(
        { message: "Role harus owner atau washer." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: "Password minimal 8 karakter." },
        { status: 400 }
      );
    }

    const prisma = createPrismaClient();
    const akunSudahAda = await prisma.users.findUnique({
      where: { username },
      select: { id_user: true },
    });

    if (akunSudahAda) {
      return NextResponse.json(
        { message: "Username sudah digunakan." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const penggunaBaru = await prisma.users.create({
      data: {
        nama,
        username,
        password: passwordHash,
        role,
      },
      select: {
        id_user: true,
        nama: true,
        username: true,
        role: true,
      },
    });

    return NextResponse.json(penggunaBaru, { status: 201 });
  } catch (error) {
    console.error("GAGAL POST PENGGUNA:", error);

    return NextResponse.json(
      {
        message: "Gagal menyimpan akun.",
        detail: error instanceof Error ? error.message : "Terjadi kesalahan server internal.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await cekOwner(request);
    if (!auth.diizinkan) {
      return NextResponse.json(
        { message: auth.pesan },
        { status: auth.status }
      );
    }

    const id = Number(request.nextUrl.searchParams.get("id"));

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        { message: "ID pengguna tidak valid." },
        { status: 400 }
      );
    }

    const prisma = createPrismaClient();
    const akun = await prisma.users.findUnique({
      where: { id_user: id },
      select: {
        id_user: true,
        nama: true,
        username: true,
        role: true,
      },
    });

    if (!akun) {
      return NextResponse.json(
        { message: "Pengguna tidak ditemukan." },
        { status: 404 }
      );
    }

    await prisma.users.delete({
      where: { id_user: id },
    });

    return NextResponse.json({
      message: `Akun ${akun.nama} (${akun.role}) berhasil dihapus.`,
    });
  } catch (error) {
    console.error("GAGAL DELETE PENGGUNA:", error);

    return NextResponse.json(
      {
        message: "Gagal menghapus pengguna.",
        detail: error instanceof Error ? error.message : "Terjadi kesalahan server internal.",
      },
      { status: 500 }
    );
  }
}

