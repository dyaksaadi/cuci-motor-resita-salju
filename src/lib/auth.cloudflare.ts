
import { SignJWT, jwtVerify } from "jose";

export type PayloadAuth = {
  id_user: number;
  nama: string;
  username: string;
  role: string;
};

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error(
      "JWT_SECRET belum diatur atau panjangnya kurang dari 32 karakter."
    );
  }

  return new TextEncoder().encode(secret);
}

export async function buatToken(payload: PayloadAuth): Promise<string> {
  return new SignJWT({
    id_user: payload.id_user,
    nama: payload.nama,
    username: payload.username,
    role: payload.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(getSecret());
}

export async function verifikasiToken(token: string) {
  const { payload } = await jwtVerify(token, getSecret(), {
    algorithms: ["HS256"],
  });

  return payload;
}
