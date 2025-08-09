import { themes } from "@/lib/constants";
import { Slide } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Image } from "lucide-react";
import React from "react";

type Props = {
  slide: Slide;
  themeName: string;
};

function ThumbnailPreview({ slide, themeName }: Props) {
  const theme = themes.find(t => t.name === themeName) || themes[0];

  //add preview of Slides
  return (
    <div
      className={cn(
        "w-full relative aspect-[16/9] rounded-lg overflow-hidden transition-all duration-200"
      )}
      style={{
        fontFamily: theme.fontFamily,
        color: theme.accentColor,
        backgroundColor: theme.slideBackgroundColor,
        backgroundImage: theme.gradientBackground,
      }}
    >
      {slide ? (
        <div className="scale-[0.5] origin-top-left w-[200%] h-[200%] overflow-hidden">
        This is the Slides
        </div>
      ):(
        <div className="w-full h-full bg-gray-400 flex justify-center items-center">
          <Image className = "w-6 h-6 text-gray-500"></Image>
        </div>
      )}

  </div>
  );
}

export default ThumbnailPreview;
