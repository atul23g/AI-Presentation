"use client"
import { Project, User } from "@prisma/client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import NavMain from "./nav-main";
import { data } from "@/lib/constants";
import RecentOpen from "./recent-open";
import NavFooter from "./nav-footer";
// Make sure this is the correct path



const AppSidebar = ({
  recentProjects,
  user,
  ...props
}: {
  recentProjects: Project[];
} & {
  user: User;
} & React.ComponentProps<typeof Sidebar>) => {
  return (
    <Sidebar
      collapsible="icon"
      className="max-w-[212px] bg-background-90"
      {...props}
    >
      <SidebarHeader className="pt-6 px-2 pb-0">
        <SidebarMenuButton
          size="default"
          className="data-[state=open]:text-sidebar-accent-foreground"
        >
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg text-sidebar-primary-foreground">
            <Avatar className="h-8 w-8 rounded-full">
              <AvatarImage src="/vivid.png" alt="AI Presentation logo" />
              <AvatarFallback className="rounded-lg">AI</AvatarFallback>
            </Avatar>
          </div>
          <span className="truncate whitespace-nowrap text-primary text-lg font-semibold">
            AI-Presentation
          </span>
        </SidebarMenuButton>
      </SidebarHeader>

      <SidebarContent className="px-2 mt-10 gap-y-6">
        <NavMain items={data.navMain} />
      </SidebarContent>
        <RecentOpen recentProjects = {recentProjects}/>
      <SidebarFooter>
        <NavFooter prismaUser={user}/> 
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;