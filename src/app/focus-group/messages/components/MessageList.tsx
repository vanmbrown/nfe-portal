'use client';

import React, { useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/Card';

interface Message {
  id: string;
  sender: 'admin' | 'user';
  message: string;
  created_at: string | null;
  is_read: boolean;
}

interface MessageListProps {
  messages: Message[];
  currentUserId?: string;
}

export default function MessageList({ messages, currentUserId }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-gray-500">No messages yet. Start the conversation!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 max-h-[500px] overflow-y-auto p-4">
      {messages.map((message) => {
        const isAdmin = message.sender === 'admin';
        const isCurrentUser = !isAdmin; // Participant messages are from current user

        return (
          <div
            key={message.id}
            className={`flex ${isAdmin ? 'justify-start' : 'justify-end'}`}
          >
            <div
              className={`max-w-[75%] rounded-lg p-3 ${
                isAdmin
                  ? 'bg-[#C9A66B] text-[#0E2A22]'
                  : 'bg-[#0E2A22] text-white'
              }`}
            >
              <div className="text-sm font-medium mb-1">
                {isAdmin ? 'Admin' : 'You'}
              </div>
              <div className="text-sm whitespace-pre-wrap break-words">
                {message.message}
              </div>
              {message.created_at && (
                <div className={`text-xs mt-2 ${isAdmin ? 'text-[#0E2A22]/70' : 'text-white/70'}`}>
                  {new Date(message.created_at).toLocaleString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </div>
              )}
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}







