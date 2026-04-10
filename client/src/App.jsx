import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import Room from './Room';

// ─── Design Tokens ───────────────────────────────────────────────────────────
const token = {
  green:     '#2d6a4f',
  greenMid:  '#40916c',
  greenSoft: '#d8f3dc',
  greenFaint:'#f0faf3',
  cream:     '#faf9f6',
  sand:      '#f3f0e8',
  ink:       '#1a1f1e',
  inkMuted:  '#4a5550',
  inkLight:  '#8a9e96',
  accent:    '#1b4332',
};

// ─── Inline Styles ───────────────────────────────────────────────────────────
const styles = {
  root: {
    fontFamily: '"Lora", Georgia, serif',
    background: token.cream,
    color: token.ink,
    minHeight: '100vh',
    overflowX: 'hidden',
  },

  // Grid paper background overlay
  gridBg: {
    position: 'fixed',
    inset: 0,
    zIndex: 0,
    backgroundImage: `
      linear-gradient(rgba(45,106,79,0.06) 1px, transparent 1px),
      linear-gradient(90deg, rgba(45,106,79,0.06) 1px, transparent 1px)
    `,
    backgroundSize: '32px 32px',
    pointerEvents: 'none',
  },

  // Navbar
  nav: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 5vw',
    height: '68px',
    backdropFilter: 'blur(14px)',
    WebkitBackdropFilter: 'blur(14px)',
    background: 'rgba(250,249,246,0.82)',
    borderBottom: `1px solid rgba(45,106,79,0.10)`,
  },
  navLogo: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '12px',
    lineHeight: 1,
  },
  navLogoText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1px',
  },
  navLogoName: {
    fontFamily: '"Playfair Display", "Lora", Georgia, serif',
    fontSize: '1.45rem',
    fontWeight: 700,
    color: token.accent,
    letterSpacing: '-0.02em',
    margin: 0,
  },
  navLogoTagline: {
    fontFamily: '"Noto Serif Malayalam", "Lora", serif',
    fontSize: '0.68rem',
    color: token.greenMid,
    letterSpacing: '0.01em',
    margin: 0,
  },
  navBtn: {
    fontFamily: '"Lora", Georgia, serif',
    background: token.accent,
    color: '#fff',
    border: 'none',
    borderRadius: '100px',
    padding: '10px 26px',
    fontSize: '0.88rem',
    fontWeight: 600,
    cursor: 'pointer',
    letterSpacing: '0.01em',
    transition: 'background 0.2s, transform 0.15s',
  },

  // Hero
  hero: {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: '110px 5vw 90px',
    background: `radial-gradient(ellipse 80% 60% at 50% 0%, ${token.greenSoft} 0%, ${token.cream} 70%)`,
  },
  heroBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '7px',
    background: token.greenFaint,
    border: `1px solid ${token.greenMid}33`,
    color: token.greenMid,
    borderRadius: '100px',
    padding: '5px 14px',
    fontSize: '0.75rem',
    fontFamily: '"Lato", "Helvetica Neue", sans-serif',
    fontWeight: 600,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    marginBottom: '32px',
  },
  heroBadgeDot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    background: token.greenMid,
    display: 'inline-block',
  },
  heroHeadline: {
    fontFamily: '"Playfair Display", "Lora", Georgia, serif',
    fontSize: 'clamp(3rem, 7vw, 5.2rem)',
    fontWeight: 700,
    lineHeight: 1.08,
    letterSpacing: '-0.03em',
    color: token.ink,
    maxWidth: '820px',
    margin: '0 auto 20px',
  },
  heroSub: {
    fontFamily: '"Lato", "Helvetica Neue", sans-serif',
    fontSize: 'clamp(1rem, 2vw, 1.18rem)',
    color: token.inkMuted,
    maxWidth: '520px',
    margin: '0 auto 12px',
    lineHeight: 1.65,
    fontWeight: 400,
  },
  heroMalayalam: {
    fontFamily: '"Noto Serif Malayalam", "Lora", serif',
    fontSize: '1.05rem',
    color: token.greenMid,
    margin: '0 auto 44px',
    letterSpacing: '0.01em',
  },
  heroBtns: {
    display: 'flex',
    gap: '14px',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: '60px',
  },
  btnPrimary: {
    fontFamily: '"Lato", "Helvetica Neue", sans-serif',
    background: token.accent,
    color: '#fff',
    border: 'none',
    borderRadius: '100px',
    padding: '14px 34px',
    fontSize: '1rem',
    fontWeight: 700,
    cursor: 'pointer',
    letterSpacing: '0.01em',
    transition: 'background 0.2s, transform 0.15s, box-shadow 0.2s',
    boxShadow: `0 4px 18px ${token.green}33`,
  },
  btnSecondary: {
    fontFamily: '"Lato", "Helvetica Neue", sans-serif',
    background: 'transparent',
    color: token.accent,
    border: `1.5px solid ${token.green}55`,
    borderRadius: '100px',
    padding: '14px 34px',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    letterSpacing: '0.01em',
    transition: 'border-color 0.2s, background 0.2s, transform 0.15s',
  },
  joinSection: {
    marginTop: '48px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
    width: '100%',
    maxWidth: '320px',
  },
  joinLabel: {
    fontFamily: '"Lato", sans-serif',
    fontSize: '0.85rem',
    fontWeight: 600,
    color: token.inkLight,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  joinInputWrapper: {
    display: 'flex',
    gap: '8px',
    width: '100%',
  },
  joinInput: {
    flex: 1,
    fontFamily: '"Lato", sans-serif',
    background: '#fff',
    border: `1.5px solid ${token.green}22`,
    borderRadius: '100px',
    padding: '12px 24px',
    fontSize: '0.95rem',
    fontWeight: 700,
    letterSpacing: '0.2em',
    textAlign: 'center',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    color: token.accent,
  },
  joinBtn: {
    background: token.greenFaint,
    color: token.accent,
    border: `1.5px solid ${token.green}33`,
    borderRadius: '100px',
    padding: '12px 24px',
    fontSize: '0.9rem',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  errorMsg: {
    fontFamily: '"Lato", sans-serif',
    fontSize: '0.8rem',
    color: '#ef4444',
    fontWeight: 600,
    marginTop: '4px',
    animation: 'shake 0.4s ease-in-out',
  },

  // Whiteboard preview card
  boardCard: {
    width: '100%',
    maxWidth: '680px',
    margin: '0 auto',
    background: '#fff',
    borderRadius: '18px',
    border: `1px solid ${token.green}18`,
    boxShadow: `0 12px 48px ${token.green}14, 0 2px 8px ${token.green}0a`,
    overflow: 'hidden',
  },
  boardBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '7px',
    padding: '12px 18px',
    background: token.sand,
    borderBottom: `1px solid ${token.green}14`,
  },
  boardDot: (color) => ({
    width: '11px', height: '11px', borderRadius: '50%', background: color,
  }),
  boardTitle: {
    fontFamily: '"Lato", sans-serif',
    fontSize: '0.75rem',
    color: token.inkLight,
    marginLeft: '6px',
    letterSpacing: '0.03em',
  },
  boardBody: {
    padding: '32px 28px 28px',
    minHeight: '200px',
    position: 'relative',
    background: `
      radial-gradient(ellipse 60% 40% at 70% 60%, ${token.greenSoft}55 0%, transparent 70%),
      #fff
    `,
  },

  // SVG sketch elements inside board
  sketchSvg: {
    width: '100%',
    height: '200px',
    overflow: 'visible',
  },

  // Features
  features: {
    position: 'relative',
    zIndex: 1,
    padding: '90px 5vw',
    maxWidth: '1100px',
    margin: '0 auto',
  },
  featuresLabel: {
    fontFamily: '"Lato", sans-serif',
    fontSize: '0.72rem',
    fontWeight: 700,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: token.greenMid,
    marginBottom: '16px',
  },
  featuresHeading: {
    fontFamily: '"Playfair Display", serif',
    fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
    fontWeight: 700,
    color: token.ink,
    letterSpacing: '-0.025em',
    marginBottom: '56px',
    maxWidth: '480px',
    lineHeight: 1.18,
  },
  featureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
    gap: '22px',
  },
  featureCard: {
    background: '#fff',
    border: `1px solid ${token.green}18`,
    borderRadius: '16px',
    padding: '34px 30px',
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'default',
  },
  featureIcon: {
    width: '42px',
    height: '42px',
    borderRadius: '12px',
    background: token.greenFaint,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '20px',
    fontSize: '1.3rem',
  },
  featureTitle: {
    fontFamily: '"Playfair Display", serif',
    fontSize: '1.15rem',
    fontWeight: 700,
    color: token.ink,
    marginBottom: '4px',
  },
  featureMalayalam: {
    fontFamily: '"Noto Serif Malayalam", serif',
    fontSize: '0.8rem',
    color: token.greenMid,
    marginBottom: '12px',
  },
  featureDesc: {
    fontFamily: '"Lato", sans-serif',
    fontSize: '0.93rem',
    color: token.inkMuted,
    lineHeight: 1.65,
  },

  // Divider
  divider: {
    width: '100%',
    height: '1px',
    background: `linear-gradient(90deg, transparent, ${token.green}22, transparent)`,
    margin: '0 auto',
    maxWidth: '900px',
  },

  // CTA
  cta: {
    position: 'relative',
    zIndex: 1,
    textAlign: 'center',
    padding: '100px 5vw',
    background: `radial-gradient(ellipse 70% 80% at 50% 100%, ${token.greenSoft}66 0%, transparent 70%)`,
  },
  ctaHeadline: {
    fontFamily: '"Playfair Display", serif',
    fontSize: 'clamp(2rem, 5vw, 3.6rem)',
    fontWeight: 700,
    letterSpacing: '-0.03em',
    color: token.ink,
    lineHeight: 1.1,
    marginBottom: '12px',
  },
  ctaMalayalam: {
    fontFamily: '"Noto Serif Malayalam", serif',
    fontSize: '1.1rem',
    color: token.greenMid,
    marginBottom: '44px',
  },

  // Footer
  footer: {
    position: 'relative',
    zIndex: 1,
    borderTop: `1px solid ${token.green}14`,
    padding: '32px 5vw',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px',
  },
  footerLeft: {
    fontFamily: '"Lato", sans-serif',
    fontSize: '0.85rem',
    color: token.inkMuted,
    lineHeight: 1.6,
  },
  footerMalayalam: {
    fontFamily: '"Noto Serif Malayalam", serif',
    fontSize: '0.8rem',
    color: token.inkLight,
    display: 'block',
  },
  footerLink: {
    fontFamily: '"Lato", sans-serif',
    fontSize: '0.85rem',
    color: token.greenMid,
    textDecoration: 'none',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'color 0.2s',
  },
};

// ─── Feature data ─────────────────────────────────────────────────────────────
const features = [
  {
    icon: '⚡',
    title: 'Real-time Sync',
    malayalam: 'തത്സമയം',
    desc: 'Every stroke appears instantly for all collaborators. No lag, no reload — pure flow.',
  },
  {
    icon: '👥',
    title: 'Multiplayer Rooms',
    malayalam: 'ഒരുമിച്ച്',
    desc: 'Create a room, share the link. Your whole team joins in seconds — no account needed.',
  },
  {
    icon: '∞',
    title: 'Infinite Canvas',
    malayalam: 'അവസാനമില്ലാത്ത ബോർഡ്',
    desc: 'Your ideas never run out of space. Pan, zoom, and draw without limits.',
  },
];

// ─── Home Component ───────────────────────────────────────────────────────────
function Home() {
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleStart = () => navigate(`/room/${uuidv4()}`);
  
  const handleJoin = async (e) => {
    e.preventDefault();
    const code = joinCode.trim().toUpperCase();
    if (code.length < 6) {
        setError('Code must be 6 characters');
        return;
    }

    setLoading(true);
    setError('');

    try {
        const baseUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:3001";
        const res = await fetch(`${baseUrl}/validate/${code}`);
        const data = await res.json();

        if (data.valid) {
            navigate(`/room/${code}`);
        } else {
            setError('Room not found or expired');
        }
    } catch (err) {
        setError('Connection error. Try again.');
    } finally {
        setLoading(false);
    }
  };

  const hoverCard = (e) => {
    e.currentTarget.style.transform = 'translateY(-5px)';
    e.currentTarget.style.boxShadow = `0 16px 40px ${token.green}18`;
  };
  const unhoverCard = (e) => {
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = 'none';
  };

  const hoverPrimary = (e) => {
    e.currentTarget.style.background = token.greenMid;
    e.currentTarget.style.transform = 'scale(1.03)';
  };
  const unhoverPrimary = (e) => {
    e.currentTarget.style.background = token.accent;
    e.currentTarget.style.transform = 'scale(1)';
  };

  const hoverSecondary = (e) => {
    e.currentTarget.style.background = token.greenFaint;
    e.currentTarget.style.borderColor = token.green;
  };
  const unhoverSecondary = (e) => {
    e.currentTarget.style.background = 'transparent';
    e.currentTarget.style.borderColor = `${token.green}55`;
  };

  const hoverNavBtn = (e) => { e.currentTarget.style.background = token.greenMid; };
  const unhoverNavBtn = (e) => { e.currentTarget.style.background = token.accent; };

  return (
    <>
      {/* Google Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Lora:wght@400;600&family=Lato:wght@400;600;700&family=Noto+Serif+Malayalam:wght@400;600&display=swap"
        rel="stylesheet"
      />

      <div style={styles.root}>
        {/* Grid paper background */}
        <div style={styles.gridBg} />

        {/* ── Navbar ─────────────────────────────────────────── */}
        <nav style={styles.nav}>
          <div style={styles.navLogo}>
            <img src="logo.png" alt="Ezhuth Logo" srcset="" height="40" width="40" style={{ display: 'block', margin: 0, flexShrink: 0 }}/>
            <div style={styles.navLogoText}>
              <span style={styles.navLogoName}>Ezhuth</span>
              <span style={styles.navLogoTagline}>എഴുതാം ഒരുമിച്ച്</span>
            </div>
          </div>
          <button
            style={styles.navBtn}
            onClick={handleStart}
            onMouseEnter={hoverNavBtn}
            onMouseLeave={unhoverNavBtn}
          >
            Start Drawing
          </button>
        </nav>

        {/* ── Hero ───────────────────────────────────────────── */}
        <section style={styles.hero}>
          {/* Live badge */}
          <div style={styles.heroBadge}>
            <span style={styles.heroBadgeDot} />
            Real-time collaborative whiteboard
          </div>

          {/* Headline */}
          <h1 style={styles.heroHeadline}>
            Think.&nbsp;Sketch.<br />Collaborate.
          </h1>

          {/* Subtext */}
          <p style={styles.heroSub}>
            A real-time collaborative whiteboard for teams and creators. Draw ideas, map thoughts, build together.
          </p>

          {/* Malayalam line */}
          <p style={styles.heroMalayalam}>ഒരുമിച്ച് ആശയങ്ങൾ വരയ്ക്കൂ</p>

          {/* Buttons */}
          <div style={styles.heroBtns}>
            <button
              style={styles.btnPrimary}
              onClick={handleStart}
              onMouseEnter={hoverPrimary}
              onMouseLeave={unhoverPrimary}
            >
              Start Drawing →
            </button>
            <a
              href="https://github.com/blitzbugg/ezhuth"
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'none' }}
            >
              <button
                style={styles.btnSecondary}
                onMouseEnter={hoverSecondary}
                onMouseLeave={unhoverSecondary}
              >
                ⭐ GitHub
              </button>
            </a>
          </div>

          {/* Join Section */}
          <div style={styles.joinSection}>
            <span style={styles.joinLabel}>Or join existing</span>
            <form onSubmit={handleJoin} style={styles.joinInputWrapper}>
              <input
                type="text"
                placeholder="ABCDEF"
                maxLength={6}
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                style={styles.joinInput}
                onFocus={(e) => { e.target.style.borderColor = token.green; e.target.style.boxShadow = `0 0 0 4px ${token.green}11`; }}
                onBlur={(e) => { e.target.style.borderColor = `${token.green}22`; e.target.style.boxShadow = 'none'; }}
              />
              <button 
                type="submit" 
                disabled={loading}
                style={{ ...styles.joinBtn, opacity: loading ? 0.6 : 1 }}
                onMouseEnter={(e) => { if (!loading) { e.target.style.background = token.greenSoft; e.target.style.transform = 'translateY(-2px)'; } }}
                onMouseLeave={(e) => { if (!loading) { e.target.style.background = token.greenFaint; e.target.style.transform = 'translateY(0)'; } }}
              >
                {loading ? '...' : 'Join'}
              </button>
            </form>
            {error && <span style={styles.errorMsg}>{error}</span>}
          </div>

          {/* Whiteboard preview card */}
          <div style={styles.boardCard}>
            <div style={styles.boardBar}>
              <span style={styles.boardDot('#ff5f57')} />
              <span style={styles.boardDot('#febc2e')} />
              <span style={styles.boardDot('#28c840')} />
              <span style={styles.boardTitle}>ezhuth.app / room / AEFGKO</span>
            </div>
            <div style={styles.boardBody}>
              <svg style={styles.sketchSvg} viewBox="0 0 620 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Freehand strokes */}
                <path d="M 40 120 C 70 80, 110 160, 150 100 C 190 40, 220 140, 260 110"
                  stroke={token.green} strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.7"/>
                <path d="M 300 60 C 320 90, 340 50, 360 80 C 380 110, 400 60, 420 85"
                  stroke="#e76f51" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6"/>
                {/* Sticky note */}
                <rect x="460" y="30" width="130" height="90" rx="6" fill="#fef9c3" stroke="#fde047" strokeWidth="1.2"/>
                <line x1="476" y1="60" x2="574" y2="60" stroke="#a3a3a3" strokeWidth="1.2" opacity="0.6"/>
                <line x1="476" y1="76" x2="555" y2="76" stroke="#a3a3a3" strokeWidth="1.2" opacity="0.6"/>
                <line x1="476" y1="92" x2="563" y2="92" stroke="#a3a3a3" strokeWidth="1.2" opacity="0.6"/>
                <text x="476" y="54" fontFamily="Lato, sans-serif" fontSize="10" fill={token.inkMuted}>Ideas</text>
                {/* Avatar cursors */}
                <circle cx="155" cy="98" r="10" fill={token.greenMid} opacity="0.9"/>
                <text x="151" y="102" fontFamily="Lato" fontSize="9" fill="#fff">K</text>
                <circle cx="420" cy="84" r="10" fill="#e76f51" opacity="0.9"/>
                <text x="416" y="88" fontFamily="Lato" fontSize="9" fill="#fff">A</text>
                {/* Arrow connector */}
                <path d="M 270 108 Q 285 108 300 60" stroke={token.greenMid} strokeWidth="1.5"
                  strokeDasharray="5 3" fill="none" opacity="0.5" markerEnd="url(#arrowhead)"/>
                <defs>
                  <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                    <path d="M 0 0 L 6 3 L 0 6 Z" fill={token.greenMid} opacity="0.5"/>
                  </marker>
                </defs>
                {/* Small shapes */}
                <rect x="60" y="140" width="50" height="36" rx="4" fill={token.greenFaint} stroke={token.greenMid} strokeWidth="1.2"/>
                <text x="73" y="162" fontFamily="Playfair Display, serif" fontSize="9" fill={token.green}>Flow</text>
                <ellipse cx="200" cy="158" rx="36" ry="22" fill="#fff7ed" stroke="#fb923c" strokeWidth="1.2"/>
                <text x="180" y="162" fontFamily="Lato, sans-serif" fontSize="9" fill="#c2410c">Idea ✦</text>
              </svg>
            </div>
          </div>
        </section>

        {/* ── Features ───────────────────────────────────────── */}
        <section style={styles.features}>
          <div style={styles.featuresLabel}>What you get</div>
          <h2 style={styles.featuresHeading}>
            Everything you need to collaborate visually.
          </h2>
          <div style={styles.featureGrid}>
            {features.map((f) => (
              <div
                key={f.title}
                style={styles.featureCard}
                onMouseEnter={hoverCard}
                onMouseLeave={unhoverCard}
              >
                <div style={styles.featureIcon}>{f.icon}</div>
                <div style={styles.featureTitle}>{f.title}</div>
                <div style={styles.featureMalayalam}>{f.malayalam}</div>
                <div style={styles.featureDesc}>{f.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Divider */}
        <div style={{ padding: '0 5vw' }}>
          <div style={styles.divider} />
        </div>

        {/* ── CTA ────────────────────────────────────────────── */}
        <section style={styles.cta}>
          <h2 style={styles.ctaHeadline}>
            Start drawing together,<br />instantly.
          </h2>
          <p style={styles.ctaMalayalam}>ഇപ്പോൾ തന്നെ തുടങ്ങൂ</p>
          <button
            style={{ ...styles.btnPrimary, fontSize: '1.05rem', padding: '16px 42px' }}
            onClick={handleStart}
            onMouseEnter={hoverPrimary}
            onMouseLeave={unhoverPrimary}
          >
            Create Room →
          </button>
        </section>

        {/* ── Footer ─────────────────────────────────────────── */}
        <footer style={styles.footer}>
          <div style={styles.footerLeft}>
            Built with ❤️ in Kerala
            <span style={styles.footerMalayalam}>കേരളത്തിൽ നിന്നുള്ള സ്നേഹം</span>
          </div>
          <a
            href="https://github.com/blitzbugg/ezhuth"
            target="_blank"
            rel="noopener noreferrer"
            style={styles.footerLink}
            onMouseEnter={(e) => { e.currentTarget.style.color = token.accent; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = token.greenMid; }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.607.069-.607 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
            </svg>
            GitHub
          </a>
        </footer>
      </div>
    </>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
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