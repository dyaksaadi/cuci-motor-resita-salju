
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  id_user: number;
  nama: string;
  username: string;
  role: string;
};

type Pelanggan = {
  id_pelanggan: number;
  nama: string;
};

type Transaksi = {
  id_transaksi: number;
  total: number;
  uang_dibayar: number;
  kembalian: number;
  metode: string;
  waktu_transaksi: string;
};

type Antrean = {
  id_antrean: number;
  id_pelanggan: number;
  nomor_antrean: number;
  status: string;
  waktu_masuk: string;
  tanggal_antrean: string;
  pelanggan: Pelanggan;
  transaksi: Transaksi | null;
};

const HARGA_CUCI = 8000;

const formatRupiah = (angka: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(angka);

const formatWaktu = (waktu: string) => {
  const tanggal = new Date(waktu);
  if (Number.isNaN(tanggal.getTime())) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(tanggal);
};

const formatTanggal = (tanggal: Date) =>
  new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(tanggal);

function Ikon({
  nama,
  className = "h-5 w-5",
}: {
  nama: string;
  className?: string;
}) {
  const umum = {
    className,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    viewBox: "0 0 24 24",
    "aria-hidden": true as const,
  };

  switch (nama) {
    case "motor":
      return (
        <svg {...umum}>
          <circle cx="6" cy="17" r="3" />
          <circle cx="18" cy="17" r="3" />
          <path d="M9 17h4l3-7h-5l-2 4H6" />
          <path d="m13 5 1-2m4 4 2-1M5 8 3 7" />
        </svg>
      );
    case "clock":
      return (
        <svg {...umum}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      );
    case "wash":
      return (
        <svg {...umum}>
          <path d="M12 3s-6 6.4-6 11a6 6 0 0 0 12 0c0-4.6-6-11-6-11Z" />
          <path d="M9 15a3 3 0 0 0 3 3" />
        </svg>
      );
    case "check":
      return (
        <svg {...umum}>
          <circle cx="12" cy="12" r="9" />
          <path d="m8 12 2.5 2.5L16 9" />
        </svg>
      );
    case "wallet":
      return (
        <svg {...umum}>
          <rect x="3" y="5" width="18" height="15" rx="2" />
          <path d="M3 9h18m-5 5h.01" />
          <path d="M7 5V3h11" />
        </svg>
      );
    case "history":
      return (
        <svg {...umum}>
          <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
          <path d="M3 3v5h5m4-1v5l3 2" />
        </svg>
      );
    case "users":
      return (
        <svg {...umum}>
          <circle cx="9" cy="8" r="3.5" />
          <path d="M3 20v-2a6 6 0 0 1 12 0v2M16 5a3.5 3.5 0 0 1 0 6.8M18 14a5 5 0 0 1 3 4.5V20" />
        </svg>
      );
    case "document":
      return (
        <svg {...umum}>
          <path d="M7 3h7l5 5v13H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
          <path d="M14 3v5h5M9 13h6m-6 4h6" />
        </svg>
      );
    case "report":
      return (
        <svg {...umum}>
          <path d="M4 20V10m8 10V4m8 16v-7" />
          <path d="M2 20h20" />
        </svg>
      );
    case "logout":
      return (
        <svg {...umum}>
          <path d="M10 17l5-5-5-5m5 5H3" />
          <path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" />
        </svg>
      );
    case "plus":
      return (
        <svg {...umum}>
          <path d="M12 5v14m-7-7h14" />
        </svg>
      );
    case "refresh":
      return (
        <svg {...umum}>
          <path d="M20 7v5h-5M4 17v-5h5" />
          <path d="M5.5 9A7 7 0 0 1 18 6l2 6M4 12l2 6a7 7 0 0 0 12.5-3" />
        </svg>
      );
    default:
      return null;
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
  nilai: string | number;
  keterangan: string;
  ikon: string;
  warna: string;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{judul}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
            {nilai}
          </p>
        </div>
        <div className={`rounded-xl p-3 ${warna}`}>
          <Ikon nama={ikon} className="h-6 w-6" />
        </div>
      </div>
      <p className="mt-3 text-xs leading-5 text-slate-500">{keterangan}</p>
    </section>
  );
}

function LabelStatus({ status }: { status: string }) {
  const gaya: Record<string, string> = {
    Menunggu: "border-amber-200 bg-amber-50 text-amber-800",
    "Sedang Dicuci": "border-blue-200 bg-blue-50 text-blue-800",
    Selesai: "border-emerald-200 bg-emerald-50 text-emerald-800",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold ${
        gaya[status] ?? "border-slate-200 bg-slate-50 text-slate-600"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          status === "Menunggu"
            ? "bg-amber-500"
            : status === "Sedang Dicuci"
              ? "bg-blue-500"
              : status === "Selesai"
                ? "bg-emerald-500"
                : "bg-slate-400"
        }`}
      />
      {status}
    </span>
  );
}

export default function HomePage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [antrean, setAntrean] = useState<Antrean[]>([]);
  const [namaPelanggan, setNamaPelanggan] = useState("");
  const [uangDibayar, setUangDibayar] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingAntrean, setLoadingAntrean] = useState(false);
  const [loadingAksi, setLoadingAksi] = useState<number | null>(null);
  const [loadingBayar, setLoadingBayar] = useState<number | null>(null);
  const [loadingLogout, setLoadingLogout] = useState(false);
  const [tanggalSekarang] = useState(() => formatTanggal(new Date()));
  const [pesan, setPesan] = useState("");
  const [jenisPesan, setJenisPesan] = useState<"sukses" | "error">("sukses");
  const [cariAntrean, setCariAntrean] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua");

  const isOwner = user?.role === "owner";

  function tampilkanPesan(teks: string, jenis: "sukses" | "error" = "sukses") {
    setPesan(teks);
    setJenisPesan(jenis);
  }

  const ambilData = useCallback(async () => {
    try {
      const userResponse = await fetch("/api/me", { cache: "no-store" });
      let userResult: { berhasil?: boolean; data?: User; pesan?: string } | null = null;
      const userCt = userResponse.headers.get("content-type");
      if (userCt && userCt.includes("application/json")) {
        try {
          userResult = await userResponse.json();
        } catch {
          userResult = null;
        }
      }

      if (!userResponse.ok || !userResult?.berhasil) {
        router.replace("/login");
        return;
      }

      if (userResult.data) {
        setUser(userResult.data);
      }

      const antreanResponse = await fetch("/api/antrean", {
        cache: "no-store",
      });
      let antreanResult: {
        berhasil?: boolean;
        data?: Antrean[];
        pesan?: string;
      } | null = null;
      const antreanCt = antreanResponse.headers.get("content-type");
      if (antreanCt && antreanCt.includes("application/json")) {
        try {
          antreanResult = await antreanResponse.json();
        } catch {
          antreanResult = null;
        }
      }

      if (!antreanResponse.ok || !antreanResult?.berhasil) {
        tampilkanPesan(
          antreanResult?.pesan ||
            `Gagal mengambil data antrean (HTTP ${antreanResponse.status}).`,
          "error"
        );
        return;
      }

      setAntrean(Array.isArray(antreanResult.data) ? antreanResult.data : []);
    } catch (error) {
      console.error("Dashboard error:", error);
      const detail =
        error instanceof Error && error.message ? `: ${error.message}` : "";
      tampilkanPesan(
        `Gagal mengambil data dashboard. Coba muat ulang${detail}.`,
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void ambilData();

    const interval = setInterval(() => {
      void ambilData();
    }, 1000);

    return () => clearInterval(interval);
  }, [ambilData]);

  const sedangMengirimAntrean = useRef(false);

  async function tambahAntrean(event: React.FormEvent<HTMLFormElement>) {
    if (sedangMengirimAntrean.current) return;
    sedangMengirimAntrean.current = true;
    event.preventDefault();

    if (!namaPelanggan.trim()) {
      tampilkanPesan("Nama pelanggan wajib diisi.", "error");
      return;
    }

    setLoadingAntrean(true);
    setPesan("");

    try {
      const response = await fetch("/api/antrean", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama: namaPelanggan.trim() }),
      });

      let result: { berhasil?: boolean; data?: Antrean; pesan?: string } | null = null;
      const ct = response.headers.get("content-type");
      if (ct && ct.includes("application/json")) {
        try {
          result = await response.json();
        } catch {
          result = null;
        }
      }

      if (!response.ok || !result?.berhasil) {
        tampilkanPesan(
          result?.pesan || `Gagal menambahkan antrean (HTTP ${response.status}).`,
          "error"
        );
        return;
      }

      tampilkanPesan(
        `Pelanggan berhasil ditambahkan. Nomor antrean ${String(
          result.data?.nomor_antrean ?? ""
        ).padStart(2, "0")}.`
      );

      setNamaPelanggan("");
      await ambilData();
    } catch (error) {
      console.error(error);
      const detail =
        error instanceof Error && error.message ? `: ${error.message}` : "";
      tampilkanPesan(`Gagal menambahkan antrean${detail}.`, "error");
    } finally {
      sedangMengirimAntrean.current = false;
      setLoadingAntrean(false);
    }
  }

  async function ubahStatus(idAntrean: number, statusBaru: string) {
    setLoadingAksi(idAntrean);
    setPesan("");

    try {
      const response = await fetch(`/api/antrean/${idAntrean}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: statusBaru }),
      });

      let result: { berhasil?: boolean; pesan?: string } | null = null;
      const ct = response.headers.get("content-type");
      if (ct && ct.includes("application/json")) {
        try {
          result = await response.json();
        } catch {
          result = null;
        }
      }

      if (!response.ok || !result?.berhasil) {
        tampilkanPesan(
          result?.pesan || `Gagal memperbarui status (HTTP ${response.status}).`,
          "error"
        );
        return;
      }

      setAntrean((daftar) =>
        daftar.map((item) =>
          item.id_antrean === idAntrean
            ? { ...item, status: statusBaru }
            : item
        )
      );
      tampilkanPesan(`Status antrean berhasil diubah menjadi ${statusBaru}.`);
      await ambilData();
    } catch (error) {
      console.error(error);
      const detail =
        error instanceof Error && error.message ? `: ${error.message}` : "";
      tampilkanPesan(`Gagal memperbarui status antrean${detail}.`, "error");
    } finally {
      setLoadingAksi(null);
    }
  }

  async function catatPembayaran(idAntrean: number) {
    if (!uangDibayar.trim()) {
      tampilkanPesan("Masukkan uang yang dibayar pelanggan.", "error");
      return;
    }

    const uang = Number(uangDibayar);

    if (!Number.isSafeInteger(uang) || uang < HARGA_CUCI) {
      tampilkanPesan(
        `Uang pelanggan harus berupa angka bulat minimal ${formatRupiah(
          HARGA_CUCI
        )}.`,
        "error"
      );
      return;
    }

    setLoadingBayar(idAntrean);
    setPesan("");

    try {
      const response = await fetch("/api/transaksi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_antrean: idAntrean,
          total: HARGA_CUCI,
          uang_dibayar: uang,
          metode: "Cash",
        }),
      });

      let result: { berhasil?: boolean; pesan?: string } | null = null;
      const ct = response.headers.get("content-type");
      if (ct && ct.includes("application/json")) {
        try {
          result = await response.json();
        } catch {
          result = null;
        }
      }

      if (!response.ok || !result?.berhasil) {
        tampilkanPesan(
          result?.pesan || `Gagal mencatat pembayaran (HTTP ${response.status}).`,
          "error"
        );
        return;
      }

      tampilkanPesan(
        `Pembayaran berhasil. Total ${formatRupiah(
          HARGA_CUCI
        )}, uang dibayar ${formatRupiah(uang)}, kembalian ${formatRupiah(
          uang - HARGA_CUCI
        )}.`
      );

      setUangDibayar("");
      await ambilData();
    } catch (error) {
      console.error(error);
      const detail =
        error instanceof Error && error.message ? `: ${error.message}` : "";
      tampilkanPesan(`Gagal mencatat pembayaran${detail}.`, "error");
    } finally {
      setLoadingBayar(null);
    }
  }

  async function logout() {
    setLoadingLogout(true);

    try {
      const response = await fetch("/api/logout", { method: "POST" });

      if (!response.ok) {
        tampilkanPesan(
          `Logout gagal (HTTP ${response.status}). Silakan coba lagi.`,
          "error"
        );
        setLoadingLogout(false);
        return;
      }

      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error(error);
      const detail =
        error instanceof Error && error.message ? `: ${error.message}` : "";
      tampilkanPesan(`Gagal logout. Periksa koneksi dan coba lagi${detail}.`, "error");
      setLoadingLogout(false);
    }
  }

  const jumlahMenunggu = antrean.filter(
    (item) => item.status === "Menunggu"
  ).length;

  const jumlahDicuci = antrean.filter(
    (item) => item.status === "Sedang Dicuci"
  ).length;

  const jumlahSelesai = antrean.filter(
    (item) => item.status === "Selesai"
  ).length;

  const totalPendapatan = antrean.reduce(
    (total, item) => total + (item.transaksi?.total ?? 0),
    0
  );

  const antreanTerfilter = antrean.filter((item) => {
    const cocokNama = item.pelanggan.nama
      .toLowerCase()
      .includes(cariAntrean.trim().toLowerCase());

    const cocokNomor = String(item.nomor_antrean).includes(
      cariAntrean.trim()
    );

    const cocokStatus =
      filterStatus === "Semua" || item.status === filterStatus;

    return (cocokNama || cocokNomor) && cocokStatus;
  });

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-700" />
          <h1 className="mt-5 text-lg font-bold text-slate-900">
            Memuat dashboard
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Sedang mengambil data pengguna dan antrean.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-700 text-white shadow-sm">
              <Ikon nama="motor" className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-base font-extrabold tracking-tight text-slate-950 sm:text-lg">
                Resita Salju
              </h1>
              <p className="truncate text-xs text-slate-500 sm:text-sm">
                Sistem Manajemen Pencucian Motor
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            {user && (
              <div className="hidden text-right sm:block">
                <p className="max-w-40 truncate text-sm font-semibold text-slate-900">
                  {user.nama}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {isOwner ? "Owner" : "Washer"}
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={logout}
              disabled={loadingLogout}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 focus:outline-none focus:ring-4 focus:ring-red-100 disabled:opacity-50 sm:px-4"
            >
              <Ikon nama="logout" className="h-4 w-4" />
              <span>{loadingLogout ? "Keluar..." : "Logout"}</span>
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-9 lg:px-8">
        <section className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-blue-700">
              <span className="h-2 w-2 rounded-full bg-blue-600" />
              Dashboard
            </div>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
              Antrean Hari Ini
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Pantau proses pencucian dan aktivitas usaha.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Tanggal
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-800">
              {tanggalSekarang || "Memuat tanggal..."}
            </p>
          </div>
        </section>

        {pesan && (
          <div
            role="status"
            aria-live="polite"
            className={`mb-6 flex items-start justify-between gap-4 rounded-xl border p-4 ${
              jenisPesan === "error"
                ? "border-red-200 bg-red-50 text-red-800"
                : "border-emerald-200 bg-emerald-50 text-emerald-800"
            }`}
          >
            <p className="text-sm font-medium leading-6">{pesan}</p>
            <button
              type="button"
              onClick={() => setPesan("")}
              aria-label="Tutup pesan"
              className="rounded-md px-2 py-1 text-lg leading-none opacity-70 hover:opacity-100"
            >
              ×
            </button>
          </div>
        )}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KartuStatistik
            judul="Menunggu"
            nilai={jumlahMenunggu}
            keterangan="Pelanggan menunggu giliran."
            ikon="clock"
            warna="bg-amber-50 text-amber-700"
          />
          <KartuStatistik
            judul="Sedang Dicuci"
            nilai={jumlahDicuci}
            keterangan="Kendaraan dalam proses pencucian."
            ikon="wash"
            warna="bg-blue-50 text-blue-700"
          />
          <KartuStatistik
            judul="Selesai"
            nilai={jumlahSelesai}
            keterangan="Pencucian yang sudah diselesaikan."
            ikon="check"
            warna="bg-emerald-50 text-emerald-700"
          />
          {isOwner && (
            <KartuStatistik
              judul="Pendapatan"
              nilai={formatRupiah(totalPendapatan)}
              keterangan="Total transaksi dari data antrean yang ditampilkan."
              ikon="wallet"
              warna="bg-indigo-50 text-indigo-700"
            />
          )}
        </section>

        {isOwner && (
          <section className="mt-9">
            <div className="mb-4">
              <h3 className="text-xl font-bold tracking-tight text-slate-950">
                Menu Manajemen
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Akses halaman pengelolaan usaha dan proses rekrutmen.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  judul: "Riwayat Transaksi",
                  deskripsi: "Lihat catatan pembayaran dan pendapatan.",
                  ikon: "history",
                  url: "/riwayat",
                  warna: "bg-blue-50 text-blue-700",
                },
                {
                  judul: "Manajemen Pengguna",
                  deskripsi: "Kelola akun Owner dan Washer.",
                  ikon: "users",
                  url: "/pengguna",
                  warna: "bg-violet-50 text-violet-700",
                },
                {
                  judul: "Pelamar",
                  deskripsi: "Kelola data dan penilaian kandidat.",
                  ikon: "document",
                  url: "/pelamar",
                  warna: "bg-amber-50 text-amber-700",
                },
                {
                  judul: "Laporan Rekrutmen",
                  deskripsi: "Tinjau dan cetak hasil seleksi.",
                  ikon: "report",
                  url: "/laporan-rekrutmen",
                  warna: "bg-emerald-50 text-emerald-700",
                },
              ].map((menu) => (
                <button
                  key={menu.url}
                  type="button"
                  onClick={() => router.push(menu.url)}
                  className="group flex h-full items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-blue-100"
                >
                  <span
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${menu.warna}`}
                  >
                    <Ikon nama={menu.ikon} className="h-6 w-6" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold text-slate-900">
                      {menu.judul}
                    </span>
                    <span className="mt-1 block text-sm leading-5 text-slate-500">
                      {menu.deskripsi}
                    </span>
                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-blue-700">
                      Buka halaman
                      <span
                        aria-hidden="true"
                        className="transition-transform group-hover:translate-x-1"
                      >
                        →
                      </span>
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        {isOwner && (
          <section className="mt-9 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                <Ikon nama="plus" className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-950">
                  Tambah Antrean
                </h3>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Masukkan nama pelanggan untuk mencatat antrean baru.
                </p>
              </div>
            </div>

            <form
              onSubmit={tambahAntrean}
              className="mt-6 flex flex-col gap-3 sm:flex-row"
            >
              <div className="flex-1">
                <label
                  htmlFor="nama-pelanggan"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Nama pelanggan
                </label>
                <input
                  id="nama-pelanggan"
                  type="text"
                  value={namaPelanggan}
                  onChange={(event) => setNamaPelanggan(event.target.value)}
                  placeholder="Contoh: Budi"
                  maxLength={100}
                  disabled={loadingAntrean}
                  className="min-h-12 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50"
                />
              </div>
              <div className="sm:self-end">
                <button
                  type="submit"
                  disabled={loadingAntrean}
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  {loadingAntrean ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Menambahkan...
                    </>
                  ) : (
                    <>
                      <Ikon nama="plus" className="h-4 w-4" />
                      Tambah Antrean
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="mt-9 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5 sm:p-7">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div>
                <h3 className="text-xl font-bold tracking-tight text-slate-950">
                  Daftar Antrean
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Pantau pelanggan berdasarkan nomor antrean.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">
                  {antrean.length} antrean
                </span>
                <button
                  type="button"
                  onClick={() => void ambilData()}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-blue-100"
                >
                  <Ikon nama="refresh" className="h-4 w-4" />
                  Muat ulang
                </button>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="cari-antrean"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500"
                >
                  Cari pelanggan
                </label>
                <input
                  id="cari-antrean"
                  type="search"
                  value={cariAntrean}
                  onChange={(event) => setCariAntrean(event.target.value)}
                  placeholder="Nama atau nomor antrean..."
                  className="min-h-11 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div>
                <label
                  htmlFor="filter-status"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500"
                >
                  Filter status
                </label>
                <select
                  id="filter-status"
                  value={filterStatus}
                  onChange={(event) => setFilterStatus(event.target.value)}
                  className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                >
                  <option value="Semua">Semua status</option>
                  <option value="Menunggu">Menunggu</option>
                  <option value="Sedang Dicuci">Sedang Dicuci</option>
                  <option value="Selesai">Selesai</option>
                </select>
              </div>
            </div>
          </div>

          {antrean.length === 0 ? (
            <div className="px-5 py-16 text-center sm:px-8">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                <Ikon nama="motor" className="h-7 w-7" />
              </div>
              <h4 className="mt-4 font-bold text-slate-900">
                Belum ada antrean
              </h4>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                {isOwner
                  ? "Tambahkan nama pelanggan melalui formulir di atas untuk memulai pencatatan antrean."
                  : "Antrean pelanggan akan ditampilkan di sini ketika tersedia."}
              </p>
            </div>
          ) : antreanTerfilter.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <p className="font-semibold text-slate-800">
                Antrean tidak ditemukan
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Coba ubah kata pencarian atau filter status.
              </p>
              <button
                type="button"
                onClick={() => {
                  setCariAntrean("");
                  setFilterStatus("Semua");
                }}
                className="mt-4 rounded-lg px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50"
              >
                Reset filter
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] border-collapse text-left">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Antrean
                    </th>
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Pelanggan
                    </th>
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Waktu masuk
                    </th>
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Status
                    </th>
                    {isOwner && (
                      <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                        Pembayaran
                      </th>
                    )}
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Aksi
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {antreanTerfilter.map((item) => (
                    <tr
                      key={item.id_antrean}
                      className="transition hover:bg-slate-50/80"
                    >
                      <td className="px-5 py-5">
                        <span className="inline-flex h-11 min-w-11 items-center justify-center rounded-xl bg-blue-50 px-3 text-lg font-extrabold text-blue-800">
                          {String(item.nomor_antrean).padStart(2, "0")}
                        </span>
                      </td>

                      <td className="px-5 py-5">
                        <p className="font-semibold text-slate-900">
                          {item.pelanggan.nama}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Pelanggan pencucian
                        </p>
                      </td>

                      <td className="whitespace-nowrap px-5 py-5 text-sm text-slate-600">
                        {formatWaktu(item.waktu_masuk)}
                      </td>

                      <td className="px-5 py-5">
                        <LabelStatus status={item.status} />
                      </td>

                      {isOwner && (
                        <td className="px-5 py-5">
                          {item.transaksi ? (
                            <div className="min-w-[180px] space-y-1.5">
                              <p className="font-bold text-slate-900">
                                {formatRupiah(item.transaksi.total)}
                              </p>
                              <p className="text-xs text-slate-500">
                                Dibayar:{" "}
                                {formatRupiah(item.transaksi.uang_dibayar)}
                              </p>
                              <p className="text-xs font-semibold text-emerald-700">
                                Kembalian:{" "}
                                {formatRupiah(item.transaksi.kembalian)}
                              </p>
                              <span className="inline-flex rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                                {item.transaksi.metode}
                              </span>
                            </div>
                          ) : item.status === "Selesai" ? (
                            <div className="w-52 space-y-3">
                              <div className="rounded-xl bg-slate-50 p-3">
                                <p className="text-xs font-medium text-slate-500">
                                  Total pembayaran
                                </p>
                                <p className="mt-1 font-bold text-slate-950">
                                  {formatRupiah(HARGA_CUCI)}
                                </p>
                              </div>

                              <div>
                                <label
                                  htmlFor={`uang-${item.id_antrean}`}
                                  className="mb-1.5 block text-xs font-semibold text-slate-600"
                                >
                                  Uang dari pelanggan (Rp)
                                </label>
                                <input
                                  id={`uang-${item.id_antrean}`}
                                  type="number"
                                  min={HARGA_CUCI}
                                  step="1"
                                  value={uangDibayar}
                                  onChange={(event) =>
                                    setUangDibayar(event.target.value)
                                  }
                                  placeholder="Contoh: 10000"
                                  disabled={loadingBayar !== null}
                                  className="min-h-10 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50"
                                />
                              </div>

                              {uangDibayar.trim() !== "" &&
                                Number.isSafeInteger(Number(uangDibayar)) &&
                                Number(uangDibayar) >= HARGA_CUCI && (
                                  <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3">
                                    <p className="text-xs font-medium text-emerald-700">
                                      Kembalian
                                    </p>
                                    <p className="mt-1 text-lg font-extrabold text-emerald-800">
                                      {formatRupiah(
                                        Number(uangDibayar) - HARGA_CUCI
                                      )}
                                    </p>
                                  </div>
                                )}

                              <button
                                type="button"
                                disabled={loadingBayar !== null}
                                onClick={() =>
                                  void catatPembayaran(item.id_antrean)
                                }
                                className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg bg-blue-700 px-3 py-2 text-sm font-bold text-white transition hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {loadingBayar === item.id_antrean
                                  ? "Memproses..."
                                  : "Catat Pembayaran"}
                              </button>
                            </div>
                          ) : (
                            <span className="text-sm text-slate-400">
                              Menunggu pencucian selesai
                            </span>
                          )}
                        </td>
                      )}

                      <td className="px-5 py-5">
                        {item.status === "Menunggu" && (
                          <button
                            type="button"
                            disabled={loadingAksi !== null}
                            onClick={() =>
                              void ubahStatus(
                                item.id_antrean,
                                "Sedang Dicuci"
                              )
                            }
                            className="inline-flex min-h-10 items-center justify-center whitespace-nowrap rounded-lg bg-blue-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {loadingAksi === item.id_antrean
                              ? "Memproses..."
                              : "Mulai Cuci"}
                          </button>
                        )}

                        {item.status === "Sedang Dicuci" && (
                          <button
                            type="button"
                            disabled={loadingAksi !== null}
                            onClick={() =>
                              void ubahStatus(item.id_antrean, "Selesai")
                            }
                            className="inline-flex min-h-10 items-center justify-center whitespace-nowrap rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {loadingAksi === item.id_antrean
                              ? "Memproses..."
                              : "Selesaikan"}
                          </button>
                        )}

                        {item.status === "Selesai" && (
                          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
                            <Ikon nama="check" className="h-4 w-4" />
                            Selesai
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {antreanTerfilter.length > 0 && (
            <div className="border-t border-slate-200 bg-slate-50 px-5 py-3.5">
              <p className="text-xs text-slate-500">
                Menampilkan{" "}
                <span className="font-bold text-slate-700">
                  {antreanTerfilter.length}
                </span>{" "}
                dari{" "}
                <span className="font-bold text-slate-700">
                  {antrean.length}
                </span>{" "}
                antrean.
              </p>
            </div>
          )}
        </section>

        <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <Ikon nama="users" className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-slate-900">
                Anda masuk sebagai {isOwner ? "Owner" : "Washer"}
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                {isOwner
                  ? "Anda dapat mengelola antrean, pembayaran, riwayat transaksi, pengguna, pelamar, dan laporan rekrutmen."
                  : "Anda dapat melihat antrean serta memperbarui status pencucian sesuai tugas Anda."}
              </p>
            </div>
          </div>
        </section>

        <footer className="py-8 text-center">
          <p className="text-xs font-medium text-slate-500">
            © {new Date().getFullYear()} Cuci Motor Resita Salju
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Sistem Manajemen Pencucian Motor
          </p>
        </footer>
      </div>
    </main>
  );
}