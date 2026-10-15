
import { NextRequest, NextResponse } from "next/server";
import { createPrismaClient } from "@/lib/prisma";
import { verifikasiToken } from "@/lib/auth";

const HARGA_CUCI = 8000;

async function cekOwner(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;

  if (!token) {
    return null;
  }

  const user = await verifikasiToken(token);

  if (!user || user.role !== "owner") {
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
    const transaksi = await prisma.transaksi.findMany({
      include: {
        antrean: {
          include: {
            pelanggan: true,
          },
        },
      },
      orderBy: {
        waktu_transaksi: "desc",
      },
    });

    return NextResponse.json({
      berhasil: true,
      data: transaksi,
    });
  } catch (error) {
    console.error("Gagal mengambil transaksi:", error);

    return NextResponse.json(
      {
        berhasil: false,
        pesan: "Gagal mengambil data transaksi",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();

    const idAntrean = Number(body.id_antrean);
    const uangDibayar = Number(body.uang_dibayar);

    if (!Number.isSafeInteger(idAntrean) || idAntrean <= 0) {
      return NextResponse.json(
        {
          berhasil: false,
          pesan: "ID antrean tidak valid",
        },
        { status: 400 }
      );
    }

    if (
      body.uang_dibayar === undefined ||
      body.uang_dibayar === null ||
      body.uang_dibayar === ""
    ) {
      return NextResponse.json(
        {
          berhasil: false,
          pesan: "Uang yang dibayar pelanggan wajib diisi",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isSafeInteger(uangDibayar) ||
      uangDibayar < HARGA_CUCI
    ) {
      return NextResponse.json(
        {
          berhasil: false,
          pesan: `Uang pelanggan minimal Rp${HARGA_CUCI.toLocaleString("id-ID")}`,
        },
        { status: 400 }
      );
    }

    const prisma = createPrismaClient();
    const antrean = await prisma.antrean.findUnique({
      where: {
        id_antrean: idAntrean,
      },
    });

    if (!antrean) {
      return NextResponse.json(
        {
          berhasil: false,
          pesan: "Antrean tidak ditemukan",
        },
        { status: 404 }
      );
    }

    if (antrean.status !== "Selesai") {
      return NextResponse.json(
        {
          berhasil: false,
          pesan:
            "Pembayaran hanya dapat dicatat setelah pencucian selesai",
        },
        { status: 400 }
      );
    }

    const transaksiLama = await prisma.transaksi.findUnique({
      where: {
        id_antrean: idAntrean,
      },
    });

    if (transaksiLama) {
      return NextResponse.json(
        {
          berhasil: false,
          pesan: "Pembayaran untuk antrean ini sudah dicatat",
        },
        { status: 409 }
      );
    }

    const total = HARGA_CUCI;
    const kembalian = uangDibayar - total;

    const transaksi = await prisma.transaksi.create({
      data: {
        id_antrean: idAntrean,
        total,
        uang_dibayar: uangDibayar,
        kembalian,
        metode: "Cash",
      },
      include: {
        antrean: {
          include: {
            pelanggan: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        berhasil: true,
        pesan: "Pembayaran berhasil dicatat",
        data: transaksi,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Gagal mencatat transaksi:", error);

    // P2002 berarti terjadi pelanggaran batasan unik di database.
    // Ini juga menangani konflik ketika dua pembayaran masuk bersamaan.
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        {
          berhasil: false,
          pesan: "Pembayaran untuk antrean ini sudah dicatat",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        berhasil: false,
        pesan: "Gagal mencatat pembayaran",
      },
      { status: 500 }
    );
  }
}