

Copy
# Rules for every follow-up message in this project

ALWAYS:
- Show the full file content when editing a file, not just the diff.
- Create files in the exact folder path specified. Do not reorganize.
- Use uuid v4 for all IDs. Never Date.now() as an ID.
- Throttle network emits (draw: 30ms, cursor: 50ms). Keep local
  rendering decoupled from emit rate.
- Maintain the pending queue for late-joiner sync in all edits to
  the draw event handler.

NEVER:
- Add TypeScript
- Add a database or authentication layer.
- Echo the draw event back to the sender (use socket.to(), not io.to()).
- Draw on the committed canvas during an active stroke — only on
  canvas-active. Move to committed canvas on mouseup.
- Use Date.now() or Math.random() as a stroke ID.
- Remove the two-canvas pattern for any reason.

WHEN ADDING A FEATURE:
1. Update the server handler in /server/src/sockets/handlers.js.
2. Update the room manager in /server/src/rooms/manager.js if the
   room schema changes.
3. Update the client event handler in /client/src/socket/events.js.
4. Update the canvas engine in /client/src/canvas/engine.js if
   rendering changes.
5. Update the component last.

TESTING CHECKLIST (run after every change):
[ ] Two tabs draw in sync
[ ] Third tab (late joiner) sees full canvas
[ ] Closing a tab does not crash the other tab
[ ] Clear button wipes all tabs

## STYLING

Use Tailwind CSS v3 for all styling.

Setup order (do this before writing any component):
1. Install: npm install -D tailwindcss postcss autoprefixer
2. Run: npx tailwindcss init -p
3. Configure tailwind.config.js content paths correctly
4. Add @tailwind directives to index.css
5. Verify Tailwind is working with one test class before proceeding

After setup is confirmed, use Tailwind for everything.
No plain CSS files except for canvas-specific rules
(canvas element sizing cannot be done in Tailwind reliably —
use a plain CSS rule for the canvas width/height only).


## UI DESIGN DIRECTION

The app should feel modern, minimal, and creative.
Reference aesthetic: Linear, Vercel, Figma.

Specific requirements:
- Dark background (#0f0f0f) as the base
- Canvas area is pure black — no border, edge to edge
- Toolbar floats at the bottom center as a pill-shaped
  glassmorphism bar (backdrop-blur, semi-transparent dark bg)
- Color swatches are small circles, active one has a white ring
- Brush size shows as a live dot preview next to the slider
- User cursors have a small label showing their color dot + "User 2" etc
- Room URL copy button in top right corner, minimal
- Landing page is centered, dark, with the app name in large
  type and a single "Create room →" button
- Smooth transitions on all interactive elements (150ms ease)

## BRANDING

App name: Ezhuth
Tagline: "Draw together, in real time."
Use a serif or display font from Google Fonts for the app name
on the landing page only. Body UI uses Inter.
Favicon: a simple stylized "E" or a pen stroke SVG.