// AppSidebar.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconChartBar,
  IconDashboard,
  IconInnerShadowTop,
} from "@tabler/icons-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { NavUser } from "@/components/nav-user";

const navData = {
  navMain: [
    { title: "Dashboard", url: "/dashboard", icon: IconDashboard },
    { title: "Products", url: "/products", icon: IconChartBar },
  ],
  navSecondary: [], // semua item dihapus
};

// ================= NavList =================
interface NavItemProps {
  title: string;
  url: string;
  icon: React.ElementType;
}

function NavList({ items }: { items: NavItemProps[] }) {
  const pathname = usePathname();
  return (
    <div className="space-y-1">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.url;
        return (
          <Link
            key={item.title}
            href={item.url}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors duration-150
              ${isActive
                ? "bg-green-100 text-green-700 font-medium dark:bg-green-900 dark:text-green-200"
                : "hover:bg-gray-100 text-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              }`}
          >
            <Icon className="!size-5" />
            <span className="text-sm">{item.title}</span>
          </Link>
        );
      })}
    </div>
  );
}

// ================= AppSidebar =================
export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user: { name: string; email: string; avatar?: string | null };
}) {
  return (
    <Sidebar
      collapsible="offcanvas"
      {...props}
      className="bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800"
    >
      {/* HEADER */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-2"
            >
              <Link href="/" className="flex items-center gap-2">
                <IconInnerShadowTop className="!size-5 text-green-600" />
                <span className="text-base font-semibold bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent">
                  Laravel Next.JS
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* MAIN NAV */}
      <SidebarContent className="px-2 py-3 space-y-4">
        <NavList items={navData.navMain} />
      </SidebarContent>

      {/* FOOTER (User Info & Logout) */}
      <SidebarFooter className="p-2 border-t border-gray-200 dark:border-gray-800">
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
