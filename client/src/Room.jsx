import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';
import { useDrawStore } from './store/useDrawStore';
import Toolbar from './components/Toolbar';
import CursorLayer from './components/CursorLayer';
import ShareBar from './components/ShareBar';
import { CanvasEngine } from './canvas/engine';

const SOCKET_SERVER_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3001";

export default function Room() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [userId] = useState(() => uuidv4());
  
  const {
    color, brushSize, tool,
    elements, addElement, updateElement, deleteElements, setElements,
    pan, setPan, selectedIds, setSelectedIds,
    updateCursor,
    addUser, removeUser, setUsers, setUserColor
  } = useDrawStore();

  const canvasCommittedRef = useRef(null);
  const canvasActiveRef = useRef(null);
  const engineRef = useRef(null);
  const socketRef = useRef(null);
  const textInputRef = useRef(null);
  
  const isDrawingRef = useRef(false);
  const startPosRef = useRef({ x: 0, y: 0 });
  const offsetRef = useRef({ x: 0, y: 0 });
  
  const [editingText, setEditingText] = useState(null); // { x, y, value, id } world coords
  
  const laserPointsRef = useRef([]);
  const lastEmitTimeRef = useRef(0);
  const lastCursorEmitTimeRef = useRef(0);

  const getPos = (e, applyPan = true) => {
    const canvas = canvasActiveRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    return applyPan ? { x: x - pan.x, y: y - pan.y } : { x, y };
  };

  const hitTest = (el, pos) => {
    if (el.width !== undefined && el.height !== undefined) {
      return pos.x >= el.x && pos.x <= el.x + el.width && pos.y >= el.y && pos.y <= el.y + el.height;
    }
    if (el.x2 !== undefined) {
        const minX = Math.min(el.x, el.x2) - 10;
        const minY = Math.min(el.y, el.y2) - 10;
        const maxX = Math.max(el.x, el.x2) + 10;
        const maxY = Math.max(el.y, el.y2) + 10;
        return pos.x >= minX && pos.x <= maxX && pos.y >= minY && pos.y <= maxY;
    }
    if (el.type === 'text') return pos.x >= el.x && pos.x <= el.x + 100 && pos.y <= el.y && pos.y >= el.y - 20;
    return false;
  };

  useEffect(() => {
    socketRef.current = io(SOCKET_SERVER_URL);
    if (canvasCommittedRef.current && canvasActiveRef.current) {
        engineRef.current = new CanvasEngine(canvasCommittedRef.current, canvasActiveRef.current);
        engineRef.current.resize(window.innerWidth, window.innerHeight);
    }
    const s = socketRef.current;
    s.emit('join-room', roomId, userId);
    s.on('your-color', (data) => setUserColor(data.color));
    s.on('room-users', (users) => setUsers(users));
    s.on('user-joined', (data) => addUser(data.userId, data.color));
    s.on('user-left', (data) => removeUser(data.userId));
    s.on('stroke-history', (history) => setElements(history));
    s.on('draw', (el) => {
      if (el.userId === userId) return;
      const currentElements = useDrawStore.getState().elements;
      if (currentElements.find(e => e.id === el.id)) updateElement(el.id, el); else addElement(el);
    });
    s.on('cursor', (data) => updateCursor(data.userId, { x: data.x, y: data.y, color: data.color }));
    s.on('clear', (id) => { if (!id || typeof id !== 'string') setElements([]); else useDrawStore.getState().deleteElements([id]); });

    const handleResize = () => { if (engineRef.current) { engineRef.current.resize(window.innerWidth, window.innerHeight); const state = useDrawStore.getState(); engineRef.current.redrawScene(state.elements, state.pan, state.selectedIds); } };
    const handleKeyDown = (e) => {
        if (e.key === 'Delete' || e.key === 'Backspace') {
            if (editingText) return; // don't delete elements while typing text
            const state = useDrawStore.getState();
            if (state.selectedIds.length > 0) {
                const sIds = [...state.selectedIds];
                deleteElements(sIds);
                sIds.forEach(id => socketRef.current.emit('clear', id));
                setSelectedIds([]);
            }
        }
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('keydown', handleKeyDown);
    return () => { window.removeEventListener('resize', handleResize); window.removeEventListener('keydown', handleKeyDown); s.disconnect(); };
  }, [roomId, userId]);

  useEffect(() => {
    if (engineRef.current) engineRef.current.redrawScene(elements, pan, selectedIds);
  }, [elements, pan, selectedIds]);

  // Focus the input when entering "Edit Mode"
  useEffect(() => {
    if (editingText && textInputRef.current) {
        textInputRef.current.focus();
    }
  }, [editingText]);

  const onPointerDown = (e) => {
    if (editingText) return; // avoid conflicts while typing
    isDrawingRef.current = true;
    const screenPos = getPos(e, false);
    const worldPos = getPos(e, true);
    startPosRef.current = worldPos;
    
    if (tool === 'hand') {
        startPosRef.current = screenPos;
        offsetRef.current = { ...pan };
    } else if (tool === 'select') {
      const target = [...elements].reverse().find(el => hitTest(el, worldPos));
      if (target) { setSelectedIds([target.id]); offsetRef.current = { x: worldPos.x - target.x, y: worldPos.y - target.y }; } else { setSelectedIds([]); }
    } else if (tool === 'pencil' || tool === 'eraser') {
      const el = { id: uuidv4(), type: tool === 'eraser' ? 'erase' : 'draw', x: worldPos.x, y: worldPos.y, prevX: worldPos.x, prevY: worldPos.y, color: tool === 'eraser' ? '#ffffff' : color, size: brushSize, userId };
      addElement(el);
      socketRef.current.emit('draw', el);
    } else if (tool === 'lasso') { setSelectedIds([]); }
  };
  
  const onPointerMove = (e) => {
    const worldPos = getPos(e, true);
    const screenPos = getPos(e, false);
    const now = Date.now();
    if (now - lastCursorEmitTimeRef.current >= 50) { if (socketRef.current) socketRef.current.emit('cursor', { x: worldPos.x, y: worldPos.y, color }); lastCursorEmitTimeRef.current = now; }
    if (!isDrawingRef.current) {
        if (tool === 'laser') { if (engineRef.current) { engineRef.current.clearActive(); laserPointsRef.current.push(screenPos); if (laserPointsRef.current.length > 15) laserPointsRef.current.shift(); engineRef.current.drawLaser(laserPointsRef.current); } }
        return;
    }
    if (tool === 'hand') { setPan({ x: offsetRef.current.x + (screenPos.x - startPosRef.current.x), y: offsetRef.current.y + (screenPos.y - startPosRef.current.y) }); }
    else if (tool === 'select' && selectedIds.length === 1) {
        const id = selectedIds[0];
        const el = elements.find(e => e.id === id);
        if (el) {
            const newX = worldPos.x - offsetRef.current.x;
            const newY = worldPos.y - offsetRef.current.y;
            const dx = newX - el.x;
            const dy = newY - el.y;
            updateElement(id, { x: newX, y: newY, x2: el.x2 !== undefined ? el.x2 + dx : undefined, y2: el.y2 !== undefined ? el.y2 + dy : undefined });
            if (now - lastEmitTimeRef.current >= 30) { socketRef.current.emit('draw', { ...el, x: newX, y: newY, x2: el.x2 !== undefined ? el.x2 + dx : undefined, y2: el.y2 !== undefined ? el.y2 + dy : undefined }); lastEmitTimeRef.current = now; }
        }
    } else if (tool === 'pencil' || tool === 'eraser') {
        const el = { id: uuidv4(), type: tool === 'eraser' ? 'erase' : 'draw', x: worldPos.x, y: worldPos.y, prevX: startPosRef.current.x, prevY: startPosRef.current.y, color: tool === 'eraser' ? '#ffffff' : color, size: brushSize, userId };
        addElement(el); socketRef.current.emit('draw', el); startPosRef.current = worldPos;
    } else if (tool === 'lasso') {
        if (engineRef.current) { engineRef.current.clearActive(); engineRef.current.drawLasso({ x: Math.min(startPosRef.current.x, worldPos.x) + pan.x, y: Math.min(startPosRef.current.y, worldPos.y) + pan.y, width: Math.abs(worldPos.x - startPosRef.current.x), height: Math.abs(worldPos.y - startPosRef.current.y) }); }
    } else if (tool === 'laser') {
        if (engineRef.current) { engineRef.current.clearActive(); laserPointsRef.current.push(screenPos); if (laserPointsRef.current.length > 15) laserPointsRef.current.shift(); engineRef.current.drawLaser(laserPointsRef.current); }
    } else if (tool !== 'text') {
      if (engineRef.current) {
        engineRef.current.clearActive();
        const x = Math.min(startPosRef.current.x, worldPos.x); const y = Math.min(startPosRef.current.y, worldPos.y); const width = Math.abs(worldPos.x - startPosRef.current.x); const height = Math.abs(worldPos.y - startPosRef.current.y);
        let previewEl; if (tool === 'arrow' || tool === 'line') previewEl = { type: tool, x: startPosRef.current.x, y: startPosRef.current.y, x2: worldPos.x, y2: worldPos.y, color, size: brushSize };
        else previewEl = { type: tool, x, y, width, height, color, size: brushSize };
        engineRef.current.drawElement({ ...previewEl, x: previewEl.x + pan.x, y: previewEl.y + pan.y, x2: (previewEl.x2||0) + pan.x, y2: (previewEl.y2||0) + pan.y }, false);
      }
    }
  };

  const onPointerUp = (e) => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false; if (!engineRef.current) return;
    const worldPos = getPos(e, true);

    if (tool === 'lasso') {
        const x = Math.min(startPosRef.current.x, worldPos.x); const y = Math.min(startPosRef.current.y, worldPos.y); const w = Math.abs(worldPos.x - startPosRef.current.x); const h = Math.abs(worldPos.y - startPosRef.current.y);
        const inBounds = elements.filter(el =>  el.x >= x && (el.x + (el.width||0)) <= x + w &&  el.y >= y && (el.y + (el.height||0)) <= y + h ).map(el => el.id);
        setSelectedIds(inBounds);
    } else if (tool === 'text') {
        setEditingText({ x: worldPos.x, y: worldPos.y, value: '', id: uuidv4() });
    } else if (tool !== 'pencil' && tool !== 'eraser' && tool !== 'select' && tool !== 'hand' && tool !== 'laser') {
      const x = Math.min(startPosRef.current.x, worldPos.x); const y = Math.min(startPosRef.current.y, worldPos.y); const width = Math.abs(worldPos.x - startPosRef.current.x); const height = Math.abs(worldPos.y - startPosRef.current.y);
      let el; if (tool === 'arrow' || tool === 'line') el = { id: uuidv4(), type: tool, x: startPosRef.current.x, y: startPosRef.current.y, x2: worldPos.x, y2: worldPos.y, color, size: brushSize, userId };
      else el = { id: uuidv4(), type: tool, x, y, width, height, color, size: brushSize, userId };
      addElement(el); socketRef.current.emit('draw', el);
    } else if (tool === 'select' && selectedIds.length === 1) {
        const id = selectedIds[0]; const el = elements.find(e => e.id === id); if (el) socketRef.current.emit('draw', el);
    }
    if (tool !== 'laser') engineRef.current.clearActive();
  };

  const handleTextCommit = () => {
    if (editingText && editingText.value.trim().length > 0) {
        const el = { id: editingText.id, type: 'text', x: editingText.x, y: editingText.y, text: editingText.value, color, size: brushSize, userId };
        addElement(el);
        socketRef.current.emit('draw', el);
    }
    setEditingText(null);
  };

  const handleClear = () => { if (socketRef.current && roomId) socketRef.current.emit('clear', roomId); };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#faf9f6] touch-none select-none">
      <h1 onClick={() => navigate('/')} className="fixed top-4 left-5 z-20 font-serif text-2xl text-[#1a1f1e] opacity-40 hover:opacity-100 transition-all cursor-pointer" style={{ fontFamily: '"Instrument Serif", serif' }}>Ezhuth</h1>
      <ShareBar />
      <canvas id="canvas-committed" ref={canvasCommittedRef} className="absolute top-0 left-0 w-full h-full pointer-events-none" />
      <canvas id="canvas-active" ref={canvasActiveRef} className={`absolute top-0 left-0 w-full h-full ${tool === 'hand' ? 'cursor-grab active:cursor-grabbing' : tool === 'select' ? 'cursor-default' : 'cursor-crosshair'}`}
        onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerLeave={() => { isDrawingRef.current = false; if (engineRef.current) engineRef.current.clearActive(); laserPointsRef.current = []; }} onPointerCancel={() => { isDrawingRef.current = false; if (engineRef.current) engineRef.current.clearActive(); laserPointsRef.current = []; }} />
      
      {/* TEXT OVERLAY */}
      {editingText && (
        <textarea
          ref={textInputRef}
          value={editingText.value}
          onChange={(e) => setEditingText({ ...editingText, value: e.target.value })}
          onBlur={handleTextCommit}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleTextCommit(); } }}
          style={{
            position: 'absolute',
            left: editingText.x + pan.x,
            top: editingText.y + pan.y - (brushSize * 4),
            fontSize: `${brushSize * 5}px`,
            color: color,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            padding: 0,
            margin: 0,
            resize: 'none',
            fontFamily: 'Lato, sans-serif',
            lineHeight: 1,
            zIndex: 100,
            width: 'auto',
            minWidth: '100px'
          }}
          placeholder="Type..."
        />
      )}

      <CursorLayer />
      <Toolbar onClear={handleClear} />
    </div>
  );
}
