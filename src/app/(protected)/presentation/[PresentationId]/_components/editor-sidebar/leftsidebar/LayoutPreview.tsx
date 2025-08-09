import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useSlideStore } from "@/store/useSlideStore";
import React, { useEffect, useState } from "react";
import DraggableSlidePreview from "./DraggableSlidePreview";

type Props = {};

const LayoutPreview = (props: Props) => {
  const { getOrderedSlides, reorderSlides, project } = useSlideStore();
  const slides = getOrderedSlides();
  const [loading, setLoading] = useState(true);
  const moveSlide = (dragIndex: number, hoverIndex: number) => {
    reorderSlides(dragIndex, hoverIndex);
  };

  useEffect(() => {
    if (typeof window !== "undefined") setLoading(false);
  }, []);

  return (
    <div className="w-72 h-full fixed left-0 top-20 border-r overflow-y-auto">
      <ScrollArea 
        className="h-full w-full" 
        suppressHydrationWarning
        onWheel={(e) => {
          const target = e.currentTarget;
          const scrollTop = target.scrollTop;
          const scrollHeight = target.scrollHeight;
          const clientHeight = target.clientHeight;
          
          // Prevent scroll propagation when at the top or bottom
          if ((scrollTop <= 0 && e.deltaY < 0) || 
              (scrollTop + clientHeight >= scrollHeight && e.deltaY > 0)) {
            e.stopPropagation();
          }
        }}
      >
        {loading ? (
          <div className="w-full px-4 flex flex-col space-y-6">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : (
          <div className="p-4 pb-32 space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-medium dark:text-gray-100 text-gray-500">
                SLIDES
              </h2>
              <span
                className="text-sm dark:text-gray-200 text-gray-400"
                suppressHydrationWarning
              >
                {slides?.length} slides
              </span>
            </div>
            {slides.map((slide, index) => (
              <DraggableSlidePreview
                key={`${project?.id || 'proj'}-${slide.id || index}`}
                slide={slide}
                index={index}
                moveSlide={moveSlide}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default LayoutPreview;
