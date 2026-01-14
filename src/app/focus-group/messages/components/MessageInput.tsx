'use client';

import React, { useState, FormEvent } from 'react';
import { Button } from '@/components/ui/Button';

interface MessageInputProps {
  onSend: (message: string) => Promise<void>;
  isLoading?: boolean;
  placeholder?: string;
}

export default function MessageInput({
  onSend,
  isLoading = false,
  placeholder = 'Type your message...',
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || sending || isLoading) {
      return;
    }

    setSending(true);
    try {
      await onSend(message.trim());
      setMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      // Error is handled by parent component
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A66B] resize-none"
        disabled={sending || isLoading}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            handleSubmit(e);
          }
        }}
      />
      <Button
        type="submit"
        disabled={!message.trim() || sending || isLoading}
        className="bg-[#C9A66B] hover:bg-[#E7C686] text-white self-end"
      >
        {sending || isLoading ? 'Sending...' : 'Send'}
      </Button>
    </form>
  );
}








