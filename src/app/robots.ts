import type { MetadataRoute } from "next";
import { siteUrl } from "@/i18n/metadata";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/r/", "/s/", "/reports", "/login", "/*/create"] },
    sitemap: new URL("/sitemap.xml", siteUrl).toString(),
  };
}
