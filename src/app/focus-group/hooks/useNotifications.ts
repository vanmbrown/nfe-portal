'use client';

import { useEffect, useState } from 'react';
import { createClientSupabase } from '@/lib/supabase/client';

export function useNotifications() {
  const [unreadAdminMessagesCount, setUnreadAdminMessagesCount] = useState(0);
  const [hasOutstandingFeedback, setHasOutstandingFeedback] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClientSupabase();

    const fetchNotifications = async () => {
      try {
        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setLoading(false);
          return;
        }

        // Poll focus_group_messages for unread admin messages
        // Messages where recipient_id = current user AND sender_role = 'admin' AND is_read = false
        const { data: messages, error } = await supabase
          .from('focus_group_messages')
          .select('id')
          .eq('recipient_id', user.id)
          .eq('sender_role', 'admin')
          .eq('is_read', false);

        if (error) {
          console.error('Error fetching unread messages:', error);
          setUnreadAdminMessagesCount(0);
        } else {
          setUnreadAdminMessagesCount(messages?.length || 0);
        }

        // TODO: Implement hasOutstandingFeedback check if needed
        // This would check if there's a week that needs feedback

        setLoading(false);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setLoading(false);
      }
    };

    fetchNotifications();

    // Poll every 30 seconds for new messages
    const interval = setInterval(fetchNotifications, 30000);

    return () => clearInterval(interval);
  }, []);

  return {
    unreadAdminMessagesCount,
    hasOutstandingFeedback,
    loading,
  };
}

