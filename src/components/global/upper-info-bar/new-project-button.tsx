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

  const handleClick = async () => {
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

  return (
    <Button
      disabled={!user?.subscription || isLoading}
      className="rounded-lg font-semibold"
      onClick={handleClick}
    >
      {isLoading ? (
        <Loader2 className="animate-spin" />
      ) : (
        <Plus />
      )}
      {isLoading ? "Creating..." : "New Project"}
    </Button>
  );
};

export default NewProjectButton;