/**
 * Room Manager
 * Handles the state of collaborative drawing rooms
 */

import { cleanupService } from './cleanup.js';

class RoomManager {
    constructor() {
        this.rooms = new Map(); // roomId -> { strokes: [], users: {}, cleanupTimer: null }
        this.COLORS = [
            "#ef4444", "#f97316", "#eab308", "#22c55e",
            "#3b82f6", "#8b5cf6", "#ec4899", "#1a1a1a"
        ];
    }

    getRoom(roomId) {
        if (!this.rooms.has(roomId)) {
            this.rooms.set(roomId, {
                strokes: [],
                users: {},
                cleanupTimer: null
            });
        }
        return this.rooms.get(roomId);
    }

    addUser(roomId, userId) {
        const room = this.getRoom(roomId);
        cleanupService.cancel(roomId);

        const userCount = Object.keys(room.users).length;
        const userColor = this.COLORS[userCount % this.COLORS.length];
        
        room.users[userId] = { color: userColor };
        return userColor;
    }

    removeUser(roomId, userId) {
        const room = this.rooms.get(roomId);
        if (!room) return null;

        delete room.users[userId];

        if (Object.keys(room.users).length === 0) {
            cleanupService.schedule(roomId, () => {
                this.rooms.delete(roomId);
                console.log(`[ROOM MANAGER] Room ${roomId} permanently removed.`);
            });
        }

        return room;
    }

    addStroke(roomId, stroke) {
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

    clearRoom(roomId) {
        const room = this.rooms.get(roomId);
        if (room) {
            room.strokes = [];
            return true;
        }
        return false;
    }

    getRoomUsers(roomId) {
        const room = this.rooms.get(roomId);
        return room ? room.users : {};
    }

    getStrokeHistory(roomId) {
        const room = this.getRoom(roomId);
        return room ? room.strokes : [];
    }
}

export const roomManager = new RoomManager();
