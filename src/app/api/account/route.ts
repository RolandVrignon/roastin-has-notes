import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/db";
import { readUserSession } from "@/lib/user-session";
import { deleteEphemeralPayload } from "@/server/storage/ephemeral-payload";
import { requestGenerationDeletion } from "@/temporal/client";

const deleteSchema = z.object({ confirmation: z.literal("DELETE") });

export async function GET() {
  const session = await readUserSession();
  if (!session) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const [reportCount, payments] = await Promise.all([
    getPrisma().report.count({ where: { userId: session.userId, deletedAt: null } }),
    getPrisma().payment.findMany({
      where: { report: { userId: session.userId } },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: { id: true, amount: true, currency: true, status: true, createdAt: true, report: { select: { id: true, chatName: true, deletedAt: true } } },
    }),
  ]);
  return NextResponse.json({ email: session.user.email, reportCount, paymentCount: payments.length, purchases: payments }, { headers: { "Cache-Control": "private, no-store" } });
}

export async function DELETE(request: Request) {
  try {
    deleteSchema.parse(await request.json());
    const session = await readUserSession();
    if (!session) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    const db = getPrisma();
    const reportJobs = await db.report.findMany({
      where: { userId: session.userId },
      select: { id: true, workflowId: true, payloadReference: true },
    });
    await Promise.allSettled(reportJobs.flatMap((report) => [
      report.workflowId ? requestGenerationDeletion(report.workflowId) : Promise.resolve(),
      report.payloadReference ? deleteEphemeralPayload(report.payloadReference) : Promise.resolve(),
    ]));
    await db.$transaction(async (tx) => {
      const reportIds = reportJobs.map(({ id }) => id);
      await tx.shareLink.updateMany({ where: { reportId: { in: reportIds }, revokedAt: null }, data: { revokedAt: new Date() } });
      await tx.whatsappDelivery.updateMany({ where: { reportId: { in: reportIds } }, data: { phoneCiphertext: null, phoneIv: null, phoneTag: null, phoneHash: null, status: "REVOKED", lastStatusAt: new Date() } });
      await tx.generationArtifact.deleteMany({ where: { reportId: { in: reportIds } } });
      await tx.report.updateMany({
        where: { id: { in: reportIds } },
        data: {
          userId: null,
          ownerTokenHash: "deleted",
          chatName: "Deleted report",
          content: Prisma.DbNull,
          preview: Prisma.DbNull,
          messageCount: 0,
          participantCount: 0,
          dateRange: null,
          payloadReference: null,
          payloadExpiresAt: null,
          publicErrorCode: null,
          rawDeletedAt: new Date(),
          status: "DELETED",
          deletedAt: new Date(),
        },
      });
      await tx.otpCode.deleteMany({ where: { email: session.user.email } });
      await tx.session.deleteMany({ where: { userId: session.userId } });
      await tx.user.delete({ where: { id: session.userId } });
    }, { isolationLevel: "Serializable" });
    const response = new NextResponse(null, { status: 204 });
    response.cookies.set({ name: "roastin_session", value: "", path: "/", maxAge: 0 });
    response.cookies.set({ name: "roastin_owner", value: "", path: "/", maxAge: 0 });
    return response;
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Type DELETE to confirm" }, { status: 400 });
    return NextResponse.json({ error: "Account deletion failed" }, { status: 500 });
  }
}
