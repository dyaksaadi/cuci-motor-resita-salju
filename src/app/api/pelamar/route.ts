
import { NextRequest, NextResponse } from "next/server";
import { createPrismaClient } from "@/lib/prisma";
import { verifikasiToken } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function periksaPemilik(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;

  if (!token) {
    return {
      error: NextResponse.json(
        { pesan: "Silakan login terlebih dahulu." },
        { status: 401 }
      ),
    };
  }

  try {
    const user = await verifikasiToken(token);

    if (!user || user.role !== "owner") {
      return {
        error: NextResponse.json(
          { pesan: "Akses hanya untuk pemilik usaha." },
          { status: 403 }
        ),
      };
    }

    return { user };
  } catch {
    return {
      error: NextResponse.json(
        { pesan: "Sesi login tidak valid. Silakan login kembali." },
        { status: 401 }
      ),
    };
  }
}

export async function GET(request: NextRequest) {
  const akses = await periksaPemilik(request);

  if ("error" in akses) {
    return akses.error;
  }

  try {
    const prisma = createPrismaClient();
    const pelamar = await prisma.pelamar.findMany({
      orderBy: {
        created_at: "desc",
      },
      include: {
        penilaian: {
          orderBy: {
            created_at: "desc",
          },
        },
      },
    });

    return NextResponse.json({ data: pelamar }, { status: 200 });
  } catch (error) {
    console.error("Gagal mengambil data pelamar:", error);

    return NextResponse.json(
      { pesan: "Gagal mengambil data pelamar." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const akses = await periksaPemilik(request);

  if ("error" in akses) {
    return akses.error;
  }

  try {
    const body = await request.json();

    const nama =
      typeof body.nama === "string" ? body.nama.trim() : "";

    const noTelepon =
      typeof body.no_telepon === "string"
        ? body.no_telepon.trim()
        : "";

    const pengalamanKerja =
      typeof body.pengalaman_kerja === "string"
        ? body.pengalaman_kerja.trim()
        : "";

    const lamaPengalaman =
      body.lama_pengalaman === "" || body.lama_pengalaman == null
        ? null
        : Number(body.lama_pengalaman);

    if (!nama || !noTelepon) {
      return NextResponse.json(
        { pesan: "Nama dan nomor telepon wajib diisi." },
        { status: 400 }
      );
    }

    if (nama.length > 100) {
      return NextResponse.json(
        { pesan: "Nama maksimal 100 karakter." },
        { status: 400 }
      );
    }

    if (noTelepon.length > 20) {
      return NextResponse.json(
        { pesan: "Nomor telepon maksimal 20 karakter." },
        { status: 400 }
      );
    }

    if (
      lamaPengalaman !== null &&
      (!Number.isInteger(lamaPengalaman) ||
        lamaPengalaman < 0 ||
        lamaPengalaman > 100)
    ) {
      return NextResponse.json(
        { pesan: "Lama pengalaman harus berupa bilangan bulat antara 0 dan 100 tahun." },
        { status: 400 }
      );
    }

    const prisma = createPrismaClient();
    const pelamar = await prisma.pelamar.create({
      data: {
        nama,
        no_telepon: noTelepon,
        pengalaman_kerja: pengalamanKerja || null,
        lama_pengalaman: lamaPengalaman,
      },
    });

    return NextResponse.json(
      {
        pesan: "Data pelamar berhasil disimpan.",
        data: pelamar,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Gagal menyimpan data pelamar:", error);

    return NextResponse.json(
      { pesan: "Gagal menyimpan data pelamar." },
      { status: 500 }
    );
  }
}