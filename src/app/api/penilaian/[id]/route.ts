
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

type ParameterRoute = {
  params: Promise<{ id: string }>;
};

export async function PATCH(
  request: NextRequest,
  context: ParameterRoute
) {
  const akses = await periksaPemilik(request);

  if ("error" in akses) {
    return akses.error;
  }

  try {
    const { id } = await context.params;
    const idPenilaian = Number(id);

    if (!Number.isInteger(idPenilaian) || idPenilaian <= 0) {
      return NextResponse.json(
        { pesan: "ID penilaian tidak valid." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const keputusan = body?.keputusan;

    if (
      typeof keputusan !== "string" ||
      !["Diterima", "Ditolak"].includes(keputusan)
    ) {
      return NextResponse.json(
        { pesan: "Keputusan harus Diterima atau Ditolak." },
        { status: 400 }
      );
    }

    const prisma = createPrismaClient();
    const hasil = await prisma.$transaction(async (tx) => {
      const penilaian = await tx.penilaian_seleksi.findUnique({
        where: { id_penilaian: idPenilaian },
        select: {
          id_penilaian: true,
          id_pelamar: true,
        },
      });

      if (!penilaian) {
        return null;
      }

      const penilaianDiperbarui =
        await tx.penilaian_seleksi.update({
          where: { id_penilaian: idPenilaian },
          data: { keputusan },
        });

      // Periksa apakah masih ada penilaian lain yang lebih baru.
      const penilaianTerbaru =
        await tx.penilaian_seleksi.findFirst({
          where: {
            id_pelamar: penilaian.id_pelamar,
          },
          orderBy: [
            { created_at: "desc" },
            { id_penilaian: "desc" },
          ],
          select: {
            id_penilaian: true,
            keputusan: true,
          },
        });

      // Hanya keputusan pada penilaian terbaru yang mengubah
      // status akhir pelamar.
      if (
        penilaianTerbaru?.id_penilaian === idPenilaian &&
        ["Diterima", "Ditolak"].includes(keputusan)
      ) {
        await tx.pelamar.update({
          where: {
            id_pelamar: penilaian.id_pelamar,
          },
          data: {
            status: keputusan,
          },
        });
      }

      return {
        penilaian: penilaianDiperbarui,
        merupakanPenilaianTerbaru:
          penilaianTerbaru?.id_penilaian === idPenilaian,
      };
    });

    if (!hasil) {
      return NextResponse.json(
        { pesan: "Data penilaian tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        pesan: hasil.merupakanPenilaianTerbaru
          ? `Keputusan berhasil diperbarui menjadi ${keputusan}.`
          : "Keputusan pada riwayat penilaian berhasil diperbarui. Status akhir pelamar tidak diubah karena penilaian ini bukan penilaian terbaru.",
        data: hasil.penilaian,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Gagal memperbarui keputusan seleksi:", error);

    return NextResponse.json(
      { pesan: "Gagal memperbarui keputusan seleksi." },
      { status: 500 }
    );
  }
}