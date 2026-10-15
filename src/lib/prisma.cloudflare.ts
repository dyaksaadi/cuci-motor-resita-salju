
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "cloudflare:workers";

function getConnectionString(): string {
  try {
    const connectionString = env.HYPERDRIVE?.connectionString;

    if (connectionString) {
      return connectionString;
    }
  } catch {
    // Binding tidak tersedia di luar konteks Cloudflare Worker.
  }

  const connectionString = process.env.DATABASE_URL;

  if (connectionString) {
    return connectionString;
  }

  throw new Error(
    "Koneksi database tidak ditemukan. Periksa binding HYPERDRIVE."
  );
}

export function createPrismaClient(): PrismaClient {
  const adapter = new PrismaPg({
    connectionString: getConnectionString(),
  });

  return new PrismaClient({ adapter });
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, property) {
    throw new Error(
      `Gunakan createPrismaClient() untuk mengakses Prisma. Properti yang diakses: ${String(property)}`
    );
  },
});
