import { Slide, Theme, ContentItem } from "@/lib/types";
import { Project } from "@prisma/client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import { SidebarMenuSubItem } from "@/components/ui/sidebar";

interface SlideState {
  slides: Slide[];
  project: Project | null;
  setProject: (project: Project) => void;
  setSlides: (slides: Slide[]) => void;
  currentSlide: number;
  currentTheme: Theme;
  removeSlide: (id: string) => void;
  setCurrentTheme: (theme: Theme) => void;
  getOrderedSlides: () => Slide[];
  reorderSlides: (fromIndex: number, toIndex: number) => void;
  addSlideAtIndex: (slide: Slide, index: number) => void;
  setCurrentSlide: (index: number) => void;
  updateContentItem: (
    slideId: string,
    contentId: string,
    newContent: string | string[] | string[][]
  ) => void;

  addComponentInSlide: (
    slideId: string,
    item: ContentItem,
    parentId: string,
    index: number
  ) => void;
}

const defaultTheme: Theme = {
  name: "Default",
  fontFamily: "'Inter', sans-serif",
  fontColor: "#333333",
  backgroundColor: "#f0f0f0",
  slideBackgroundColor: "#ffffff",
  accentColor: "#3b82f6",
  type: "light",
};

export const useSlideStore = create(
  persist<SlideState>(
    (set, get) => ({
      project: null,
      slides: [],
      setSlides: (slides: Slide[]) => {
        // Ensure slides is always an array
        const slidesArray = Array.isArray(slides) ? slides : [];
        console.log(`🟢 Setting slides in store:`, slidesArray.length, 'slides');
        
        // Normalize and ensure globally unique slide IDs to satisfy React keys
        const seenIds = new Set<string>();
        const normalized = slidesArray.map((slide, index) => {
          let normalizedId = typeof slide.id === 'string' ? slide.id : '';
          if (!normalizedId || seenIds.has(normalizedId)) {
            normalizedId = uuidv4();
          }
          seenIds.add(normalizedId);
          return {
            ...slide,
            id: normalizedId,
            slideOrder: typeof slide.slideOrder === 'number' ? slide.slideOrder : index,
          } as Slide;
        });
        set({ slides: normalized });
      },
      setProject: (project: Project) =>
        set((state) => {
          // If switching to a different project, clear stale slides immediately
          if (state.project?.id && state.project.id !== project.id) {
            return { project, slides: [] };
          }
          return { project };
        }),
      currentTheme: defaultTheme,
      setCurrentTheme: (theme: Theme) => set({ currentTheme: theme }),
      currentSlide: 0,
      getOrderedSlides: () => {
        const state = get();
        // Ensure slides is always an array
        const slidesArray = Array.isArray(state.slides) ? state.slides : [];
        return [...slidesArray].sort((a, b) => (a.slideOrder || 0) - (b.slideOrder || 0));
      },
      addSlideAtIndex: (slide: Slide, index: number) =>
        set((state) => {
          const newSlides = [...state.slides];
          newSlides.splice(index, 0, { ...slide, id: uuidv4() });
          newSlides.forEach((s, i) => {
            s.slideOrder = i;
          });
          return { slides: newSlides, currentSlide: index };
        }),
      removeSlide: (id) =>
        set((state) => ({
          slides: state.slides.filter((slide) => slide.id !== id),
        })),

      updateContentItem: (slideId, contentId, newContent) => {
        set((state) => {
          const updateContentRecursively = (item: ContentItem): ContentItem => {
            if (item.id === contentId) {
              return { ...item, content: newContent };
            }
            if (
              Array.isArray(item.content) &&
              item.content.every((i) => typeof i !== "string")
            ) {
              return {
                ...item,
                content: item.content.map((subItem) => {
                  if (typeof subItem !== "string") {
                    return updateContentRecursively(subItem as ContentItem);
                  }
                  return subItem;
                }) as ContentItem[],
              };
            }
            return item;
          };

          return {
            slides: state.slides.map((slide) =>
              slide.id === slideId
                ? { ...slide, content: updateContentRecursively(slide.content) }
                : slide
            ),
          };
        });
      },
      setCurrentSlide: (index) => set({ currentSlide: index }),

      addComponentInSlide: (
        slideId: string,
        item: ContentItem,
        parentId: string,
        index: number
      ) => {
        set((state) => {
          const updatedSlides = state.slides.map((slide) => {
            if (slide.id === slideId) {
              const updateContentRecursively = (
                content: ContentItem
              ): ContentItem => {
                if (content.id === parentId && Array.isArray(content.content)) {
                  const updatedContent = [...content.content];
                  updatedContent.splice(index, 0, item);
                  return {
                    ...content,
                    content: updatedContent as unknown as string[],
                  };
                }
                return content;
              };

              return {
                ...slide,
                content: updateContentRecursively(slide.content),
              };
            }

            return slide;
          });

          return { slides: updatedSlides };
        });
      },

      reorderSlides: (fromIndex: number, toIndex: number) => {
        set((state) => {
          const newSlides = [...state.slides];
          const [removed] = newSlides.splice(fromIndex, 1);
          newSlides.splice(toIndex, 0, removed);
          return {
            slides: newSlides.map((slide, index) => ({
              ...slide,
              slideOrder: index,
            })),
          };
        });
      },
    }),
    {
      name: "slides-storage-v2",
      version: 2,
      migrate: (persistedState: any, version: number) => {
        // On upgrade, clear potentially stale project/slides to avoid cross-project leakage
        if (version < 2) {
          return {
            ...persistedState,
            project: null,
            slides: [],
          };
        }
        return persistedState as SlideState;
      },
    }
  )
);
