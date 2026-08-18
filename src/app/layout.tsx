import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import EmotionRegistry from "./registry";
import Providers from "./providers";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "CineGraph — explore movies, casts and connections",
    template: "%s · CineGraph",
  },
  description:
    "A graph database demo backed by CognoDB: explore how movies, actors and directors are connected.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <EmotionRegistry>
          <Providers>
            <Nav />
            <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 pb-20">
              {children}
            </main>
            <Footer />
          </Providers>
        </EmotionRegistry>
      </body>
    </html>
  );
}