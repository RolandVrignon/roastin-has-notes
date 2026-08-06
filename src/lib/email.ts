function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character] ?? character);
}

export async function sendReportAccessEmail(input: { email: string; reportId: string; chatName: string; paymentId: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) return { sent: false };
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const reportUrl = new URL(`/r/${input.reportId}`, origin).toString();
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `roastin-report-access-${input.paymentId}`,
    },
    body: JSON.stringify({
      from,
      to: [input.email],
      subject: "Your full Roastin report is unlocked",
      html: `<div style="font-family:Arial,sans-serif;color:#112b4d"><h1>Roastin has notes.</h1><p>Your full report for <strong>${escapeHtml(input.chatName)}</strong> is unlocked.</p><p><a href="${escapeHtml(reportUrl)}">Open your private report</a></p><p>Keep this email private. You can create separate, revocable sharing links from the report.</p></div>`,
    }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error("Email provider rejected the message");
  return { sent: true };
}
