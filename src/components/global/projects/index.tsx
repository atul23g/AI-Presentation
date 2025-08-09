'use client'

import { Project } from "@prisma/client";
import React from "react";
import { motion } from "framer-motion";
import { containerVariants } from "@/lib/constants";
import ProjectCard from "../project-card";
import { useProjectSearch } from "@/hooks/useProjectSearch";

type Props = {
  projects: Project[];
};

function Projects({ projects }: Props) {
  const { filteredProjects, searchQuery, hasResults, totalResults } = useProjectSearch(projects);

  return (
    <div className="w-full">
      {/* Search Results Info */}
      {searchQuery && (
        <div className="mb-4 p-3 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            {hasResults 
              ? `Found ${totalResults} project${totalResults === 1 ? '' : 's'} for "${searchQuery}"`
              : `No projects found for "${searchQuery}"`
            }
          </p>
        </div>
      )}

      {/* Projects Grid */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {filteredProjects.map((project, index) => (
          <ProjectCard
            key={project.id}
            title={project?.title}
            projectId={project?.id}
            createdAt={project?.createdAt.toString()}
            isDelete={project?.isDeleted}
            slideData={project?.slides}
            themeName={project.themeName}
          />
        ))}
      </motion.div>

      {/* No Results Message */}
      {searchQuery && !hasResults && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No projects match your search criteria.</p>
          <p className="text-sm text-muted-foreground mt-2">
            Try searching by project title, theme name, or date (today, yesterday, week)
          </p>
        </div>
      )}
    </div>
  );
}

export default Projects;