import React, { useState } from 'react';
import { useDrawStore } from '../store/useDrawStore';
import { Link2, Check } from 'lucide-react';

export default function ShareBar() {
  const { users, userColor, shortCode } = useDrawStore();
  const [copied, setCopied] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);

  const handleCopy = () => {
    const shareUrl = shortCode 
      ? `${window.location.origin}/room/${shortCode}`
      : window.location.href;
      
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCode = (e) => {
    e.stopPropagation();
    if (!shortCode) return;
    navigator.clipboard.writeText(shortCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const userEntries = Object.entries(users);
  const displayLimit = 4;
  const displayUsers = userEntries.slice(0, displayLimit);
  const remaingCount = userEntries.length - displayLimit;

  return (
    <div className="fixed top-4 right-4 z-10 flex items-center gap-3">
      {/* ROOM CODE DISPLAY */}
      {shortCode && (
        <button 
          onClick={handleCopyCode}
          title="Copy room code"
          className="bg-white/90 backdrop-blur-md border border-[#e5e5e3] px-3 py-1.5 rounded-full shadow-sm 
                     flex items-center gap-2 group cursor-pointer hover:bg-white transition-all 
                     hover:border-[#2d6a4f]33 active:scale-95 outline-none"
        >
          <span className={`text-[10px] uppercase tracking-wider font-bold transition-colors ${codeCopied ? 'text-green-500' : 'text-gray-400'}`}>
            {codeCopied ? "Copied!" : "Code"}
          </span>
          <span className={`text-sm font-mono font-bold tracking-widest transition-colors ${codeCopied ? 'text-green-600' : 'text-[#2d6a4f]'}`}>
            {shortCode}
          </span>
        </button>
      )}

      {/* PRESENCE DOTS */}
      <div className="flex items-center -space-x-1.5">
        {displayUsers.map(([userId, user]) => (
          <div 
            key={userId}
            title={user.color === userColor ? "You" : `User ${userId.slice(0, 4)}`}
            style={{ backgroundColor: user.color }}
            className="w-7 h-7 rounded-full ring-2 ring-white shadow-sm flex items-center justify-center 
                       hover:-translate-y-0.5 transition-transform cursor-help"
          >
            {user.color === userColor && <div className="w-1.5 h-1.5 bg-white rounded-full opacity-60" />}
          </div>
        ))}
        {remaingCount > 0 && (
          <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center 
                         ring-2 ring-white text-[10px] font-bold text-gray-500 shadow-sm">
            +{remaingCount}
          </div>
        )}
      </div>

      {/* SHARE BUTTON */}
      <button 
        onClick={handleCopy}
        className="bg-white border border-[#e5e5e3] text-gray-600 font-medium 
                   px-3 py-1.5 rounded-full hover:bg-gray-50 shadow-sm 
                   flex items-center gap-1.5 transition-all active:scale-95 text-xs"
      >
        {copied ? <Check size={14} className="text-green-500" /> : <Link2 size={14} />}
        <span>{copied ? "Copied!" : "Copy link"}</span>
      </button>
    </div>
  );
}
