/**
 * Socket Event Constants (Server)
 * Centralized names for all Socket.io events
 */

export const SOCKET_EVENTS = {
    // Connection
    JOIN_ROOM: 'join-room',
    USER_JOINED: 'user-joined',
    USER_LEFT: 'user-left',
    
    // Core Logic
    DRAW: 'draw',
    CURSOR: 'cursor',
    CLEAR: 'clear',
    
    // Server to Client state
    YOUR_COLOR: 'your-color',
    ROOM_USERS: 'room-users',
    STROKE_HISTORY: 'stroke-history'
};
