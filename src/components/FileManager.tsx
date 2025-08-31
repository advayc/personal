import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import File from './File';
import { fileConfigs } from '@/lib/fileConfigs';

interface FileManagerProps {
  onFileOpen: (fileId: string) => void;
  className?: string;
}

interface FilePosition {
  id: string;
  x: number;
  y: number;
  isDragging: boolean;
}

export default function FileManager({ onFileOpen, className }: FileManagerProps) {
  const [filePositions, setFilePositions] = useState<FilePosition[]>([]);
  const [draggedFile, setDraggedFile] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize file positions in a grid layout
  useEffect(() => {
    const positions: FilePosition[] = fileConfigs.map((config, index) => ({
      id: config.id,
      x: (index % 4) * 120, // 4 files per row
      y: Math.floor(index / 4) * 120,
      isDragging: false
    }));
    setFilePositions(positions);
  }, []);

  const handleDragStart = (e: React.PointerEvent, fileId: string) => {
    const file = filePositions.find(f => f.id === fileId);
    if (!file) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect();
    
    if (containerRect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }

    setDraggedFile(fileId);
    setFilePositions(prev => 
      prev.map(f => 
        f.id === fileId ? { ...f, isDragging: true } : f
      )
    );
  };

  const handleDragMove = (e: React.PointerEvent) => {
    if (!draggedFile || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const newX = e.clientX - containerRect.left - dragOffset.x;
    const newY = e.clientY - containerRect.top - dragOffset.y;

    setFilePositions(prev => 
      prev.map(f => 
        f.id === draggedFile 
          ? { ...f, x: Math.max(0, newX), y: Math.max(0, newY) }
          : f
      )
    );
  };

  const handleDragEnd = () => {
    if (draggedFile) {
      setFilePositions(prev => 
        prev.map(f => 
          f.id === draggedFile ? { ...f, isDragging: false } : f
        )
      );
      setDraggedFile(null);
    }
  };

  const handleFileClick = (fileId: string) => {
    if (!draggedFile) {
      onFileOpen(fileId);
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-full ${className || ''}`}
      onPointerMove={handleDragMove}
      onPointerUp={handleDragEnd}
      onPointerLeave={handleDragEnd}
    >
      <AnimatePresence>
        {filePositions.map((filePos) => {
          const fileConfig = fileConfigs.find(f => f.id === filePos.id);
          if (!fileConfig) return null;

          return (
            <motion.div
              key={filePos.id}
              className="absolute"
              style={{
                left: filePos.x,
                top: filePos.y,
                zIndex: filePos.isDragging ? 1000 : 1
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: 1, 
                scale: filePos.isDragging ? 1.1 : 1,
                rotate: filePos.isDragging ? 5 : 0
              }}
              transition={{ 
                duration: 0.2,
                ease: "easeOut"
              }}
              onPointerDown={(e) => handleDragStart(e, filePos.id)}
              onClick={() => handleFileClick(filePos.id)}
            >
              <div className="relative">
                <File
                  setWindowOpen={() => handleFileClick(filePos.id)}
                  className="px-1 sm:px-2"
                  filename={fileConfig.filename}
                  imageSrc={fileConfig.imageSrc}
                />
                
                {/* Drag indicator */}
                {filePos.isDragging && (
                  <motion.div
                    className="absolute inset-0 bg-blue-500/20 rounded-lg border-2 border-blue-500 border-dashed"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}