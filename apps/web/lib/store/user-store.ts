'use client';

import { create } from 'zustand';
import type { UserContract } from '@aidvokat/contracts';

interface UserState {
  user: UserContract | null;
  setUser: (user: UserContract | null) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null })
}));
