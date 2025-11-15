'use client';

import React, { createContext, useContext, useMemo } from 'react';

export interface User {
  id: string;
  email?: string;
}

const UserContext = createContext<User | null>(null);

export function MockAuthProvider({ children, userId }: { children: React.ReactNode; userId?: string }) {
  const user = useMemo<User>(() => ({ id: userId || 'user_1', email: (userId || 'user_1') + '@example.com' }), [userId]);
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

export function useUser(): User {
  const ctx = useContext(UserContext);
  return ctx || { id: 'user_1', email: 'user_1@example.com' };
}

// Server utility (can be imported in server files)
export function getUser(): User {
  // In Week 3 MVP, use a fixed mock user. In Week 4, wire to real auth.
  return { id: process.env.NEXT_PUBLIC_MOCK_USER_ID || 'user_1', email: 'user_1@example.com' };
}


