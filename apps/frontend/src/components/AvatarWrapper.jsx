import React from 'react';

export const AvatarWrapper = ({ children }) => {
  return (
    <div className="relative w-full h-full bg-gray-200 rounded-2xl overflow-hidden">
      <div className="relative w-full h-full">
        {children}
      </div>
    </div>
  );
}; 