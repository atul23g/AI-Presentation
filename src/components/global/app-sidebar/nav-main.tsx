"use client";
import React, { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuBadge,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Loader2 } from "lucide-react";

const NavMain = ({
  items,
}: {
  items?: {
    title: string;
    url: string;
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const [loadingItem, setLoadingItem] = useState<string | null>(null);

  // Add safety check for undefined/empty items
  if (!items || !Array.isArray(items)) {
    return null;
  }

  const handleNavigation = useCallback(async (url: string, title: string) => {
    // Set loading state immediately for instant feedback
    setLoadingItem(title);
    
    try {
      if (pathname !== url) {
        // Use router.push for navigation
        await router.push(url);
      } else {
        // If already on the same page, refresh to show loading state
        await router.refresh();
      }
    } catch (error) {
      console.error('Navigation error:', error);
      // Clear loading state on error
      setLoadingItem(null);
    }
    // Note: Loading state will be cleared by the component unmounting or route change
  }, [pathname, router]);

  // Clear loading state when pathname changes (navigation completes)
  useEffect(() => {
    setLoadingItem(null);
  }, [pathname]);

  return (
    <SidebarGroup className="p-0">
      <SidebarMenu>
        {items.map((item, idx) => {
          const isLoading = loadingItem === item.title;
          const isActive = pathname.includes(item.url);
          
          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                className={`${isActive && "bg-muted"}`}
              >
                <button
                  onClick={() => handleNavigation(item.url, item.title)}
                  disabled={isLoading}
                  className={`text-lg w-full text-left flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-300 ${
                    isActive ? "font-bold bg-muted" : "hover:bg-muted"
                  } ${isLoading ? "cursor-not-allowed opacity-70 bg-muted/50 scale-95" : "hover:scale-[1.02]"}`}
                >
                  {isLoading ? (
                    <Loader2 className="text-lg animate-spin text-primary" />
                  ) : (
                    <item.icon className="text-lg transition-transform duration-200" />
                  )}
                  <span className={`transition-opacity duration-200 ${isLoading ? "opacity-70" : ""}`}>
                    {item.title}
                  </span>
                </button>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
};

export default NavMain;