"use client";

import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

import { useUser } from "@clerk/nextjs";
import { use } from "react";

import { ModeToggle } from '@/components/theme-button'

export function SiteHeader() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return <p>Cargando...</p>;
  }

  let username = ""
  if(user){
    username = user.fullName
  }

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">{username}</h1>
      </div>
      <div className="pr-2">
        <ModeToggle/>
      </div>
    </header>
  )
}
