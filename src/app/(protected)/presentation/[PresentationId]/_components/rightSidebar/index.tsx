"use client";
import React from "react";
import { useSlideStore } from "@/store/useSlideStore";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@radix-ui/react-popover";
import { Button } from "@/components/ui/button";
import { LayoutTemplate, Palette, Type } from "lucide-react";
import LayoutChooser from "./tab/LayoutChooser";
import { ScrollArea } from "@/components/ui/scroll-area";
import ThemeChooser from "./tab/ThemeChooser";
import { component } from "@/lib/constants";
import { useDrag } from "react-dnd";

const DraggableComponentItem = ({ item }: { item: any }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "CONTENT_ITEM",
    item: item,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag as unknown as React.LegacyRef<HTMLDivElement>}
      className="flex flex-col items-center cursor-grab active:cursor-grabbing gap-2 p-2 rounded-lg hover:bg-primary-10 transition-all duration-200 text-center w-full hover:scale-105 transform"
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <div className="w-full aspect-[16/9] rounded-md border bg-gray-100 dark:bg-gray-700 p-2 shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center justify-center h-full">
          <span className="text-2xl text-primary">{item.icon}</span>
        </div>
      </div>
      <span className="text-xs text-gray-500 font-medium text-center break-words w-full px-1">{item.name}</span>
    </div>
  );
};

const RightSidebar = () => {
  const { currentTheme } = useSlideStore();

  return (
    <div className="fixed top-1/2 right-0 transform -translate-y-1/2 z-10">
      <div className="rounded-xl border-r-0 border border-background-70 shadow-lg p-2 flex flex-col items-center space-y-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full hover:bg-primary-10 hover:scale-105 transition-all duration-200"
            >
              <LayoutTemplate className="h-5 w-5" />
              <span className="sr-only">Choose Layout</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent side="left" align="center" className="w-[480px] p-0">
            <LayoutChooser />
          </PopoverContent>
        </Popover>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full hover:bg-primary-10 hover:scale-105 transition-all duration-200"
            >
              <Type className="h-5 w-5" />
              <span className="sr-only">Choose Components</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent
            side="left"
            align="center"
            className="w-[480px] p-0"
            style={{
              backgroundColor: currentTheme.backgroundColor,
              color: currentTheme.fontColor,
            }}
          >
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
                {component.map((group, idx) => (
                  <div className="space-y-2" key={idx}>
                    <h3 className="text-sm font-medium text-muted-foreground px-1">
                      {group.name}
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                      {group.components.map((item) => (
                        <DraggableComponentItem key={item.componentType} item={item} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </PopoverContent>
        </Popover>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full hover:bg-primary-10 hover:scale-105 transition-all duration-200"
            >
              <Palette className="h-5 w-5" />
              <span className="sr-only">Change Style</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent side="left" align="center" className="w-80">
            <ThemeChooser />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default RightSidebar;