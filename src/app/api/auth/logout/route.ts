import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getPrisma } from "@/lib/db";
import { hashSecret } from "@/lib/owner-session";

export async function POST() {
  const store = await cookies();
  const token = store.get("roastin_session")?.value;
  if (token) await getPrisma().session.deleteMany({ where: { tokenHash: hashSecret(token) } });
  const response = new NextResponse(null, { status: 204 });
  response.cookies.set({ name: "roastin_session", value: "", path: "/", maxAge: 0 });
  response.cookies.set({ name: "roastin_owner", value: "", path: "/", maxAge: 0 });
  return response;
}
