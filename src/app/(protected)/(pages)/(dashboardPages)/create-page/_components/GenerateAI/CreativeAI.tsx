'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Loader2, RotateCcw } from 'lucide-react';

import { containerVariants, itemVariants } from '@/lib/constants';
import useCreativeAIStore from '@/store/useCreateivAIStroe';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import CardList from '../common/CardList';
import usePromptStore from '@/store/usePromptStore';
import{v4 as uuid } from 'uuid'


import RecentPrompts from './RecentPrompts';
import { toast } from 'sonner';
import { generateCreativePrompt } from '@/actions/chatgpt';
import { OutlineCard } from '@/lib/types';
import { v4 } from 'uuid';
import { useSlideStore } from '@/store/useSlideStore';
import { createproject } from '@/actions/project';

type Props = {
  onBack: () => void;
};

const CreativeAI = ({ onBack }: Props) => {

  const { setProject, setSlides } = useSlideStore()
  const router = useRouter();
  const [editingCard, seteditingCard] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editText, setEditText] = useState('');
  const [noOfCards, setNoOfCards] = useState(0);
  const { prompts, addPrompt } = usePromptStore();

  const {
    currentAiPrompt,
    setCurrentAiPrompt,
    outlines,
    resetOutlines,
    addOutlines,
    addMultipleOutlines,
  } = useCreativeAIStore();

  const handleBack = () => {
    onBack();
  };

  const resetCards = () => {
    seteditingCard(null);
    setSelectedCard(null);
    setEditText('');
    setCurrentAiPrompt('');
    resetOutlines();
  };

  const generateOutline = async () => {
    setIsGenerating(true);
    
    try {
      const res = await generateCreativePrompt(currentAiPrompt);

      if (res.status === 200 && res?.data?.outlines) {
        const cardsData: OutlineCard[] = [];

        res.data?.outlines.map((outline: string, idx: number) => {
          const newCard = {
            id: v4(),
            title: outline,
            order: idx + 1,
          };
          cardsData.push(newCard);
        });

        addMultipleOutlines(cardsData);
        setNoOfCards(cardsData.length);
        toast.success('Success', {
          description: 'Outlines generated successfully',
        });
      } else {
        toast.error('Error', {
          description: res.error || 'Failed to generate outline. Please try again.',
        });
      }
    } catch (error) {
      console.error('Error generating outline:', error);
      toast.error('Error', {
        description: 'Failed to generate outline. Please try again.',
      });
    }

    setIsGenerating(false);
  };


const handleGenerate = async () => {
  setIsGenerating(true);
  
  if (outlines.length === 0) {
    toast.error('Error', {
      description: 'Please add at least one card to generate slides'
    });
    setIsGenerating(false);
    return;
  }

  try {
    const res = await createproject(
      currentAiPrompt,
      outlines.slice(0, noOfCards)
    );

    if (res.status !== 200 || !res.data) {
      // Handle specific error cases
      if (res.status === 403) {
        throw new Error('Authentication required. Please sign in again.');
      } else if (res.status === 500) {
        throw new Error('Server error. Please try again in a moment.');
      } else {
        throw new Error(res.error || 'Unable to create project');
      }
    }

    // Clear any persisted slides before moving to the new project's theme page
    try { localStorage.removeItem('slides-storage-v2'); } catch {}
    setSlides([]);
    router.push(`/presentation/${res.data.id}/select-theme`);

    setProject(res.data);

    addPrompt({
      id: v4(),
      title: currentAiPrompt || outlines?.[0]?.title,
      outlines: outlines,
      createdAt: new Date().toISOString(),
    });

    toast.success('Success', {
      description: 'Project created successfully!',
    });

    setCurrentAiPrompt('');
    resetOutlines();
  } catch (error) {
    console.log(error);
    toast.error('Error', {
      description: 'Failed to create project',
    });
  } finally {
    setIsGenerating(false);
  }
};



  useEffect(() => {
    setNoOfCards (outlines.length)
    }, [outlines.length])

  return (
    <motion.div
      className="space-y-6 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Button onClick={handleBack} variant="outline" className="mb-4">
        <ChevronLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <motion.div variants={itemVariants} className="space-y-2 text-center">
        <h1 className="text-4xl font-bold text-primary">
          Generate with <span className="text-vivid">Creative AI</span>
        </h1>
        <p className="text-secondary">What would you like to create today?</p>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="bg-primary/10 p-4 rounded-xl"
      >
        <div className="flex flex-col sm:flex-row justify-between gap-3 items-center rounded-xl">
          <input
            required
            placeholder="Enter Prompt and add to the cards..."
            className="text-base sm:text-xl border-0 focus-visible:ring-0 focus:outline-none shadow-none p-0 bg-transparent flex-grow"
            value={currentAiPrompt}
            onChange={(e) => setCurrentAiPrompt(e.target.value)}
          />

          <div className="flex items-center gap-3">
            <Select
              value={noOfCards.toString()}
              onValueChange={(val) => setNoOfCards(parseInt(val))}
            >
              <SelectTrigger className="w-fit gap-2 font-semibold shadow-xl">
                <SelectValue placeholder="Select number of cards" />
              </SelectTrigger>
              <SelectContent className="w-fit">
                {outlines.length === 0 ? (
                  <SelectItem value="0">No Cards</SelectItem>
                ) : (
                  Array.from({ length: outlines.length }, (_, idx) => idx + 1).map(
                    (num) => (
                      <SelectItem
                        key={num}
                        value={num.toString()}
                        className="font-semibold"
                      >
                        {num} {num === 1 ? 'Card' : 'Cards'}
                      </SelectItem>
                    )
                  )
                )}
              </SelectContent>
            </Select>

            <Button
              variant="destructive"
              onClick={resetCards}
              size="icon"
              aria-label="Reset cards"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="w-full flex justify-center items-center">
        <Button
          className="font-medium text-lg flex gap-2 items-center"
          disabled={isGenerating}
          onClick={generateOutline}
        >
          {isGenerating ? (
            <>
              <Loader2 className="animate-spin mr-2" />
              Generating...
            </>
          ) : (
            'Generate Outline'
          )}
        </Button>
      </div>

      <CardList
        outlines={outlines}
        addOutline={addOutlines}
        addMultipleOutlines={addMultipleOutlines}
        editingCard={editingCard}
        selectedCard={selectedCard}
        editText={editText}
        onEditChange={setEditText}
        onCardSelect={setSelectedCard}
        setEditText={setEditText}
        setEditingCard={seteditingCard}
        setSelectedCard={setSelectedCard}
        onCardDoubleClick={(id, title) => {
          seteditingCard(id);
          setEditText(title);
        }}
      />

      {outlines.length > 0 && (
        <Button
          className="w-full"
          onClick={handleGenerate}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <Loader2 className="animate-spin mr-2" />
              Generating...
            </>
          ) : (
            'Generate'
          )}
        </Button>
      )}

      {prompts?.length > 0 && <RecentPrompts />}
    </motion.div>
  );
};

export default CreativeAI;