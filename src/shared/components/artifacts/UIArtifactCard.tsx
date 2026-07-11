"use client";

import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { ExternalLink, Maximize2, Monitor, Smartphone, Tablet } from 'lucide-react';
import Image from 'next/image';

export interface UIArtifact {
  id: string;
  title?: string | null;
  screenshot_url?: string | null;
  html_url?: string | null;
  device_type?: string | null;
  width?: string | null;
  height?: string | null;
  created_at?: Date | string | null;
}

interface UIArtifactCardProps {
  artifact: UIArtifact;
}

export const UIArtifactCard: React.FC<UIArtifactCardProps> = ({ artifact }) => {
  const getDeviceIcon = (device?: string) => {
    switch (device?.toLowerCase()) {
      case 'mobile':
        return <Smartphone className="w-4 h-4" />;
      case 'tablet':
        return <Tablet className="w-4 h-4" />;
      default:
        return <Monitor className="w-4 h-4" />;
    }
  };

  return (
    <Card variant="glass" hoverable className="overflow-hidden flex flex-col h-full bg-white/50 backdrop-blur-sm border-white/20">
      <div className="relative aspect-video w-full bg-slate-100 group">
        {artifact.screenshot_url ? (
          <Image 
            src={artifact.screenshot_url} 
            alt={artifact.title || 'UI Artifact'} 
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            unoptimized={true}
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-slate-200 text-slate-400">
            <Maximize2 className="w-8 h-8 opacity-20" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
      </div>

      <CardHeader className="p-4 mb-0 flex-grow">
        <div className="flex justify-between items-start gap-2 mb-2">
          <Badge variant="primary" size="sm" className="flex items-center gap-1">
            {getDeviceIcon(artifact.device_type ?? undefined)}
            {artifact.device_type || 'Desktop'}
          </Badge>
          {artifact.width && artifact.height && (
            <span className="text-[10px] font-mono text-gray-400 uppercase">
              {artifact.width} x {artifact.height}
            </span>
          )}
        </div>
        <CardTitle className="text-base line-clamp-1">{artifact.title || 'Untitled UI Artifact'}</CardTitle>
        <CardDescription className="text-xs line-clamp-2">
          Created on {new Date(artifact.created_at || new Date()).toLocaleDateString()}
        </CardDescription>
      </CardHeader>

      <CardFooter className="p-4 pt-0 mt-0 flex gap-2">
        {artifact.html_url && (
          <a href={artifact.html_url} target="_blank" rel="noopener noreferrer" className="flex-1">
            <Button variant="secondary" size="sm" className="w-full" leftIcon={<ExternalLink className="w-3 h-3" />}>
              View
            </Button>
          </a>
        )}
        {artifact.screenshot_url && (
          <a href={artifact.screenshot_url} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="px-2">
              <Maximize2 className="w-4 h-4" />
            </Button>
          </a>
        )}
      </CardFooter>
    </Card>
  );
};
