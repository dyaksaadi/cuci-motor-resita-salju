
"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

export default function HalamanDaftar() {
  const [nama, setNama] = useState("");
  const [telepon, setTelepon] = useState("");
  const [pengalaman, setPengalaman] = useState("");
  const [lamaPengalaman, setLamaPengalaman] = useState("");
  const [sedangMengirim, setSedangMengirim] = useState(false);
  const [pesan, setPesan] = useState("");
  const [berhasil, setBerhasil] = useState(false);

  async function kirimPendaftaran(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setPesan("");
    setBerhasil(false);
    setSedangMengirim(true);

    try {
      const response = await fetch("/api/daftar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nama,
          no_telepon: telepon,
          pengalaman_kerja: pengalaman,
          lama_pengalaman:
            lamaPengalaman === "" ? null : Number(lamaPengalaman),
        }),
      });

      let hasil: { pesan?: string; message?: string; detail?: string } | null = null;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        try {
          hasil = await response.json();
        } catch {
          hasil = null;
        }
      }

      if (!response.ok) {
        const detailPesan = hasil?.detail ? ` (${hasil.detail})` : "";
        const pesanGagal =
          hasil?.pesan ||
          hasil?.message ||
          (response.status === 404
            ? "Endpoint pendaftaran (/api/daftar) tidak ditemukan (404)."
            : response.status >= 500
              ? `Server mengalami kendala (HTTP ${response.status})${detailPesan}. Coba beberapa saat lagi.`
              : `Pendaftaran gagal dikirim (HTTP ${response.status}).`);
        setPesan(pesanGagal);
        return;
      }

      setBerhasil(true);
      setPesan(
        hasil?.pesan ||
          "Pendaftaran berhasil dikirim. Terima kasih telah melamar pekerjaan di Cuci Motor Resita Salju."
      );

      setNama("");
      setTelepon("");
      setPengalaman("");
      setLamaPengalaman("");
    } catch (error) {
      console.error("Kesalahan jaringan/daftar:", error);
      const detailError =
        error instanceof Error && error.message
          ? `: ${error.message}`
          : "";
      setPesan(
        `Tidak dapat terhubung ke server. Periksa koneksi lalu coba lagi${detailError}.`
      );
    } finally {
      setSedangMengirim(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100 sm:py-16">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/"
          className="text-sm text-slate-400 transition hover:text-white"
        >
          ← Kembali ke halaman utama
        </Link>

        <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl sm:p-9">
          <div className="mb-7">
            <p className="text-sm font-semibold uppercase tracking-widest text-sky-400">
              Rekrutmen karyawan
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Formulir Lamaran Kerja
            </h1>

            <p className="mt-3 leading-7 text-slate-400">
              Cuci Motor Resita Salju membuka kesempatan bagi calon pekerja
              yang memiliki keterampilan, ketelitian, dan tanggung jawab
              dalam bekerja.
            </p>
          </div>

          {pesan && (
            <div
              role="status"
              className={`mb-6 rounded-xl border p-4 text-sm leading-6 ${
                berhasil
                  ? "border-emerald-800 bg-emerald-950/50 text-emerald-300"
                  : "border-red-800 bg-red-950/50 text-red-300"
              }`}
            >
              {pesan}
            </div>
          )}

          {!berhasil && (
            <form onSubmit={kirimPendaftaran} className="space-y-5">
              <div>
                <label
                  htmlFor="nama"
                  className="mb-2 block text-sm font-medium"
                >
                  Nama lengkap *
                </label>
                <input
                  id="nama"
                  name="nama"
                  type="text"
                  autoComplete="name"
                  maxLength={100}
                  required
                  value={nama}
                  onChange={(event) => setNama(event.target.value)}
                  placeholder="Masukkan nama lengkap"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                />
              </div>

              <div>
                <label
                  htmlFor="telepon"
                  className="mb-2 block text-sm font-medium"
                >
                  Nomor telepon aktif *
                </label>
                <input
                  id="telepon"
                  name="telepon"
                  type="tel"
                  autoComplete="tel"
                  maxLength={20}
                  required
                  value={telepon}
                  onChange={(event) => setTelepon(event.target.value)}
                  placeholder="Contoh: 08xxxxxxxxxx"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                />
              </div>

              <div>
                <label
                  htmlFor="lamaPengalaman"
                  className="mb-2 block text-sm font-medium"
                >
                  Lama pengalaman kerja (tahun)
                </label>
                <input
                  id="lamaPengalaman"
                  name="lamaPengalaman"
                  type="number"
                  min={0}
                  max={100}
                  step={1}
                  value={lamaPengalaman}
                  onChange={(event) =>
                    setLamaPengalaman(event.target.value)
                  }
                  placeholder="Kosongkan jika belum pernah bekerja"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                />
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Belum memiliki pengalaman kerja? Kamu tetap bisa mendaftar.
                </p>
              </div>

              <div>
                <label
                  htmlFor="pengalaman"
                  className="mb-2 block text-sm font-medium"
                >
                  Pengalaman kerja atau keterampilan
                </label>
                <textarea
                  id="pengalaman"
                  name="pengalaman"
                  rows={4}
                  maxLength={2000}
                  value={pengalaman}
                  onChange={(event) => setPengalaman(event.target.value)}
                  placeholder="Ceritakan pengalaman kerja atau keterampilan yang kamu miliki."
                  className="w-full resize-y rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                />
              </div>

              <p className="text-xs leading-5 text-slate-500">
                Data yang kamu kirim akan digunakan untuk proses seleksi
                calon pekerja Cuci Motor Resita Salju.
              </p>

              <button
                type="submit"
                disabled={sedangMengirim}
                className="w-full rounded-xl bg-sky-500 px-5 py-3.5 font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {sedangMengirim
                  ? "Mengirim pendaftaran..."
                  : "Kirim Lamaran"}
              </button>
            </form>
          )}

          {berhasil && (
            <button
              type="button"
              onClick={() => {
                setPesan("");
                setBerhasil(false);
              }}
              className="rounded-xl bg-slate-700 px-5 py-3 font-medium transition hover:bg-slate-600"
            >
              Kirim lamaran lain
            </button>
          )}
        </section>

        <p className="mt-6 text-center text-xs text-slate-500">
          Cuci Motor Resita Salju
        </p>
      </div>
    </main>
  );
}
