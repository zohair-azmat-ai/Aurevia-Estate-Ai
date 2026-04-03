import type { Metadata } from "next";
import { DashboardShell } from "../../components/dashboard/page-shell";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Premium Aurevia Estate AI dashboard shell and overview.",
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <DashboardShell>{children}</DashboardShell>;
}
