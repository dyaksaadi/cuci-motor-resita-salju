
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
    const penilaian = await prisma.penilaian_seleksi.findMany({
      orderBy: {
        created_at: "desc",
      },
      include: {
        pelamar: true,
      },
    });

    return NextResponse.json(
      { data: penilaian },
      { status: 200 }
    );
  } catch (error) {
    console.error("Gagal mengambil penilaian:", error);

    return NextResponse.json(
      { pesan: "Gagal mengambil data penilaian." },
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

    const idPelamar = Number(body.id_pelamar);
    const nilaiPraktik = Number(body.nilai_praktik);
    const nilaiKetelitian = Number(body.nilai_ketelitian);
    const nilaiTanggungJawab = Number(body.nilai_tanggung_jawab);

    const catatan =
      typeof body.catatan === "string"
        ? body.catatan.trim()
        : "";

    if (
      body.id_pelamar === "" ||
      body.id_pelamar == null ||
      !Number.isInteger(idPelamar) ||
      idPelamar <= 0
    ) {
      return NextResponse.json(
        { pesan: "Pilih pelamar yang akan dinilai." },
        { status: 400 }
      );
    }

    const nilai = [
      nilaiPraktik,
      nilaiKetelitian,
      nilaiTanggungJawab,
    ];

    if (
      nilai.some(
        (angka) => !Number.isInteger(angka) || angka < 0 || angka > 100
      ) ||
      body.nilai_praktik === "" ||
      body.nilai_praktik == null ||
      body.nilai_ketelitian === "" ||
      body.nilai_ketelitian == null ||
      body.nilai_tanggung_jawab === "" ||
      body.nilai_tanggung_jawab == null
    ) {
      return NextResponse.json(
        { pesan: "Semua nilai wajib diisi dengan bilangan bulat 0 sampai 100." },
        { status: 400 }
      );
    }

    if (catatan.length > 5000) {
      return NextResponse.json(
        { pesan: "Catatan maksimal 5.000 karakter." },
        { status: 400 }
      );
    }

    const prisma = createPrismaClient();
    const pelamar = await prisma.pelamar.findUnique({
      where: {
        id_pelamar: idPelamar,
      },
      select: {
        id_pelamar: true,
      },
    });

    if (!pelamar) {
      return NextResponse.json(
        { pesan: "Data pelamar tidak ditemukan." },
        { status: 404 }
      );
    }

    const hasil = await prisma.penilaian_seleksi.create({
      data: {
        id_pelamar: idPelamar,
        nilai_praktik: nilaiPraktik,
        nilai_ketelitian: nilaiKetelitian,
        nilai_tanggung_jawab: nilaiTanggungJawab,
        catatan: catatan || null,
      },
      include: {
        pelamar: true,
      },
    });

    return NextResponse.json(
      {
        pesan: "Penilaian calon karyawan berhasil disimpan.",
        data: hasil,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Gagal menyimpan penilaian:", error);

    return NextResponse.json(
      { pesan: "Gagal menyimpan penilaian calon karyawan." },
      { status: 500 }
    );
  }
}