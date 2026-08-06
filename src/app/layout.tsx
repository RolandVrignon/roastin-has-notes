import "@fontsource-variable/dm-sans";
import "@fontsource-variable/fraunces";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Roastin Has Notes — Your group chat, unfiltered",
    template: "%s · Roastin Has Notes",
  },
  description:
    "Upload a WhatsApp conversation and get the unfiltered report nobody in the chat would dare to write.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html data-scroll-behavior="smooth" lang="en">
      <body>{children}</body>
    </html>
  );
}
