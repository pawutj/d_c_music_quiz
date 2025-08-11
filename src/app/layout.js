import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Music Quiz - ทดสอบความรู้เพลง 2 โหมด",
  description: "เกมทายชื่อเพลงและชื่ออัลบั้ม พร้อมระบบจับเวลา 30 วินาทีต่อข้อ และแสดงเฉลย 10 วินาที",
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}