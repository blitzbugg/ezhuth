import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';
import { useDrawStore } from './store/useDrawStore';
import Toolbar from './components/Toolbar';
import CursorLayer from './components/CursorLayer';
import ShareBar from './components/ShareBar';

const SOCKET_SERVER_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3001";

export default function Room() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [userId] = useState(() => uuidv4());
  
  const { 
    color, brushSize, isEraser, 
    updateCursor, 
    addUser, removeUser, setUsers, setUserColor
  } = useDrawStore();

  const canvasCommittedRef = useRef(null);
  const canvasActiveRef = useRef(null);
  const socketRef = useRef(null);
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });
  
  const ctxCommittedRef = useRef(null);
  const ctxActiveRef = useRef(null);
  
  const lastEmitTimeRef = useRef(0);
  const lastCursorEmitTimeRef = useRef(0);
  const lastEmittedPosRef = useRef({ x: 0, y: 0 });
  
  const pendingRemoteStrokesRef = useRef([]);
  const hasHistoryRef = useRef(false);

  // Helper to get correct coordinates for both touch and mouse
  const getPos = (e) => {
    const canvas = canvasActiveRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const drawStroke = (stroke, ctx, forceSourceOver = false) => {
    if (!ctx) return;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(stroke.prevX, stroke.prevY);
    ctx.lineTo(stroke.x, stroke.y);
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.size;
    
    // Eraser logic: on committed canvas (remote or final), use destination-out.
    // For local preview, draw white pixels so user sees the change.
    if (stroke.type === 'erase' && !forceSourceOver) {
       ctx.globalCompositeOperation = 'destination-out';
    } else {
       ctx.globalCompositeOperation = 'source-over';
    }
    
    ctx.stroke();
    ctx.globalCompositeOperation = 'source-over'; // always reset to be safe
  };

  useEffect(() => {
    socketRef.current = io(SOCKET_SERVER_URL);
    
    const setCanvasSize = () => {
      const c1 = canvasCommittedRef.current;
      const c2 = canvasActiveRef.current;
      if (!c1 || !c2) return;

      // Save content before resize
      const temp = document.createElement('canvas');
      temp.width = c1.width;
      temp.height = c1.height;
      temp.getContext('2d').drawImage(c1, 0, 0);

      c1.width = window.innerWidth;
      c1.height = window.innerHeight;
      c2.width = window.innerWidth;
      c2.height = window.innerHeight;
      
      ctxCommittedRef.current = c1.getContext('2d');
      ctxActiveRef.current = c2.getContext('2d');
      
      [ctxCommittedRef.current, ctxActiveRef.current].forEach(ctx => {
        if (ctx) {
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
        }
      });

      ctxCommittedRef.current.drawImage(temp, 0, 0);
    };
    
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);
    
    socketRef.current.emit('join-room', roomId, userId);
    
    socketRef.current.on('your-color', (data) => setUserColor(data.color));
    socketRef.current.on('room-users', (users) => setUsers(users));
    socketRef.current.on('user-joined', (data) => addUser(data.userId, data.color));
    socketRef.current.on('user-left', (data) => removeUser(data.userId));
    
    socketRef.current.on('stroke-history', (strokes) => {
      hasHistoryRef.current = true;
      strokes.forEach(s => drawStroke(s, ctxCommittedRef.current));
      pendingRemoteStrokesRef.current.forEach(s => drawStroke(s, ctxCommittedRef.current));
      pendingRemoteStrokesRef.current = [];
    });
    
    socketRef.current.on('draw', (stroke) => {
      if (stroke.userId === userId) return;
      if (!hasHistoryRef.current) {
        pendingRemoteStrokesRef.current.push(stroke);
      } else {
        drawStroke(stroke, ctxCommittedRef.current);
      }
    });

    socketRef.current.on('cursor', (data) => {
      updateCursor(data.userId, { x: data.x, y: data.y, color: data.color });
    });

    socketRef.current.on('clear', () => {
      const c1 = canvasCommittedRef.current;
      const c2 = canvasActiveRef.current;
      if (c1 && c2 && ctxCommittedRef.current && ctxActiveRef.current) {
        ctxCommittedRef.current.clearRect(0, 0, c1.width, c1.height);
        ctxActiveRef.current.clearRect(0, 0, c2.width, c2.height);
      }
    });
    
    return () => {
      window.removeEventListener('resize', setCanvasSize);
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [roomId, userId, setUserColor, setUsers, addUser, removeUser, updateCursor]);

  const onPointerDown = (e) => {
    isDrawingRef.current = true;
    const pos = getPos(e);
    lastPosRef.current = pos;
    lastEmittedPosRef.current = pos;

    const strokeData = {
      strokeId: uuidv4(),
      type: isEraser ? 'erase' : 'draw',
      x: pos.x,
      y: pos.y,
      prevX: pos.x,
      prevY: pos.y,
      color: isEraser ? '#ffffff' : color, 
      size: brushSize,
      userId
    };

    drawStroke(strokeData, ctxActiveRef.current, true);
    socketRef.current.emit('draw', strokeData);
  };
  
  const onPointerMove = (e) => {
    const pos = getPos(e);
    const now = Date.now();
    
    if (now - lastCursorEmitTimeRef.current >= 50) {
      if (socketRef.current) {
        socketRef.current.emit('cursor', { x: pos.x, y: pos.y, color });
      }
      lastCursorEmitTimeRef.current = now;
    }

    if (!isDrawingRef.current) return;
    
    const prevPos = lastPosRef.current;
    const strokeData = {
      strokeId: uuidv4(),
      type: isEraser ? 'erase' : 'draw',
      x: pos.x,
      y: pos.y,
      prevX: prevPos.x,
      prevY: prevPos.y,
      color: isEraser ? '#ffffff' : color,
      size: brushSize,
      userId
    };

    drawStroke(strokeData, ctxActiveRef.current, true);
    
    if (now - lastEmitTimeRef.current >= 30) {
      if (socketRef.current) {
        socketRef.current.emit('draw', {
          ...strokeData,
          prevX: lastEmittedPosRef.current.x,
          prevY: lastEmittedPosRef.current.y
        });
      }
      lastEmitTimeRef.current = now;
      lastEmittedPosRef.current = pos;
    }
    lastPosRef.current = pos;
  };

  const onPointerUp = () => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    
    if (!ctxCommittedRef.current || !ctxActiveRef.current || !canvasActiveRef.current) return;

    if (isEraser) {
      ctxCommittedRef.current.globalCompositeOperation = 'destination-out';
    } else {
      ctxCommittedRef.current.globalCompositeOperation = 'source-over';
    }
    
    ctxCommittedRef.current.drawImage(canvasActiveRef.current, 0, 0);
    ctxCommittedRef.current.globalCompositeOperation = 'source-over';
    ctxActiveRef.current.clearRect(0, 0, canvasActiveRef.current.width, canvasActiveRef.current.height);
  };

  const handleClear = () => {
    if (socketRef.current && roomId) {
      console.log(`[CLIENT] Requesting clear for room: ${roomId}`);
      socketRef.current.emit('clear', roomId);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-white touch-none">
      <h1 
        onClick={() => navigate('/')}
        className="fixed top-4 left-5 z-10 font-serif text-2xl text-text-primary opacity-40 
                   hover:opacity-100 transition-all duration-300 cursor-pointer select-none"
        style={{ fontFamily: '"Instrument Serif", serif' }}
      >
        Ezhuth
      </h1>

      <ShareBar />
      
      <canvas
        id="canvas-committed"
        ref={canvasCommittedRef}
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
      />
      
      <canvas
        id="canvas-active"
        ref={canvasActiveRef}
        className={`absolute top-0 left-0 w-full h-full ${isEraser ? 'eraser-mode' : ''}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onPointerCancel={onPointerUp}
      />

      <CursorLayer />
      <Toolbar onClear={handleClear} />
    </div>
  );
}
