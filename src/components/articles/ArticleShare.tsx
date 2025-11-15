'use client';

import React, { useState, useEffect } from 'react';
import { Share2, Instagram, Linkedin, Mail } from 'lucide-react';

interface ArticleShareProps {
  title: string;
  url: string;
}

export function ArticleShare({ title, url }: ArticleShareProps) {
  const [hasNativeShare, setHasNativeShare] = useState(false);
  const [shareUrl, setShareUrl] = useState(url);

  useEffect(() => {
    // Check for native share after component mounts (client-side only)
    if (typeof window !== 'undefined') {
      setShareUrl(window.location.href);
      setHasNativeShare(!!navigator.share);
    }
  }, []);

  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(shareUrl);

  const shareLinks = {
    instagram: `https://www.instagram.com/`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedUrl}`,
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or error occurred
        console.log('Share cancelled');
      }
    }
  };

  return (
    <div className="border-t border-[#E5E5E5] mt-12 pt-8">
      <div className="flex items-center gap-6">
        <span className="text-sm text-[#2B2B2B]/60 uppercase tracking-wide">Share</span>
        <div className="flex gap-4">
          {/* Native Share (Mobile) - Only show after hydration */}
          {hasNativeShare && (
            <button
              onClick={handleNativeShare}
              className="p-2 text-[#1B3A34] hover:text-[#2A4C44] transition-colors"
              aria-label="Share article"
            >
              <Share2 size={20} />
            </button>
          )}

          {/* Instagram */}
          <a
            href={shareLinks.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-[#1B3A34] hover:text-[#2A4C44] transition-colors"
            aria-label="Share on Instagram"
          >
            <Instagram size={20} />
          </a>

          {/* LinkedIn */}
          <a
            href={shareLinks.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-[#1B3A34] hover:text-[#2A4C44] transition-colors"
            aria-label="Share on LinkedIn"
          >
            <Linkedin size={20} />
          </a>

          {/* Email */}
          <a
            href={shareLinks.email}
            className="p-2 text-[#1B3A34] hover:text-[#2A4C44] transition-colors"
            aria-label="Share via email"
          >
            <Mail size={20} />
          </a>
        </div>
      </div>
    </div>
  );
}

