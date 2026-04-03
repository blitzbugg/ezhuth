import { create } from 'zustand';

export const useDrawStore = create((set) => ({
  color: "#1a1a1a",
  brushSize: 4,
  tool: "pencil", // 'pencil', 'rectangle', 'diamond', 'frame', 'eraser', 'select', 'hand', 'ellipse', 'arrow', 'line', 'text', 'laser', 'lasso'
  elements: [],
  selectedIds: [],
  pan: { x: 0, y: 0 },
  zoom: 1,
  cursors: {}, // { userId: { x, y, color, label } }
  userColor: "", // assigned by server on join
  users: {}, // { userId: { color } } for presence dots

  setColor: (color) => set((state) => ({ 
    color, 
    tool: state.tool === 'eraser' ? 'pencil' : state.tool 
  })),
  setBrushSize: (brushSize) => set({ brushSize }),
  setTool: (tool) => set({ tool, selectedIds: [] }),
  setPan: (pan) => set({ pan }),
  setZoom: (zoom) => set({ zoom }),
  
  setSelectedIds: (selectedIds) => set({ selectedIds }),
  
  setElements: (elements) => set({ elements }),
  addElement: (el) => set((state) => ({ 
    elements: [...state.elements, { ...el, id: el.id || crypto.randomUUID() }] 
  })),
  updateElement: (id, data) => set((state) => ({
    elements: state.elements.map(el => el.id === id ? { ...el, ...data } : el)
  })),
  deleteElement: (id) => set((state) => ({
    elements: state.elements.filter(el => el.id !== id),
    selectedIds: state.selectedIds.filter(sid => sid !== id)
  })),
  deleteElements: (ids) => set((state) => ({
    elements: state.elements.filter(el => !ids.includes(el.id)),
    selectedIds: state.selectedIds.filter(sid => !ids.includes(sid))
  })),
  
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
