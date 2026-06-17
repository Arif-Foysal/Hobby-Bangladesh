"use client";

import Link from "next/link";
import {
  IconDashboard,
  IconShoppingCart,
  IconCategory,
  IconReceipt,
  IconStar,
  IconUsers,
  IconSettings,
  IconInnerShadowTop,
} from "@tabler/icons-react";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const navMain = [
  { title: "Dashboard", url: "/admin", icon: IconDashboard },
  { title: "Products", url: "/admin/products", icon: IconShoppingCart },
  { title: "Categories", url: "/admin/categories", icon: IconCategory },
  { title: "Orders", url: "/admin/orders", icon: IconReceipt },
  { title: "Reviews", url: "/admin/reviews", icon: IconStar },
  { title: "Customers", url: "/admin/customers", icon: IconUsers },
];

const navSecondary = [
  { title: "Settings", url: "/admin/settings", icon: IconSettings },
];

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user: { name: string; email: string; avatar: string };
}) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link href="/admin">
                <IconInnerShadowTop className="size-5!" />
                <span className="text-base font-semibold">Hobby BD</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
