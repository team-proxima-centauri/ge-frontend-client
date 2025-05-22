import type { Metadata } from "next";
import { IBM_Plex_Mono } from "next/font/google";
import { Footer } from "@/components/Footer";

import "@/app/globals.css";

const ibm = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "GroceryEase - Online Grocery Delivery",
  description: "Your one-stop solution for grocery delivery with individual and group shopping options.",
  keywords: "grocery, delivery, online shopping, group cart, collaborative shopping",
  authors: [{ name: "Proxima Centauri Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  return (
    <html lang="en">
      <head>
      <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
      </head>
      <body
        className={`${ibm.variable} antialiased min-h-screen overflow-x-hidden flex flex-col`}
      >
        <div className="flex-grow">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
