'use client';

import { useState, useCallback } from 'react';

interface MessageRow {
  id: string;
  user_id?: string;
  sender_id?: string;
  recipient_id?: string;
  sender: 'admin' | 'user';
  sender_role?: 'admin' | 'user';
  message: string;
  message_text?: string;
  is_read: boolean;
  created_at: string | null;
  [key: string]: unknown;
}

interface UseMessagesReturn {
  messages: MessageRow[];
  isLoading: boolean;
  fetchMessages: (userId?: string) => Promise<MessageRow[]>;
  sendMessage: (message: string, recipientUserId?: string) => Promise<void>;
  error: string | null;
}

export function useMessages(): UseMessagesReturn {
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch messages
  // For participants: fetchMessages() - gets all messages for current user
  // For admins: fetchMessages(userId) - gets all messages for a specific user
  const fetchMessages = useCallback(async (userId?: string, silent: boolean = false): Promise<MessageRow[]> => {
    if (!silent) setIsLoading(true);
    setError(null);

    try {
      // Get session token for authenticated request
      const { createClientSupabase } = await import('@/lib/supabase/client');
      const supabase = createClientSupabase();
      const { data: { session } } = await supabase.auth.getSession();

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const url = userId
        ? `/api/focus-group/messages/fetch?userId=${userId}`
        : '/api/focus-group/messages/fetch';

      const response = await fetch(url, {
        headers,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to load messages');
      }

      if (result.success && result.data) {
        // Normalize field names
        const normalized = (result.data as unknown[]).map((msg: unknown) => {
          const m = msg as Record<string, unknown>;
          return {
            ...m,
            sender: (m.sender_role || m.sender) as 'admin' | 'user',
            message: m.message_text || m.message || '',
            user_id: m.recipient_id || m.user_id || undefined,
          } as MessageRow;
        });

        // Sort by created_at (oldest first)
        normalized.sort((a, b) => {
          const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
          const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
          return aTime - bTime;
        });

        setMessages(normalized);
        return normalized;
      }

      setMessages([]);
      return [];
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load messages';
      setError(message);
      console.error('Error loading messages:', err);
      return [];
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, []);

  // Send message
  // For participants: sendMessage(message) - sends as 'user' to current user's conversation
  // For admins: sendMessage(message, recipientUserId) - sends as 'admin' to specified user
  const sendMessage = useCallback(
    async (message: string, recipientUserId?: string): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        // Get session token for authenticated request
        const { createClientSupabase } = await import('@/lib/supabase/client');
        const supabase = createClientSupabase();
        const { data: { session } } = await supabase.auth.getSession();

        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };

        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`;
        }

        const body: { message: string; recipientUserId?: string } = { message };
        if (recipientUserId) {
          body.recipientUserId = recipientUserId;
        }

        const response = await fetch('/api/focus-group/messages/send', {
          method: 'POST',
          headers,
          body: JSON.stringify(body),
        });

        const result = await response.json();

      if (!response.ok) {
        const errorMessage = result.details 
          ? `${result.error}: ${result.details}`
          : (result.error || 'Failed to send message');
        throw new Error(errorMessage);
      }

        // Reload messages after sending
        if (recipientUserId) {
          await fetchMessages(recipientUserId);
        } else {
          await fetchMessages();
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to send message';
        setError(message);
        console.error('Error sending message:', err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchMessages]
  );

  return {
    messages,
    isLoading,
    fetchMessages,
    sendMessage,
    error,
  };
}





