/**
 * Room Manager
 * Handles the state of collaborative drawing rooms
 */

import { cleanupService } from './cleanup.js';

class RoomManager {
    constructor() {
        this.rooms = new Map(); // roomId -> { strokes: [], users: {}, cleanupTimer: null }
        this.shortCodes = new Map(); // shortCode -> roomId
        this.roomToShortCode = new Map(); // roomId -> shortCode
        this.COLORS = [
            "#ef4444", "#f97316", "#eab308", "#22c55e",
            "#3b82f6", "#8b5cf6", "#ec4899", "#1a1a1a"
        ];
    }

    generateShortCode() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude similar looking characters like I, 1, O, 0
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }

    getOrCreateShortCode(roomId) {
        if (this.roomToShortCode.has(roomId)) {
            return this.roomToShortCode.get(roomId);
        }

        let code;
        let attempts = 0;
        do {
            code = this.generateShortCode();
            attempts++;
            if (attempts > 100) break; // Safety break
        } while (this.shortCodes.has(code));

        this.shortCodes.set(code, roomId);
        this.roomToShortCode.set(roomId, code);
        return code;
    }

    resolveRoomId(id) {
        if (this.shortCodes.has(id)) {
            return this.shortCodes.get(id);
        }
        return id;
    }

    getRoom(id) {
        const roomId = this.resolveRoomId(id);
        if (!this.rooms.has(roomId)) {
            this.rooms.set(roomId, {
                strokes: [],
                users: {},
                cleanupTimer: null
            });
            // Ensure every room has a short code
            this.getOrCreateShortCode(roomId);
        }
        return this.rooms.get(roomId);
    }

    addUser(id, userId) {
        const roomId = this.resolveRoomId(id);
        const room = this.getRoom(roomId);
        cleanupService.cancel(roomId);

        const userCount = Object.keys(room.users).length;
        const userColor = this.COLORS[userCount % this.COLORS.length];
        
        room.users[userId] = { color: userColor };
        return userColor;
    }

    removeUser(id, userId) {
        const roomId = this.resolveRoomId(id);
        const room = this.rooms.get(roomId);
        if (!room) return null;

        delete room.users[userId];

        if (Object.keys(room.users).length === 0) {
            cleanupService.schedule(roomId, () => {
                const shortCode = this.roomToShortCode.get(roomId);
                if (shortCode) {
                    this.shortCodes.delete(shortCode);
                    this.roomToShortCode.delete(roomId);
                }
                this.rooms.delete(roomId);
                console.log(`[ROOM MANAGER] Room ${roomId} permanently removed.`);
            });
        }

        return room;
    }

    addStroke(id, stroke) {
        const roomId = this.resolveRoomId(id);
        const room = this.getRoom(roomId);
        if (room) {
            // If stroke has an ID and already exists, update it instead of pushing
            if (stroke.id) {
                const index = room.strokes.findIndex(s => s.id === stroke.id);
                if (index !== -1) {
                    room.strokes[index] = { ...room.strokes[index], ...stroke };
                    return true;
                }
            }
            room.strokes.push(stroke);
            return true;
        }
        return false;
    }

    clearRoom(id) {
        const roomId = this.resolveRoomId(id);
        const room = this.rooms.get(roomId);
        if (room) {
            room.strokes = [];
            return true;
        }
        return false;
    }

    getRoomUsers(id) {
        const roomId = this.resolveRoomId(id);
        const room = this.rooms.get(roomId);
        return room ? room.users : {};
    }

    getStrokeHistory(id) {
        const roomId = this.resolveRoomId(id);
        const room = this.getRoom(roomId);
        return room ? room.strokes : [];
    }

    getShortCode(roomId) {
        return this.roomToShortCode.get(roomId);
    }

    exists(id) {
        const roomId = this.resolveRoomId(id);
        return this.rooms.has(roomId);
    }
}

export const roomManager = new RoomManager();
