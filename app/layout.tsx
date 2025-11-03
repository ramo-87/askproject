import type { Metadata } from "next";
import { Rubik, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

const rubikSans = Rubik({
  variable: "--font-rubik",
  subsets: ["latin", "arabic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AMA",
  description: "backend bro does frontend stuff kind of project",
  twitter: {
    card: "summary",
    site: "https://ask.omaryahya.net",
    creator: "Omar Yahya",
    images: "https://ask.omaryahya.net/twitter_og.png",
  },
  openGraph: {
    type: "website",
    url: "https://ask.omaryahya.net",
    title: "AMA",
    description: "Ask me anonymous questions",
    siteName: "https://omaryahya.net",
    images: [{ url: "https://ask.omaryahya.net/og.png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${rubikSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}
