import { onAuthenticateUser } from '@/actions/user';
import React from 'react';
import SettingsWrapper from './_components/SettingsWrapper';

const Page = async () => {
  const checkUser = await onAuthenticateUser();

  if (!checkUser.user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-primary mb-2">Authentication Required</h2>
          <p className="text-secondary">Please sign in to access settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 relative max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <div className="flex flex-col items-start">
          <h1 className="text-3xl font-bold text-primary">
            Settings
          </h1>
          <p className="text-base font-normal text-secondary">
            Manage your account preferences and security
          </p>
        </div>
      </div>
      
      <SettingsWrapper user={checkUser.user} />
    </div>
  );
};

export default Page;