import React from 'react';
import { useDrop } from 'react-dnd';
import { useSlideStore } from '@/store/useSlideStore';
import { v4 as uuidv4 } from 'uuid';
import { cn } from '@/lib/utils'; // assuming `cn` is your classnames utility
import { ContentItem } from '@/lib/types';

type DropZoneProps = {
  index: number;
  parentId: string;
  slideId: string;
};

const DropZone = ({ index, parentId, slideId }: DropZoneProps) => {
  const { addComponentInSlide } = useSlideStore();

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'CONTENT_ITEM',
    drop: (item: {
      type: string;
      componentType: string;
      label: string;
      component: ContentItem;
    }) => {
      if (item.type === 'component') {
        addComponentInSlide(
          slideId,
          { ...item.component, id: uuidv4() },
          parentId,
          index
        );
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  });

  // Generate unique ID for this drop zone
  const dropZoneId = `dropzone-${slideId}-${parentId}-${index}`;

  return (
    <div
      ref={drop as unknown as React.RefObject<HTMLDivElement>}
      key={dropZoneId}
      className={cn(
        'h-8 w-full transition-all duration-300 ease-out rounded-lg',
        isOver && canDrop 
          ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-dashed border-blue-400 shadow-lg' 
          : 'border-2 border-dashed border-transparent'
      )}
    >
      {isOver && canDrop && (
        <div className="w-full h-full flex items-center justify-center">
          <div className="flex items-center space-x-2 px-4 py-1 bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-blue-200">
            <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Drop to add component
            </span>
            <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DropZone;