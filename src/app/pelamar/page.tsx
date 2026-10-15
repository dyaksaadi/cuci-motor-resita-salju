
"use client";

import Link from "next/link";
import {
  type FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

type Penilaian = {
  id_penilaian: number;
  id_pelamar: number;
  nilai_praktik: number;
  nilai_ketelitian: number;
  nilai_tanggung_jawab: number;
  catatan: string | null;
  keputusan: string;
  created_at: string;
};

type Pelamar = {
  id_pelamar: number;
  nama: string;
  no_telepon: string;
  pengalaman_kerja: string | null;
  lama_pengalaman: number | null;
  status: string;
  created_at: string;
  penilaian: Penilaian[];
};

type ResponsAPI<T> = {
  berhasil?: boolean;
  data?: T;
  pesan?: string;
};

type FilterStatus =
  | "Semua"
  | "Menunggu Seleksi"
  | "Diterima"
  | "Ditolak";

const inputClass =
  "mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50";

const tombolUtama =
  "inline-flex items-center justify-center rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

function formatTanggal(tanggal: string) {
  const date = new Date(tanggal);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function warnaStatus(status: string) {
  if (status === "Diterima") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (status === "Ditolak") {
    return "border-red-200 bg-red-50 text-red-700";
  }

  return "border-amber-200 bg-amber-50 text-amber-800";
}

function hitungRataRata(nilai: Penilaian) {
  return (
    (nilai.nilai_praktik +
      nilai.nilai_ketelitian +
      nilai.nilai_tanggung_jawab) /
    3
  );
}

function penilaianTerbaru(pelamar: Pelamar) {
  return [...pelamar.penilaian].sort(
    (a, b) =>
      new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime() ||
      b.id_penilaian - a.id_penilaian
  )[0];
}

function PanelPedoman({
  judul,
  nomor,
  indikator,
}: {
  judul: string;
  nomor: string;
  indikator: string[];
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-sm font-bold text-blue-700">
          {nomor}
        </div>
        <h3 className="font-semibold text-slate-900">{judul}</h3>
      </div>

      <ul className="mt-4 space-y-2">
        {indikator.map((item) => (
          <li
            key={item}
            className="flex items-start gap-2 text-sm leading-6 text-slate-600"
          >
            <span className="mt-0.5 font-bold text-blue-600">✓</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Bagian({
  nomor,
  judul,
  deskripsi,
  children,
}: {
  nomor: string;
  judul: string;
  deskripsi: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-start gap-3 border-b border-slate-100 px-5 py-5 sm:px-6">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-sm font-bold text-blue-700">
          {nomor}
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">{judul}</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            {deskripsi}
          </p>
        </div>
      </div>

      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}

export default function HalamanPelamar() {
  const [pelamar, setPelamar] = useState<Pelamar[]>([]);
  const [memuat, setMemuat] = useState(true);
  const [menyimpanPelamar, setMenyimpanPelamar] = useState(false);
  const [menyimpanNilai, setMenyimpanNilai] = useState(false);
  const [idMemproses, setIdMemproses] = useState<number | null>(null);

  const [nama, setNama] = useState("");
  const [noTelepon, setNoTelepon] = useState("");
  const [pengalamanKerja, setPengalamanKerja] = useState("");
  const [lamaPengalaman, setLamaPengalaman] = useState("");

  const [idPelamar, setIdPelamar] = useState("");
  const [nilaiPraktik, setNilaiPraktik] = useState("");
  const [nilaiKetelitian, setNilaiKetelitian] = useState("");
  const [nilaiTanggungJawab, setNilaiTanggungJawab] = useState("");
  const [catatan, setCatatan] = useState("");

  const [kataKunci, setKataKunci] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("Semua");

  const [pesan, setPesan] = useState("");
  const [jenisPesan, setJenisPesan] = useState<"sukses" | "error">("sukses");

  const tampilkanPesan = (
    teks: string,
    jenis: "sukses" | "error"
  ) => {
    setPesan(teks);
    setJenisPesan(jenis);
  };

  const muatPelamar = useCallback(async () => {
    setMemuat(true);

    try {
      const respons = await fetch("/api/pelamar", {
        cache: "no-store",
      });

      let hasil: ResponsAPI<Pelamar[]> | null = null;
      const ct = respons.headers.get("content-type");
      if (ct && ct.includes("application/json")) {
        try {
          hasil = await respons.json();
        } catch {
          hasil = null;
        }
      }

      if (!respons.ok || !hasil || hasil.berhasil === false) {
        throw new Error(
          hasil?.pesan || `Gagal mengambil data pelamar (HTTP ${respons.status}).`
        );
      }

      const data = hasil.data ?? [];
      setPelamar(data);

      setIdPelamar((pilihanLama) => {
        if (
          pilihanLama &&
          data.some((item) => String(item.id_pelamar) === pilihanLama)
        ) {
          return pilihanLama;
        }

        return data.length > 0 ? String(data[0].id_pelamar) : "";
      });
    } catch (error) {
      tampilkanPesan(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat mengambil data pelamar.",
        "error"
      );
    } finally {
      setMemuat(false);
    }
  }, []);

  useEffect(() => {
    let aktif = true;

    async function muatAwal() {
      try {
        const respons = await fetch("/api/pelamar", {
          cache: "no-store",
        });

        let hasil: ResponsAPI<Pelamar[]> | null = null;
        const ct = respons.headers.get("content-type");
        if (ct && ct.includes("application/json")) {
          try {
            hasil = await respons.json();
          } catch {
            hasil = null;
          }
        }

        if (!respons.ok || !hasil || hasil.berhasil === false) {
          throw new Error(
            hasil?.pesan || `Gagal mengambil data pelamar (HTTP ${respons.status}).`
          );
        }

        const data = hasil.data ?? [];
        if (aktif) {
          setPelamar(data);

          setIdPelamar((pilihanLama) => {
            if (
              pilihanLama &&
              data.some((item) => String(item.id_pelamar) === pilihanLama)
            ) {
              return pilihanLama;
            }

            return data.length > 0 ? String(data[0].id_pelamar) : "";
          });
        }
      } catch (error) {
        if (aktif) {
          tampilkanPesan(
            error instanceof Error
              ? error.message
              : "Terjadi kesalahan saat mengambil data pelamar.",
            "error"
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

  const statistik = useMemo(
    () => ({
      total: pelamar.length,
      menunggu: pelamar.filter(
        (item) => item.status === "Menunggu Seleksi"
      ).length,
      diterima: pelamar.filter((item) => item.status === "Diterima").length,
      ditolak: pelamar.filter((item) => item.status === "Ditolak").length,
      belumDinilai: pelamar.filter(
        (item) => item.penilaian.length === 0
      ).length,
    }),
    [pelamar]
  );

  const peringkatKandidat = useMemo(() => {
    return pelamar
      .map((item) => {
        const terbaru = penilaianTerbaru(item);

        if (!terbaru) return null;

        return {
          ...item,
          penilaianTerbaru: terbaru,
          rataRata: hitungRataRata(terbaru),
        };
      })
      .filter((item) => item !== null)
      .sort(
        (a, b) =>
          b.rataRata - a.rataRata ||
          a.nama.localeCompare(b.nama, "id")
      );
  }, [pelamar]);

  const pelamarTerfilter = useMemo(() => {
    const kata = kataKunci.trim().toLocaleLowerCase("id-ID");

    return pelamar.filter((item) => {
      const cocokKata =
        !kata ||
        item.nama.toLocaleLowerCase("id-ID").includes(kata) ||
        item.no_telepon.toLocaleLowerCase("id-ID").includes(kata);

      const cocokStatus =
        filterStatus === "Semua" || item.status === filterStatus;

      return cocokKata && cocokStatus;
    });
  }, [pelamar, kataKunci, filterStatus]);

  const pelamarTerpilih = pelamar.find(
    (item) => String(item.id_pelamar) === idPelamar
  );

  async function tambahPelamar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPesan("");

    if (!nama.trim() || !noTelepon.trim()) {
      tampilkanPesan("Nama dan nomor telepon wajib diisi.", "error");
      return;
    }

    if (
      lamaPengalaman.trim() !== "" &&
      (!Number.isInteger(Number(lamaPengalaman)) ||
        Number(lamaPengalaman) < 0 ||
        Number(lamaPengalaman) > 100)
    ) {
      tampilkanPesan(
        "Lama pengalaman harus berupa bilangan bulat dari 0 sampai 100 tahun.",
        "error"
      );
      return;
    }

    setMenyimpanPelamar(true);

    try {
      const respons = await fetch("/api/pelamar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama: nama.trim(),
          no_telepon: noTelepon.trim(),
          pengalaman_kerja: pengalamanKerja.trim(),
          lama_pengalaman: lamaPengalaman,
        }),
      });

      const hasil: ResponsAPI<Pelamar> = await respons.json();

      if (!respons.ok || hasil.berhasil === false) {
        throw new Error(hasil.pesan || "Gagal menyimpan data pelamar.");
      }

      setNama("");
      setNoTelepon("");
      setPengalamanKerja("");
      setLamaPengalaman("");

      tampilkanPesan(
        hasil.pesan || "Pelamar berhasil ditambahkan.",
        "sukses"
      );

      await muatPelamar();
    } catch (error) {
      tampilkanPesan(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat menyimpan pelamar.",
        "error"
      );
    } finally {
      setMenyimpanPelamar(false);
    }
  }

  async function simpanPenilaian(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPesan("");

    const nilai = [nilaiPraktik, nilaiKetelitian, nilaiTanggungJawab];

    if (!idPelamar) {
      tampilkanPesan("Tambahkan pelamar terlebih dahulu.", "error");
      return;
    }

    if (
      nilai.some(
        (item) =>
          item.trim() === "" ||
          !Number.isInteger(Number(item)) ||
          Number(item) < 0 ||
          Number(item) > 100
      )
    ) {
      tampilkanPesan(
        "Isi semua nilai dengan bilangan bulat dari 0 sampai 100.",
        "error"
      );
      return;
    }

    setMenyimpanNilai(true);

    try {
      const respons = await fetch("/api/penilaian", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_pelamar: Number(idPelamar),
          nilai_praktik: Number(nilaiPraktik),
          nilai_ketelitian: Number(nilaiKetelitian),
          nilai_tanggung_jawab: Number(nilaiTanggungJawab),
          catatan: catatan.trim(),
        }),
      });

      const hasil: ResponsAPI<Penilaian> = await respons.json();

      if (!respons.ok || hasil.berhasil === false) {
        throw new Error(hasil.pesan || "Gagal menyimpan penilaian.");
      }

      setNilaiPraktik("");
      setNilaiKetelitian("");
      setNilaiTanggungJawab("");
      setCatatan("");

      tampilkanPesan(
        hasil.pesan || "Penilaian berhasil disimpan.",
        "sukses"
      );

      await muatPelamar();
    } catch (error) {
      tampilkanPesan(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat menyimpan penilaian.",
        "error"
      );
    } finally {
      setMenyimpanNilai(false);
    }
  }

  async function ubahKeputusan(
    idPenilaian: number,
    keputusan: "Diterima" | "Ditolak"
  ) {
    const konfirmasi = window.confirm(
      `Apakah kamu yakin menetapkan keputusan "${keputusan}" untuk penilaian ini?`
    );

    if (!konfirmasi) return;

    setPesan("");
    setIdMemproses(idPenilaian);

    try {
      const respons = await fetch(`/api/penilaian/${idPenilaian}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keputusan }),
      });

      const hasil: ResponsAPI<Penilaian> = await respons.json();

      if (!respons.ok || hasil.berhasil === false) {
        throw new Error(hasil.pesan || "Gagal memperbarui keputusan.");
      }

      tampilkanPesan(
        hasil.pesan || `Keputusan berhasil diubah menjadi ${keputusan}.`,
        "sukses"
      );

      await muatPelamar();
    } catch (error) {
      tampilkanPesan(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat memperbarui keputusan.",
        "error"
      );
    } finally {
      setIdMemproses(null);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-800 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* HEADER */}
        <header className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="h-1.5 bg-gradient-to-r from-blue-700 via-blue-500 to-sky-400" />

          <div className="flex flex-col gap-5 p-5 sm:p-7 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">
                Pengelolaan Sumber Daya Manusia
              </p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Rekrutmen Karyawan
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                Cuci Motor Resita Salju — kelola data pelamar, penilaian
                kemampuan, dan keputusan seleksi.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => window.history.back()}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                ← Kembali
              </button>

              <Link
                href="/"
                className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </header>

        {/* PESAN */}
        {pesan && (
          <div
            role="status"
            aria-live="polite"
            className={`flex items-start gap-3 rounded-xl border p-4 text-sm leading-6 ${
              jenisPesan === "sukses"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-red-200 bg-red-50 text-red-800"
            }`}
          >
            <span className="font-bold" aria-hidden="true">
              {jenisPesan === "sukses" ? "✓" : "!"}
            </span>
            <p className="flex-1">{pesan}</p>
            <button
              type="button"
              onClick={() => setPesan("")}
              aria-label="Tutup pesan"
              className="rounded px-2 font-bold hover:bg-black/5"
            >
              ×
            </button>
          </div>
        )}

        {/* RINGKASAN */}
        <section>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Ringkasan Rekrutmen
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Kondisi data pelamar saat ini.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void muatPelamar()}
              disabled={memuat}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              {memuat ? "Memuat..." : "↻ Muat ulang data"}
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {[
              {
                label: "Total Pelamar",
                jumlah: statistik.total,
                warna: "bg-blue-100 text-blue-700",
                simbol: "P",
              },
              {
                label: "Menunggu Seleksi",
                jumlah: statistik.menunggu,
                warna: "bg-amber-100 text-amber-700",
                simbol: "…",
              },
              {
                label: "Diterima",
                jumlah: statistik.diterima,
                warna: "bg-emerald-100 text-emerald-700",
                simbol: "✓",
              },
              {
                label: "Ditolak",
                jumlah: statistik.ditolak,
                warna: "bg-red-100 text-red-700",
                simbol: "×",
              },
              {
                label: "Belum Dinilai",
                jumlah: statistik.belumDinilai,
                warna: "bg-slate-100 text-slate-700",
                simbol: "—",
              },
            ].map((item) => (
              <article
                key={item.label}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-slate-500">
                    {item.label}
                  </p>
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold ${item.warna}`}
                  >
                    {item.simbol}
                  </span>
                </div>
                <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
                  {item.jumlah}
                </p>
                <p className="mt-1 text-xs text-slate-400">orang</p>
              </article>
            ))}
          </div>
        </section>

        {/* TAMBAH PELAMAR */}
        <Bagian
          nomor="01"
          judul="Tambah Pelamar"
          deskripsi="Masukkan informasi calon karyawan yang melamar."
        >
          <form onSubmit={tambahPelamar} className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <label className="block text-sm font-semibold text-slate-700">
                Nama lengkap *
                <input
                  className={inputClass}
                  type="text"
                  autoComplete="name"
                  value={nama}
                  onChange={(event) => setNama(event.target.value)}
                  maxLength={100}
                  placeholder="Masukkan nama pelamar"
                  required
                  disabled={menyimpanPelamar}
                />
              </label>

              <label className="block text-sm font-semibold text-slate-700">
                Nomor telepon *
                <input
                  className={inputClass}
                  type="tel"
                  autoComplete="tel"
                  value={noTelepon}
                  onChange={(event) => setNoTelepon(event.target.value)}
                  maxLength={20}
                  placeholder="Masukkan nomor telepon"
                  required
                  disabled={menyimpanPelamar}
                />
              </label>

              <label className="block text-sm font-semibold text-slate-700">
                Pengalaman kerja
                <textarea
                  className={inputClass}
                  value={pengalamanKerja}
                  onChange={(event) =>
                    setPengalamanKerja(event.target.value)
                  }
                  rows={3}
                  maxLength={2000}
                  placeholder="Tuliskan pengalaman kerja yang relevan, jika ada"
                  disabled={menyimpanPelamar}
                />
                <span className="mt-1.5 block text-xs font-normal text-slate-500">
                  Pengalaman merupakan informasi pendukung seleksi.
                </span>
              </label>

              <label className="block text-sm font-semibold text-slate-700">
                Lama pengalaman (tahun)
                <input
                  className={inputClass}
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={lamaPengalaman}
                  onChange={(event) =>
                    setLamaPengalaman(event.target.value)
                  }
                  placeholder="Boleh dikosongkan"
                  disabled={menyimpanPelamar}
                />
                <span className="mt-1.5 block text-xs font-normal text-slate-500">
                  Isi dengan bilangan bulat atau biarkan kosong.
                </span>
              </label>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs leading-5 text-slate-500">
                Kolom bertanda * wajib diisi.
              </p>

              <button
                className={tombolUtama}
                type="submit"
                disabled={menyimpanPelamar}
              >
                {menyimpanPelamar ? (
                  <>
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Menyimpan...
                  </>
                ) : (
                  "+ Simpan Pelamar"
                )}
              </button>
            </div>
          </form>
        </Bagian>

        {/* PENILAIAN */}
        <Bagian
          nomor="02"
          judul="Penilaian Calon Karyawan"
          deskripsi="Catat hasil praktik dan perilaku yang benar-benar diamati selama proses seleksi."
        >
          <div className="grid gap-4 lg:grid-cols-3">
            <PanelPedoman
              nomor="01"
              judul="Kemampuan Praktik"
              indikator={[
                "Mengikuti tahapan pencucian motor.",
                "Menggunakan peralatan sesuai instruksi.",
                "Memeriksa hasil pencucian sebelum selesai.",
              ]}
            />

            <PanelPedoman
              nomor="02"
              judul="Ketelitian"
              indikator={[
                "Memeriksa bagian motor yang dibersihkan.",
                "Memperhatikan bagian yang masih kotor.",
                "Melakukan pemeriksaan akhir.",
              ]}
            />

            <PanelPedoman
              nomor="03"
              judul="Tanggung Jawab"
              indikator={[
                "Mengikuti instruksi kerja.",
                "Menggunakan peralatan dengan hati-hati.",
                "Menyelesaikan tugas praktik yang diberikan.",
              ]}
            />
          </div>

          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
            <p className="font-semibold">Petunjuk penilaian</p>
            <p className="mt-1">
              Skala 0–100 merupakan rancangan penilaian aplikasi. Indikator
              di atas adalah usulan operasional, bukan standar resmi yang
              telah dikonfirmasi pemilik. Tentukan pedoman pemberian nilai
              sebelum menggunakannya untuk keputusan seleksi.
            </p>
          </div>

          <form onSubmit={simpanPenilaian} className="mt-6 space-y-5">
            <label className="block text-sm font-semibold text-slate-700">
              Pilih pelamar *
              <select
                className={inputClass}
                value={idPelamar}
                onChange={(event) => setIdPelamar(event.target.value)}
                required
                disabled={memuat || pelamar.length === 0 || menyimpanNilai}
              >
                {pelamar.length === 0 ? (
                  <option value="">Belum ada pelamar</option>
                ) : (
                  pelamar.map((item) => (
                    <option
                      key={item.id_pelamar}
                      value={String(item.id_pelamar)}
                    >
                      {item.nama} — {item.no_telepon}
                    </option>
                  ))
                )}
              </select>
            </label>

            <div className="grid gap-4 md:grid-cols-3">
              <label className="block text-sm font-semibold text-slate-700">
                Nilai praktik *
                <input
                  className={inputClass}
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={nilaiPraktik}
                  onChange={(event) => setNilaiPraktik(event.target.value)}
                  placeholder="0–100"
                  required
                  disabled={menyimpanNilai || pelamar.length === 0}
                />
                <span className="mt-1.5 block text-xs font-normal leading-5 text-slate-500">
                  Kemampuan menjalankan tahapan pencucian.
                </span>
              </label>

              <label className="block text-sm font-semibold text-slate-700">
                Nilai ketelitian *
                <input
                  className={inputClass}
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={nilaiKetelitian}
                  onChange={(event) =>
                    setNilaiKetelitian(event.target.value)
                  }
                  placeholder="0–100"
                  required
                  disabled={menyimpanNilai || pelamar.length === 0}
                />
                <span className="mt-1.5 block text-xs font-normal leading-5 text-slate-500">
                  Ketelitian membersihkan dan memeriksa hasil.
                </span>
              </label>

              <label className="block text-sm font-semibold text-slate-700">
                Nilai tanggung jawab *
                <input
                  className={inputClass}
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={nilaiTanggungJawab}
                  onChange={(event) =>
                    setNilaiTanggungJawab(event.target.value)
                  }
                  placeholder="0–100"
                  required
                  disabled={menyimpanNilai || pelamar.length === 0}
                />
                <span className="mt-1.5 block text-xs font-normal leading-5 text-slate-500">
                  Kepatuhan terhadap instruksi dan penggunaan alat.
                </span>
              </label>
            </div>

            <label className="block text-sm font-semibold text-slate-700">
              Catatan pemilik
              <textarea
                className={inputClass}
                value={catatan}
                onChange={(event) => setCatatan(event.target.value)}
                rows={3}
                maxLength={5000}
                placeholder="Tuliskan hasil praktik atau perilaku yang diamati."
                disabled={menyimpanNilai || pelamar.length === 0}
              />
            </label>

            {pelamarTerpilih && (
              <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                  Pelamar yang dinilai
                </p>
                <p className="mt-1 font-semibold text-blue-950">
                  {pelamarTerpilih.nama}
                </p>
                <p className="mt-1 text-sm text-blue-800">
                  {pelamarTerpilih.no_telepon}
                </p>
              </div>
            )}

            <div className="border-t border-slate-100 pt-5">
              <button
                className={tombolUtama}
                type="submit"
                disabled={
                  menyimpanNilai ||
                  memuat ||
                  pelamar.length === 0
                }
              >
                {menyimpanNilai ? "Menyimpan penilaian..." : "Simpan Penilaian"}
              </button>
            </div>
          </form>
        </Bagian>

        {/* PERINGKAT */}
        <Bagian
          nomor="03"
          judul="Peringkat Kandidat"
          deskripsi="Peringkat berdasarkan rata-rata penilaian terbaru setiap pelamar."
        >
          <p className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-600">
            Peringkat merupakan alat bantu pertimbangan. Keputusan penerimaan
            tetap ditentukan oleh pemilik usaha.
          </p>

          {memuat ? (
            <div className="py-10 text-center text-sm text-slate-500">
              Memuat peringkat kandidat...
            </div>
          ) : peringkatKandidat.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 px-5 py-10 text-center">
              <p className="font-semibold text-slate-700">
                Belum ada kandidat yang dinilai
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Simpan penilaian untuk menampilkan peringkat.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-slate-50">
                    {[
                      "Peringkat",
                      "Nama pelamar",
                      "Praktik",
                      "Ketelitian",
                      "Tanggung jawab",
                      "Rata-rata",
                      "Status",
                    ].map((judul) => (
                      <th
                        key={judul}
                        className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-500"
                      >
                        {judul}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {peringkatKandidat.map((item, index) => (
                    <tr
                      key={item.id_pelamar}
                      className="border-t border-slate-100 transition hover:bg-slate-50"
                    >
                      <td className="px-4 py-4">
                        <span
                          className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold ${
                            index === 0
                              ? "bg-amber-100 text-amber-800"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {index + 1}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-semibold text-slate-900">
                          {item.nama}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {item.no_telepon}
                        </p>
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        {item.penilaianTerbaru.nilai_praktik}
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        {item.penilaianTerbaru.nilai_ketelitian}
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        {item.penilaianTerbaru.nilai_tanggung_jawab}
                      </td>
                      <td className="px-4 py-4 font-bold text-slate-900">
                        {item.rataRata.toFixed(2)}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${warnaStatus(
                            item.status
                          )}`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Bagian>

        {/* DAFTAR PELAMAR */}
        <Bagian
          nomor="04"
          judul="Daftar Pelamar"
          deskripsi="Cari data pelamar, saring berdasarkan status, dan periksa riwayat penilaiannya."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm font-semibold text-slate-700">
              Cari nama atau nomor telepon
              <input
                className={inputClass}
                type="search"
                value={kataKunci}
                onChange={(event) => setKataKunci(event.target.value)}
                placeholder="Ketik nama atau nomor telepon..."
              />
            </label>

            <label className="block text-sm font-semibold text-slate-700">
              Filter status
              <select
                className={inputClass}
                value={filterStatus}
                onChange={(event) =>
                  setFilterStatus(event.target.value as FilterStatus)
                }
              >
                <option value="Semua">Semua status</option>
                <option value="Menunggu Seleksi">Menunggu Seleksi</option>
                <option value="Diterima">Diterima</option>
                <option value="Ditolak">Ditolak</option>
              </select>
            </label>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <p className="text-sm text-slate-500">
              Menampilkan{" "}
              <strong className="text-slate-800">
                {pelamarTerfilter.length}
              </strong>{" "}
              dari {pelamar.length} pelamar
            </p>

            {(kataKunci || filterStatus !== "Semua") && (
              <button
                type="button"
                onClick={() => {
                  setKataKunci("");
                  setFilterStatus("Semua");
                }}
                className="text-sm font-semibold text-blue-700 hover:text-blue-900"
              >
                Reset filter
              </button>
            )}
          </div>

          {memuat ? (
            <div className="py-10 text-center text-sm text-slate-500">
              Memuat data pelamar...
            </div>
          ) : pelamarTerfilter.length === 0 ? (
            <div className="py-10 text-center">
              <p className="font-semibold text-slate-700">
                {pelamar.length === 0
                  ? "Belum ada pelamar"
                  : "Pelamar tidak ditemukan"}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {pelamar.length === 0
                  ? "Tambahkan pelamar melalui formulir di atas."
                  : "Coba ubah kata kunci atau pilih status lainnya."}
              </p>
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              {pelamarTerfilter.map((item) => (
                <article
                  key={item.id_pelamar}
                  className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-slate-300 sm:p-5"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-base font-bold text-blue-700">
                        {item.nama.charAt(0).toUpperCase()}
                      </div>

                      <div>
                        <h3 className="font-bold text-slate-900">
                          {item.nama}
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                          {item.no_telepon}
                        </p>
                        <p className="mt-2 text-xs text-slate-400">
                          Terdaftar: {formatTanggal(item.created_at)}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`inline-flex w-fit rounded-full border px-3 py-1.5 text-xs font-semibold ${warnaStatus(
                        item.status
                      )}`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <div className="mt-4 rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Pengalaman kerja
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                      {item.pengalaman_kerja || "Belum diisi"}
                      {item.lama_pengalaman !== null
                        ? ` · ${item.lama_pengalaman} tahun`
                        : ""}
                    </p>
                  </div>

                  <div className="mt-5 border-t border-slate-100 pt-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="font-bold text-slate-900">
                        Riwayat Penilaian
                      </h4>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                        {item.penilaian.length} penilaian
                      </span>
                    </div>

                    {item.penilaian.length === 0 ? (
                      <p className="mt-3 rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                        Belum ada penilaian untuk pelamar ini.
                      </p>
                    ) : (
                      <div className="mt-4 space-y-4">
                        {[...item.penilaian]
                          .sort(
                            (a, b) =>
                              new Date(b.created_at).getTime() -
                                new Date(a.created_at).getTime() ||
                              b.id_penilaian - a.id_penilaian
                          )
                          .map((nilai) => {
                            const rataRata = hitungRataRata(nilai);
                            const sedangDiproses =
                              idMemproses === nilai.id_penilaian;

                            return (
                              <div
                                key={nilai.id_penilaian}
                                className="rounded-xl border border-slate-200 p-4"
                              >
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                  <div>
                                    <p className="text-xs text-slate-500">
                                      Waktu penilaian
                                    </p>
                                    <p className="mt-1 text-sm font-medium text-slate-700">
                                      {formatTanggal(nilai.created_at)}
                                    </p>
                                  </div>

                                  <span
                                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${warnaStatus(
                                      nilai.keputusan
                                    )}`}
                                  >
                                    {nilai.keputusan}
                                  </span>
                                </div>

                                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                                  {[
                                    {
                                      label: "Praktik",
                                      nilai: nilai.nilai_praktik,
                                    },
                                    {
                                      label: "Ketelitian",
                                      nilai: nilai.nilai_ketelitian,
                                    },
                                    {
                                      label: "Tanggung jawab",
                                      nilai: nilai.nilai_tanggung_jawab,
                                    },
                                    {
                                      label: "Rata-rata",
                                      nilai: rataRata.toFixed(2),
                                    },
                                  ].map((bagian) => (
                                    <div
                                      key={bagian.label}
                                      className="rounded-xl bg-slate-50 p-3"
                                    >
                                      <p className="text-xs text-slate-500">
                                        {bagian.label}
                                      </p>
                                      <p className="mt-1 text-lg font-bold text-slate-900">
                                        {bagian.nilai}
                                      </p>
                                    </div>
                                  ))}
                                </div>

                                {nilai.catatan && (
                                  <div className="mt-4 rounded-lg border border-slate-100 bg-slate-50 p-3">
                                    <p className="text-xs font-semibold text-slate-500">
                                      Catatan pemilik
                                    </p>
                                    <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                                      {nilai.catatan}
                                    </p>
                                  </div>
                                )}

                                <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                                  <button
                                    type="button"
                                    className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                                    disabled={idMemproses !== null}
                                    onClick={() =>
                                      void ubahKeputusan(
                                        nilai.id_penilaian,
                                        "Diterima"
                                      )
                                    }
                                  >
                                    {sedangDiproses
                                      ? "Memproses..."
                                      : "Tetapkan Diterima"}
                                  </button>

                                  <button
                                    type="button"
                                    className="inline-flex items-center justify-center rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                    disabled={idMemproses !== null}
                                    onClick={() =>
                                      void ubahKeputusan(
                                        nilai.id_penilaian,
                                        "Ditolak"
                                      )
                                    }
                                  >
                                    {sedangDiproses
                                      ? "Memproses..."
                                      : "Tetapkan Ditolak"}
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </Bagian>

        <footer className="pb-3 pt-1 text-center">
          <p className="text-xs font-medium text-slate-400">
            Cuci Motor Resita Salju
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Modul Rekrutmen Karyawan
          </p>
        </footer>
      </div>
    </main>
  );
}