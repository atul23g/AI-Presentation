"use client";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { SignedIn, UserButton, useUser } from "@clerk/nextjs";
import { User } from "@prisma/client";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { buySubscription } from "@/actions/lemonSqueezy";
import { toast } from "sonner";

const NavFooter = ({ prismaUser }: { prismaUser: User }) => {
  const { isLoaded, isSignedIn, user } = useUser();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleUpgrade = async () => {
    if (!user?.id) {
      toast.error("User not found");
      return;
    }

    // Get the Prisma user ID, not Clerk user ID
    if (!prismaUser?.id) {
      toast.error("User data not found");
      return;
    }

    setLoading(true);
    try {
      console.log("🟢 Starting upgrade for user:", prismaUser.id);
      const result = await buySubscription(prismaUser.id);
      
      if (result.status === 200 && result.url) {
        console.log("✅ Redirecting to checkout:", result.url);
        // Redirect to Lemon Squeezy checkout
        window.location.href = result.url;
      } else {
        console.error("❌ Checkout creation failed:", result);
        toast.error("Failed to create checkout session", {
          description: result.message || "Please try again later",
        });
      }
    } catch (error) {
      console.error("❌ Upgrade error:", error);
      toast.error("Something went wrong", {
        description: "Please try again later",
      });
    } finally {
      setLoading(false);
    }
  };





  if (!isLoaded || !isSignedIn) {
    return null;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div className="flex flex-col gap-y-6 items-start group-data-[collapsible=icon]:hidden">
          {!prismaUser.subscription && (
            <div className="flex flex-col items-start p-2 pb-3 gap-4 bg-background-80 rounded-xl">
              <div className="flex flex-col item-start gap-1">
                <p className="text-base font-bold">
                  Get <span className="text-vivid">Creative AI</span>
                </p>
                <span className="text-sm dark:text-secondary">
                  Unlock all features including AI and more
                </span>
              </div>
              <div className="w-full bg-vivid-gradient p-[1px] rounded-full group">
                <Button
                  className="w-full bg-background-80 group-hover:bg-background-90 text-primary rounded-full font-bold border-0 transition-colors"
                  variant={"default"}
                  size={"lg"}
                  onClick={handleUpgrade}
                  disabled={loading}
                >
                  {loading ? "Upgrading..." : "Upgrade"}
                </Button>
              </div>


            </div>
          )}

          <SignedIn>
            <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
              <UserButton />
              <div className="flex flex-col ml-2 overflow-hidden">
                <span className="truncate font-semibold">{user?.fullName}</span>
                <span className="text-secondary truncate">
                  {user?.emailAddresses?.[0]?.emailAddress}
                </span>
              </div>
            </SidebarMenuButton>
          </SignedIn>
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};

export default NavFooter;