import type { Metadata } from "next";
import localFont from "next/font/local";
import { Source_Sans_3 } from "next/font/google";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import "./globals.css";

const lulo = localFont({
  src: "../../public/fonts/Lulo-Clean-One-Bold.otf",
  variable: "--font-display",
  display: "swap",
});

const body = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-body",
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover" as const,
};

export const metadata: Metadata = {
  title: "Storm Sprinklers Utah | Sprinkler Repair & Watering Tools",
  description:
    "Utah sprinkler repair, installation, and free watering run time calculators for Utah County and Salt Lake County homeowners.",
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
  openGraph: {
    title: "Sprinkler Runtime Calculator | Storm Sprinklers",
    description:
      "Build a smarter irrigation program for your Utah lawn sprinkler system.",
    siteName: "Storm Sprinklers",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${lulo.variable} ${body.variable} h-full`}>
      <body className="flex min-h-full flex-col antialiased">
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
