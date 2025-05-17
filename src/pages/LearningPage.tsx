import React from 'react';
import LearningTabMDX from '../components/mdx/LearningTabMDX';

function LearningPage() {
  return (
    <div className="bg-gradient-to-br from-indigo-100 to-purple-100 min-h-screen">
      <div className="container mx-auto px-1 sm:px-2 md:px-4 py-2 sm:py-4 md:py-6">
        <LearningTabMDX />
      </div>
    </div>
  );
}

export default LearningPage; 