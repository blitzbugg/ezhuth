/**
 * Room Cleanup Service
 * Handles the logic for clearing empty rooms from memory
 */

export const ROOM_CLEANUP_TIMEOUT = 5 * 60 * 1000; // 5 minutes

class CleanupService {
  constructor() {
    this.timers = new Map(); // roomId -> Timeout object
  }

  schedule(roomId, cleanupCallback) {
    // If there's an existing timer, clear it first
    this.cancel(roomId);

    console.log(`[CLEANUP] Scheduling cleanup for room: ${roomId}`);
    
    const timer = setTimeout(() => {
      console.log(`[CLEANUP] Executing cleanup for room: ${roomId}`);
      cleanupCallback();
      this.timers.delete(roomId);
    }, ROOM_CLEANUP_TIMEOUT);

    this.timers.set(roomId, timer);
  }

  cancel(roomId) {
    if (this.timers.has(roomId)) {
      clearTimeout(this.timers.get(roomId));
      this.timers.delete(roomId);
      console.log(`[CLEANUP] Canceled cleanup for room: ${roomId}`);
    }
  }

  isScheduled(roomId) {
    return this.timers.has(roomId);
  }
}

export const cleanupService = new CleanupService();
