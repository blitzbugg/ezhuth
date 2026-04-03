/**
 * Socket Client
 * Encapsulates the Socket.io interaction logic
 */

import { io } from 'socket.io-client';
import { SOCKET_EVENTS } from './events.js';

const SOCKET_SERVER_URL = "http://localhost:3001";

class SocketClient {
    constructor() {
        this.socket = null;
    }

    connect(roomId, userId) {
        this.socket = io(SOCKET_SERVER_URL);
        
        this.onConnect(() => {
            console.log(`[SOCKET] Connected with ID: ${this.socket.id}`);
            this.emit(SOCKET_EVENTS.JOIN_ROOM, { roomId, userId });
        });

        return this.socket;
    }

    onConnect(cb) {
        this.socket.on('connect', cb);
    }

    on(event, cb) {
        if (this.socket) {
            this.socket.on(event, cb);
        }
    }

    emit(event, data) {
        if (this.socket) {
            this.socket.emit(event, data);
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }
}

export const socketClient = new SocketClient();
export { SOCKET_EVENTS };
