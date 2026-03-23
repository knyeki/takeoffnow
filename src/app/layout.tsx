import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TakeoffNow.ai — AI-Powered Glazing Takeoffs",
  description:
    "Upload your architectural plans. Get accurate glazing takeoffs in minutes, not hours. Storefront, curtain wall, showers, mirrors, and more.",
  openGraph: {
    title: "TakeoffNow.ai — AI-Powered Glazing Takeoffs",
    description:
      "Upload your architectural plans. Get accurate glazing takeoffs in minutes, not hours.",
    url: "https://takeoffnow.ai",
    siteName: "TakeoffNow.ai",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
