'use client'
import React from "react";
import { Project } from "@prisma/client";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { JsonValue } from "@prisma/client/runtime/library";
import { toast } from "sonner";
import { useSlideStore } from "@/store/useSlideStore";
import { useRouter } from "next/navigation";
import { useSearchStore } from "@/store/useSearchStore";

type Props = {
  recentProjects: Project[];
};

const RecentOpen = ({ recentProjects }: Props) => {
    const router = useRouter()
    const { setSlides } = useSlideStore();
    const { searchQuery } = useSearchStore();

    // Filter recent projects based on search query
    const filteredRecentProjects = recentProjects.filter((project) => {
      if (!searchQuery.trim()) return true;
      
      const query = searchQuery.toLowerCase().trim();
      return (
        project.title.toLowerCase().includes(query) ||
        (project.themeName && project.themeName.toLowerCase().includes(query))
      );
    });

    const handleClick = (projectId: string, slides: JsonValue)=> {
      if (!projectId || !slides) {
        toast.error("Project not found" ,{
          description: "Please try again.",
        })
        return
      }
      
      // Ensure slides is an array before setting it
      // Clear old slides before setting fresh ones to avoid stale render
      setSlides([]);
      const slidesData = slides ? JSON.parse(JSON.stringify(slides)) : [];
      const slidesArray = Array.isArray(slidesData) ? slidesData : [];
      setSlides(slidesArray);
      router.push(`/presentation/${projectId}`)
    };

  return (
    filteredRecentProjects.length > 0 ? (
      <SidebarGroup>
        <SidebarGroupLabel> 
          Recently opened
          {searchQuery && (
            <span className="text-xs text-muted-foreground ml-2">
              ({filteredRecentProjects.length} of {recentProjects.length})
            </span>
          )}
        </SidebarGroupLabel>
        <SidebarMenu>
          {filteredRecentProjects.map((item, idx) => (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                className="hover:bg-primary-80"
              >
                <Button
                  variant="link"
                  onClick={() => handleClick(item.id, item.slides)}
                  className={`text-xs items-center justify-start`}
                >
                  <span> {item.title} </span>
                </Button>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>
    ) : (
      searchQuery && recentProjects.length > 0 ? (
        <SidebarGroup>
          <SidebarGroupLabel>Recently opened</SidebarGroupLabel>
          <div className="px-3 py-2 text-xs text-muted-foreground">
            No recent projects match your search
          </div>
        </SidebarGroup>
      ) : null
    )
  );
}

export default RecentOpen;