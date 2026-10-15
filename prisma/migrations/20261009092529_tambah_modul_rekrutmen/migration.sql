-- CreateTable
CREATE TABLE "pelamar" (
    "id_pelamar" SERIAL NOT NULL,
    "nama" VARCHAR(100) NOT NULL,
    "no_telepon" VARCHAR(20) NOT NULL,
    "pengalaman_kerja" TEXT,
    "lama_pengalaman" INTEGER,
    "status" VARCHAR(30) NOT NULL DEFAULT 'Menunggu Seleksi',
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pelamar_pkey" PRIMARY KEY ("id_pelamar")
);

-- CreateTable
CREATE TABLE "penilaian_seleksi" (
    "id_penilaian" SERIAL NOT NULL,
    "id_pelamar" INTEGER NOT NULL,
    "nilai_praktik" INTEGER NOT NULL,
    "nilai_ketelitian" INTEGER NOT NULL,
    "nilai_tanggung_jawab" INTEGER NOT NULL,
    "catatan" TEXT,
    "keputusan" VARCHAR(30) NOT NULL DEFAULT 'Belum Diputuskan',
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "penilaian_seleksi_pkey" PRIMARY KEY ("id_penilaian")
);

-- CreateIndex
CREATE INDEX "penilaian_seleksi_id_pelamar_idx" ON "penilaian_seleksi"("id_pelamar");

-- AddForeignKey
ALTER TABLE "penilaian_seleksi" ADD CONSTRAINT "penilaian_seleksi_id_pelamar_fkey" FOREIGN KEY ("id_pelamar") REFERENCES "pelamar"("id_pelamar") ON DELETE NO ACTION ON UPDATE NO ACTION;
