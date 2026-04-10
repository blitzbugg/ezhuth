/**
 * Socket Handlers
 * Handles socket.io events and logic for collaborative whiteboard
 */

import { roomManager } from '../rooms/manager.js';
import { SOCKET_EVENTS } from './events.js';

export const handleSocketEvents = (io, socket) => {
    console.log(`[SOCKET] User connected: ${socket.id}`);

    /**
     * Handles joining a room. Supports both:
     * 1. emit('join-room', { roomId, userId }) 
     * 2. emit('join-room', roomId, userId) - legacy positional
     */
    socket.on(SOCKET_EVENTS.JOIN_ROOM, (data, legacyUserId) => {
        let inputRoomId, userId;
        
        if (typeof data === 'object' && data !== null) {
            inputRoomId = data.roomId;
            userId = data.userId;
        } else {
            inputRoomId = data;
            userId = legacyUserId;
        }
        
        if (!inputRoomId || !userId) {
            console.log(`[SOCKET] Join failed for ${socket.id}: Missing roomId or userId`);
            return;
        }

        const roomId = roomManager.resolveRoomId(inputRoomId);
        const shortCode = roomManager.getOrCreateShortCode(roomId);

        socket.join(roomId);
        socket.roomId = roomId;
        socket.userId = userId;

        const userColor = roomManager.addUser(roomId, userId);
        const roomUsers = roomManager.getRoomUsers(roomId);
        const strokes = roomManager.getStrokeHistory(roomId);

        console.log(`[SOCKET] User ${userId} joined room ${roomId} (Code: ${shortCode})`);

        // Send context to joining client
        socket.emit(SOCKET_EVENTS.YOUR_COLOR, { color: userColor });
        socket.emit(SOCKET_EVENTS.ROOM_USERS, roomUsers);
        socket.emit(SOCKET_EVENTS.STROKE_HISTORY, strokes);
        socket.emit('room-short-code', { shortCode });

        // Notify others in the room
        socket.to(roomId).emit(SOCKET_EVENTS.USER_JOINED, { userId, color: userColor });
    });

    socket.on(SOCKET_EVENTS.DRAW, (stroke) => {
        const roomId = socket.roomId;
        if (!roomId) return;
        
        // Add stroke to history
        roomManager.addStroke(roomId, stroke);
        
        // Broadcast to other clients
        socket.broadcast.to(roomId).emit(SOCKET_EVENTS.DRAW, stroke);
    });

    socket.on(SOCKET_EVENTS.CURSOR, (data) => {
        const roomId = socket.roomId;
        if (!roomId) return;
        
        // Broadcast cursor position to others
        socket.to(roomId).emit(SOCKET_EVENTS.CURSOR, { ...data, userId: socket.userId });
    });

    socket.on(SOCKET_EVENTS.CLEAR, (idOrRoomId) => {
        const roomId = socket.roomId;
        if (!roomId) return;
        
        const resolvedId = roomManager.resolveRoomId(idOrRoomId);

        // If the ID passed is different from the current roomId, it's likely an element ID
        if (idOrRoomId && resolvedId !== roomId) {
            const room = roomManager.getRoom(roomId);
            if (room) {
                room.strokes = room.strokes.filter(s => s.id !== idOrRoomId);
                io.to(roomId).emit(SOCKET_EVENTS.CLEAR, idOrRoomId);
                console.log(`[SOCKET] Element ${idOrRoomId} deleted in room ${roomId}`);
            }
        } else {
            // Clear whole room
            if (roomManager.clearRoom(roomId)) {
                console.log(`[SOCKET] History cleared for room: ${roomId}`);
                io.to(roomId).emit(SOCKET_EVENTS.CLEAR);
            }
        }
    });

    socket.on('disconnect', () => {
        const { roomId, userId } = socket;
        if (roomId && userId) {
            roomManager.removeUser(roomId, userId);
            socket.to(roomId).emit(SOCKET_EVENTS.USER_LEFT, { userId });
            console.log(`[SOCKET] User ${userId} left room ${roomId}`);
        }
    });
};
