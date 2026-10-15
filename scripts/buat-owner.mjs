import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import readline from "node:readline/promises";
import { stdin, stdout } from "node:process";

const url = process.env.DATABASE_URL;

if (!url || !url.includes("neon.tech")) {
  throw new Error("DATABASE_URL belum mengarah ke Neon. Hentikan proses.");
}

const rl = readline.createInterface({ input: stdin, output: stdout });

try {
  const nama = (await rl.question("Nama owner: ")).trim();
  const username = (await rl.question("Username owner (minimal 6 karakter): ")).trim();
  const password = await rl.question("Password owner (minimal 8 karakter): ");

  if (!nama || username.length < 6 || password.length < 8) {
    throw new Error("Nama wajib diisi, username minimal 6 karakter, password minimal 8 karakter.");
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: url }),
  });

  try {
    const jumlah = await prisma.users.count();

    if (jumlah > 0) {
      throw new Error(`Tabel users sudah berisi ${jumlah} akun. Tidak ada perubahan.`);
    }

    const hash = await bcrypt.hash(password, 12);

    await prisma.users.create({
      data: { nama, username, password: hash, role: "owner" },
    });

    console.log("Akun owner berhasil dibuat di Neon.");
  } finally {
    await prisma.$disconnect();
  }
} finally {
  rl.close();
}
