/**
 * Server Entry Point
 * Express server and Socket.io setup
 */

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { handleSocketEvents } from './sockets/handlers.js'; // Paths corrected for src/ folder

const app = express();
app.use(cors());

// Server initialization
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: process.env.CLIENT_URL || '*', 
        methods: ['GET', 'POST']
    }
});

// Configure Socket.io
io.on('connection', (socket) => {
    handleSocketEvents(io, socket);
});

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
    console.log(`[SERVER] Collaborative Whiteboard server running on port ${PORT}`);
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', pid: process.pid });
});
