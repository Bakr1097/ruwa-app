import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  if (!req.auth) {
    return NextResponse.redirect(new URL("/auth/sign-in", req.nextUrl));
  }
});

export const config = {
  matcher: ["/fabrics/:path*", "/products/:path*"],
};
