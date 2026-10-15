-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "antrean" (
    "id_antrean" SERIAL NOT NULL,
    "id_pelanggan" INTEGER NOT NULL,
    "nomor_antrean" INTEGER NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'Menunggu',
    "waktu_masuk" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tanggal_antrean" DATE NOT NULL DEFAULT CURRENT_DATE,

    CONSTRAINT "antrean_pkey" PRIMARY KEY ("id_antrean")
);

-- CreateTable
CREATE TABLE "pelanggan" (
    "id_pelanggan" SERIAL NOT NULL,
    "nama" VARCHAR(100) NOT NULL,

    CONSTRAINT "pelanggan_pkey" PRIMARY KEY ("id_pelanggan")
);

-- CreateTable
CREATE TABLE "transaksi" (
    "id_transaksi" SERIAL NOT NULL,
    "id_antrean" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "uang_dibayar" INTEGER NOT NULL DEFAULT 0,
    "kembalian" INTEGER NOT NULL DEFAULT 0,
    "metode" VARCHAR(20) NOT NULL DEFAULT 'Cash',
    "waktu_transaksi" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transaksi_pkey" PRIMARY KEY ("id_transaksi")
);

-- CreateTable
CREATE TABLE "users" (
    "id_user" SERIAL NOT NULL,
    "nama" VARCHAR(100) NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "role" VARCHAR(20) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id_user")
);

-- CreateIndex
CREATE UNIQUE INDEX "unique_nomor_antrean_per_tanggal" ON "antrean"("tanggal_antrean", "nomor_antrean");

-- CreateIndex
CREATE UNIQUE INDEX "transaksi_id_antrean_key" ON "transaksi"("id_antrean");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- AddForeignKey
ALTER TABLE "antrean" ADD CONSTRAINT "fk_antrean_pelanggan" FOREIGN KEY ("id_pelanggan") REFERENCES "pelanggan"("id_pelanggan") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "transaksi" ADD CONSTRAINT "fk_transaksi_antrean" FOREIGN KEY ("id_antrean") REFERENCES "antrean"("id_antrean") ON DELETE NO ACTION ON UPDATE NO ACTION;
