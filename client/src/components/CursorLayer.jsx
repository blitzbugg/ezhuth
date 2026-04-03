import React from 'react';
import { useDrawStore } from '../store/useDrawStore';

export default function CursorLayer() {
  const { cursors } = useDrawStore();

  return (
    <svg className="fixed inset-0 w-full h-full pointer-events-none z-20">
      {Object.entries(cursors).map(([userId, cursor]) => (
        <g 
          key={userId} 
          style={{ transform: `translate(${cursor.x}px, ${cursor.y}px)`, transition: 'transform 80ms linear' }}
        >
          {/* CURSOR DOT */}
          <circle 
            r="5" 
            fill={cursor.color} 
            stroke="white" 
            strokeWidth="1.5" 
          />
          
          {/* CURSOR LABEL */}
          <g transform="translate(0, 8)">
            <rect 
              x="-24" 
              y="0" 
              width="48" 
              height="20" 
              rx="10" 
              fill={cursor.color} 
              fillOpacity="0.15" 
            />
            <text 
              y="14" 
              textAnchor="middle" 
              fill={cursor.color} 
              fontSize="11" 
              className="font-medium"
            >
              {(cursor.label || userId).slice(0, 8)}
            </text>
          </g>
        </g>
      ))}
    </svg>
  );
}
