import React, { useState, useRef, useEffect } from 'react';
import { useDrawStore } from '../store/useDrawStore';
import { Eraser, Trash2 } from 'lucide-react';

const COLORS = ["#1a1a1a", "#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899"];

export default function Toolbar({ onClear }) {
  const { color, setColor, brushSize, setBrushSize, isEraser, setEraser } = useDrawStore();
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
                    bg-white/85 backdrop-blur-md border border-[#e5e5e3] 
                    rounded-full px-4 py-2 flex items-center gap-3 shadow-lg">
      
      {/* COLORS */}
      <div className="flex items-center gap-1.5 px-1">
        {COLORS.map(c => (
          <button
            key={c}
            onClick={() => setColor(c)}
            style={{ backgroundColor: c }}
            className={`w-5 h-5 rounded-full cursor-pointer transition-transform hover:scale-110 
                      ${color === c && !isEraser ? 'ring-2 ring-offset-1 ring-[#6d4aff]' : ''}`}
          />
        ))}
        {/* Color Picker Swatch */}
        <div 
          className={`relative w-5 h-5 rounded-full overflow-hidden cursor-pointer border border-gray-200
                    ${!COLORS.includes(color) && !isEraser ? 'ring-2 ring-offset-1 ring-[#6d4aff]' : ''}`}
          style={{ backgroundColor: !COLORS.includes(color) ? color : '#ffffff' }}
        >
          {!COLORS.includes(color) ? null : (
            <div className="absolute inset-0 bg-[conic-gradient(from_0deg,#ff0000,#ffff00,#00ff00,#00ffff,#0000ff,#ff00ff,#ff0000)] opacity-40" />
          )}
          <input 
            type="color" 
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
      </div>

      <div className="w-px h-5 bg-[#e5e5e3]" />

      {/* BRUSH PREVIEW & SIZE */}
      <div className="flex items-center gap-3 px-1">
        <div 
          style={{ 
            width: Math.max(brushSize, 4), 
            height: Math.max(brushSize, 4), 
            backgroundColor: color 
          }}
          className="rounded-full transition-all duration-100"
        />
        <input 
          type="range"
          min="1"
          max="20"
          step="1"
          value={brushSize}
          onChange={(e) => setBrushSize(parseInt(e.target.value))}
          className="w-20 accent-[#6d4aff] cursor-pointer"
        />
      </div>

      <div className="w-px h-5 bg-[#e5e5e3]" />

      {/* ERASER */}
      <button 
        onClick={() => setEraser(!isEraser)}
        className={`p-1.5 rounded-full transition-colors 
                    ${isEraser ? 'bg-violet-100 text-violet-600' : 'text-gray-400 hover:bg-gray-100'}`}
      >
        <Eraser size={18} />
      </button>

      <div className="w-px h-5 bg-[#e5e5e3]" />

      {/* CLEAR */}
      <div className="relative">
        <button 
          onClick={() => setShowClearConfirm(true)}
          className="p-1.5 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100 transition-colors"
        >
          <Trash2 size={18} />
        </button>

        {showClearConfirm && (
          <div ref={confirmRef}
            className="absolute bottom-12 left-1/2 -translate-x-1/2 
                       bg-white border border-[#e5e5e3] rounded-2xl shadow-lg 
                       px-4 py-3 text-sm whitespace-nowrap z-20"
          >
            <p className="text-[#1a1a1a] mb-2 font-medium">Clear canvas for everyone?</p>
            <div className="flex gap-4 justify-end">
              <button 
                onClick={() => setShowClearConfirm(false)}
                className="text-gray-500 hover:text-gray-700 transition"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  onClear();
                  setShowClearConfirm(false);
                }}
                className="text-red-500 hover:text-red-700 font-semibold transition"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
