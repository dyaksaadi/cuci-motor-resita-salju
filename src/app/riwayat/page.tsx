
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  id_user: number;
  nama: string;
  username: string;
  role: string;
};

type Transaksi = {
  id_transaksi: number;
  total: number;
  metode: string;
  waktu_transaksi: string;
  antrean: {
    nomor_antrean: number;
    pelanggan: {
      nama: string;
    };
  };
};

export default function RiwayatPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [transaksi, setTransaksi] = useState<Transaksi[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorData, setErrorData] = useState("");
  const [kataKunci, setKataKunci] = useState("");
  const [tanggalAwal, setTanggalAwal] = useState("");
  const [tanggalAkhir, setTanggalAkhir] = useState("");
  const [metodeFilter, setMetodeFilter] = useState("Semua");

  const formatRupiah = (angka: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(angka);

  const formatWaktu = (waktu: string) =>
    new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(new Date(waktu));

  const ambilData = useCallback(async () => {
    setLoading(true);
    setErrorData("");

    try {
      const userResponse = await fetch("/api/me", {
        cache: "no-store",
      });

      let userResult: { berhasil?: boolean; data?: User; pesan?: string } | null = null;
      const userCt = userResponse.headers.get("content-type");
      if (userCt && userCt.includes("application/json")) {
        try {
          userResult = await userResponse.json();
        } catch {
          userResult = null;
        }
      }

      if (!userResponse.ok || !userResult?.berhasil || !userResult.data) {
        router.replace("/login");
        return;
      }

      if (userResult.data.role !== "owner") {
        alert("Anda tidak memiliki akses ke halaman ini.");
        router.replace("/");
        return;
      }

      setUser(userResult.data);

      const transaksiResponse = await fetch("/api/transaksi", {
        cache: "no-store",
      });

      let transaksiResult: {
        berhasil?: boolean;
        data?: Transaksi[];
        pesan?: string;
      } | null = null;
      const trxCt = transaksiResponse.headers.get("content-type");
      if (trxCt && trxCt.includes("application/json")) {
        try {
          transaksiResult = await transaksiResponse.json();
        } catch {
          transaksiResult = null;
        }
      }

      if (!transaksiResponse.ok || !transaksiResult?.berhasil) {
        setErrorData(
          transaksiResult?.pesan ||
            `Gagal mengambil riwayat transaksi (HTTP ${transaksiResponse.status}).`
        );
        return;
      }

      setTransaksi(Array.isArray(transaksiResult.data) ? transaksiResult.data : []);
    } catch (error) {
      console.error(error);
      const detail =
        error instanceof Error && error.message ? `: ${error.message}` : "";
      setErrorData(`Gagal terhubung ke server. Silakan coba lagi${detail}.`);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    let aktif = true;

    async function muatAwal() {
      try {
        const userResponse = await fetch("/api/me", {
          cache: "no-store",
        });

        let userResult: { berhasil?: boolean; data?: User; pesan?: string } | null = null;
        const userCt = userResponse.headers.get("content-type");
        if (userCt && userCt.includes("application/json")) {
          try {
            userResult = await userResponse.json();
          } catch {
            userResult = null;
          }
        }

        if (!userResponse.ok || !userResult?.berhasil || !userResult.data) {
          router.replace("/login");
          return;
        }

        if (userResult.data.role !== "owner") {
          alert("Anda tidak memiliki akses ke halaman ini.");
          router.replace("/");
          return;
        }

        if (aktif) {
          setUser(userResult.data);
        }

        const transaksiResponse = await fetch("/api/transaksi", {
          cache: "no-store",
        });

        let transaksiResult: {
          berhasil?: boolean;
          data?: Transaksi[];
          pesan?: string;
        } | null = null;
        const trxCt = transaksiResponse.headers.get("content-type");
        if (trxCt && trxCt.includes("application/json")) {
          try {
            transaksiResult = await transaksiResponse.json();
          } catch {
            transaksiResult = null;
          }
        }

        if (!transaksiResponse.ok || !transaksiResult?.berhasil) {
          if (aktif) {
            setErrorData(
              transaksiResult?.pesan ||
                `Gagal mengambil riwayat transaksi (HTTP ${transaksiResponse.status}).`
            );
          }
          return;
        }

        if (aktif) {
          setTransaksi(Array.isArray(transaksiResult.data) ? transaksiResult.data : []);
        }
      } catch (error) {
        console.error(error);
        if (aktif) {
          const detail =
            error instanceof Error && error.message ? `: ${error.message}` : "";
          setErrorData(`Gagal terhubung ke server. Silakan coba lagi${detail}.`);
        }
      } finally {
        if (aktif) {
          setLoading(false);
        }
      }
    }

    void muatAwal();

    return () => {
      aktif = false;
    };
  }, [router]);

  async function logout() {
    try {
      const response = await fetch("/api/logout", {
        method: "POST",
      });

      if (!response.ok) {
        alert("Gagal logout. Silakan coba lagi.");
        return;
      }

      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Gagal logout.");
    }
  }

  const transaksiTerfilter = transaksi.filter((item) => {
    const kata = kataKunci.trim().toLowerCase();
    const waktu = new Date(item.waktu_transaksi);

    const cocokKata =
      kata === "" ||
      item.antrean.pelanggan.nama.toLowerCase().includes(kata) ||
      String(item.antrean.nomor_antrean).includes(kata) ||
      String(item.id_transaksi).includes(kata);

    const tanggalTransaksi = [
      waktu.getFullYear(),
      String(waktu.getMonth() + 1).padStart(2, "0"),
      String(waktu.getDate()).padStart(2, "0"),
    ].join("-");

    const cocokTanggalAwal =
      tanggalAwal === "" || tanggalTransaksi >= tanggalAwal;

    const cocokTanggalAkhir =
      tanggalAkhir === "" || tanggalTransaksi <= tanggalAkhir;

    const cocokMetode =
      metodeFilter === "Semua" ||
      item.metode.toLowerCase() === metodeFilter.toLowerCase();

    return (
      cocokKata &&
      cocokTanggalAwal &&
      cocokTanggalAkhir &&
      cocokMetode
    );
  });

  const totalPendapatan = transaksi.reduce(
    (total, item) => total + item.total,
    0
  );

  const pendapatanTerfilter = transaksiTerfilter.reduce(
    (total, item) => total + item.total,
    0
  );

  const metodeTersedia = Array.from(
    new Set(transaksi.map((item) => item.metode))
  );

  function resetFilter() {
    setKataKunci("");
    setTanggalAwal("");
    setTanggalAkhir("");
    setMetodeFilter("Semua");
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div>
            <p className="text-sm font-semibold tracking-wide text-blue-700">
              CUCI MOTOR RESITA SALJU
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              Riwayat Transaksi
            </h1>
            <p className="mt-2 text-base text-slate-600">
              Pantau pembayaran dan pendapatan usaha.
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push("/")}
            className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:self-auto"
          >
            <span aria-hidden="true">←</span>
            Kembali ke Dashboard
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {user && (
          <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-800">
                {user.nama.charAt(0).toUpperCase()}
              </div>

              <div>
                <p className="text-base font-bold text-slate-900">
                  {user.nama}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Akun Owner · Pengelola transaksi
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              className="min-h-11 rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Logout
            </button>
          </section>
        )}

        <section className="grid gap-4 md:grid-cols-2">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-600">
                  Total Transaksi
                </p>
                <p className="mt-3 text-3xl font-bold tabular-nums tracking-tight text-slate-950 sm:text-4xl">
                  {transaksi.length.toLocaleString("id-ID")}
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Seluruh transaksi yang tercatat
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-2xl">
                <span aria-hidden="true">▤</span>
              </div>
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-600">
                  Total Pendapatan
                </p>
                <p className="mt-3 break-words text-2xl font-bold tabular-nums tracking-tight text-emerald-700 sm:text-3xl">
                  {formatRupiah(totalPendapatan)}
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Akumulasi nilai seluruh transaksi
                </p>
              </div>

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-2xl">
                <span aria-hidden="true">↗</span>
              </div>
            </div>
          </article>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-950">
                  Daftar Transaksi
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Cari transaksi berdasarkan nama pelanggan, nomor antrean,
                  atau ID transaksi.
                </p>
              </div>

              <button
                type="button"
                onClick={() => void ambilData()}
                disabled={loading}
                className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Memuat..." : "Muat Ulang"}
              </button>
            </div>
          </div>

          <div className="border-b border-slate-200 bg-slate-50/70 p-5 sm:p-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="sm:col-span-2">
                <label
                  htmlFor="cari-transaksi"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Cari transaksi
                </label>
                <input
                  id="cari-transaksi"
                  type="search"
                  value={kataKunci}
                  onChange={(event) => setKataKunci(event.target.value)}
                  placeholder="Nama, nomor antrean, atau ID..."
                  className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label
                  htmlFor="tanggal-awal"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Dari tanggal
                </label>
                <input
                  id="tanggal-awal"
                  type="date"
                  value={tanggalAwal}
                  max={tanggalAkhir || undefined}
                  onChange={(event) => setTanggalAwal(event.target.value)}
                  className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-base text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label
                  htmlFor="tanggal-akhir"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Sampai tanggal
                </label>
                <input
                  id="tanggal-akhir"
                  type="date"
                  value={tanggalAkhir}
                  min={tanggalAwal || undefined}
                  onChange={(event) => setTanggalAkhir(event.target.value)}
                  className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-base text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="sm:col-span-2 lg:col-span-2">
                <label
                  htmlFor="metode-filter"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Metode pembayaran
                </label>
                <select
                  id="metode-filter"
                  value={metodeFilter}
                  onChange={(event) => setMetodeFilter(event.target.value)}
                  className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-base text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="Semua">Semua metode</option>
                  {metodeTersedia.map((metode) => (
                    <option key={metode} value={metode}>
                      {metode}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end sm:col-span-2 lg:col-span-2">
                <button
                  type="button"
                  onClick={resetFilter}
                  className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
                >
                  Reset Filter
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-sm text-slate-600">
              Menampilkan{" "}
              <span className="font-bold text-slate-900">
                {transaksiTerfilter.length}
              </span>{" "}
              dari{" "}
              <span className="font-bold text-slate-900">
                {transaksi.length}
              </span>{" "}
              transaksi
            </p>

            <p className="text-sm text-slate-600">
              Pendapatan hasil filter:{" "}
              <span className="font-bold text-emerald-700">
                {formatRupiah(pendapatanTerfilter)}
              </span>
            </p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-700" />
              <p className="mt-4 text-base font-semibold text-slate-700">
                Memuat riwayat transaksi
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Mohon tunggu sebentar.
              </p>
            </div>
          ) : errorData ? (
            <div className="p-8 sm:p-12">
              <div
                role="alert"
                className="mx-auto max-w-xl rounded-xl border border-red-200 bg-red-50 p-5 text-center"
              >
                <p className="font-bold text-red-800">
                  Gagal memuat transaksi
                </p>
                <p className="mt-2 text-sm leading-6 text-red-700">
                  {errorData}
                </p>
                <button
                  type="button"
                  onClick={() => void ambilData()}
                  className="mt-4 min-h-10 rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-800"
                >
                  Coba Lagi
                </button>
              </div>
            </div>
          ) : transaksiTerfilter.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl text-slate-500">
                <span aria-hidden="true">⌕</span>
              </div>
              <h3 className="mt-4 text-lg font-bold text-slate-900">
                {transaksi.length === 0
                  ? "Belum ada transaksi"
                  : "Transaksi tidak ditemukan"}
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
                {transaksi.length === 0
                  ? "Transaksi yang sudah dibayar akan muncul di halaman ini."
                  : "Coba ubah kata kunci atau tanggal, atau reset filter untuk melihat transaksi lainnya."}
              </p>
              {transaksi.length > 0 && (
                <button
                  type="button"
                  onClick={resetFilter}
                  className="mt-4 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
                >
                  Reset Filter
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-100">
                    <th
                      scope="col"
                      className="whitespace-nowrap px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-600"
                    >
                      No.
                    </th>
                    <th
                      scope="col"
                      className="whitespace-nowrap px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-600"
                    >
                      ID Transaksi
                    </th>
                    <th
                      scope="col"
                      className="whitespace-nowrap px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-600"
                    >
                      No. Antrean
                    </th>
                    <th
                      scope="col"
                      className="whitespace-nowrap px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-600"
                    >
                      Pelanggan
                    </th>
                    <th
                      scope="col"
                      className="whitespace-nowrap px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-slate-600"
                    >
                      Total
                    </th>
                    <th
                      scope="col"
                      className="whitespace-nowrap px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-600"
                    >
                      Metode
                    </th>
                    <th
                      scope="col"
                      className="whitespace-nowrap px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-600"
                    >
                      Waktu Transaksi
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {transaksiTerfilter.map((item, index) => (
                    <tr
                      key={item.id_transaksi}
                      className="transition-colors hover:bg-blue-50/50"
                    >
                      <td className="whitespace-nowrap px-5 py-4 text-sm font-medium tabular-nums text-slate-500">
                        {index + 1}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold tabular-nums text-slate-700">
                        TRX-{String(item.id_transaksi).padStart(4, "0")}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4">
                        <span className="inline-flex min-w-12 items-center justify-center rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-bold tabular-nums text-blue-800">
                          {String(item.antrean.nomor_antrean).padStart(
                            2,
                            "0"
                          )}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span className="block min-w-36 text-sm font-semibold text-slate-900">
                          {item.antrean.pelanggan.nama}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-right text-sm font-bold tabular-nums text-slate-900">
                        {formatRupiah(item.total)}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4">
                        <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                          {item.metode}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm tabular-nums text-slate-600">
                        {formatWaktu(item.waktu_transaksi)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && !errorData && transaksiTerfilter.length > 0 && (
            <div className="border-t border-slate-200 bg-slate-50 px-5 py-4 sm:px-6">
              <p className="text-xs leading-5 text-slate-500">
                Angka pendapatan di atas mengikuti transaksi yang berhasil
                dimuat dari server. Gunakan filter untuk melihat transaksi
                pada periode tertentu.
              </p>
            </div>
          )}
        </section>

        <footer className="pb-4 pt-2 text-center">
          <p className="text-sm font-medium text-slate-500">
            Cuci Motor Resita Salju
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Sistem Manajemen Pencucian Motor
          </p>
        </footer>
      </div>
    </main>
  );
}