import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "Brave & Planned CRM",
  description: "English learning center management system",
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#1a1a2e] text-white">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "rgba(255, 214, 98, 0.1)",
              border: "1px solid rgba(255, 214, 98, 0.2)",
              color: "#FFD662",
            },
          }}
        />
      </body>
    </html>
  );
}
