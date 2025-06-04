import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import localFont from "next/font/local";
import { ToastContainer } from "react-toastify";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


const suisse = localFont({
  src: [
    {
      path: "../assets/fonts/suisse-intl/SuisseIntl-Light.ttf",
      weight: "300",
      style: "light",
    },
    {
      path: "../assets/fonts/suisse-intl/SuisseIntl-Regular.ttf",
      weight: "400",
      style: "regular",
    },
    {
      path: "../assets/fonts/suisse-intl/SuisseIntl-Medium.ttf",
      weight: "500",
      style: "medium",
    },
    {
      path: "../assets/fonts/suisse-intl/SuisseIntl-SemiBold.ttf",
      weight: "600",
      style: "semibold",
    },
    {
      path: "../assets/fonts/suisse-intl/SuisseIntl-Bold.ttf",
      weight: "700",
      style: "bold",
    },
   
  ],
  variable: "--font-suisse",
});

export const metadata: Metadata = {
  title: "rock.fun",
  description: "The pump.fun alternative for Graphite Network",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${suisse.variable} antialiased flex flex-col desktop:items-center`}
      >
        {children}
        <ToastContainer/>
      </body>
    </html>
  );
}
