# 🚑 HELPMATE 2.0 — AI-Powered Emergency Response Platform

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-Vercel-black?style=for-the-badge)](https://helpmate-2-0.vercel.app)
[![API Backend](https://img.shields.io/badge/⚙️_API_Backend-PythonAnywhere-blue?style=for-the-badge)](https://raishahashly.pythonanywhere.com/api/services)
[![GitHub](https://img.shields.io/badge/📁_Source_Code-GitHub-181717?style=for-the-badge&logo=github)](https://github.com/Raishahashly/HELPMATE-2.0)

> A professional, full-stack emergency response web application built with **React + Vite** (frontend) and **Python Flask + SQLite** (backend), featuring an intelligent AI chatbot, real-time hospital mapping, and ambulance dispatch.

## 🔗 Live Links

| Service | URL |
|---|---|
| 🌐 **Frontend (Vercel)** | https://helpmate-2-0.vercel.app |
| ⚙️ **Backend API (PythonAnywhere)** | https://raishahashly.pythonanywhere.com/api |
| 📁 **GitHub Repository** | https://github.com/Raishahashly/HELPMATE-2.0 |

---

## 🌟 What's New in HELPMATE 2.0 (Changes from Previous Version)

| Feature | Before (V1) | After (V2 — This Version) |
|---|---|---|
| **Frontend** | Static HTML/CSS pages | React + Vite (component-based, dynamic) |
| **Chatbot** | Basic keyword matching, said "I don't know" | AI-powered NLP from `knowledge_base.json`, 50+ scenarios, step-by-step instructions |
| **Knowledge Base** | Hardcoded in HTML | Dynamic JSON (`knowledge_base.json`) served via Flask API, fetched by React |
| **First Aid Videos** | None | Language selector (English / Hindi / Malayalam) with YouTube embed modal |
| **UI Design** | Basic HTML with minimal styling | Premium dark navy + red theme, glassmorphism cards, responsive grid |
| **Header/Navbar** | None | Sticky top navbar with branding + navigation links |
| **Footer** | None | Full professional footer with hotlines, links, disclaimer |
| **Hospital Map** | Hardcoded doctor contacts | Google Maps integration with real-time GPS location + hospital markers |
| **GPS Flow** | Browser popup without context | Custom branded permission screen before app loads |
| **Ambulance Dispatch** | Fake/hardcoded messages | Real SOS dispatch via Flask API → SQLite → Hospital Dashboard |
| **Database** | None | SQLite (`helpmate.db`) — emergency services, hospitals, SOS emergencies tables |
| **Template Pages** | 6 unused HTML pages (page1–page6) | Deleted — all content now in React components |
| **Emergency Services** | Hardcoded phone numbers | Fetched dynamically from SQLite via REST API |
| **Deployment** | Not deployable | Vercel-ready frontend + documented backend hosting |

---

## 🏗️ Project Structure

```
HELPMATE/
├── app.py                  # Flask REST API backend
├── init_db.py              # SQLite database initializer
├── knowledge_base.json     # 50+ first aid scenarios (used by chatbot)
├── requirements.txt        # Python dependencies
├── helpmate.db             # SQLite database (auto-created)
├── static/
│   └── images/             # Emergency images (burn, heart, snake, etc.)
└── frontend/               # React + Vite application
    ├── index.html          # Entry point (HELPMATE 🚑 title)
    ├── vercel.json         # Vercel deployment config
    ├── vite.config.js      # Vite build config
    ├── .env.example        # Environment variable template
    ├── package.json
    └── src/
        ├── main.jsx        # React entry point
        ├── App.jsx         # Main app (all components)
        └── index.css       # Global design system
```

---

## ⚡ Quick Start

### Prerequisites
- Python 3.8+
- Node.js 18+
- npm 9+

---

### 1. Backend Setup (Flask + SQLite)

```bash
# Navigate to project root
cd HELPMATE

# Install Python dependencies
pip install flask flask-cors

# Initialize the SQLite database (creates helpmate.db)
python init_db.py

# Start the Flask API server
python app.py
# Server runs on http://localhost:5000
```

---

### 2. Frontend Setup (React + Vite)

```bash
# Navigate to frontend folder
cd frontend

# Install all dependencies
npm install

# Install additional packages (already done, listed for reference)
npm install axios react-icons

# Start the development server
npm run dev
# App runs on http://localhost:5173
```

Open your browser to **http://localhost:5173**

> ⚠️ **Both terminals must be running simultaneously** — Flask on port 5000, React on port 5173.

---

## 📦 Packages Installed

### Python (Backend)
| Package | Purpose |
|---|---|
| `flask` | Web server framework |
| `flask-cors` | Allows React (port 5173) to call Flask (port 5000) |
| `sqlite3` | Built-in Python DB (no install needed) |

```bash
pip install flask flask-cors
```

### Node.js (Frontend)
| Package | Purpose | How Installed |
|---|---|---|
| `react` | Core UI library | Included in Vite template |
| `react-dom` | React DOM renderer | Included in Vite template |
| `vite` | Build tool / dev server | `npx create-vite@latest frontend --template react` |
| `@vitejs/plugin-react` | JSX transform | Included in Vite template |
| `axios` | HTTP client for API calls | `npm install axios` |
| `react-icons` | Icon library | `npm install react-icons` |

---

## 🚀 Deployment to Vercel (Frontend)

The React frontend is **Vercel-ready** with `vercel.json` configured.

### Steps:

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "HELPMATE 2.0 - React + Flask full-stack"
   git push origin main
   ```

2. **Deploy Frontend on Vercel**
   - Go to [vercel.com](https://vercel.com) → New Project
   - Import your GitHub repository
   - Set **Root Directory** to `frontend`
   - Vercel auto-detects Vite — click Deploy

3. **Set Environment Variable on Vercel**
   - In Vercel project settings → Environment Variables
   - Add: `VITE_API_URL` = `https://your-backend-url.onrender.com/api`

4. **Deploy Backend on Render (Free)**
   - Go to [render.com](https://render.com) → New Web Service
   - Connect your GitHub repo
   - Set build command: `pip install flask flask-cors`
   - Set start command: `python app.py`

---

## 🤖 AI Chatbot — How It Works

The chatbot is powered by a **local NLP engine** (no external AI API required):

1. User types a symptom (e.g., "my friend got a burn")
2. The React frontend sends the message to `GET /api/knowledge` on mount (fetches the full `knowledge_base.json`)
3. Keywords from the JSON are matched against the user's message
4. The matched entry's `first_aid` steps are shown as numbered instructions
5. If videos exist for that scenario, **language buttons** (English / Hindi / Malayalam) appear
6. Clicking a language opens a fullscreen video player with the YouTube embed

### Supported Emergencies (50+)
Burns, Heart Attack, Stroke, Snake Bite, Choking, Electric Shock, Mud/Dust in Eyes, Foreign Object in Eye, Fainting, Fracture, Sprain, Head Injury, Nose Bleeding, Ear Bleeding, Dog Bite, Cat Bite, Headache/Migraine, Fatigue, Constipation, Dysentery, Bee Sting, Asthma Attack, Seizure, Drowning, Poisoning, Heat Stroke, Hypothermia, Severe Bleeding, Knocked Out Tooth, Allergic Reaction, Cardiac Arrest/CPR, and more.

---

## 🗺️ Google Maps Integration

- On GPS permission grant, user's live coordinates are recorded
- The map initializes with a **blue marker** at the user's location
- Hospital markers (red) are fetched from the SQLite database via `GET /api/hospitals`
- The map is embedded using the free Google Maps JavaScript API

---

## 🆘 SOS Dispatch System

1. User types an emergency → Chatbot provides first aid
2. "Dispatch Ambulance Now" button appears
3. User clicks it → coordinates + emergency type saved to SQLite via `POST /api/sos`
4. Hospital dashboard (`/dashboard`) shows pending emergencies on a map
5. Hospital staff click "Dispatch" → emergency status updates to `dispatched`
6. User's chatbot shows "🚑 Ambulance Dispatched!"

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/services` | List all emergency service hotlines |
| GET | `/api/hospitals` | List all hospitals with coordinates |
| GET | `/api/knowledge` | Get full first aid knowledge base |
| POST | `/api/chat` | Legacy chatbot endpoint |
| POST | `/api/sos` | Submit emergency SOS with GPS coordinates |
| GET | `/api/sos-status/:id` | Poll dispatch status of an SOS |
| GET | `/api/emergencies` | List all pending emergencies (dashboard) |
| POST | `/api/dispatch/:id` | Mark emergency as dispatched |

---

## 👥 Team

HELPMATE was built as a **Hackathon Project** focused on accessible emergency response technology.

---

## ⚠️ Disclaimer

This platform is a first-aid guidance and triage assistant. It is **not a replacement** for calling professional emergency services. **Always call 112 in a life-threatening emergency.**
