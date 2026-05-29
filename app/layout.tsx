import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WatchParty",
  description: "Watch videos together with synced playback and realtime chat.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
