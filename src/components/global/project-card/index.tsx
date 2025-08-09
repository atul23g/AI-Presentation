"use client";

import { itemVariants, themes } from "@/lib/constants";
import { useSlideStore } from "@/store/useSlideStore";
import { JsonValue } from "@prisma/client/runtime/library";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import Image from "next/image";
import ThumbnailPreview from "./thumbnail-preview";
import { timeAgo } from "@/lib/utils";
import AlertDialogBox from "../alert-dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { deleteProject, recoverProject } from "@/actions/project";
import { Description } from "@radix-ui/react-alert-dialog";

type Props = {
  projectId: string;
  title: string;
  createdAt: string;
  isDelete?: boolean;
  slideData: JsonValue;
  themeName: string;
};

function ProjectCard({
  projectId,
  title,
  createdAt,
  isDelete,
  slideData,
  themeName,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const { setSlides } = useSlideStore();
  const router = useRouter();

  const handleNavigation = () => {
    // Ensure slideData is an array before setting it
    const slidesData = slideData ? JSON.parse(JSON.stringify(slideData)) : [];
    const slidesArray = Array.isArray(slidesData) ? slidesData : [];
    setSlides(slidesArray);
    router.push(`/presentation/${projectId}`);
  };

  const theme = themes.find((theme) => theme.name === themeName) || themes[0];

  const handleRecover = async () => {
    setLoading(true);
    if (!projectId) {
      setLoading(false);
      toast("Error", {
        description: "Project not found.",
      });
      return;
    }
    try {
      const res = await recoverProject(projectId);
      if (res.status !== 200) {
        setLoading(false);
        toast.error("Oops!", {
          description: res.error || "something went wrong",
        });
        return;
      }
      // Immediately hide the card and close dialog
      setIsDeleted(true);
      setOpen(false);
      toast.success("Success!", {
        description: "Project recovered successfully.",
      });
      
      // Refresh the page after a short delay to update the server state
      setTimeout(() => {
        router.refresh();
      }, 500);
    } catch (error) {
      console.log(error);
      setLoading(false);
      toast.error("Oops!", {
        description: "something went wrong. Please contact support.",
      });
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);

      if (!projectId) {
        setLoading(false);
        toast.error("Error!", {
          description: "Project not found.",
        });
        return;
      }

      const res = await deleteProject(projectId);

      if (res.status !== 200) {
        setLoading(false);
        toast.error("Oops!", {
          description: res.error || "Failed to delete project!",
        });
        return;
      }

      // Immediately hide the card and close dialog
      setIsDeleted(true);
      setOpen(false);
      toast.success("Project deleted successfully.");
      
      // Refresh the page after a short delay to update the server state
      setTimeout(() => {
        router.refresh();
      }, 500);
    } catch (error) {
      console.log(error);
      setLoading(false);
      toast.error("Oops!", {
        description: "Something went wrong. Please contact support.",
      });
    }
  };

  // Don't render the card if it's been deleted
  if (isDeleted) {
    return null;
  }

  return (
    <motion.div
      className={`group w-full flex flex-col gap-y-3 rounded-xl p-3 transition-colors ${
        !isDelete ? "hover:bg-muted/50" : ""
      }`}
      variants={itemVariants}
    >
      <div
        className="relative aspect-[16/10] overflow-hidden rounded-lg cursor-pointer"
        onClick={handleNavigation}
      >
        {imageLoading && (
          <div 
            className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 animate-pulse"
            style={{
              background: `linear-gradient(135deg, ${theme.accentColor}20, ${theme.accentColor}40)`
            }}
          />
        )}
        <Image
          src="https://plus.unsplash.com/premium_photo-1729004379397-ece899804701?q=80&w=2767&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt={`${title} project thumbnail`}
          fill
          className={`object-cover transition-all duration-300 group-hover:scale-105 ${
            imageLoading ? 'opacity-0' : 'opacity-100'
          }`}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          onLoad={() => setImageLoading(false)}
          onError={(e) => {
            // Fallback to a gradient background if image fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            target.parentElement!.style.background = `linear-gradient(135deg, ${theme.accentColor}20, ${theme.accentColor}40)`;
            setImageLoading(false);
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <div className="w-full">
        <div className="space-y-1">
          <h3 className="font-semibold text-base text-primary line-clamp-1">
            {title}
          </h3>
          <div className="flex w-full justify-between items-center gap-2">
            <p
              className="text-sm text-muted-foreground"
              suppressHydrationWarning
            >
              {timeAgo(createdAt)}
            </p>
            {isDelete ? (
              <AlertDialogBox
                description="This will recover your project and restore your data."
                className="bg-green-500 text-white dark:bg-green-600 hover:bg-green-700"
                loading={loading}
                open={open}
                handleOpen={() => setOpen(!open)}
                onClick={handleRecover}
                actionText="Recover"
              >
                <Button
                  size="sm"
                  variant="ghost"
                  className="bg-background-80 dark:hover:bg-background-90"
                  disabled={loading}
                >
                  Recover
                </Button>
              </AlertDialogBox>
            ) : (
              <AlertDialogBox
                description="This will delete your project and send it to trash."
                className="bg-red-500 text-white dark:bg-red-600 hover:bg-red-700"
                loading={loading}
                open={open}
                handleOpen={() => setOpen(!open)}
                onClick={handleDelete}
                actionText="Delete"
              >
                <Button
                  size="sm"
                  variant="ghost"
                  className="bg-background-80 dark:hover:bg-background-90"
                  disabled={loading}
                >
                  Delete
                </Button>
              </AlertDialogBox>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default ProjectCard;
