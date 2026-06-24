import type { ReactNode } from "react";
import { LayoutDashboard, User, CalendarDays } from "lucide-react";
import { DashboardShell, type DashboardNavItem } from "@/components/layout/dashboard-shell";
import { getCurrentProfile } from "@/lib/queries/profile";

const NAV_ITEMS: DashboardNavItem[] = [
  { href: "/area-paziente", label: "Dashboard", icon: LayoutDashboard },
  { href: "/area-paziente/appuntamenti", label: "Appuntamenti", icon: CalendarDays },
  { href: "/area-paziente/profilo", label: "Profilo", icon: User },
];

export default async function PatientAreaLayout({ children }: { children: ReactNode }) {
  const profile = await getCurrentProfile();

  return (
    <DashboardShell navItems={NAV_ITEMS} userName={profile.full_name} roleLabel="Paziente">
      {children}
    </DashboardShell>
  );
}
