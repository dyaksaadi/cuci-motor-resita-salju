import { NextRequest, NextResponse } from "next/server";
import { createPrismaClient } from "@/lib/prisma";
import { verifikasiToken } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // =========================
    // 1. Cek login
    // =========================

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

    // Owner dan Washer boleh mengubah status pencucian
    if (
      user.role !== "owner" &&
      user.role !== "washer"
    ) {
      return NextResponse.json(
        {
          berhasil: false,
          pesan: "Anda tidak memiliki izin mengubah status",
        },
        { status: 403 }
      );
    }

    // =========================
    // 2. Ambil ID antrean
    // =========================

    const { id } = await params;

    const idAntrean = Number(id);

    if (Number.isNaN(idAntrean)) {
      return NextResponse.json(
        {
          berhasil: false,
          pesan: "ID antrean tidak valid",
        },
        { status: 400 }
      );
    }

    // =========================
    // 3. Ambil status baru
    // =========================

    const body = await request.json();

    const statusBaru = body.status;

    const statusValid = [
      "Menunggu",
      "Sedang Dicuci",
      "Selesai",
    ];

    if (!statusValid.includes(statusBaru)) {
      return NextResponse.json(
        {
          berhasil: false,
          pesan: "Status tidak valid",
        },
        { status: 400 }
      );
    }

    // =========================
    // 4. Cari antrean
    // =========================

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

    // =========================
    // 5. Cegah status mundur
    // =========================

    if (antrean.status === "Selesai") {
      return NextResponse.json(
        {
          berhasil: false,
          pesan:
            "Antrean yang sudah selesai tidak dapat diubah lagi",
        },
        { status: 400 }
      );
    }

    if (
      antrean.status === "Sedang Dicuci" &&
      statusBaru === "Menunggu"
    ) {
      return NextResponse.json(
        {
          berhasil: false,
          pesan:
            "Antrean yang sedang dicuci tidak dapat kembali menjadi Menunggu",
        },
        { status: 400 }
      );
    }

    // =========================
    // 6. Aturan urutan antrean
    // =========================

    // Jika ingin mulai mencuci,
    // periksa apakah ada antrean sebelumnya
    // yang masih menunggu.
    if (
      antrean.status === "Menunggu" &&
      statusBaru === "Sedang Dicuci"
    ) {
      const antreanSebelumnya =
        await prisma.antrean.findFirst({
          where: {
            tanggal_antrean:
              antrean.tanggal_antrean,

            nomor_antrean: {
              lt: antrean.nomor_antrean,
            },

            status: "Menunggu",
          },

          orderBy: {
            nomor_antrean: "asc",
          },
        });

      if (antreanSebelumnya) {
        return NextResponse.json(
          {
            berhasil: false,
            pesan:
              `Antrean nomor ${antreanSebelumnya.nomor_antrean} harus diproses terlebih dahulu`,
          },
          { status: 400 }
        );
      }
    }

    // =========================
    // 7. Pastikan proses benar
    // =========================

    if (
      antrean.status === "Menunggu" &&
      statusBaru === "Selesai"
    ) {
      return NextResponse.json(
        {
          berhasil: false,
          pesan:
            "Antrean harus masuk ke status Sedang Dicuci terlebih dahulu",
        },
        { status: 400 }
      );
    }

    // =========================
    // 8. Update status
    // =========================

    const antreanDiperbarui =
      await prisma.antrean.update({
        where: {
          id_antrean: idAntrean,
        },

        data: {
          status: statusBaru,
        },

        include: {
          pelanggan: true,
        },
      });

    // =========================
    // 9. Berhasil
    // =========================

    return NextResponse.json({
      berhasil: true,
      pesan: "Status antrean berhasil diperbarui",
      data: antreanDiperbarui,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        berhasil: false,
        pesan: "Gagal memperbarui status antrean",
      },
      { status: 500 }
    );
  }
}