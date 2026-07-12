import type { Metadata } from "next";
import { Geist, Space_Grotesk } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: {
    default: "Hobby Bangladesh",
    template: "%s | Hobby Bangladesh",
  },
  description: "Hobby Bangladesh provides the best craft supplies in Bangladesh. Here, you can buy pre-made art materials like pre-marked MDF bases, wooden bases, kids room decor, home accessories, personalized lamps, Mirror, Lippon Art and much more.",
  openGraph: {
    title: "Hobby Bangladesh",
    description: "Hobby Bangladesh provides the best craft supplies in Bangladesh. Here, you can buy pre-made art materials like pre-marked MDF bases, wooden bases, kids room decor, home accessories, personalized lamps, Mirror, Lippon Art and much more.",
    url: defaultUrl,
    siteName: "Hobby Bangladesh",
    locale: "en_BD",
    type: "website",
  },
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  display: "swap",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.className} ${spaceGrotesk.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>{children}</TooltipProvider>
          <Toaster position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
