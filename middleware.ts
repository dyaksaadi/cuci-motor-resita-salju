import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

function getSecretKey(): Uint8Array | null {
  const secretKey = process.env.AUTH_SECRET;
  if (!secretKey) return null;
  return new TextEncoder().encode(secretKey);
}

async function cekToken(token: string) {
  try {
    const secret = getSecretKey();
    if (!secret) return false;
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;

  const sudahLogin = token
    ? await cekToken(token)
    : false;

  const pathname = request.nextUrl.pathname;

  // Halaman publik yang tidak memerlukan login
  if (pathname === "/login" || pathname === "/daftar") {
    if (sudahLogin && pathname === "/login") {
      return NextResponse.redirect(
        new URL("/", request.url)
      );
    }

    return NextResponse.next();
  }

  // Semua halaman selain publik harus sudah login
  if (!sudahLogin) {
    return NextResponse.redirect(
      new URL("/login", request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};