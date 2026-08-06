import "@fontsource-variable/dm-sans";
import "@fontsource-variable/fraunces";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { isLocale } from "@/i18n/config";
import { siteUrl } from "@/i18n/metadata";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: "Roastin Has Notes — Your group chat, unfiltered",
    template: "%s · Roastin Has Notes",
  },
  description:
    "Upload a WhatsApp conversation and get the unfiltered report nobody in the chat would dare to write.",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const requestedLocale = (await headers()).get("x-roastin-locale") ?? "en";
  const locale = isLocale(requestedLocale) ? requestedLocale : "en";
  return (
    <html data-scroll-behavior="smooth" lang={locale}>
      <body>{children}</body>
    </html>
  );
}
