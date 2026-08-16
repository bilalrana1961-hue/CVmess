import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { Toaster } from "sonner";
import { CVMessProvider } from "@/components/app-provider";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const incoming = await headers();
  const host = incoming.get("x-forwarded-host") || incoming.get("host") || "localhost:3000";
  const protocol = incoming.get("x-forwarded-proto") || (host.startsWith("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;
  return {
    metadataBase: new URL(origin),
    title: { default: "CVmess — Order. Track. Settle.", template: "%s · CVmess" },
    description: "A transparent monthly mess ordering and billing system for the CV 105 community.",
    applicationName: "CVmess",
    openGraph: {
      title: "CVmess — Order. Track. Settle.",
      description: "Clear meals. Fair bills. Built for the CV 105 community.",
      type: "website",
      images: [{ url: `${origin}/og.png`, width: 1200, height: 630, alt: "CVmess — Order. Track. Settle." }],
    },
    twitter: { card: "summary_large_image", title: "CVmess", description: "Order. Track. Settle.", images: [`${origin}/og.png`] },
  };
}

export const viewport: Viewport = { themeColor: "#626747", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <CVMessProvider>{children}</CVMessProvider>
        <Toaster richColors position="top-right" toastOptions={{ className: "cvmess-toast" }} />
      </body>
    </html>
  );
}
