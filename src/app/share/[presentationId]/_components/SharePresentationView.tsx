'use client';
import React, { useEffect, useState } from 'react';
import { Project } from '@prisma/client';
import { themes } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Eye, 
  Calendar, 
  User, 
  ArrowRight,
  Presentation,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

interface SharePresentationViewProps {
  project: Project;
}

const SharePresentationView: React.FC<SharePresentationViewProps> = ({ project }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPresenting, setIsPresenting] = useState(false);

  const theme = themes.find(t => t.name === project.themeName) || themes[0];
  const slides = project.slides ? JSON.parse(JSON.stringify(project.slides)) : [];
  const slidesArray = Array.isArray(slides) ? slides : [];

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const handleStartPresentation = () => {
    setIsPresenting(true);
    setCurrentSlideIndex(0);
  };

  const handleNextSlide = () => {
    if (currentSlideIndex < slidesArray.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    }
  };

  const handlePrevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (!isPresenting) return;
    
    switch (e.key) {
      case 'ArrowRight':
      case ' ':
        e.preventDefault();
        handleNextSlide();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        handlePrevSlide();
        break;
      case 'Escape':
        e.preventDefault();
        setIsPresenting(false);
        break;
    }
  };

  useEffect(() => {
    if (isPresenting) {
      document.addEventListener('keydown', handleKeyPress);
      return () => document.removeEventListener('keydown', handleKeyPress);
    }
  }, [isPresenting, currentSlideIndex]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isPresenting) {
    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ backgroundColor: theme.backgroundColor }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlideIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full flex items-center justify-center p-8"
          >
            {slidesArray[currentSlideIndex] ? (
              <div 
                className="w-full max-w-6xl h-full flex items-center justify-center rounded-lg shadow-2xl"
                  style={{ 
                  backgroundColor: theme.slideBackgroundColor || theme.backgroundColor,
                  color: theme.fontColor 
                }}
              >
                <div className="p-12 text-center">
                  <h1 
                    className="text-6xl font-bold mb-8"
                    style={{ color: theme.accentColor }}
                  >
                    Slide {currentSlideIndex + 1}
                  </h1>
                  <p className="text-2xl leading-relaxed">
                    {slidesArray[currentSlideIndex]?.content || 'No content available'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <h1 className="text-4xl font-bold mb-4" style={{ color: theme.accentColor }}>
                  No slides available
                </h1>
                <p className="text-xl" style={{ color: theme.fontColor }}>
                  This presentation doesn't contain any slides yet.
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Presentation Controls */}
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-4 bg-black/80 backdrop-blur-sm rounded-full px-6 py-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrevSlide}
            disabled={currentSlideIndex === 0}
            className="text-white hover:bg-white/20"
          >
            ← Previous
          </Button>
          
          <span className="text-white text-sm px-4">
            {currentSlideIndex + 1} / {slidesArray.length}
          </span>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNextSlide}
            disabled={currentSlideIndex === slidesArray.length - 1}
            className="text-white hover:bg-white/20"
          >
            Next →
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsPresenting(false)}
            className="text-white hover:bg-white/20 ml-4"
          >
            Exit (ESC)
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12 rounded-xl">
                <AvatarImage src="/vivid.png" alt="AI Presentation" />
                <AvatarFallback className="rounded-xl text-lg font-semibold">VI</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold text-primary">AI Presentation</h1>
                <p className="text-sm text-muted-foreground">Shared Presentation</p>
              </div>
            </div>
            
            <Button onClick={handleStartPresentation} className="flex items-center gap-2">
              <Presentation className="w-4 h-4" />
              Start Presentation
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Presentation Info */}
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Title Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl font-bold text-primary mb-4">
              {project.title}
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              A presentation created with AI Presentation
            </p>
            
            <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Created {format(new Date(project.createdAt), 'MMM dd, yyyy')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                <span>{slidesArray.length} slides</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>Theme: {theme.name}</span>
              </div>
            </div>
          </motion.div>

          {/* Presentation Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card border rounded-xl overflow-hidden shadow-lg"
          >
            <div 
              className="h-96 flex items-center justify-center relative"
              style={{ backgroundColor: theme.slideBackgroundColor || theme.backgroundColor }}
            >
              {slidesArray.length > 0 ? (
                <div className="text-center p-8">
                  <h2 
                    className="text-4xl font-bold mb-4"
                    style={{ color: theme.accentColor }}
                  >
                    {project.title}
                  </h2>
                  <p 
                    className="text-xl"
                    style={{ color: theme.fontColor }}
                  >
                    {slidesArray[0]?.content || 'Welcome to this presentation'}
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <Presentation className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-2xl font-semibold text-muted-foreground mb-2">
                    No slides available
                  </h3>
                  <p className="text-muted-foreground">
                    This presentation is still being created.
                  </p>
                </div>
              )}
              
              {/* Play overlay */}
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer" onClick={handleStartPresentation}>
                <Button size="lg" className="gap-2">
                  <Presentation className="w-5 h-5" />
                  Start Presentation
                </Button>
              </div>
            </div>
            
            <div className="p-6 border-t bg-muted/50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg mb-1">{project.title}</h3>
                  <p className="text-muted-foreground">
                    {slidesArray.length} slides • {theme.name} theme
                  </p>
                </div>
                <Button onClick={handleStartPresentation} className="gap-2">
                  <Presentation className="w-4 h-4" />
                  Present
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center mt-12"
          >
            <p className="text-muted-foreground">
              Create your own presentations with{' '}
              <span className="text-vivid font-semibold">AI Presentation</span>
            </p>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default SharePresentationView;
