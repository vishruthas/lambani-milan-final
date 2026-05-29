import { create } from "zustand";

export const useUnreadStore = create((set) => ({

  // unread conversations (messages)
  unreadSet: new Set(),

  // interest unread count
  interestUnread: 0,

  /* MESSAGE FUNCTIONS */

  setInitialUnread: (ids) =>
    set(() => ({
      unreadSet: new Set(ids)
    })),

  addConversation: (id) =>
    set((state) => {
      const updated = new Set(state.unreadSet);
      updated.add(id);
      return { unreadSet: updated };
    }),

  removeConversation: (id) =>
    set((state) => {
      const updated = new Set(state.unreadSet);
      updated.delete(id);
      return { unreadSet: updated };
    }),

  /* INTEREST FUNCTIONS */

  setInterestUnread: (count) =>
    set(() => ({ interestUnread: count })),

}));