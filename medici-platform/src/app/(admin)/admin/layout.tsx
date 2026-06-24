import type { ReactNode } from "react";
import { LayoutDashboard, Stethoscope, Users, CalendarDays, BarChart3 } from "lucide-react";
import { DashboardShell, type DashboardNavItem } from "@/components/layout/dashboard-shell";
import { getCurrentProfile } from "@/lib/queries/profile";

const NAV_ITEMS: DashboardNavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/medici", label: "Medici", icon: Stethoscope },
  { href: "/admin/utenti", label: "Utenti", icon: Users },
  { href: "/admin/appuntamenti", label: "Appuntamenti", icon: CalendarDays },
  { href: "/admin/statistiche", label: "Statistiche", icon: BarChart3 },
];

export default async function AdminAreaLayout({ children }: { children: ReactNode }) {
  const profile = await getCurrentProfile();

  return (
    <DashboardShell navItems={NAV_ITEMS} userName={profile.full_name} roleLabel="Admin">
      {children}
    </DashboardShell>
  );
}
