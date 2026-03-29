import React, { useState, useEffect, useRef, useCallback } from 'react'

const API = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || 'http://localhost:5000/api'

// Parse "1. Step one\n2. Step two" -> ['Step one', 'Step two']
function parseSteps(str) {
  return str.split('\n').map(s => s.replace(/^\d+\.\s*/, '').trim()).filter(Boolean)
}

// Search fetched KB object for a keyword match
function findInKB(kb, message) {
  if (!kb || Object.keys(kb).length === 0) return null
  const lower = message.toLowerCase()
  for (const [keyword, info] of Object.entries(kb)) {
    if (keyword.startsWith('emergency hazard')) continue
    if (lower.includes(keyword)) {
      return { title: info.name, steps: parseSteps(info.first_aid), videos: info.videos || null }
    }
  }
  return null
}

// ===========================
// COMPONENT: GPS Permission Screen
// ===========================
function GPSScreen({ onGranted, onSkip }) {
  const [loading, setLoading] = useState(false)

  const handleGrant = () => {
    setLoading(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => onGranted({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => { setLoading(false); onSkip() },
        { timeout: 10000 }
      )
    } else { setLoading(false); onSkip() }
  }

  return (
    <div className="gps-overlay">
      <div className="gps-card">
        <div className="gps-icon">📍</div>
        <h2>Enable Location Access</h2>
        <p>
          HELPMATE needs your GPS location to show nearby hospitals on the map and 
          dispatch emergency ambulances to your exact location when needed.
        </p>
        <button className="btn-gps" onClick={handleGrant} disabled={loading}>
          {loading ? '⏳ Getting Location...' : '📍 Grant GPS Access'}
        </button>
        <br />
        <button className="btn-skip" onClick={onSkip}>
          Skip — Go to First Aid Guide
        </button>
      </div>
    </div>
  )
}

// ===========================
// COMPONENT: Navbar
// ===========================
function Navbar({ onChatOpen }) {
  return (
    <nav className="navbar">
      <a href="#" className="nav-logo">
        <div className="nav-logo-icon">🚑</div>
        <h1>HELP<span>MATE</span></h1>
      </a>
      <div className="nav-links">
        <a href="#emergencies">First Aid</a>
        <a href="#map-section">Hospitals</a>
        <a href="#directory">Hotlines</a>
        <button className="nav-emergency" onClick={onChatOpen}>⚕️ AI Assistant</button>
      </div>
      <button className="hamburger" onClick={onChatOpen}>⚕️</button>
    </nav>
  )
}

// ===========================
// COMPONENT: Hero
// ===========================
function Hero({ onChatOpen }) {
  return (
    <section className="hero">
      <div className="hero-badge"><span>🟢</span> AI-Powered Emergency Support</div>
      <h2>Expert First Aid Guidance.<br /><span>When Seconds Matter.</span></h2>
      <p>Trained on 50+ medical emergencies. Ask our AI assistant and get step-by-step first aid instructions instantly — plus direct ambulance dispatch.</p>
      <div className="hero-actions">
        <button className="btn-hero-primary" onClick={onChatOpen}>⚕️ Open AI Assistant</button>
        <button className="btn-hero-secondary" onClick={() => document.getElementById('emergencies')?.scrollIntoView({ behavior: 'smooth' })}>
          Browse First Aid →
        </button>
      </div>
      <div className="hero-stats">
        <div className="stat"><div className="stat-num">50<span>+</span></div><div className="stat-label">Medical Scenarios</div></div>
        <div className="stat"><div className="stat-num">24<span>/7</span></div><div className="stat-label">Always Available</div></div>
        <div className="stat"><div className="stat-num">3<span>s</span></div><div className="stat-label">Avg Response</div></div>
      </div>
    </section>
  )
}

// ===========================
// COMPONENT: Emergency Cards Grid
// ===========================
const SHORTCUT_CARDS = [
  { keyword: 'burn',          label: 'Burns',          img: '/burn.jpg',    bg: '#FF6B35' },
  { keyword: 'heart attack',  label: 'Heart Attack',   img: '/heart.jpg',   bg: '#EF4444' },
  { keyword: 'stroke',        label: 'Stroke',         img: '/stroke.jpg',  bg: '#8B5CF6' },
  { keyword: 'choke',         label: 'Choking',        img: '/choking.jpg', bg: '#F59E0B' },
  { keyword: 'snake',         label: 'Snake Bite',     img: '/snake.jpg',   bg: '#10B981' },
  { keyword: 'electric',      label: 'Electric Shock', img: '/shock.jpg',   bg: '#3B82F6' },
  { keyword: 'bee',           label: 'Bee Sting',      img: null, emoji: '🐝', bg: '#F59E0B' },
  { keyword: 'fracture',      label: 'Fracture',       img: null, emoji: '🦴', bg: '#64748B' },
  { keyword: 'dog',           label: 'Dog Bite',       img: null, emoji: '🐕', bg: '#92400E' },
  { keyword: 'seizure',       label: 'Seizure',        img: null, emoji: '🫨', bg: '#7C3AED' },
  { keyword: 'drowning',      label: 'Drowning',       img: null, emoji: '🌊', bg: '#0EA5E9' },
  { keyword: 'heat stroke',   label: 'Heat Stroke',    img: null, emoji: '☀️', bg: '#DC2626' },
]

function EmergencyGrid({ onShortcut }) {
  return (
    <section className="section" id="emergencies" style={{ background: '#fff' }}>
      <div className="container">
        <div className="section-title">
          <div className="divider"><div className="divider-line"></div></div>
          <h3>Emergency First Aid</h3>
          <p>Tap any card to instantly get expert guidance from the AI assistant</p>
        </div>
        <div className="emergency-grid">
          {SHORTCUT_CARDS.map((card) => (
            <div
              key={card.keyword}
              className="emergency-card"
              onClick={() => onShortcut(card.keyword)}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && onShortcut(card.keyword)}
            >
              {card.img
                ? <img src={card.img} alt={card.label} onError={e => { e.target.style.display = 'none'; e.target.nextElementSibling.style.display = 'flex' }} />
                : null
              }
              <div className="no-img" style={{ background: card.bg, display: card.img ? 'none' : 'flex' }}>
                {card.emoji || card.label[0]}
              </div>
              <div className="card-overlay"><span>{card.label}</span></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ===========================
// COMPONENT: Map Section
// ===========================
function MapSection({ location }) {
  const mapRef = useRef(null)

  useEffect(() => {
    if (!location || !mapRef.current) return
    const tryInit = () => {
      if (!window.google?.maps) { setTimeout(tryInit, 500); return }
      const { lat, lng } = location
      const map = new window.google.maps.Map(mapRef.current, { zoom: 14, center: { lat, lng }, mapTypeControl: false })
      new window.google.maps.Marker({ position: { lat, lng }, map, title: 'Your Location', icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png' })
      fetch(`${API}/hospitals`).then(r => r.json()).then(hospitals => {
        hospitals.forEach(h => new window.google.maps.Marker({ position: { lat: h.lat, lng: h.lng }, map, title: h.name, icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png' }))
      }).catch(() => {})
    }
    tryInit()
  }, [location])

  return (
    <section className="map-section" id="map-section">
      <div className="section-title">
        <div className="divider"><div className="divider-line"></div></div>
        <h3>Live Hospital Radar</h3>
        <p>Real-time map showing your location and nearby emergency hospitals</p>
      </div>
      <div className="map-wrapper">
        <div className="map-status-bar">
          <div className="status-dot">
            <div className={`dot ${location ? 'dot-green' : 'dot-gray'}`}></div>
            <span>{location ? `GPS Active — ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : 'GPS not enabled — allow location to activate map'}</span>
          </div>
          {location && <div className="status-dot"><span>🏥 Loading nearby hospitals...</span></div>}
        </div>
        <div
          id="map-container"
          ref={mapRef}
          style={location ? { background: '#ccc', height: '420px' } : {}}
        >
          {!location && (
            <>
              <span style={{ fontSize: '2.5rem' }}>🗺️</span>
              <p>Allow location access to see the hospital radar map.</p>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

// ===========================
// COMPONENT: Services Table
// ===========================
function ServicesTable() {
  const [services, setServices] = useState([])
  useEffect(() => {
    fetch(`${API}/services`)
      .then(r => r.json())
      .then(setServices)
      .catch(() => setServices([
        { id: 1, name: 'Ambulance Dispatch', type: 'Medical', contact_no: '102' },
        { id: 2, name: 'Fire Control Room',  type: 'Fire Safety', contact_no: '101' },
        { id: 3, name: 'Police Station',     type: 'Security',    contact_no: '100' },
        { id: 4, name: 'National Emergency', type: 'General',     contact_no: '112' },
      ]))
  }, [])

  return (
    <section className="section services-section" id="directory">
      <div className="container">
        <div className="section-title">
          <div className="divider"><div className="divider-line"></div></div>
          <h3>Public Emergency Hotlines</h3>
          <p>One-tap calling for all national emergency services</p>
        </div>
        <div className="table-wrap">
          <table className="styled-table">
            <thead><tr><th>Department</th><th>Category</th><th>Call Now</th></tr></thead>
            <tbody>
              {services.map(s => (
                <tr key={s.id}>
                  <td><strong>{s.name}</strong></td>
                  <td><span className="service-badge">{s.type}</span></td>
                  <td><a href={`tel:${s.contact_no}`} className="call-link">📞 {s.contact_no}</a></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

// ===========================
// COMPONENT: Footer
// ===========================
function Footer() {
  return (
    <footer>
      <div className="footer-grid">
        <div className="footer-brand">
          <h4>🚑 HELPMATE 2.0</h4>
          <p>A professional AI-powered emergency response platform providing expert first aid guidance, real-time hospital tracking, and instant ambulance dispatch.</p>
          <p style={{ marginTop: '1rem', fontSize: '0.8rem' }}>⚠️ Always call professional emergency services in life-threatening situations.</p>
        </div>
        <div className="footer-col">
          <h5>Quick Links</h5>
          <ul>
            <li><a href="#emergencies">First Aid Guide</a></li>
            <li><a href="#map-section">Hospital Map</a></li>
            <li><a href="#directory">Emergency Hotlines</a></li>
            <li><a href="http://localhost:5000/dashboard" target="_blank" rel="noreferrer">Hospital Dashboard</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h5>Emergency Numbers</h5>
          <ul>
            <li><a href="tel:112">🚨 National Emergency: 112</a></li>
            <li><a href="tel:102">🚑 Ambulance: 102</a></li>
            <li><a href="tel:101">🚒 Fire: 101</a></li>
            <li><a href="tel:100">🚔 Police: 100</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} HELPMATE — Hackathon Project</span>
        <span>Built with ❤️ for emergency response</span>
      </div>
    </footer>
  )
}

// ===========================
// COMPONENT: Video Modal
// ===========================
function VideoModal({ videos, onClose }) {
  const [active, setActive] = useState(null)

  useEffect(() => {
    if (videos) { const first = Object.values(videos)[0]; setActive(first) }
  }, [videos])

  if (!videos) return null
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.95)', zIndex: 2000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <button onClick={onClose} style={{ position: 'absolute', top: 20, right: 40, background: 'none', border: 'none', color: '#fff', fontSize: '2rem', cursor: 'pointer' }}>✕</button>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        {Object.entries(videos).map(([lang, url]) => (
          <button
            key={lang}
            onClick={() => setActive(url)}
            style={{
              padding: '8px 20px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.95rem',
              background: active === url ? 'var(--red, #EF4444)' : 'rgba(255,255,255,0.15)', color: '#fff', transition: '0.2s'
            }}
          >{lang}</button>
        ))}
      </div>
      {active && (
        <iframe
          src={active}
          title="First Aid Video"
          allowFullScreen
          style={{ width: '90%', maxWidth: '800px', height: '450px', borderRadius: '16px', border: 'none', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}
        />
      )}
    </div>
  )
}

// ===========================
// COMPONENT: Chatbot Widget
// ===========================
function Chatbot({ location, initialMessage, onClearInitial, externalOpen, kb }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([{
    sender: 'bot', type: 'text',
    text: 'Hi! 👋 I\'m your HelpMate Medical Assistant.\n\nI\'m trained on 50+ emergency scenarios. Tell me what happened — for example:\n"My friend got a burn"\n"Someone is choking"\n"Snake bit me on the leg"'
  }])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [sosState, setSosState] = useState(null)
  const [currentIntent, setCurrentIntent] = useState('Unknown')
  const [videoModal, setVideoModal] = useState(null)
  const chatEndRef = useRef(null)

  useEffect(() => { if (externalOpen) setOpen(true) }, [externalOpen])
  useEffect(() => {
    if (initialMessage && kb) {
      setOpen(true)
      handleSend(initialMessage)
      onClearInitial()
    }
  }, [initialMessage, kb])
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, isTyping])

  const addMessage = useCallback((msg) => setMessages(prev => [...prev, msg]), [])

  const handleSend = async (overrideText) => {
    const text = (typeof overrideText === 'string' ? overrideText : input).trim()
    if (!text) return
    setInput('')
    addMessage({ sender: 'user', type: 'text', text })
    setIsTyping(true)
    setSosState(null)
    await new Promise(r => setTimeout(r, 600))
    setIsTyping(false)

    const lower = text.toLowerCase()

    // Greeting
    if (['hi', 'hello', 'hey', 'help', 'hai'].some(g => lower === g || lower.startsWith(g + ' '))) {
      addMessage({ sender: 'bot', type: 'text', text: "Hello! I'm here to help. Please describe the emergency clearly — for example: \"burn\", \"heart attack\", \"dog bite\" or \"someone is choking\"." })
      return
    }

    // Search knowledge base fetched from API
    const match = findInKB(kb, text)
    if (match) {
      setCurrentIntent(match.title)
      addMessage({ sender: 'bot', type: 'firstaid', title: match.title, steps: match.steps, videos: match.videos })
      if (match.videos) {
        setTimeout(() => addMessage({ sender: 'bot', type: 'video_prompt', videos: match.videos }), 400)
      }
      setTimeout(() => addMessage({ sender: 'bot', type: 'sos_prompt', text: 'Would you like me to dispatch an ambulance to your location?' }), match.videos ? 800 : 400)
      return
    }

    // Fallback
    addMessage({
      sender: 'bot', type: 'firstaid', title: 'General First Aid Protocol', steps: [
        'Ensure the area is safe — protect yourself and the patient.',
        'Keep the person calm and still. Reassure them.',
        'Check their breathing and pulse. Begin CPR if not breathing.',
        'Do not give food or water unless fully conscious.',
        'Call emergency services (112) and describe the situation.'
      ]
    })
    setTimeout(() => addMessage({ sender: 'bot', type: 'sos_prompt', text: 'Would you like me to dispatch an ambulance?' }), 400)
  }

  const handleSOS = async () => {
    if (!location) {
      addMessage({ sender: 'bot', type: 'text', text: '⚠️ Location access was denied. Please call 112 directly.' })
      return
    }
    setSosState('transmitting')
    try {
      const res = await fetch(`${API}/sos`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: currentIntent, lat: location.lat, lng: location.lng }) })
      const data = await res.json()
      if (data.success) {
        setSosState('confirmed')
        addMessage({ sender: 'bot', type: 'text', text: '✅ SOS confirmed! Your location has been sent to the hospital dispatch center.' })
        const interval = setInterval(async () => {
          try {
            const r = await fetch(`${API}/sos-status/${data.emergency_id}`)
            const d = await r.json()
            if (d.status === 'dispatched') {
              setSosState('dispatched')
              addMessage({ sender: 'bot', type: 'text', text: '🚑 Ambulance dispatched! Help is on the way. Stay calm.' })
              clearInterval(interval)
            }
          } catch { clearInterval(interval) }
        }, 3000)
      }
    } catch {
      setSosState(null)
      addMessage({ sender: 'bot', type: 'text', text: '⚠️ Could not reach dispatch server. Please call 112 directly.' })
    }
  }

  return (
    <>
      <button className={`chat-fab ${open ? 'active' : ''}`} onClick={() => setOpen(!open)}>
        {open ? '✕' : '⚕️'}
      </button>

      <div className={`chat-panel ${open ? 'open' : ''}`}>
        <div className="chat-head">
          <div className="chat-head-info">
            <div className="chat-avatar">⚕️</div>
            <div>
              <h4>Medical Assistant</h4>
              <p><span className="online-dot"></span> Online — Ready to help</p>
            </div>
          </div>
          <button className="chat-close-btn" onClick={() => setOpen(false)}>✕</button>
        </div>

        <div className="chat-messages">
          {messages.map((msg, i) => (
            <MessageBubble key={i} msg={msg} sosState={sosState} onSOS={handleSOS} onVideoOpen={setVideoModal} />
          ))}
          {isTyping && (
            <div className="msg-row">
              <div className="msg-icon">⚕️</div>
              <div className="typing"><span></span><span></span><span></span></div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="chat-footer">
          <input type="text" placeholder="Describe the emergency..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} />
          <button className="chat-send" onClick={handleSend}>➤</button>
        </div>
      </div>

      {videoModal && <VideoModal videos={videoModal} onClose={() => setVideoModal(null)} />}
    </>
  )
}

function MessageBubble({ msg, sosState, onSOS, onVideoOpen }) {
  if (msg.sender === 'user') {
    return <div className="msg-row user"><div className="bubble user">{msg.text}</div></div>
  }

  if (msg.type === 'firstaid') {
    return (
      <div className="msg-row">
        <div className="msg-icon">⚕️</div>
        <div className="bubble bot">
          <strong>{msg.title}</strong>
          <ul className="steps-list">
            {msg.steps.map((step, i) => (
              <li key={i}><span className="step-num">{i + 1}</span><span>{step}</span></li>
            ))}
          </ul>
        </div>
      </div>
    )
  }

  if (msg.type === 'video_prompt') {
    return (
      <div className="msg-row">
        <div className="msg-icon">▶️</div>
        <div className="bubble bot">
          <strong style={{ display: 'block', marginBottom: '8px' }}>Watch First Aid Video</strong>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {Object.keys(msg.videos).map(lang => (
              <button
                key={lang}
                onClick={() => onVideoOpen(msg.videos)}
                style={{ background: '#1E293B', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '20px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
              >▶ {lang}</button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (msg.type === 'sos_prompt') {
    return (
      <div className="msg-row">
        <div className="msg-icon">⚕️</div>
        <div className="bubble bot">
          <span>{msg.text}</span>
          {sosState === null && <button className="sos-btn" onClick={onSOS}>🚨 Dispatch Ambulance Now</button>}
          {sosState === 'transmitting' && <button className="sos-btn" disabled>⏳ Transmitting location...</button>}
          {sosState === 'confirmed' && <div className="sos-status confirmed">✅ SOS Sent to Hospital Dispatch</div>}
          {sosState === 'dispatched' && <div className="sos-status dispatched">🚑 Ambulance Dispatched!</div>}
        </div>
      </div>
    )
  }

  return (
    <div className="msg-row">
      <div className="msg-icon">⚕️</div>
      <div className="bubble bot" style={{ whiteSpace: 'pre-line' }}>{msg.text}</div>
    </div>
  )
}

// ===========================
// ROOT APP
// ===========================
export default function App() {
  const [phase, setPhase] = useState('gps') // 'gps' | 'app'
  const [location, setLocation] = useState(null)
  const [chatTrigger, setChatTrigger] = useState(null)
  const [chatOpen, setChatOpen] = useState(false)
  const [kb, setKb] = useState({})

  // Fetch knowledge base from Flask API
  useEffect(() => {
    fetch(`${API}/knowledge`)
      .then(r => r.json())
      .then(setKb)
      .catch(() => {})
  }, [])

  // Inject Google Maps script
  useEffect(() => {
    if (!window.google && !document.getElementById('gmap-script')) {
      const s = document.createElement('script')
      s.id = 'gmap-script'
      s.src = 'https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false'
      s.async = true
      document.head.appendChild(s)
    }
  }, [])

  const handleGranted = (loc) => {
    setLocation(loc)
    setPhase('app')
    setTimeout(() => setChatOpen(true), 500)
  }

  const handleSkip = () => {
    setPhase('app')
    setTimeout(() => setChatOpen(true), 300)
  }

  if (phase === 'gps') {
    return <GPSScreen onGranted={handleGranted} onSkip={handleSkip} />
  }

  return (
    <>
      <Navbar onChatOpen={() => setChatOpen(true)} />
      <Hero onChatOpen={() => setChatOpen(true)} />
      <EmergencyGrid onShortcut={kw => { setChatTrigger(kw); setChatOpen(true) }} />
      <MapSection location={location} />
      <ServicesTable />
      <Footer />
      <Chatbot
        location={location}
        initialMessage={chatTrigger}
        onClearInitial={() => setChatTrigger(null)}
        externalOpen={chatOpen}
        kb={kb}
      />
    </>
  )
}
