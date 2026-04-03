import { create } from 'zustand';

export const useDrawStore = create((set) => ({
  color: "#1a1a1a",
  brushSize: 4,
  isEraser: false,
  cursors: {}, // { userId: { x, y, color, label } }
  userColor: "", // assigned by server on join
  users: {}, // { userId: { color } } for presence dots

  setColor: (color) => set({ color, isEraser: false }),
  setBrushSize: (brushSize) => set({ brushSize }),
  setEraser: (isEraser) => set({ isEraser }),
  
  updateCursor: (userId, data) => set((state) => ({
    cursors: { ...state.cursors, [userId]: { ...state.cursors[userId], ...data } }
  })),
  
  removeCursor: (userId) => set((state) => {
    const newCursors = { ...state.cursors };
    delete newCursors[userId];
    return { cursors: newCursors };
  }),
  
  addUser: (userId, color) => set((state) => ({
    users: { ...state.users, [userId]: { color } }
  })),
  
  removeUser: (userId) => set((state) => {
    const newUsers = { ...state.users };
    delete newUsers[userId];
    const newCursors = { ...state.cursors };
    delete newCursors[userId];
    return { users: newUsers, cursors: newCursors };
  }),
  
  setUsers: (users) => set({ users }),
  setUserColor: (userColor) => set({ userColor, color: userColor })
}));
