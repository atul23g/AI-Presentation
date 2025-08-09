"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Theme } from "@/lib/types";
import { useSlideStore } from "@/store/useSlideStore";
import { toast } from "sonner";
import { Loader2, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateLayouts } from "@/actions/chatgpt";
import { motion } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";

type Props = {
  selectedTheme: Theme;
  themes: Theme[];
  onThemeSelect: (theme: Theme) => void;
};

const ThemePicker = ({ onThemeSelect, selectedTheme, themes }: Props) => {
  const router = useRouter();
  const params = useParams();
  const { project, setSlides, currentTheme } = useSlideStore();
  const [loading, setLoading] = useState(false);

  const handleGenerateLayouts = async () => {
    setLoading(true);

    // Debug: Log current state
    console.log("Current project:", project);
    console.log("Current theme:", currentTheme);
    console.log("Params:", params);

    if (!selectedTheme) {
      toast.error("Error", { description: "Please select a theme" });
      setLoading(false);
      return;
    }

    if (!project?.id) {
      toast.error("Error", { description: "Please create a project" });
      router.push("/create-page");
      return;
    }

    try {
      const PresentationId = (params.PresentationId || params.presentationId) as string;
      console.log(
        "Sending to API - PresentationId:",
        PresentationId,
        "theme:",
        currentTheme.name
      );

      const res = await generateLayouts(PresentationId, currentTheme.name);

      console.log("API Response:", res);

      // Handle specific quota error
      if (res.status === 429) {
        toast.error("API Quota Exceeded", {
          description: "Please wait a moment and try again. The AI service is temporarily overloaded.",
        });
        return;
      }

      if (res.status !== 200 || !('data' in res) || !res.data) {
        const errMsg = 'error' in res && res.error ? res.error : 'Failed to generate layouts';
        throw new Error(errMsg);
      }

      toast.success("Success", {
        description: "Layouts generated successfully",
      });

      // Only navigate if we have valid slides data
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        // Ensure res.data is an array before setting it
        const slidesArray = Array.isArray(res.data) ? res.data : [];
        console.log(`🟢 Setting ${slidesArray.length} slides in ThemePicker`);
        // Clear old slides first to avoid any stale render, then set fresh ones
        setSlides([]);
        setSlides(slidesArray);
        router.push(`/presentation/${PresentationId}`);
      } else {
        throw new Error("No slides data received from the server");
      }
    } catch (error) {
      console.error("Full error:", error);
      
      // Handle network errors
      if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
        toast.error("Network Error", {
          description: "Failed to connect to the server. Please check your connection and try again.",
        });
      } else {
        toast.error("Error", {
          description:
            error instanceof Error ? error.message : "Failed to generate layouts",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="w-[400px] overflow-hidden sticky top-0 h-screen flex flex-col"
      style={{
        backgroundColor:
          selectedTheme.sidebarColor || selectedTheme.backgroundColor,
        borderLeft: `1px solid ${selectedTheme.accentColor}20`,
      }}
    >
      <div className="p-8 space-y-6 flex-shrink-0">
        <div className="space-y-2">
          <h2
            className="text-3xl font-bold tracking-tight"
            style={{ color: selectedTheme.accentColor }}
          >
            Pick a theme
          </h2>
          <p
            className="text-sm"
            style={{ color: `${selectedTheme.accentColor}80` }}
          >
            Choose from our curated collection or generate a custom theme
          </p>
        </div>

        <Button
          className="w-full h-12 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300"
          style={{
            backgroundColor: selectedTheme.accentColor,
            color: selectedTheme.backgroundColor,
          }}
          onClick={handleGenerateLayouts}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              <p className="animate-pulse">Generating...</p>
            </>
          ) : (
            <>
              <Wand2 className="mr-2 h-5 w-5" />
              Generate Theme
            </>
          )}
        </Button>
      </div>

      <ScrollArea className="flex-grow px-8 pb-8">
        <div className="grid grid-cols-1 gap-4">
          {themes.map((theme) => (
            <motion.div
              key={theme.name}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={() => {
                  onThemeSelect(theme);
                }}
                className="flex flex-col items-center justify-start p-6 w-full h-auto"
                style={{
                  fontFamily: theme.fontFamily,
                  color: theme.fontColor,
                  background: theme.gradientBackground || theme.backgroundColor,
                }}
              >
                <div className="w-full flex items-center justify-between">
                  <span className="text-xl font-bold">{theme.name}</span>
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: theme.accentColor }}
                  />
                </div>
                <div className="space-y-1 w-full">
                  <div
                    className="text-2xl font-bold"
                    style={{ color: theme.accentColor }}
                  >
                    Title
                  </div>
                  <div className="text-base opacity-80">
                    Body &{" "}
                    <span style={{ color: theme.accentColor }}> link</span>
                  </div>
                </div>
              </Button>
            </motion.div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ThemePicker;
