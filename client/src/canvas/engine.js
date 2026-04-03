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
        ctx.strokeStyle = '#ffffff'; 
        ctx.globalCompositeOperation = 'source-over';
      }
    } else {
      ctx.globalCompositeOperation = 'source-over';
    }

    ctx.stroke();
    ctx.globalCompositeOperation = 'source-over';
  }

  drawRect(shape, useCommitted = true) {
    const ctx = useCommitted ? this.committedCtx : this.activeCtx;
    if (!ctx) return;
    ctx.strokeStyle = shape.color;
    ctx.lineWidth = shape.size;
    ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
  }

  drawEllipse(shape, useCommitted = true) {
    const ctx = useCommitted ? this.committedCtx : this.activeCtx;
    if (!ctx) return;
    ctx.strokeStyle = shape.color;
    ctx.lineWidth = shape.size;
    
    ctx.beginPath();
    ctx.ellipse(
        shape.x + shape.width / 2, 
        shape.y + shape.height / 2, 
        Math.abs(shape.width / 2), 
        Math.abs(shape.height / 2), 
        0, 0, 2 * Math.PI
    );
    ctx.stroke();
  }

  drawArrow(shape, useCommitted = true) {
    const ctx = useCommitted ? this.committedCtx : this.activeCtx;
    if (!ctx) return;
    ctx.strokeStyle = shape.color;
    ctx.lineWidth = shape.size;
    
    // Draw base line
    ctx.beginPath();
    ctx.moveTo(shape.x, shape.y);
    ctx.lineTo(shape.x2, shape.y2);
    ctx.stroke();
    
    // Draw head
    const angle = Math.atan2(shape.y2 - shape.y, shape.x2 - shape.x);
    const headLen = 10;
    ctx.beginPath();
    ctx.moveTo(shape.x2, shape.y2);
    ctx.lineTo(shape.x2 - headLen * Math.cos(angle - Math.PI / 6), shape.y2 - headLen * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(shape.x2, shape.y2);
    ctx.lineTo(shape.x2 - headLen * Math.cos(angle + Math.PI / 6), shape.y2 - headLen * Math.sin(angle + Math.PI / 6));
    ctx.stroke();
  }

  drawLine(shape, useCommitted = true) {
    const ctx = useCommitted ? this.committedCtx : this.activeCtx;
    if (!ctx) return;
    ctx.strokeStyle = shape.color;
    ctx.lineWidth = shape.size;
    
    ctx.beginPath();
    ctx.moveTo(shape.x, shape.y);
    ctx.lineTo(shape.x2, shape.y2);
    ctx.stroke();
  }

  drawText(shape, useCommitted = true) {
    const ctx = useCommitted ? this.committedCtx : this.activeCtx;
    if (!ctx) return;
    ctx.fillStyle = shape.color;
    ctx.font = `${shape.size * 5}px Lato, sans-serif`;
    ctx.fillText(shape.text || '', shape.x, shape.y);
  }

  drawDiamond(shape, useCommitted = true) {
    const ctx = useCommitted ? this.committedCtx : this.activeCtx;
    if (!ctx) return;
    ctx.strokeStyle = shape.color;
    ctx.lineWidth = shape.size;
    
    ctx.beginPath();
    ctx.moveTo(shape.x + shape.width / 2, shape.y);
    ctx.lineTo(shape.x + shape.width, shape.y + shape.height / 2);
    ctx.lineTo(shape.x + shape.width / 2, shape.y + shape.height);
    ctx.lineTo(shape.x, shape.y + shape.height / 2);
    ctx.closePath();
    ctx.stroke();
  }

  drawFrame(shape, useCommitted = true) {
    const ctx = useCommitted ? this.committedCtx : this.activeCtx;
    if (!ctx) return;
    
    ctx.strokeStyle = '#e5e5e3';
    ctx.lineWidth = 1;
    ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
    
    ctx.fillStyle = '#f3f0e8';
    ctx.fillRect(shape.x, shape.y - 20, Math.min(Math.max(shape.width, 40), 100), 20);
    ctx.fillStyle = '#4a5550';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('Frame', shape.x + 5, shape.y - 6);
  }

  drawLaser(points) {
    const ctx = this.activeCtx;
    if (!ctx || !points || points.length === 0) return;
    
    // Draw tail
    ctx.save();
    points.forEach((p, i) => {
        const opacity = (i + 1) / points.length;
        const radius = (i + 1) / points.length * 4;
        ctx.fillStyle = `rgba(255, 0, 0, ${opacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, 2 * Math.PI);
        ctx.fill();
    });
    ctx.restore();
  }

  drawLasso(lasso) {
    const ctx = this.activeCtx;
    if (!ctx) return;
    ctx.save();
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = 'rgba(109, 74, 255, 0.6)';
    ctx.lineWidth = 1;
    ctx.strokeRect(lasso.x, lasso.y, lasso.width, lasso.height);
    ctx.restore();
  }

  drawElement(el, useCommitted = true) {
    switch (el.type) {
      case 'draw':
      case 'erase':
        this.drawStroke(el, useCommitted);
        break;
      case 'rectangle':
        this.drawRect(el, useCommitted);
        break;
      case 'ellipse':
        this.drawEllipse(el, useCommitted);
        break;
      case 'arrow':
        this.drawArrow(el, useCommitted);
        break;
      case 'line':
        this.drawLine(el, useCommitted);
        break;
      case 'text':
        this.drawText(el, useCommitted);
        break;
      case 'diamond':
        this.drawDiamond(el, useCommitted);
        break;
      case 'frame':
        this.drawFrame(el, useCommitted);
        break;
      default:
        break;
    }
  }

  redrawScene(elements, pan = { x: 0, y: 0 }, selectedIds = []) {
    this.clearAll();
    
    this.committedCtx.save();
    this.committedCtx.translate(pan.x, pan.y);
    
    const frames = elements.filter(el => el.type === 'frame');
    const others = elements.filter(el => el.type !== 'frame');
    
    [...frames, ...others].forEach(el => {
      this.drawElement(el, true);
      
      // Draw multiple selection highlights
      if (selectedIds.includes(el.id)) {
        this.committedCtx.save();
        this.committedCtx.setLineDash([4, 4]);
        this.committedCtx.strokeStyle = '#6d4aff';
        this.committedCtx.lineWidth = 1.5;
        if (el.width && el.height) {
          this.committedCtx.strokeRect(el.x - 4, el.y - 4, el.width + 8, el.height + 8);
        } else if (el.x2 !== undefined) {
          const minX = Math.min(el.x, el.x2);
          const minY = Math.min(el.y, el.y2);
          const maxX = Math.max(el.x, el.x2);
          const maxY = Math.max(el.y, el.y2);
          this.committedCtx.strokeRect(minX - 4, minY - 4, maxX - minX + 8, maxY - minY + 8);
        } else if (el.type === 'text') {
            this.committedCtx.strokeRect(el.x - 4, el.y - 24, 108, 30);
        }
        this.committedCtx.restore();
      }
    });

    this.committedCtx.restore();
  }

  clearActive() {
    this.activeCtx.clearRect(0, 0, this.activeCanvas.width, this.activeCanvas.height);
  }

  clearAll() {
    this.committedCtx.clearRect(0, 0, this.committedCanvas.width, this.committedCanvas.height);
    this.activeCtx.clearRect(0, 0, this.activeCanvas.width, this.activeCanvas.height);
  }

  resize(width, height) {
    this.committedCanvas.width = width;
    this.committedCanvas.height = height;
    this.activeCanvas.width = width;
    this.activeCanvas.height = height;
    this.setContextDefaults(this.committedCtx);
    this.setContextDefaults(this.activeCtx);
  }
}
