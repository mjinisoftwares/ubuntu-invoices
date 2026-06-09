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
import { SquaresFourIcon, ListIcon, FileTextIcon } from "@phosphor-icons/react"
import Image from "next/image"
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
  ],

}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
           <span className="text-2xl font-black ml-4">Ubuntu Logistics</span>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
    </Sidebar>
  )
}
