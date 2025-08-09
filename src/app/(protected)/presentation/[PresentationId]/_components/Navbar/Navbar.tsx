'use client';
import { useSlideStore } from '@/store/useSlideStore';
import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Home, Share, Play, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import PresentationMode from './PresentationMode';
import ShareModal from './ShareModal';


type Props = { presentationId: string };

const Navbar = ({ presentationId }: Props) => {
  const { currentTheme, project } = useSlideStore();
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [isNavigatingHome, setIsNavigatingHome] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const router = useRouter();

  const handleOpenShareModal = () => {
    setIsShareModalOpen(true);
  };

  const handleReturnHome = useCallback(async () => {
    setIsNavigatingHome(true);
    try {
      await router.push('/dashboard');
    } catch (error) {
      console.error('Navigation error:', error);
      setIsNavigatingHome(false);
    }
  }, [router]);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 w-full h-20 flex justify-between items-center py-4 px-7 border-b"
      style={{
        backgroundColor: currentTheme.navbarColor || currentTheme.backgroundColor,
        color: currentTheme.accentColor,
      }}
    >
      <Button
        variant="outline"
        className="flex items-center gap-2 transition-all duration-300 hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-70 disabled:scale-95"
        style={{
          backgroundColor: currentTheme.backgroundColor,
        }}
        onClick={handleReturnHome}
        disabled={isNavigatingHome}
      >
        {isNavigatingHome ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Home className="w-4 h-4" />
        )}
        <span className="hidden sm:inline transition-opacity duration-200">
          {isNavigatingHome ? 'Returning...' : 'Return Home'}
        </span>
      </Button>
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          className="flex items-center gap-2 transition-all duration-200 hover:scale-105"
          onClick={handleOpenShareModal}
        >
          <Share className="w-4 h-4" />
          <span className="hidden sm:inline">Share</span>
        </Button>
        <Button
          variant="default"
          className="flex items-center gap-2"
          onClick={() => setIsPresentationMode(true)}
        >
          <Play className="w-4 h-4" />
          <span className="hidden sm:inline">Present</span>
        </Button>
      </div>
      
      {/* Modals */}
      {isPresentationMode && (
        <PresentationMode onClose={() => setIsPresentationMode(false)} />
      )}
      
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        presentationId={presentationId}
        presentationTitle={project?.title}
      />
    </nav>
  );
};

export default Navbar;
