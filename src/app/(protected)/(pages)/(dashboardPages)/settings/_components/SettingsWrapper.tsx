'use client';

import React, { useState, useMemo } from 'react';
import { User } from '@prisma/client';
import SettingsContent from './SettingsContent';
import SettingsSearch from './SettingsSearch';
import { motion, AnimatePresence } from 'framer-motion';

interface SettingsWrapperProps {
  user: User;
}

const SettingsWrapper: React.FC<SettingsWrapperProps> = ({ user }) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Define searchable sections and their keywords
  const searchableSections = useMemo(() => [
    {
      id: 'profile',
      title: 'Profile Information',
      keywords: ['profile', 'name', 'email', 'information', 'personal', 'avatar', 'picture'],
      description: 'Update your personal information and profile picture'
    },
    {
      id: 'security',
      title: 'Security Settings',
      keywords: ['security', 'password', 'change', 'protect', 'shield', 'safe'],
      description: 'Manage your password and security preferences'
    },
    {
      id: 'preferences',
      title: 'Preferences',
      keywords: ['preferences', 'settings', 'notifications', 'email', 'push', 'auto save'],
      description: 'Customize your experience and notification settings'
    },
    {
      id: 'account',
      title: 'Account Status',
      keywords: ['account', 'status', 'subscription', 'premium', 'free', 'plan', 'created', 'updated'],
      description: 'View your current subscription and account details'
    },
    {
      id: 'data',
      title: 'Data Management',
      keywords: ['data', 'export', 'import', 'download', 'upload', 'backup', 'delete account'],
      description: 'Export your data or manage your account'
    },
    {
      id: 'logout',
      title: 'Danger Zone',
      keywords: ['logout', 'sign out', 'danger', 'delete', 'remove', 'exit'],
      description: 'Sign out of your account'
    }
  ], []);

  // Filter sections based on search query
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) {
      return searchableSections;
    }

    const query = searchQuery.toLowerCase();
    return searchableSections.filter(section => 
      section.title.toLowerCase().includes(query) ||
      section.description.toLowerCase().includes(query) ||
      section.keywords.some(keyword => keyword.toLowerCase().includes(query))
    );
  }, [searchQuery, searchableSections]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleClear = () => {
    setSearchQuery('');
  };

  return (
    <div className="space-y-6">
      <SettingsSearch 
        onSearch={handleSearch}
        onClear={handleClear}
        placeholder="Search settings, preferences, security..."
      />

      <AnimatePresence mode="wait">
        {searchQuery && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-primary/5 rounded-lg p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span className="text-sm font-medium text-primary">
                Search Results ({filteredSections.length} sections found)
              </span>
            </div>
            
            {filteredSections.length > 0 ? (
              <div className="grid gap-2">
                {filteredSections.map((section) => (
                  <div key={section.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-primary/10 transition-colors">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium text-primary">{section.title}</p>
                      <p className="text-xs text-secondary">{section.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-secondary">
                  No settings found for "{searchQuery}"
                </p>
                <p className="text-xs text-secondary mt-1">
                  Try searching for: profile, security, preferences, account, or logout
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <SettingsContent user={user} searchQuery={searchQuery} />
    </div>
  );
};

export default SettingsWrapper;
