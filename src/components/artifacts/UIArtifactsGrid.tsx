"use client";

import React from 'react';
import { UIArtifact, UIArtifactCard } from './UIArtifactCard';
import { LayoutGrid } from 'lucide-react';

interface UIArtifactsGridProps {
  artifacts: UIArtifact[];
  emptyMessage?: string;
}

export const UIArtifactsGrid: React.FC<UIArtifactsGridProps> = ({ 
  artifacts, 
  emptyMessage = "No UI artifacts found for this project." 
}) => {
  if (!artifacts || artifacts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white border border-gray-100 rounded-2xl border-dashed">
        <LayoutGrid className="w-12 h-12 text-gray-200 mb-4" />
        <p className="text-gray-400 text-sm italic">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {artifacts.map((artifact) => (
        <UIArtifactCard key={artifact.id} artifact={artifact} />
      ))}
    </div>
  );
};
