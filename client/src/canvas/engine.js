/**
 * Canvas Engine
 * Reusable drawing and rendering logic
 */

export class CanvasEngine {
  constructor(committedCanvas, activeCanvas) {
    this.committedCanvas = committedCanvas;
    this.activeCanvas = activeCanvas;
    this.committedCtx = committedCanvas.getContext('2d');
    this.activeCtx = activeCanvas.getContext('2d');
    
    // Default settings
    this.setContextDefaults(this.committedCtx);
    this.setContextDefaults(this.activeCtx);
  }

  setContextDefaults(ctx) {
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }

  drawStroke(stroke, useCommitted = true, forceSourceOver = false) {
    const ctx = useCommitted ? this.committedCtx : this.activeCtx;
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(stroke.prevX, stroke.prevY);
    ctx.lineTo(stroke.x, stroke.y);
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.size;

    // Handle eraser
    if (stroke.type === 'erase' && !forceSourceOver) {
      if (useCommitted) {
        ctx.globalCompositeOperation = 'destination-out';
      } else {
        // Active ctx preview (e.g., drawing with white on top)
        ctx.strokeStyle = '#ffffff'; 
        ctx.globalCompositeOperation = 'source-over';
      }
    } else {
      ctx.globalCompositeOperation = 'source-over';
    }

    ctx.stroke();
    ctx.globalCompositeOperation = 'source-over';
  }

  commitActiveToCommitted(isEraser) {
    if (isEraser) {
      this.committedCtx.globalCompositeOperation = 'destination-out';
    } else {
      this.committedCtx.globalCompositeOperation = 'source-over';
    }
    
    this.committedCtx.drawImage(this.activeCanvas, 0, 0);
    this.committedCtx.globalCompositeOperation = 'source-over';
    this.clearActive();
  }

  clearActive() {
    this.activeCtx.clearRect(0, 0, this.activeCanvas.width, this.activeCanvas.height);
  }

  clearAll() {
    this.committedCtx.clearRect(0, 0, this.committedCanvas.width, this.committedCanvas.height);
    this.activeCtx.clearRect(0, 0, this.activeCanvas.width, this.activeCanvas.height);
  }

  resize(width, height) {
    // Save content
    const temp = document.createElement('canvas');
    temp.width = this.committedCanvas.width;
    temp.height = this.committedCanvas.height;
    temp.getContext('2d').drawImage(this.committedCanvas, 0, 0);

    this.committedCanvas.width = width;
    this.committedCanvas.height = height;
    this.activeCanvas.width = width;
    this.activeCanvas.height = height;

    this.setContextDefaults(this.committedCtx);
    this.setContextDefaults(this.activeCtx);
    
    this.committedCtx.drawImage(temp, 0, 0);
  }
}
