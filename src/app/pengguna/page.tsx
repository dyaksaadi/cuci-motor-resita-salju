
"use client";

import { useCallback, useEffect, useState } from "react";

type Role = "OWNER" | "WASHER";

type Pengguna = {
  id_user: number;
  nama: string;
  username: string;
  role: string;
};

export default function PenggunaPage() {
  const [pengguna, setPengguna] = useState<Pengguna[]>([]);
  const [nama, setNama] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("WASHER");
  const [pencarian, setPencarian] = useState("");
  const [pesan, setPesan] = useState("");
  const [error, setError] = useState("");
  const [memuat, setMemuat] = useState(true);
  const [menyimpan, setMenyimpan] = useState(false);
  const [menghapus, setMenghapus] = useState<number | null>(null);

  const ambilPengguna = useCallback(async () => {
    setMemuat(true);
    setError("");

    try {
      const response = await fetch("/api/pengguna", {
        method: "GET",
        cache: "no-store",
      });

      let hasil: {
        message?: string;
        pesan?: string;
        detail?: string;
        pengguna?: Pengguna[];
      } | Pengguna[] | null = null;

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        try {
          hasil = await response.json();
        } catch {
          hasil = null;
        }
      }

      if (!response.ok) {
        const detailPesan =
          hasil && !Array.isArray(hasil) && hasil.detail ? ` (${hasil.detail})` : "";
        const pesanError =
          (hasil && !Array.isArray(hasil) && (hasil.message || hasil.pesan)) ||
          (response.status === 404
            ? "Endpoint /api/pengguna tidak ditemukan (404)."
            : response.status === 403
              ? "Akses ditolak (403). Hanya akun owner yang dapat mengelola pengguna."
              : `Gagal mengambil data pengguna (HTTP ${response.status})${detailPesan}.`);
        throw new Error(pesanError);
      }

      const daftar = Array.isArray(hasil)
        ? hasil
        : hasil && Array.isArray(hasil.pengguna)
          ? hasil.pengguna
          : [];

      setPengguna(daftar);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat mengambil data pengguna."
      );
    } finally {
      setMemuat(false);
    }
  }, []);

  useEffect(() => {
    let aktif = true;

    async function muatAwal() {
      try {
        const response = await fetch("/api/pengguna", {
          method: "GET",
          cache: "no-store",
        });

        let hasil: {
          message?: string;
          pesan?: string;
          detail?: string;
          pengguna?: Pengguna[];
        } | Pengguna[] | null = null;

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          try {
            hasil = await response.json();
          } catch {
            hasil = null;
          }
        }

        if (!response.ok) {
          const detailPesan =
            hasil && !Array.isArray(hasil) && hasil.detail ? ` (${hasil.detail})` : "";
          const pesanError =
            (hasil && !Array.isArray(hasil) && (hasil.message || hasil.pesan)) ||
            (response.status === 404
              ? "Endpoint /api/pengguna tidak ditemukan (404)."
              : response.status === 403
                ? "Akses ditolak (403). Hanya akun owner yang dapat mengelola pengguna."
                : `Gagal mengambil data pengguna (HTTP ${response.status})${detailPesan}.`);
          throw new Error(pesanError);
        }

        if (aktif) {
          const daftar = Array.isArray(hasil)
            ? hasil
            : hasil && Array.isArray(hasil.pengguna)
              ? hasil.pengguna
              : [];
          setPengguna(daftar);
        }
      } catch (err) {
        if (aktif) {
          setError(
            err instanceof Error
              ? err.message
              : "Terjadi kesalahan saat mengambil data pengguna."
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

  async function tambahPengguna(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPesan("");
    setError("");

    if (!nama.trim() || !username.trim() || !password) {
      setError("Nama, username, dan password wajib diisi.");
      return;
    }

    if (password.length < 8) {
      setError("Password minimal 8 karakter.");
      return;
    }

    setMenyimpan(true);

    try {
      const response = await fetch("/api/pengguna", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nama: nama.trim(),
          username: username.trim(),
          password,
          role,
        }),
      });

      let hasil: {
        message?: string;
        pesan?: string;
        detail?: string;
      } | null = null;

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
        throw new Error(
          hasil?.message ||
            hasil?.pesan ||
            (response.status === 404
              ? "Endpoint /api/pengguna tidak ditemukan (404)."
              : response.status === 403
                ? "Akses ditolak (403). Anda bukan owner."
                : `Gagal menambahkan pengguna (HTTP ${response.status})${detailPesan}.`)
        );
      }

      setNama("");
      setUsername("");
      setPassword("");
      setRole("WASHER");
      setPesan("Pengguna berhasil ditambahkan.");

      await ambilPengguna();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat menyimpan pengguna."
      );
    } finally {
      setMenyimpan(false);
    }
  }

  async function hapusPengguna(id: number, namaPengguna: string) {
    const yakin = window.confirm(
      `Apakah kamu yakin ingin menghapus akun "${namaPengguna}"?`
    );

    if (!yakin) return;

    setPesan("");
    setError("");
    setMenghapus(id);

    try {
      const response = await fetch(`/api/pengguna?id=${id}`, {
        method: "DELETE",
      });

      let hasil: {
        message?: string;
        pesan?: string;
        detail?: string;
      } | null = null;

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
        throw new Error(
          hasil?.message ||
            hasil?.pesan ||
            (response.status === 404
              ? "Endpoint /api/pengguna tidak ditemukan (404)."
              : response.status === 403
                ? "Akses ditolak (403). Anda bukan owner."
                : `Gagal menghapus pengguna (HTTP ${response.status})${detailPesan}.`)
        );
      }

      setPesan("Pengguna berhasil dihapus.");
      await ambilPengguna();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat menghapus pengguna."
      );
    } finally {
      setMenghapus(null);
    }
  }

  const penggunaTerfilter = pengguna.filter((item) => {
    const kata = pencarian.toLowerCase();

    return (
      item.nama.toLowerCase().includes(kata) ||
      item.username.toLowerCase().includes(kata) ||
      item.role.toLowerCase().includes(kata)
    );
  });

  return (
    <main className="min-h-screen bg-gray-50 p-4 text-gray-900 sm:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header>
          <h1 className="text-2xl font-bold sm:text-3xl">
            Manajemen Pengguna
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Tambahkan dan kelola akun Owner serta Washer untuk Cuci Motor
            Resita Salju.
          </p>
        </header>

        {pesan && (
          <div
            role="status"
            className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800"
          >
            {pesan}
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="mb-5 text-lg font-semibold">Tambah Pengguna</h2>

          <form onSubmit={tambahPengguna} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="nama"
                  className="mb-1 block text-sm font-medium"
                >
                  Nama lengkap
                </label>
                <input
                  id="nama"
                  type="text"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Masukkan nama lengkap"
                  maxLength={100}
                  autoComplete="name"
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label
                  htmlFor="username"
                  className="mb-1 block text-sm font-medium"
                >
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username"
                  maxLength={50}
                  autoComplete="username"
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-1 block text-sm font-medium"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 8 karakter"
                  minLength={8}
                  autoComplete="new-password"
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label
                  htmlFor="role"
                  className="mb-1 block text-sm font-medium"
                >
                  Peran pengguna
                </label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="OWNER">Owner</option>
                  <option value="WASHER">Washer</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={menyimpan}
              className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {menyimpan ? "Menyimpan..." : "Tambah Pengguna"}
            </button>
          </form>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Daftar Pengguna</h2>
              <p className="mt-1 text-sm text-gray-500">
                Jumlah pengguna: {pengguna.length}
              </p>
            </div>

            <button
              type="button"
              onClick={() => void ambilPengguna()}
              disabled={memuat}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-60"
            >
              {memuat ? "Memuat..." : "Muat Ulang"}
            </button>
          </div>

          <div className="mb-4">
            <label htmlFor="pencarian" className="sr-only">
              Cari pengguna
            </label>
            <input
              id="pencarian"
              type="search"
              value={pencarian}
              onChange={(e) => setPencarian(e.target.value)}
              placeholder="Cari nama, username, atau peran..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {memuat ? (
            <p className="py-8 text-center text-sm text-gray-500">
              Memuat data pengguna...
            </p>
          ) : penggunaTerfilter.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">
              {pengguna.length === 0
                ? "Belum ada data pengguna."
                : "Pengguna tidak ditemukan."}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-4 py-3 font-semibold">No.</th>
                    <th className="px-4 py-3 font-semibold">Nama</th>
                    <th className="px-4 py-3 font-semibold">Username</th>
                    <th className="px-4 py-3 font-semibold">Peran</th>
                    <th className="px-4 py-3 font-semibold">Aksi</th>
                  </tr>
                </thead>

                <tbody>
                  {penggunaTerfilter.map((item, index) => (
                    <tr
                      key={item.id_user}
                      className="border-b border-gray-100 last:border-0"
                    >
                      <td className="px-4 py-3">{index + 1}</td>
                      <td className="px-4 py-3">{item.nama}</td>
                      <td className="px-4 py-3">{item.username}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                            item.role.toUpperCase() === "OWNER"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {item.role.toUpperCase() === "OWNER"
                            ? "Owner"
                            : item.role.toUpperCase() === "WASHER"
                              ? "Washer"
                              : item.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() =>
                            void hapusPengguna(item.id_user, item.nama)
                          }
                          disabled={menghapus === item.id_user}
                          className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {menghapus === item.id_user
                            ? "Menghapus..."
                            : "Hapus"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
