import type { Prisma } from "@/generated/prisma/client";
import { readOwnerHash } from "@/lib/owner-session";
import { readUserSession } from "@/lib/user-session";

export async function viewerReportWhere(): Promise<Prisma.ReportWhereInput | null> {
  const [ownerTokenHash, session] = await Promise.all([readOwnerHash(), readUserSession()]);
  const alternatives: Prisma.ReportWhereInput[] = [];
  if (ownerTokenHash) alternatives.push({ ownerTokenHash });
  if (session) alternatives.push({ userId: session.userId });
  return alternatives.length ? { OR: alternatives } : null;
}
