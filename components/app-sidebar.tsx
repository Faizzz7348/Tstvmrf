"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Home,
  Inbox,
  Settings,
  Search,
  ChevronUp,
  ChevronDown,
  User2,
  Calendar,
  File,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
// Menu items.
const items = [
  {
    title: "Home",
    url: "/home",
    icon: Home,
    color: "text-blue-500",
  },
  {
    title: "Inbox",
    url: "/inbox",
    icon: Inbox,
    color: "text-purple-500",
  },
  {
    title: "Calendar",
    url: "/calendar",
    icon: Calendar,
    color: "text-green-500",
  },
  {
    title: "Search",
    url: "/search",
    icon: Search,
    color: "text-orange-500",
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
    color: "text-gray-500",
  },
]

const projects = [
  {
    title: "Route List",
    url: "#",
    icon: File,
    color: "text-pink-500",
    items: [
      {
        title: "Selangor",
        url: "/selangor",
      },
      {
        title: "Kuala Lumpur",
        url: "/kuala-lumpur",
      },
    ],
  },
  {
    title: "Plano",
    url: "#",
    icon: File,
    color: "text-cyan-500",
    items: [
      {
        title: "Standard",
        url: "/standard",
      },
      {
        title: "Analytics",
        url: "#",
      },
    ],
  },
]

export function AppSidebar() {
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({})

  const toggleMenu = (title: string) => {
    setOpenMenus(prev => {
      const isCurrentlyOpen = prev[title]
      // Tutup semua menu lain dan buka yang dipilih - animasi serentak
      const newState: Record<string, boolean> = {}
      
      // Set semua menu lain ke false untuk trigger sliding close
      Object.keys(prev).forEach(key => {
        newState[key] = false
      })
      
      // Toggle menu yang dipilih
      if (!isCurrentlyOpen) {
        newState[title] = true
      }
      
      return newState
    })
  }

  return (
    <Sidebar className="h-full">
      <SidebarHeader className="p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  <Home className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">My App</span>
                  <span className="text-xs">v1.0.0</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="overflow-y-auto">
        <SidebarGroup>
          <SidebarGroupLabel className="px-2 py-1.5">Platform</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon className={item.color} />
                      <span className="text-base font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="my-2" />

        <SidebarGroup>
          <SidebarGroupLabel className="px-2 py-1.5">Vending Machines</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {projects.map((project) => (
                <SidebarMenuItem key={project.title}>
                  <SidebarMenuButton 
                    onClick={(e) => {
                      e.preventDefault()
                      toggleMenu(project.title)
                    }}
                    className="cursor-pointer"
                  >
                    <project.icon className={project.color} />
                    <span className="text-base font-medium">{project.title}</span>
                    {project.items?.length ? (
                      openMenus[project.title] ? (
                        <ChevronUp className="ml-auto h-4 w-4" />
                      ) : (
                        <ChevronDown className="ml-auto h-4 w-4" />
                      )
                    ) : null}
                  </SidebarMenuButton>
                  <div 
                    className={`grid transition-all duration-300 ease-in-out ${
                      openMenus[project.title] 
                        ? 'grid-rows-[1fr] opacity-100' 
                        : 'grid-rows-[0fr] opacity-0'
                    }`}
                  >
                    <div className="overflow-hidden">
                      {project.items?.length ? (
                        <SidebarMenuSub className="py-1">
                          {project.items.map((item) => (
                            <SidebarMenuSubItem key={item.title}>
                              <SidebarMenuSubButton asChild>
                                <Link href={item.url}>{item.title}</Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      ) : null}
                    </div>
                  </div>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-2 mt-auto">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <User2 className="text-yellow-500" />
                  <span>Username</span>
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-popper-anchor-width]"
              >
                <DropdownMenuItem>
                  <span>Account</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span>Billing</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
