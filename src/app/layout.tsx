import type { Metadata } from "next";
import { Inter, Playfair_Display, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ["latin"], variable: '--font-playfair' });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: '--font-jetbrains' });

export const metadata: Metadata = {
  title: "Knowith Capital AI",
  description: "AI-powered financial ecosystem for Knowith Capital",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body suppressHydrationWarning className={`${inter.variable} ${playfair.variable} ${jetbrains.variable} ${inter.className} bg-[#050505] text-white antialiased flex h-screen overflow-hidden`}>
        <Sidebar />
        <main className="flex-1 h-screen overflow-y-auto relative print:h-auto print:overflow-visible">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#050505] to-[#050505] -z-10 print:hidden" />
          {children}
        </main>
      </body>
    </html>
  );
}
