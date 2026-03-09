import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "CipherCore Academy — Learn Real Tech Skills",
  description: "Master Cybersecurity, Web Dev, AI, Data, and Cloud with hands-on courses taught by industry experts.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: { fontFamily: "DM Sans, sans-serif", fontSize: "14px" },
          }}
        />
      </body>
    </html>
  );
}
