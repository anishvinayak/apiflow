import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "APIFLOW | API Management Platform",
  description:
    "APIFLOW is a developer-focused API management platform with API keys, rate limiting, gateway requests, and usage analytics.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}