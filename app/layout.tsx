import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.sbgti.cn";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "三角洲人格测试",
  description:
    "三角洲人自己的SBTI，快来测测看你是唐王大人还是嘉豪？",
  openGraph: {
    title: "三角洲人格测试",
    description:
      "三角洲人自己的SBTI，快来测测看你是唐王大人还是嘉豪？",
    url: "/",
    siteName: "三角洲人格测试",
    locale: "zh_CN",
    type: "website",
    images: [
      {
        url: "/images/logo.png",
        alt: "三角洲人格测试",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "三角洲人格测试",
    description:
      "三角洲人自己的SBTI，快来测测看你是唐王大人还是嘉豪？",
    images: ["/images/logo.png"],
  },
  icons: {
    icon: "/images/logo.png",
    shortcut: "/images/logo.png",
    apple: "/images/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
