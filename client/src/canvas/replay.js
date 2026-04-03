/**
 * Canvas Replay Utility
 * Useful for redraws, state restoration, or animated replays
 */

export const replayStrokes = (strokes, engine, delay = 0) => {
    if (delay === 0) {
        // Redraw instantly
        strokes.forEach(s => engine.drawStroke(s));
        return Promise.resolve();
    }

    // Redraw with an optional delay for a "replay effect"
    return new Promise((resolve) => {
        let currentIndex = 0;
        
        const next = () => {
            if (currentIndex >= strokes.length) {
                resolve();
                return;
            }
            
            engine.drawStroke(strokes[currentIndex]);
            currentIndex++;
            setTimeout(next, delay);
        };
        
        next();
    });
};
