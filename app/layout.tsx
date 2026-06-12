import type { Metadata } from "next";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

export const metadata: Metadata = {
  title: "Vannamruta | Luxury Ayurvedic Elixir",
  description: "Discover the celebrated Kumkumadi Taila ritual with a refined shopping experience, premium product details, and concierge support.",
  keywords: ["Kumkumadi Taila", "Ayurvedic skincare", "luxury beauty", "saffron elixir", "Vannamruta"],
  openGraph: {
    title: "Vannamruta | Luxury Ayurvedic Elixir",
    description: "A cinematic, luxury-first shopping experience for the legendary Kumkumadi Taila ritual.",
    type: "website",
    siteName: "Vannamruta",
  },
};

export const viewport = {
  themeColor: "#050505",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
