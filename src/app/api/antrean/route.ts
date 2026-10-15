import { NextRequest, NextResponse } from "next/server";
import { createPrismaClient } from "@/lib/prisma";
import { verifikasiToken } from "@/lib/auth";

function tanggalIndonesia(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function tanggalDatabase(tanggal: string): Date {
  return new Date(`${tanggal}T00:00:00.000Z`);
}

async function ambilUser(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;

  if (!token) {
    return null;
  }

  return await verifikasiToken(token);
}

/*
 * GET
 * Semua user yang sudah login boleh melihat antrean hari ini.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await ambilUser(request);

    if (!user) {
      return NextResponse.json(
        {
          berhasil: false,
          pesan: "Belum login",
        },
        { status: 401 }
      );
    }

    const tanggalHariIni = tanggalIndonesia();
    const tanggal = tanggalDatabase(tanggalHariIni);
    const prisma = createPrismaClient();

    const antrean = await prisma.antrean.findMany({
      where: {
        tanggal_antrean: tanggal,
      },
      include: {
        pelanggan: true,
        transaksi: true,
      },
      orderBy: {
        nomor_antrean: "asc",
      },
    });

    return NextResponse.json({
      berhasil: true,
      data: antrean,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        berhasil: false,
        pesan: "Gagal mengambil data antrean",
      },
      { status: 500 }
    );
  }
}

/*
 * POST
 * Hanya Owner yang boleh menambahkan pelanggan.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await ambilUser(request);

    if (!user) {
      return NextResponse.json(
        {
          berhasil: false,
          pesan: "Belum login",
        },
        { status: 401 }
      );
    }

    if (user.role !== "owner") {
      return NextResponse.json(
        {
          berhasil: false,
          pesan: "Hanya Owner yang dapat menambahkan antrean",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const nama = body.nama;

    if (!nama || typeof nama !== "string") {
      return NextResponse.json(
        {
          berhasil: false,
          pesan: "Nama pelanggan wajib diisi",
        },
        { status: 400 }
      );
    }

    const namaBersih = nama.trim();

    if (!namaBersih) {
      return NextResponse.json(
        {
          berhasil: false,
          pesan: "Nama pelanggan wajib diisi",
        },
        { status: 400 }
      );
    }

    const tanggalHariIni = tanggalIndonesia();
    const tanggal = tanggalDatabase(tanggalHariIni);
    const prisma = createPrismaClient();

    /*
     * Transaction + advisory lock PostgreSQL.
     *
     * Lock ini membuat proses pemberian nomor antrean
     * berjalan satu per satu.
     *
     * Contoh:
     *
     * Request A → ambil nomor 5
     * Request B → menunggu
     * Request A selesai
     * Request B → ambil nomor 6
     *
     * Jadi tidak terjadi dua pelanggan mendapatkan
     * nomor antrean yang sama.
     */
    const hasil = await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`
        SELECT pg_advisory_xact_lock(987654321)
      `;

      const antreanTerakhir = await tx.antrean.findFirst({
        where: {
          tanggal_antrean: tanggal,
        },
        orderBy: {
          nomor_antrean: "desc",
        },
        select: {
          nomor_antrean: true,
        },
      });

      const nomorAntrean =
        (antreanTerakhir?.nomor_antrean ?? 0) + 1;

      const pelanggan = await tx.pelanggan.create({
        data: {
          nama: namaBersih,
        },
      });

      const antrean = await tx.antrean.create({
        data: {
          id_pelanggan: pelanggan.id_pelanggan,
          nomor_antrean: nomorAntrean,
          status: "Menunggu",
          tanggal_antrean: tanggal,
        },
        include: {
          pelanggan: true,
          transaksi: true,
        },
      });

      return antrean;
    });

    return NextResponse.json(
      {
        berhasil: true,
        pesan: "Pelanggan berhasil ditambahkan ke antrean",
        data: hasil,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        berhasil: false,
        pesan: "Gagal menambahkan pelanggan ke antrean",
      },
      { status: 500 }
    );
  }
}