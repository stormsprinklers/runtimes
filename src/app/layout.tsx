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

export const metadata: Metadata = {
  title: "Sprinkler Runtime Calculator | Storm Sprinklers Utah",
  description:
    "Free sprinkler program calculator for Utah homeowners. Get zone runtimes based on your city watering rules, drought restrictions, soil, slope, shade, and vegetation.",
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
