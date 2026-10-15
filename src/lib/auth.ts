import { SignJWT, jwtVerify, type JWTPayload } from "jose";

function getSecretKey(): Uint8Array {
  const secretKey = process.env.AUTH_SECRET;
  if (!secretKey) {
    throw new Error("AUTH_SECRET belum dibuat di environment atau file .env");
  }
  return new TextEncoder().encode(secretKey);
}

export async function buatToken(data: {
  id_user: number;
  nama: string;
  username: string;
  role: string;
}) {
  const secret = getSecretKey();
  return await new SignJWT(data)
    .setProtectedHeader({
      alg: "HS256",
    })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secret);
}

export async function verifikasiToken(token: string): Promise<JWTPayload | null> {
  try {
    const secret = getSecretKey();
    const { payload } = await jwtVerify(
      token,
      secret
    );

    return payload;
  } catch {
    return null;
  }
}