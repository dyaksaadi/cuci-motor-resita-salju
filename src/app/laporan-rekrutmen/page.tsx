
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Penilaian = {
  id_penilaian: number;
  id_pelamar: number;
  nilai_praktik: number;
  nilai_ketelitian: number;
  nilai_tanggung_jawab: number;
  catatan: string | null;
  keputusan: string;
  created_at: string;
  pelamar: {
    id_pelamar: number;
    nama: string;
    no_telepon: string;
    pengalaman_kerja: string | null;
    lama_pengalaman: number | null;
    status: string;
  };
};

type ResponsAPI = {
  data?: Penilaian[];
  pesan?: string;
  error?: string;
};

type FilterKeputusan =
  | "Semua"
  | "Belum Diputuskan"
  | "Diterima"
  | "Ditolak";

function formatTanggal(tanggal: string) {
  return new Date(tanggal).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  });
}

function tanggalLokal(tanggal: string) {
  const nilai = new Date(tanggal);

  const bagian = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Jakarta",
  }).formatToParts(nilai);

  const ambil = (jenis: string) =>
    bagian.find((item) => item.type === jenis)?.value ?? "";

  return `${ambil("year")}-${ambil("month")}-${ambil("day")}`;
}

function rataRata(item: Penilaian) {
  return (
    item.nilai_praktik +
    item.nilai_ketelitian +
    item.nilai_tanggung_jawab
  ) / 3;
}

function gayaKeputusan(keputusan: string) {
  switch (keputusan) {
    case "Diterima":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "Ditolak":
      return "border-rose-200 bg-rose-50 text-rose-700";
    default:
      return "border-amber-200 bg-amber-50 text-amber-700";
  }
}

function Ikon({
  nama,
  className = "h-5 w-5",
}: {
  nama: "laporan" | "orang" | "dokumen" | "diterima" | "ditolak" | "jam" | "cetak" | "refresh" | "filter" | "kalender" | "kembali";
  className?: string;
}) {
  const atribut = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": true as const,
  };

  switch (nama) {
    case "laporan":
      return (
        <svg {...atribut}>
          <path d="M7 3h7l5 5v13H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
          <path d="M14 3v5h5M9 13h6M9 17h6" />
        </svg>
      );
    case "orang":
      return (
        <svg {...atribut}>
          <circle cx="9" cy="8" r="4" />
          <path d="M2 21v-2a7 7 0 0 1 14 0v2M19 8v6m-3-3h6" />
        </svg>
      );
    case "dokumen":
      return (
        <svg {...atribut}>
          <path d="M6 3h9l4 4v14H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
          <path d="M14 3v5h5M8 13h8M8 17h8" />
        </svg>
      );
    case "diterima":
      return (
        <svg {...atribut}>
          <circle cx="12" cy="12" r="9" />
          <path d="m8 12 2.5 2.5L16 9" />
        </svg>
      );
    case "ditolak":
      return (
        <svg {...atribut}>
          <circle cx="12" cy="12" r="9" />
          <path d="m9 9 6 6m0-6-6 6" />
        </svg>
      );
    case "jam":
      return (
        <svg {...atribut}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      );
    case "cetak":
      return (
        <svg {...atribut}>
          <path d="M7 8V3h10v5M7 17H5a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
          <path d="M7 14h10v7H7zM17 11h.01" />
        </svg>
      );
    case "refresh":
      return (
        <svg {...atribut}>
          <path d="M20 7v5h-5M4 17v-5h5" />
          <path d="M5.6 9A7 7 0 0 1 18 6l2 2M4 16l2 2a7 7 0 0 0 12.4-3" />
        </svg>
      );
    case "filter":
      return (
        <svg {...atribut}>
          <path d="M4 5h16M7 12h10m-7 7h4" />
        </svg>
      );
    case "kalender":
      return (
        <svg {...atribut}>
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M16 3v4M8 3v4M3 10h18" />
        </svg>
      );
    case "kembali":
      return (
        <svg {...atribut}>
          <path d="m15 18-6-6 6-6M9 12h12" />
        </svg>
      );
  }
}

function KartuStatistik({
  judul,
  nilai,
  keterangan,
  ikon,
  warna,
}: {
  judul: string;
  nilai: number;
  keterangan: string;
  ikon: "orang" | "dokumen" | "diterima" | "ditolak" | "jam";
  warna: "biru" | "ungu" | "hijau" | "merah" | "amber";
}) {
  const warnaIkon = {
    biru: "bg-blue-50 text-blue-700",
    ungu: "bg-violet-50 text-violet-700",
    hijau: "bg-emerald-50 text-emerald-700",
    merah: "bg-rose-50 text-rose-700",
    amber: "bg-amber-50 text-amber-700",
  };

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{judul}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            {nilai}
          </p>
        </div>
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${warnaIkon[warna]}`}
        >
          <Ikon nama={ikon} className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-3 text-xs leading-5 text-slate-500">{keterangan}</p>
    </article>
  );
}

export default function HalamanLaporanRekrutmen() {
  const router = useRouter();

  const [data, setData] = useState<Penilaian[]>([]);
  const [memuat, setMemuat] = useState(true);
  const [error, setError] = useState("");
  const [waktuCetak] = useState(() =>
    new Date().toLocaleString("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Jakarta",
    })
  );
  const [tanggalAwal, setTanggalAwal] = useState("");
  const [tanggalAkhir, setTanggalAkhir] = useState("");
  const [keputusan, setKeputusan] = useState<FilterKeputusan>("Semua");

  const muatLaporan = useCallback(async () => {
    setMemuat(true);
    setError("");

    try {
      const respons = await fetch("/api/penilaian", {
        cache: "no-store",
      });

      let hasil: ResponsAPI | null = null;
      const ct = respons.headers.get("content-type");
      if (ct && ct.includes("application/json")) {
        try {
          hasil = await respons.json();
        } catch {
          hasil = null;
        }
      }

      if (!respons.ok) {
        throw new Error(
          hasil?.pesan ||
            hasil?.error ||
            `Gagal mengambil data laporan rekrutmen (HTTP ${respons.status}).`
        );
      }

      setData(hasil?.data ?? []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat memuat laporan."
      );
    } finally {
      setMemuat(false);
    }
  }, []);

  useEffect(() => {
    let aktif = true;

    async function muatAwal() {
      try {
        const respons = await fetch("/api/penilaian", {
          cache: "no-store",
        });

        let hasil: ResponsAPI | null = null;
        const ct = respons.headers.get("content-type");
        if (ct && ct.includes("application/json")) {
          try {
            hasil = await respons.json();
          } catch {
            hasil = null;
          }
        }

        if (!respons.ok) {
          throw new Error(
            hasil?.pesan ||
              hasil?.error ||
              `Gagal mengambil data laporan rekrutmen (HTTP ${respons.status}).`
          );
        }

        if (aktif) {
          setData(hasil?.data ?? []);
        }
      } catch (err) {
        if (aktif) {
          setError(
            err instanceof Error
              ? err.message
              : "Terjadi kesalahan saat memuat laporan."
          );
        }
      } finally {
        if (aktif) {
          setMemuat(false);
        }
      }
    }

    void muatAwal();

    return () => {
      aktif = false;
    };
  }, []);

  const dataTerurut = useMemo(
    () =>
      [...data].sort(
        (a, b) =>
          new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime() ||
          b.id_penilaian - a.id_penilaian
      ),
    [data]
  );

  const rentangTanggalValid =
    !tanggalAwal || !tanggalAkhir || tanggalAwal <= tanggalAkhir;

  const dataTersaring = useMemo(() => {
    return dataTerurut.filter((item) => {
      const tanggal = tanggalLokal(item.created_at);

      const sesuaiTanggalAwal =
        !tanggalAwal || tanggal >= tanggalAwal;
      const sesuaiTanggalAkhir =
        !tanggalAkhir || tanggal <= tanggalAkhir;
      const sesuaiKeputusan =
        keputusan === "Semua" || item.keputusan === keputusan;

      return (
        rentangTanggalValid &&
        sesuaiTanggalAwal &&
        sesuaiTanggalAkhir &&
        sesuaiKeputusan
      );
    });
  }, [
    dataTerurut,
    tanggalAwal,
    tanggalAkhir,
    keputusan,
    rentangTanggalValid,
  ]);

  const statistik = useMemo(() => {
    const kandidat = new Set(
      dataTersaring.map((item) => item.id_pelamar)
    );

    return {
      jumlahKandidat: kandidat.size,
      jumlahPenilaian: dataTersaring.length,
      diterima: dataTersaring.filter(
        (item) => item.keputusan === "Diterima"
      ).length,
      ditolak: dataTersaring.filter(
        (item) => item.keputusan === "Ditolak"
      ).length,
      belumDiputuskan: dataTersaring.filter(
        (item) => item.keputusan === "Belum Diputuskan"
      ).length,
    };
  }, [dataTersaring]);

  function resetFilter() {
    setTanggalAwal("");
    setTanggalAkhir("");
    setKeputusan("Semua");
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800">
      <style jsx global>{`
        @media print {
          @page {
            size: landscape;
            margin: 12mm;
          }

          html,
          body {
            background: white !important;
            color: #0f172a !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          body * {
            visibility: hidden;
          }

          #laporan-cetak,
          #laporan-cetak * {
            visibility: visible;
          }

          #laporan-cetak {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0 !important;
            margin: 0 !important;
          }

          .print-hidden {
            display: none !important;
          }

          .print-card {
            break-inside: avoid;
            box-shadow: none !important;
            border-color: #cbd5e1 !important;
          }

          .print-table-wrap {
            overflow: visible !important;
          }

          .print-table {
            min-width: 0 !important;
            width: 100% !important;
            font-size: 8px !important;
          }

          .print-table th,
          .print-table td {
            padding: 5px 4px !important;
            overflow-wrap: anywhere;
          }

          .print-notes {
            display: none !important;
          }

          .print-heading {
            color: #0f172a !important;
          }
        }
      `}</style>

      <header className="print-hidden border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm shadow-blue-200">
              <Ikon nama="laporan" className="h-6 w-6" />
            </div>
            <div>
              <p className="font-bold tracking-tight text-slate-900">
                Resita Salju
              </p>
              <p className="text-xs text-slate-500">
                Sistem Manajemen Cuci Motor
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => router.push("/")}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <Ikon nama="kembali" className="h-4 w-4" />
            Kembali ke Dashboard
          </button>
        </div>
      </header>

      <div
        id="laporan-cetak"
        className="mx-auto max-w-7xl space-y-6 px-4 py-7 sm:px-6 sm:py-9 lg:px-8"
      >
        <section className="print-card overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950 to-blue-800 p-6 text-white shadow-sm sm:p-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-blue-100">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Laporan administrasi
              </div>
              <h1 className="print-heading text-2xl font-bold tracking-tight sm:text-3xl">
                Laporan Rekrutmen Pegawai
              </h1>
              <p className="mt-2 text-sm leading-6 text-blue-100">
                Cuci Motor Resita Salju · Rekapitulasi hasil penilaian calon
                pegawai.
              </p>
              <p className="mt-3 text-xs text-blue-200">
                Waktu cetak: {waktuCetak || "Akan ditampilkan saat halaman siap"}
              </p>
            </div>

            <div className="print-hidden flex shrink-0 flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void muatLaporan()}
                disabled={memuat}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/20 disabled:opacity-50"
              >
                <Ikon
                  nama="refresh"
                  className={`h-4 w-4 ${memuat ? "animate-spin" : ""}`}
                />
                {memuat ? "Memuat..." : "Muat Ulang"}
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                disabled={memuat || dataTersaring.length === 0}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-blue-800 shadow-sm transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Ikon nama="cetak" className="h-4 w-4" />
                Cetak / Simpan PDF
              </button>
            </div>
          </div>
        </section>

        {error && (
          <section
            role="alert"
            className="print-hidden flex flex-col gap-4 rounded-2xl border border-rose-200 bg-rose-50 p-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-semibold text-rose-800">
                Laporan gagal dimuat
              </p>
              <p className="mt-1 text-sm leading-5 text-rose-700">{error}</p>
            </div>
            <button
              type="button"
              onClick={() => void muatLaporan()}
              disabled={memuat}
              className="rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-50"
            >
              Coba lagi
            </button>
          </section>
        )}

        {!error && (
          <>
            <section className="print-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <Ikon nama="filter" className="h-5 w-5 text-blue-600" />
                    <h2 className="text-lg font-bold text-slate-900">
                      Filter Laporan
                    </h2>
                  </div>
                  <p className="mt-1 text-sm leading-5 text-slate-500">
                    Pilih periode dan keputusan untuk menyaring data laporan.
                  </p>
                </div>
                <span className="inline-flex w-fit items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                  Filter tidak mengubah data asli
                </span>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label
                    htmlFor="tanggal-awal"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Tanggal awal
                  </label>
                  <div className="relative">
                    <Ikon
                      nama="kalender"
                      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      id="tanggal-awal"
                      type="date"
                      value={tanggalAwal}
                      max={tanggalAkhir || undefined}
                      onChange={(event) =>
                        setTanggalAwal(event.target.value)
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="tanggal-akhir"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Tanggal akhir
                  </label>
                  <div className="relative">
                    <Ikon
                      nama="kalender"
                      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      id="tanggal-akhir"
                      type="date"
                      value={tanggalAkhir}
                      min={tanggalAwal || undefined}
                      onChange={(event) =>
                        setTanggalAkhir(event.target.value)
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="filter-keputusan"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Keputusan
                  </label>
                  <select
                    id="filter-keputusan"
                    value={keputusan}
                    onChange={(event) =>
                      setKeputusan(event.target.value as FilterKeputusan)
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  >
                    <option value="Semua">Semua keputusan</option>
                    <option value="Belum Diputuskan">
                      Belum diputuskan
                    </option>
                    <option value="Diterima">Diterima</option>
                    <option value="Ditolak">Ditolak</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={resetFilter}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Reset Filter
                  </button>
                </div>
              </div>

              {!rentangTanggalValid && (
                <p className="mt-3 text-sm font-medium text-rose-600">
                  Tanggal awal tidak boleh melewati tanggal akhir.
                </p>
              )}
            </section>

            {memuat ? (
              <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                <div className="mx-auto flex max-w-sm flex-col items-center text-center">
                  <span className="h-9 w-9 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
                  <h2 className="mt-4 font-semibold text-slate-800">
                    Memuat laporan rekrutmen
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Sedang mengambil data penilaian yang tersimpan.
                  </p>
                </div>
              </section>
            ) : data.length === 0 ? (
              <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center shadow-sm">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <Ikon nama="laporan" className="h-7 w-7" />
                </div>
                <h2 className="mt-4 text-lg font-bold text-slate-900">
                  Belum ada data penilaian
                </h2>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  Laporan akan tersedia setelah penilaian calon pegawai
                  disimpan melalui halaman Manajemen Pelamar.
                </p>
                <button
                  type="button"
                  onClick={() => router.push("/pelamar")}
                  className="print-hidden mt-5 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  Buka Manajemen Pelamar
                </button>
              </section>
            ) : dataTersaring.length === 0 ? (
              <section className="rounded-2xl border border-slate-200 bg-white px-5 py-10 text-center shadow-sm">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                  <Ikon nama="filter" className="h-6 w-6" />
                </div>
                <h2 className="mt-4 font-bold text-slate-900">
                  Tidak ada hasil yang sesuai
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Coba ubah tanggal atau keputusan yang dipilih.
                </p>
                <button
                  type="button"
                  onClick={resetFilter}
                  className="print-hidden mt-4 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Tampilkan semua data
                </button>
              </section>
            ) : (
              <>
                <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                  <KartuStatistik
                    judul="Kandidat Dinilai"
                    nilai={statistik.jumlahKandidat}
                    keterangan="Jumlah kandidat unik dalam hasil filter"
                    ikon="orang"
                    warna="biru"
                  />
                  <KartuStatistik
                    judul="Jumlah Penilaian"
                    nilai={statistik.jumlahPenilaian}
                    keterangan="Seluruh catatan penilaian yang sesuai"
                    ikon="dokumen"
                    warna="ungu"
                  />
                  <KartuStatistik
                    judul="Diterima"
                    nilai={statistik.diterima}
                    keterangan="Catatan penilaian dengan keputusan diterima"
                    ikon="diterima"
                    warna="hijau"
                  />
                  <KartuStatistik
                    judul="Ditolak"
                    nilai={statistik.ditolak}
                    keterangan="Catatan penilaian dengan keputusan ditolak"
                    ikon="ditolak"
                    warna="merah"
                  />
                  <KartuStatistik
                    judul="Belum Diputuskan"
                    nilai={statistik.belumDiputuskan}
                    keterangan="Catatan penilaian yang belum diputuskan"
                    ikon="jam"
                    warna="amber"
                  />
                </section>

                <section className="print-card rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">
                        Riwayat Penilaian Kandidat
                      </h2>
                      <p className="mt-1 text-sm text-slate-500">
                        Menampilkan {dataTersaring.length} catatan dari{" "}
                        {data.length} penilaian tersimpan.
                      </p>
                    </div>
                    <span className="inline-flex w-fit items-center rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                      Urutan terbaru
                    </span>
                  </div>

                  <div className="print-table-wrap mt-5 overflow-x-auto rounded-xl border border-slate-200">
                    <table className="print-table w-full min-w-[1100px] border-collapse text-left text-sm">
                      <thead>
                        <tr className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                          <th className="whitespace-nowrap px-4 py-3 font-semibold">
                            No.
                          </th>
                          <th className="whitespace-nowrap px-4 py-3 font-semibold">
                            Tanggal
                          </th>
                          <th className="px-4 py-3 font-semibold">
                            Nama Pelamar
                          </th>
                          <th className="px-4 py-3 font-semibold">
                            Telepon
                          </th>
                          <th className="px-4 py-3 text-center font-semibold">
                            Praktik
                          </th>
                          <th className="px-4 py-3 text-center font-semibold">
                            Ketelitian
                          </th>
                          <th className="px-4 py-3 text-center font-semibold">
                            Tanggung Jawab
                          </th>
                          <th className="px-4 py-3 text-center font-semibold">
                            Rata-rata
                          </th>
                          <th className="px-4 py-3 font-semibold">
                            Status Pelamar
                          </th>
                          <th className="px-4 py-3 font-semibold">
                            Keputusan
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {dataTersaring.map((item, index) => (
                          <tr
                            key={item.id_penilaian}
                            className="transition hover:bg-slate-50"
                          >
                            <td className="px-4 py-4 text-slate-500">
                              {index + 1}
                            </td>
                            <td className="whitespace-nowrap px-4 py-4 text-slate-600">
                              {formatTanggal(item.created_at)}
                            </td>
                            <td className="px-4 py-4 font-semibold text-slate-900">
                              {item.pelamar.nama}
                            </td>
                            <td className="whitespace-nowrap px-4 py-4 text-slate-600">
                              {item.pelamar.no_telepon || "—"}
                            </td>
                            <td className="px-4 py-4 text-center tabular-nums">
                              {item.nilai_praktik}
                            </td>
                            <td className="px-4 py-4 text-center tabular-nums">
                              {item.nilai_ketelitian}
                            </td>
                            <td className="px-4 py-4 text-center tabular-nums">
                              {item.nilai_tanggung_jawab}
                            </td>
                            <td className="px-4 py-4 text-center font-bold tabular-nums text-slate-900">
                              {rataRata(item).toFixed(2)}
                            </td>
                            <td className="px-4 py-4">
                              <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600">
                                {item.pelamar.status || "—"}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <span
                                className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold ${gayaKeputusan(item.keputusan)}`}
                              >
                                {item.keputusan}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <p className="mt-3 text-xs leading-5 text-slate-500">
                    Nilai rata-rata merupakan perhitungan dari tiga kriteria
                    penilaian. Keputusan akhir tetap ditetapkan oleh pemilik
                    usaha.
                  </p>
                </section>

                <section className="print-notes print-card rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <h2 className="text-lg font-bold text-slate-900">
                    Catatan Penilaian
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Catatan dan keputusan untuk setiap rekaman penilaian.
                  </p>

                  <div className="mt-5 grid gap-3 lg:grid-cols-2">
                    {dataTersaring.map((item) => (
                      <article
                        key={item.id_penilaian}
                        className="break-inside-avoid rounded-xl border border-slate-200 p-4"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <h3 className="font-bold text-slate-900">
                              {item.pelamar.nama}
                            </h3>
                            <p className="mt-1 text-xs text-slate-500">
                              {formatTanggal(item.created_at)}
                            </p>
                          </div>
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${gayaKeputusan(item.keputusan)}`}
                          >
                            {item.keputusan}
                          </span>
                        </div>

                        <div className="mt-4 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2.5">
                          <span className="text-sm text-slate-600">
                            Nilai rata-rata
                          </span>
                          <span className="font-bold tabular-nums text-slate-900">
                            {rataRata(item).toFixed(2)}
                          </span>
                        </div>

                        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                          <span className="font-semibold text-slate-700">
                            Catatan:{" "}
                          </span>
                          {item.catatan || "Tidak ada catatan."}
                        </p>
                      </article>
                    ))}
                  </div>
                </section>

                <footer className="text-xs leading-5 text-slate-500">
                  Laporan ini merangkum catatan penilaian yang tersimpan pada
                  sistem. Satu kandidat dapat memiliki lebih dari satu catatan
                  penilaian; karena itu, jumlah penilaian tidak selalu sama
                  dengan jumlah kandidat unik.
                </footer>
              </>
            )}
          </>
        )}
      </div>
    </main>
  );
}