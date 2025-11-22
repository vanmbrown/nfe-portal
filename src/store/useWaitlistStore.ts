'use client';

import { create } from 'zustand';

interface WaitlistState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

export const useWaitlistStore = create<WaitlistState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));

