import React, { useState, useRef, useEffect } from 'react';
import { useDrawStore } from '../store/useDrawStore';
import { 
  Eraser, Trash2, Pencil, Square, Diamond, Frame, 
  MousePointer2, Hand, Circle, ArrowRight, Minus, Type, Zap, LassoSelect
} from 'lucide-react';

const COLORS = ["#1a1a1a", "#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899"];

const TOOLS = [
  { id: 'hand', icon: Hand, label: 'Hand (Pan)' },
  { id: 'select', icon: MousePointer2, label: 'Select' },
  { id: 'lasso', icon: LassoSelect, label: 'Lasso (Delete)' },
  { id: 'pencil', icon: Pencil, label: 'Pencil' },
  { id: 'rectangle', icon: Square, label: 'Rectangle' },
  { id: 'ellipse', icon: Circle, label: 'Ellipse' },
  { id: 'diamond', icon: Diamond, label: 'Diamond' },
  { id: 'arrow', icon: ArrowRight, label: 'Arrow' },
  { id: 'line', icon: Minus, label: 'Line' },
  { id: 'text', icon: Type, label: 'Text' },
  { id: 'frame', icon: Frame, label: 'Frame' },
  { id: 'laser', icon: Zap, label: 'Laser Pointer' },
  { id: 'eraser', icon: Eraser, label: 'Eraser' },
];

export default function Toolbar({ onClear }) {
  const { color, setColor, brushSize, setBrushSize, tool, setTool } = useDrawStore();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const confirmRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (confirmRef.current && !confirmRef.current.contains(e.target)) {
        setShowClearConfirm(false);
      }
    };
    if (showClearConfirm) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [showClearConfirm]);

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-10 
                    bg-white/90 backdrop-blur-xl border border-[#e5e5e3] 
                    rounded-3xl px-4 py-2.5 flex items-center gap-2.5 shadow-2xl transition-all">
      
      {/* TOOLS PAGINATION/GROUPS */}
      <div className="flex items-center gap-1 overflow-x-auto max-w-[400px] scrollbar-hide px-1">
        {TOOLS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTool(t.id)}
              title={t.label}
              className={`p-2 rounded-xl transition-all flex-shrink-0
                        ${tool === t.id 
                          ? 'bg-violet-100 text-violet-600 scale-110 shadow-sm' 
                          : 'text-gray-400 hover:bg-gray-100'}`}
            >
              <Icon size={18} />
            </button>
          );
        })}
      </div>

      <div className="w-px h-6 bg-[#e5e5e3] flex-shrink-0" />

      {/* COLORS */}
      <div className="flex items-center gap-1.5 px-1 flex-shrink-0">
        {COLORS.map(c => (
          <button
            key={c}
            onClick={() => setColor(c)}
            style={{ backgroundColor: c }}
            className={`w-5 h-5 rounded-full cursor-pointer transition-transform hover:scale-110 
                      ${color === c && tool !== 'eraser' ? 'ring-2 ring-offset-1 ring-[#6d4aff]' : ''}`}
          />
        ))}
      </div>

      <div className="w-px h-6 bg-[#e5e5e3] flex-shrink-0" />

      {/* SIZE & BRUSH */}
      <div className="flex items-center gap-3 px-1 flex-shrink-0">
        <input 
          type="range"
          min="1"
          max="20"
          step="1"
          value={brushSize}
          onChange={(e) => setBrushSize(parseInt(e.target.value))}
          className="w-16 h-1 bg-gray-200 accent-[#6d4aff] rounded-lg cursor-pointer"
        />
      </div>

      <div className="w-px h-6 bg-[#e5e5e3] flex-shrink-0" />

      {/* CLEAR */}
      <div className="relative flex-shrink-0">
        <button 
          onClick={() => setShowClearConfirm(true)}
          className="p-2 text-gray-400 hover:text-red-500 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <Trash2 size={18} />
        </button>

        {showClearConfirm && (
          <div ref={confirmRef}
            className="absolute bottom-14 left-1/2 -translate-x-1/2 
                       bg-white border border-[#e5e5e3] rounded-2xl shadow-xl 
                       px-4 py-3 text-sm whitespace-nowrap z-20"
          >
            <p className="text-[#1a1a1a] mb-2 font-medium">Clear everything?</p>
            <div className="flex gap-4 justify-end">
              <button onClick={() => setShowClearConfirm(false)} className="text-gray-500 hover:text-gray-700">Cancel</button>
              <button onClick={() => { onClear(); setShowClearConfirm(false); }} className="text-red-500 font-semibold">Clear</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
