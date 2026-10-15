
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [tampilkanPassword, setTampilkanPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pesanError, setPesanError] = useState("");

  async function login(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPesanError("");

    if (!username.trim() || !password) {
      setPesanError("Username dan password wajib diisi.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      let result: {
        berhasil?: boolean;
        pesan?: string;
        message?: string;
        detail?: string;
      } | null = null;

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        try {
          result = await response.json();
        } catch {
          result = null;
        }
      }

      if (!response.ok) {
        const detailPesan = result?.detail ? ` (${result.detail})` : "";
        const pesan =
          result?.pesan ||
          result?.message ||
          (response.status === 404
            ? "Endpoint autentikasi (/api/login) tidak ditemukan (404)."
            : response.status >= 500
              ? `Server mengalami gangguan internal (HTTP ${response.status})${detailPesan}. Coba beberapa saat lagi.`
              : `Login gagal (HTTP ${response.status}).`);
        setPesanError(pesan);
        return;
      }

      if (!result?.berhasil) {
        setPesanError(
          result?.pesan || "Login gagal. Periksa username dan password."
        );
        return;
      }

      router.replace("/");
      router.refresh();
    } catch (error) {
      console.error("Kesalahan jaringan/login:", error);
      const detailError =
        error instanceof Error && error.message
          ? `: ${error.message}`
          : "";
      setPesanError(
        `Tidak dapat terhubung ke server. Periksa koneksi dan coba lagi${detailError}.`
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-100 px-4 py-10 text-slate-900 sm:px-6">
      {/* Dekorasi latar */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-blue-200/50 blur-3xl" />
        <div className="absolute -bottom-28 -right-20 h-80 w-80 rounded-full bg-indigo-200/50 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#94a3b810_1px,transparent_1px),linear-gradient(to_bottom,#94a3b810_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Identitas usaha */}
        <div className="mb-7 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-700 text-white shadow-lg shadow-blue-700/20">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              className="h-9 w-9"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="6" cy="17" r="3" />
              <circle cx="18" cy="17" r="3" />
              <path d="M9 17h4l3-7h-5l-2 4H6" />
              <path d="M13 5l1-2m4 4 2-1M5 8 3 7m8 0h3" />
            </svg>
          </div>

          <p className="mt-5 text-xs font-bold uppercase tracking-[0.22em] text-blue-700">
            Sistem Manajemen Usaha
          </p>

          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
            Resita Salju
          </h1>

          <p className="mt-2 text-base text-slate-600">
            Cuci Motor Resita Salju
          </p>
        </div>

        {/* Kartu login */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-8">
          <div className="mb-7">
            <h2 className="text-xl font-bold text-slate-950">
              Selamat datang
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Masuk menggunakan akun yang telah terdaftar untuk melanjutkan
              ke sistem.
            </p>
          </div>

          {pesanError && (
            <div
              role="alert"
              aria-live="polite"
              className="mb-5 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                className="mt-0.5 h-5 w-5 shrink-0 text-red-700"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 8v4m0 4h.01" />
              </svg>
              <p className="text-sm font-medium leading-6 text-red-800">
                {pesanError}
              </p>
            </div>
          )}

          <form onSubmit={login} className="space-y-5">
            <div>
              <label
                htmlFor="username"
                className="mb-2 block text-sm font-semibold text-slate-800"
              >
                Username
              </label>

              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-slate-400">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-5 w-5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="8" r="4" />
                    <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
                  </svg>
                </span>

                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck={false}
                  required
                  autoFocus
                  value={username}
                  onChange={(event) => {
                    setUsername(event.target.value);
                    setPesanError("");
                  }}
                  placeholder="Masukkan username"
                  disabled={loading}
                  className="min-h-12 w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-base text-slate-950 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-slate-800"
              >
                Password
              </label>

              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-slate-400">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-5 w-5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="4" y="10" width="16" height="11" rx="2" />
                    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                  </svg>
                </span>

                <input
                  id="password"
                  name="password"
                  type={tampilkanPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setPesanError("");
                  }}
                  placeholder="Masukkan password"
                  disabled={loading}
                  className="min-h-12 w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-20 text-base text-slate-950 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                />

                <button
                  type="button"
                  onClick={() => setTampilkanPassword(!tampilkanPassword)}
                  aria-label={
                    tampilkanPassword
                      ? "Sembunyikan password"
                      : "Tampilkan password"
                  }
                  aria-pressed={tampilkanPassword}
                  disabled={loading}
                  className="absolute inset-y-0 right-0 flex items-center rounded-r-xl px-3 text-sm font-semibold text-slate-600 transition hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 disabled:opacity-50"
                >
                  {tampilkanPassword ? "Sembunyikan" : "Lihat"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-base font-bold text-white shadow-md shadow-blue-700/15 transition hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-blue-400 disabled:shadow-none"
            >
              {loading ? (
                <>
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-5 w-5 animate-spin"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="9"
                      stroke="currentColor"
                      strokeWidth="3"
                      opacity="0.25"
                    />
                    <path
                      d="M21 12a9 9 0 0 0-9-9"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                  Memproses login...
                </>
              ) : (
                <>
                  Masuk ke Sistem
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-5 w-5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14m-6-6 6 6-6 6" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 flex items-start gap-2 rounded-xl bg-slate-50 p-3.5">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              className="mt-0.5 h-4 w-4 shrink-0 text-slate-500"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="4" y="10" width="16" height="11" rx="2" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" />
            </svg>
            <p className="text-xs leading-5 text-slate-600">
              Gunakan akun yang diberikan oleh pengelola. Jangan membagikan
              password kepada orang lain.
            </p>
          </div>
        </section>

        <footer className="mt-6 text-center">
          <p className="text-sm font-semibold text-slate-600">
            Cuci Motor Resita Salju
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Sistem Manajemen Pencucian Motor
          </p>
        </footer>
      </div>
    </main>
  );
}