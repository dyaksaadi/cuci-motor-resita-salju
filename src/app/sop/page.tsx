
"use client";

import { useRouter } from "next/navigation";

const langkahSOP = [
  {
    nomor: 1,
    judul: "Persiapan",
    deskripsi:
      "Siapkan peralatan pencucian, air, sabun, dan kain lap. Pastikan peralatan dapat digunakan dengan baik.",
    pemeriksaan: [
      "Peralatan pencucian siap digunakan.",
      "Sabun dan air tersedia.",
      "Kain lap tersedia dan bersih.",
    ],
  },
  {
    nomor: 2,
    judul: "Membersihkan kotoran",
    deskripsi:
      "Bersihkan kotoran pada motor sebelum melanjutkan proses pencucian menggunakan sabun.",
    pemeriksaan: [
      "Bagian motor yang kotor sudah dibersihkan.",
      "Pencucian dilakukan dengan hati-hati.",
    ],
  },
  {
    nomor: 3,
    judul: "Mencuci dengan sabun",
    deskripsi:
      "Gunakan sabun untuk membersihkan permukaan motor secara merata.",
    pemeriksaan: [
      "Sabun digunakan pada bagian yang perlu dibersihkan.",
      "Tidak ada bagian penting yang terlewat.",
    ],
  },
  {
    nomor: 4,
    judul: "Membilas motor",
    deskripsi:
      "Bilas motor hingga sisa sabun dan kotoran terangkat.",
    pemeriksaan: [
      "Sisa sabun sudah dibilas.",
      "Tidak terlihat kotoran yang masih menempel.",
    ],
  },
  {
    nomor: 5,
    judul: "Mengeringkan motor",
    deskripsi:
      "Lap motor menggunakan kain yang sesuai dan bersih.",
    pemeriksaan: [
      "Bagian motor yang basah sudah dilap.",
      "Hasil akhir diperiksa secara visual.",
    ],
  },
  {
    nomor: 6,
    judul: "Pemeriksaan akhir",
    deskripsi:
      "Periksa kembali hasil pencucian. Jika masih ada bagian yang kotor, bersihkan kembali sebelum motor diserahkan.",
    pemeriksaan: [
      "Tidak ada kotoran yang terlihat pada bagian yang diperiksa.",
      "Hasil pencucian layak diserahkan kepada pelanggan.",
    ],
  },
];

export default function SOPPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-5">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Cuci Motor Resita Salju
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Panduan Operasional Pencucian Motor
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push("/")}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Kembali
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-500">
            Standar Operasional Prosedur
          </p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            Panduan Kerja Karyawan
          </h2>
          <p className="mt-3 text-sm leading-6 text-gray-600">
            Gunakan panduan ini sebagai rancangan awal untuk menjaga
            konsistensi proses pencucian dan membantu pemeriksaan
            kualitas sebelum motor diserahkan kepada pelanggan.
          </p>
        </div>

        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="font-semibold text-amber-900">
            Catatan
          </p>
          <p className="mt-1 text-sm leading-6 text-amber-800">
            Panduan ini masih berupa rancangan awal. Pemilik perlu
            meninjau dan menetapkan standar kerja yang sesuai dengan
            praktik usaha sebelum digunakan sebagai SOP resmi.
          </p>
        </div>

        <div className="space-y-4">
          {langkahSOP.map((langkah) => (
            <section
              key={langkah.nomor}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-900 font-bold text-white">
                  {langkah.nomor}
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {langkah.judul}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    {langkah.deskripsi}
                  </p>

                  <h4 className="mt-4 text-sm font-semibold text-gray-800">
                    Hal yang perlu diperiksa
                  </h4>

                  <ul className="mt-2 space-y-2">
                    {langkah.pemeriksaan.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 text-sm text-gray-600"
                      >
                        <span
                          aria-hidden="true"
                          className="mt-0.5 text-gray-400"
                        >
                          •
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          ))}
        </div>

        <div className="mt-6 rounded-2xl bg-gray-900 p-5 text-white">
          <h3 className="text-lg font-semibold">
            Prinsip kerja
          </h3>
          <p className="mt-2 text-sm leading-6 text-gray-300">
            Ikuti urutan kerja, gunakan peralatan dengan hati-hati,
            periksa hasil pencucian, dan pastikan motor layak diserahkan
            kepada pelanggan.
          </p>
        </div>

        <footer className="py-8 text-center text-xs text-gray-400">
          Cuci Motor Resita Salju — Panduan Operasional
        </footer>
      </div>
    </main>
  );
}