'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface VideoLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  title?: string;
}

export function VideoLightbox({ isOpen, onClose, videoUrl, title }: VideoLightboxProps) {
  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Extract video ID from YouTube URL
  const getVideoId = (url: string): string | null => {
    // Handle YouTube Shorts format: https://www.youtube.com/shorts/VIDEO_ID
    const shortsMatch = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/);
    if (shortsMatch) {
      return shortsMatch[1];
    }
    
    // Handle standard YouTube format: https://www.youtube.com/watch?v=VIDEO_ID
    const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]+)/);
    if (watchMatch) {
      return watchMatch[1];
    }
    
    // Handle youtu.be format: https://youtu.be/VIDEO_ID
    const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
    if (shortMatch) {
      return shortMatch[1];
    }
    
    return null;
  };

  const videoId = getVideoId(videoUrl);
  const embedUrl = videoId 
    ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`
    : null;

  // Debug logging - must be before any conditional returns
  useEffect(() => {
    if (isOpen) {
      console.log('VideoLightbox isOpen:', isOpen);
      console.log('Video URL:', videoUrl);
      console.log('Video ID:', videoId);
      console.log('Embed URL:', embedUrl);
    }
  }, [isOpen, videoUrl, videoId, embedUrl]);

  // Debug: Log when component renders - must be before any conditional returns
  useEffect(() => {
    console.log('VideoLightbox render - isOpen:', isOpen, 'embedUrl:', embedUrl);
  }, [isOpen, embedUrl]);

  if (!embedUrl) {
    console.error('Invalid YouTube URL:', videoUrl);
    console.error('Extracted video ID:', videoId);
    return null;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="video-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center p-4"
            onClick={onClose}
            aria-label="Close video"
            style={{ 
              zIndex: 9999,
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              visibility: 'visible',
              opacity: 1
            }}
          >
            {/* Video Container */}
            <motion.div
              key="video-container"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="relative w-full max-w-4xl bg-black rounded-lg overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: '56rem',
                aspectRatio: '16/9',
                minHeight: '400px',
                zIndex: 10000
              }}
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-[10001] w-10 h-10 bg-black/70 hover:bg-black/90 rounded-full flex items-center justify-center text-white transition-colors focus:outline-none focus:ring-2 focus:ring-[#D6B370] focus:ring-offset-2"
                aria-label="Close video"
                style={{ 
                  zIndex: 10001,
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem'
                }}
              >
                <X size={24} />
              </button>

              {/* YouTube Embed */}
              <iframe
                src={embedUrl}
                title={title || 'Video'}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  display: 'block',
                  zIndex: 1
                }}
              />
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
