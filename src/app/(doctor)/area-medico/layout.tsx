import type { ReactNode } from "react";
import {
  LayoutDashboard,
  User,
  CalendarClock,
  CalendarDays,
  Wallet,
  Star,
} from "lucide-react";
import { DashboardShell, type DashboardNavItem } from "@/components/layout/dashboard-shell";
import { getCurrentProfile } from "@/lib/queries/profile";

const NAV_ITEMS: DashboardNavItem[] = [
  { href: "/area-medico", label: "Dashboard", icon: LayoutDashboard },
  { href: "/area-medico/appuntamenti", label: "Appuntamenti", icon: CalendarDays },
  { href: "/area-medico/disponibilita", label: "Disponibilità", icon: CalendarClock },
  { href: "/area-medico/profilo", label: "Profilo", icon: User },
  { href: "/area-medico/pagamenti", label: "Pagamenti", icon: Wallet },
  { href: "/area-medico/recensioni", label: "Recensioni", icon: Star },
];

export default async function DoctorAreaLayout({ children }: { children: ReactNode }) {
  const profile = await getCurrentProfile();

  return (
    <DashboardShell navItems={NAV_ITEMS} userName={profile.full_name} roleLabel="Medico">
      {children}
    </DashboardShell>
  );
}
