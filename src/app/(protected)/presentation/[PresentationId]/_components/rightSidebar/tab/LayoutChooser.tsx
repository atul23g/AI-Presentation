"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { layouts } from "@/lib/constants";
import { Layout } from "@/lib/types";
import { useSlideStore } from "@/store/useSlideStore";
import React from "react";
import { useDrag } from "react-dnd";

const DraggableLayoutItem = ({
  component,
  icon,
  layoutType,
  name,
  type,
}: Layout) => {
  const { currentTheme } = useSlideStore();

  const [{ isDragging }, drag] = useDrag(() => ({
    type: "layout",
    item: { type, layoutType, component },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag as unknown as React.LegacyRef<HTMLDivElement>}
      className="border rounded-lg p-2 cursor-grab active:cursor-grabbing hover:bg-primary-10 transition-all duration-200"
      style={{
        opacity: isDragging ? 0.5 : 1,
        backgroundColor: currentTheme.slideBackgroundColor,
      }}
    >
      <div className="text-center">
        <div className="w-full aspect-[16/9] rounded-md border bg-gray-100 dark:bg-gray-700 p-2 shadow-sm">
          <div className="flex items-center justify-center h-full">
            {icon && typeof icon === 'function' ? (
              React.createElement(icon)
            ) : (
              <span className="text-gray-500">Layout</span>
            )}
          </div>
        </div>
        <span className="text-xs text-gray-500 font-medium mt-2 block">{name}</span>
      </div>
    </div>
  );
};

const LayoutChooser = () => {
  const { currentTheme } = useSlideStore();

  return (
    <ScrollArea
      className="h-[400px]"
      style={{
        backgroundColor: currentTheme.slideBackgroundColor,
      }}
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
      <div className="p-4 flex flex-col space-y-6">
        {layouts.map((group) => (
          <div key={group.name} className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground px-1">
              {group.name}
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {group.layouts.map((layout) => (
                <DraggableLayoutItem key={layout.layoutType} {...layout} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default LayoutChooser;