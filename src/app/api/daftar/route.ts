
import { NextRequest, NextResponse } from "next/server";
import { createPrismaClient } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const nama =
      typeof body.nama === "string" ? body.nama.trim() : "";

    const no_telepon =
      typeof body.no_telepon === "string"
        ? body.no_telepon.trim()
        : "";

    const pengalaman_kerja =
      typeof body.pengalaman_kerja === "string"
        ? body.pengalaman_kerja.trim()
        : "";

    const pengalamanRaw = body.lama_pengalaman;
    let lama_pengalaman: number | null = null;

    if (
      pengalamanRaw !== undefined &&
      pengalamanRaw !== null &&
      pengalamanRaw !== ""
    ) {
      const angka = Number(pengalamanRaw);

      if (!Number.isInteger(angka) || angka < 0 || angka > 100) {
        return NextResponse.json(
          { pesan: "Lama pengalaman harus antara 0 sampai 100 tahun." },
          { status: 400 }
        );
      }

      lama_pengalaman = angka;
    }

    if (!nama || !no_telepon) {
      return NextResponse.json(
        { pesan: "Nama dan nomor telepon wajib diisi." },
        { status: 400 }
      );
    }

    if (nama.length > 100 || no_telepon.length > 20) {
      return NextResponse.json(
        { pesan: "Nama atau nomor telepon terlalu panjang." },
        { status: 400 }
      );
    }

    if (pengalaman_kerja.length > 2000) {
      return NextResponse.json(
        { pesan: "Pengalaman kerja maksimal 2.000 karakter." },
        { status: 400 }
      );
    }

    const prisma = createPrismaClient();
    const pelamar = await prisma.pelamar.create({
      data: {
        nama,
        no_telepon,
        pengalaman_kerja: pengalaman_kerja || null,
        lama_pengalaman,
      },
      select: {
        id_pelamar: true,
        nama: true,
        status: true,
        created_at: true,
      },
    });

    return NextResponse.json(
      {
        pesan: "Pendaftaran berhasil dikirim.",
        data: pelamar,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Kesalahan pendaftaran publik:", error);

    return NextResponse.json(
      { pesan: "Pendaftaran gagal diproses. Periksa server dan database." },
      { status: 500 }
    );
  }
}
