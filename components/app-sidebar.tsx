"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconChartBar, IconDashboard, IconHelp, IconInnerShadowTop, IconSearch, IconSettings } from "@tabler/icons-react";

import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";

import { NavUser } from "@/components/nav-user";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Products",
      url: "/products",
      icon: IconChartBar,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/settings",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "/help",
      icon: IconHelp,
    },
    {
      title: "Search",
      url: "/search",
      icon: IconSearch,
    },
  ],
};

// ================= NavMain =================
interface NavItemProps {
  title: string;
  url: string;
  icon: React.ElementType;
}

function NavMain({ items }: { items: NavItemProps[] }) {
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
            className={`flex items-center gap-2 px-3 py-2 rounded transition-colors duration-150 hover:bg-gray-100 dark:hover:bg-gray-800 ${isActive ? "bg-gray-200 dark:bg-gray-700 font-semibold" : ""}`}
          >
            <Icon className="!size-5" />
            <span className="text-sm">{item.title}</span>
          </Link>
        );
      })}
    </div>
  );
}

// ================= NavSecondary =================
function NavSecondary({ items }: { items: NavItemProps[] }) {
  const pathname = usePathname();
  return (
    <div className="space-y-1 mt-auto">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.url;
        return (
          <Link
            key={item.title}
            href={item.url}
            className={`flex items-center gap-2 px-3 py-2 rounded transition-colors duration-150 hover:bg-gray-100 dark:hover:bg-gray-800 ${isActive ? "bg-gray-200 dark:bg-gray-700 font-semibold" : ""}`}
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
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <Link href="/">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Laravel Next.JS</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
