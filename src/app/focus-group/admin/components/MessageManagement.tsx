'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MessageCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import type { Database } from '@/types/supabase';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

interface MessageManagementProps {
  profiles: ProfileRow[];
  unreadCounts: Record<string, number>;
}

export default function MessageManagement({
  profiles,
  unreadCounts,
}: MessageManagementProps) {
  // Show all profiles (including admins) for testing purposes
  const participantProfiles = profiles;

  if (participantProfiles.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-gray-500">No participants to message yet.</p>
          <div className="mt-4 text-center text-sm text-gray-400">
            <p>Debug Info:</p>
            <p>Total Profiles: {profiles.length}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Message Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {participantProfiles.map((profile) => {
            const unreadCount = unreadCounts[profile.user_id] || 0;
            const isAdmin = profile.is_admin;
            
            return (
              <div
                key={profile.id}
                className={`flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors ${
                  isAdmin ? 'border-yellow-200 bg-yellow-50/50' : 'border-gray-200'
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-gray-600">
                      {profile.user_id.slice(0, 8)}...
                    </span>
                    {isAdmin && (
                      <span className="bg-yellow-100 text-yellow-800 text-xs font-bold rounded px-1.5 py-0.5">
                        Admin
                      </span>
                    )}
                    {unreadCount > 0 && (
                      <span className="bg-[#C9A66B] text-[#0E2A22] text-xs font-bold rounded-full px-2 py-0.5">
                        {unreadCount} unread
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Status: {(profile.status as string) || 'N/A'} | Week:{' '}
                    {profile.current_week || 'N/A'}
                  </div>
                </div>
                <Link href={`/focus-group/messages?userId=${profile.user_id}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <Send className="w-4 h-4" />
                    Message
                  </Button>
                </Link>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
