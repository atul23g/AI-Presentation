'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const TemplatesPage = () => {
  return (
    <div className="flex flex-col gap-6 relative max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex flex-col items-start">
          <h1 className="text-3xl font-bold text-primary">
            Templates
          </h1>
          <p className="text-base font-normal text-secondary">
            Pre-designed presentation templates
          </p>
        </div>
      </div>

      {/* Coming Soon Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center justify-center min-h-[60vh] text-center"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="space-y-12"
        >
          {/* Big App Logo */}
          <div className="flex justify-center">
            <Avatar className="h-32 w-32 rounded-2xl">
              <AvatarImage src="/vivid.png" alt="ai-presentation-logo" />
              <AvatarFallback className="rounded-2xl text-4xl font-semibold">VI</AvatarFallback>
            </Avatar>
          </div>

          {/* Coming Soon Title */}
          <div className="space-y-6">
            <h2 className="text-5xl md:text-6xl font-bold text-primary">
              Coming <span className="text-vivid">Soon</span>
            </h2>
            <p className="text-xl text-secondary">
              Professional presentation templates are on their way
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default TemplatesPage;
