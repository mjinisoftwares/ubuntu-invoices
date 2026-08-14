"use client"
import * as React from "react"

import { NavMain } from "@/components/nav-main"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { SquaresFourIcon, ListIcon, FileTextIcon, UsersIcon } from "@phosphor-icons/react"
import { Separator } from "./ui/separator"

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: (
        <SquaresFourIcon />
      ),
    },
    {
      title: "Invoices",
      url: "/dashboard/invoices",
      icon: (
        <FileTextIcon />
      ),
    },
    {
      title: "Quotations",
      url: "/dashboard/quotations",
      icon: (
        <ListIcon />
      ),
    },
    {
      title: "Clients",
      url: "/dashboard/clients",
      icon: (
        <UsersIcon />
      ),
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
          <img src="/ubuntu.webp" alt="logo" className="ml-4 h-12 sm:h-16 lg:h-20 w-auto object-contain" />
         
           </SidebarMenuItem>
           <Separator />
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
    </Sidebar>
  )
}
