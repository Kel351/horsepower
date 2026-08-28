import { Geist, Geist_Mono } from "next/font/google";
import ClientLayout from "@/components/ClientLayout";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Horsepower Global Ministry",
  description: "Leadership & Directory System",
  icons: {
    icon: "/hspwr.jpg",
    shortcut: "/hspwr.jpg",
    apple: "/hspwr.jpg",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased overflow-x-hidden`}
    >
     <head>
        <link rel="icon" href="/hspwr1.png?v=2" type="image/png" />
        <link rel="shortcut icon" href="/hspwr1.png?v=2" type="image/png" />
      </head>
      <body className="min-h-full flex flex-col bg-slate-100 text-slate-900 overflow-x-hidden">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}