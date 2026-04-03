/**
 * Whiteboard Component
 * React component for the collaborative drawing surface
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useDrawStore } from '../store/useDrawStore';
import { CanvasEngine } from '../canvas/engine.js';
import { socketClient, SOCKET_EVENTS } from '../socket/client.js';
import { replayStrokes } from '../canvas/replay.js';

export default function Whiteboard() {
    const { roomId } = useParams();
    const [userId] = useState(() => uuidv4());
    const canvasCommittedRef = useRef(null);
    const canvasActiveRef = useRef(null);
    const engineRef = useRef(null);
    const isDrawingRef = useRef(false);
    const lastPosRef = useRef({ x: 0, y: 0 });

    const {
        color, brushSize, isEraser,
        updateCursor, removeCursor,
        addUser, removeUser, setUsers, setUserColor
    } = useDrawStore();

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

    useEffect(() => {
        if (!canvasCommittedRef.current || !canvasActiveRef.current) return;

        // Initialize engine
        engineRef.current = new CanvasEngine(canvasCommittedRef.current, canvasActiveRef.current);

        // Resize handler
        const handleResize = () => {
            engineRef.current.resize(window.innerWidth, window.innerHeight);
        };
        handleResize();
        window.addEventListener('resize', handleResize);

        // Socket setup
        socketClient.connect(roomId, userId);

        socketClient.on(SOCKET_EVENTS.YOUR_COLOR, (data) => setUserColor(data.color));
        socketClient.on(SOCKET_EVENTS.ROOM_USERS, (users) => setUsers(users));
        socketClient.on(SOCKET_EVENTS.USER_JOINED, (data) => addUser(data.userId, data.color));
        socketClient.on(SOCKET_EVENTS.USER_LEFT, (data) => removeUser(data.userId));

        // Use replay utility when history arrives
        socketClient.on(SOCKET_EVENTS.STROKE_HISTORY, (strokes) => {
            replayStrokes(strokes, engineRef.current);
        });

        socketClient.on(SOCKET_EVENTS.DRAW, (stroke) => {
            if (stroke.userId !== userId) {
                engineRef.current.drawStroke(stroke);
            }
        });

        socketClient.on(SOCKET_EVENTS.CURSOR, (data) => {
            updateCursor(data.userId, { x: data.x, y: data.y, color: data.color });
        });

        socketClient.on(SOCKET_EVENTS.CLEAR, () => {
            engineRef.current.clearAll();
        });

        return () => {
            window.removeEventListener('resize', handleResize);
            socketClient.disconnect();
        };
    }, [roomId, userId, setUserColor, setUsers, addUser, removeUser, updateCursor]);

    const onPointerDown = (e) => {
        isDrawingRef.current = true;
        const pos = getPos(e);
        lastPosRef.current = pos;

        const strokeData = {
            strokeId: uuidv4(),
            type: isEraser ? 'erase' : 'draw',
            x: pos.x, y: pos.y,
            prevX: pos.x, prevY: pos.y,
            color: isEraser ? '#ffffff' : color,
            size: brushSize,
            userId
        };

        engineRef.current.drawStroke(strokeData, false);
        socketClient.emit(SOCKET_EVENTS.DRAW, strokeData);
    };

    const onPointerMove = (e) => {
        const pos = getPos(e);

        // Smooth cursor updates
        socketClient.emit(SOCKET_EVENTS.CURSOR, { x: pos.x, y: pos.y, color });

        if (!isDrawingRef.current) return;

        const prevPos = lastPosRef.current;
        const strokeData = {
            strokeId: uuidv4(),
            type: isEraser ? 'erase' : 'draw',
            x: pos.x, y: pos.y,
            prevX: prevPos.x, prevY: prevPos.y,
            color: isEraser ? '#ffffff' : color,
            size: brushSize,
            userId
        };

        engineRef.current.drawStroke(strokeData, false);
        socketClient.emit(SOCKET_EVENTS.DRAW, strokeData);
        lastPosRef.current = pos;
    };

    const onPointerUp = () => {
        if (!isDrawingRef.current) return;
        isDrawingRef.current = false;
        engineRef.current.commitActiveToCommitted(isEraser);
    };

    return (
        <div className="relative w-screen h-screen overflow-hidden bg-white touch-none">
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
            />
        </div>
    );
}
