import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import Room from './Room';

function Home() {
  const navigate = useNavigate();

  return (
    <div 
      className="flex flex-col items-center justify-center min-h-screen w-full bg-canvas text-text-primary selection:bg-violet-100 italic"
      style={{
        background: 'radial-gradient(ellipse at 50% 40%, #ede9fe 0%, #f8f8f6 60%)'
      }}
    >
      <div className="text-center px-6">
        {/* TAG */}
        <span className="inline-block px-3 py-1 text-xs font-medium text-violet-600 bg-violet-50 
                         rounded-full border border-violet-200">
          Real-time collaborative drawing
        </span>

        {/* LOGO */}
        <h1 className="mt-6 text-8xl font-serif text-text-primary tracking-tighter leading-none" 
            style={{ fontFamily: '"Instrument Serif", serif' }}>
          Ezhuth
        </h1>

        {/* TAGLINE */}
        <p className="mt-4 text-xl text-text-muted font-medium tracking-tight">
          Draw together, <span className="text-text-primary">in real time.</span>
        </p>

        {/* BUTTON */}
        <div className="mt-12 flex flex-col items-center">
          <button 
            onClick={() => navigate(`/room/${uuidv4()}`)}
            className="group px-10 py-4 bg-accent text-white text-lg font-semibold 
                       rounded-full shadow-lg hover:bg-violet-700 active:scale-95 
                       transform transition-all duration-150 flex items-center gap-2"
          >
            Create room
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </button>
          <span className="mt-6 text-sm text-gray-400 font-medium">
            No sign up needed · Share the link to invite others
          </span>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/room/:roomId" element={<Room />} />
      </Routes>
    </Router>
  );
}

export default App;
