"use client"

import * as React from "react"
import {
  IconDashboard,
  IconInnerShadowTop,
  IconTestPipe2Filled,
  IconUserFilled,
  IconFileBarcode,
  IconReport,
  IconUsers,
} from "@tabler/icons-react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Usuarios",
      url: "/users",
      icon: IconUsers,
    },
    {
      title: "Ordenes",
      url: "/orders",
      icon: IconFileBarcode,
    },
    {
      title: "Muestras",
      url: "/samples",
      icon: IconTestPipe2Filled,
    },
    {
      title: "Analisis",
      url: "/analysis",
      icon: IconReport,
    },
    {
      title: "Mis resultados",
      url: "/miresults",
      icon: IconUserFilled,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Mario</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain/>
      </SidebarContent>
      <SidebarFooter>
        <NavUser/>
      </SidebarFooter>
    </Sidebar>
  )
}
