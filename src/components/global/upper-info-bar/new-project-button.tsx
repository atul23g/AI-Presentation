"use client"

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { User } from "@prisma/client";

const NewProjectButton = ({ user }: { user: User }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const [isActivating, setIsActivating] = useState(false);

  const handleClick = async () => {
    if (!user?.subscription || isActivating) return;
    setIsLoading(true);
    try {
      await router.push('/create-page');
    } catch (error) {
      console.error('Navigation error:', error);
      setIsLoading(false);
    }
    // Loading state will be cleared when component unmounts or route changes
  };

  // Clear loading state when pathname changes (navigation completes)
  useEffect(() => {
    setIsLoading(false);
  }, [pathname]);

  // Reflect activation state triggered from the sidebar "Free" button
  useEffect(() => {
    // If already subscribed, ensure flag is cleared
    if (user?.subscription) {
      try { localStorage.removeItem('subscriptionActivating'); } catch {}
      setIsActivating(false);
      return;
    }

    try {
      const flag = typeof window !== 'undefined' ? localStorage.getItem('subscriptionActivating') : null;
      if (flag) {
        setIsActivating(true);
        // Safety timeout in case refresh takes longer than expected
        const t = setTimeout(() => setIsActivating(false), 20000);
        return () => clearTimeout(t);
      }
    } catch {}
  }, [user?.subscription]);

  return (
    <Button
      aria-busy={isLoading || isActivating}
      disabled={!user?.subscription || isLoading || isActivating}
      className="rounded-lg font-semibold"
      onClick={handleClick}
    >
      {isLoading || isActivating ? (
        <Loader2 className="animate-spin" />
      ) : (
        <Plus />
      )}
      {isLoading ? "Creating..." : isActivating ? "Activating..." : "New Project"}
    </Button>
  );
};

export default NewProjectButton;