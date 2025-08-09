import { Project } from "@prisma/client";
import { useMemo } from "react";
import { useSearchStore } from "@/store/useSearchStore";

export const useProjectSearch = (projects: Project[]) => {
  const { searchQuery } = useSearchStore();

  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) {
      return projects;
    }

    const query = searchQuery.toLowerCase().trim();
    
    return projects.filter((project) => {
      // Search by title
      if (project.title.toLowerCase().includes(query)) {
        return true;
      }
      
      // Search by theme name
      if (project.themeName && project.themeName.toLowerCase().includes(query)) {
        return true;
      }
      
      // Search by creation date (if query contains date-related terms)
      if (query.includes('today') || query.includes('yesterday') || query.includes('week')) {
        const projectDate = new Date(project.createdAt);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (query.includes('today') && projectDate.toDateString() === today.toDateString()) {
          return true;
        }
        if (query.includes('yesterday') && projectDate.toDateString() === yesterday.toDateString()) {
          return true;
        }
        if (query.includes('week')) {
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          if (projectDate >= weekAgo) {
            return true;
          }
        }
      }
      
      return false;
    });
  }, [projects, searchQuery]);

  return {
    filteredProjects,
    searchQuery,
    hasResults: filteredProjects.length > 0,
    totalResults: filteredProjects.length,
  };
}; 