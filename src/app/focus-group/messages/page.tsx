'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useMessages } from './hooks/useMessages';
import MessageList from './components/MessageList';
import MessageInput from './components/MessageInput';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ToastAlert } from '@/components/ui/Alert';

export default function MessagesPage() {
  const searchParams = useSearchParams();
  const { messages, isLoading, fetchMessages, sendMessage, error } = useMessages();
  const [userId, setUserId] = useState<string | undefined>(undefined);

  // Get userId from query params (for admin mode)
  useEffect(() => {
    const userIdParam = searchParams.get('userId');
    setUserId(userIdParam || undefined);
  }, [searchParams]);

  // Load messages on mount and when userId changes
  useEffect(() => {
    fetchMessages(userId);

    // Mark messages as read when viewing (only for participant view, not admin view)
    if (!userId) {
      const markAsRead = async () => {
        try {
          const { createClientSupabase } = await import('@/lib/supabase/client');
          const supabase = createClientSupabase();
          const { data: { session } } = await supabase.auth.getSession();

          const headers: HeadersInit = {
            'Content-Type': 'application/json',
          };

          if (session?.access_token) {
            headers['Authorization'] = `Bearer ${session.access_token}`;
          }

          await fetch('/api/focus-group/messages/mark-read', {
            method: 'POST',
            headers,
          });
        } catch (err) {
          console.error('Error marking messages as read:', err);
        }
      };

      markAsRead();
    }

    // Set up polling to refresh messages every 10 seconds
    const interval = setInterval(() => {
      fetchMessages(userId);
    }, 10000);

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [userId, fetchMessages]);

  // Handle sending message
  const handleSend = async (message: string) => {
    await sendMessage(message, userId);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-primary font-bold text-[#0E2A22] mb-2">
          Messages
        </h1>
        <p className="text-gray-600">
          {userId
            ? 'Conversation with participant'
            : 'Communicate with the admin team. Ask questions or share updates about your experience.'}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6">
          <ToastAlert
            message={error}
            variant="error"
            onDismiss={() => {}}
          />
        </div>
      )}

      {/* Messages Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>
            {userId ? 'Participant Conversation' : 'Your Messages'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && messages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading messages...</p>
            </div>
          ) : (
            <MessageList messages={messages} />
          )}
        </CardContent>
      </Card>

      {/* Message Input */}
      <Card>
        <CardContent className="pt-6">
          <MessageInput
            onSend={handleSend}
            isLoading={isLoading}
            placeholder={
              userId
                ? 'Type a message to the participant...'
                : 'Type your message to the admin team...'
            }
          />
          <p className="text-xs text-gray-500 mt-2">
            Press Ctrl+Enter (or Cmd+Enter on Mac) to send
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

