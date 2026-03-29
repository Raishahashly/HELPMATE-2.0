from flask import Flask, render_template, jsonify, request
from flask_cors import CORS
import sqlite3
import json
import os

app = Flask(__name__)
# Enable CORS for all domains, specifically the one React runs on (:5173)
CORS(app)

# ─── AUTO-INITIALIZE DATABASE ON STARTUP ─────────────────────────────────────
# This ensures the DB is always created when deployed on Railway/Render
def init_db():
    conn = sqlite3.connect('helpmate.db')
    cursor = conn.cursor()
    cursor.execute('''CREATE TABLE IF NOT EXISTS emergency_services (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL, type TEXT NOT NULL, contact_no TEXT NOT NULL)''')
    cursor.execute('''CREATE TABLE IF NOT EXISTS hospitals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL, lat REAL NOT NULL, lng REAL NOT NULL, contact_no TEXT NOT NULL)''')
    cursor.execute('''CREATE TABLE IF NOT EXISTS emergencies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL, lat REAL NOT NULL, lng REAL NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'pending',
        hospital_assigned INTEGER)''')
    # Seed only if empty
    if cursor.execute('SELECT COUNT(*) FROM emergency_services').fetchone()[0] == 0:
        cursor.executemany('INSERT INTO emergency_services (name, type, contact_no) VALUES (?, ?, ?)', [
            ('Fire Control Room',   'Fire Safety',    '101'),
            ('Ambulance Dispatch',  'Medical',        '102'),
            ('Police Station',      'Security/Police','100'),
            ('National Emergency',  'General',        '112'),
        ])
    if cursor.execute('SELECT COUNT(*) FROM hospitals').fetchone()[0] == 0:
        cursor.executemany('INSERT INTO hospitals (name, lat, lng, contact_no) VALUES (?, ?, ?, ?)', [
            ('City General Hospital', 40.7128, -74.0060, '911'),
        ])
    conn.commit()
    conn.close()

init_db()  # Run on every startup
# ─────────────────────────────────────────────────────────────────────────────

# Load the 50+ Scenario Knowledge Base
KB_PATH = os.path.join(os.path.dirname(__file__), 'knowledge_base.json')
if os.path.exists(KB_PATH):
    with open(KB_PATH, 'r') as f:
        knowledge_base = json.load(f)
else:
    knowledge_base = {}

def get_db_connection():
    conn = sqlite3.connect('helpmate.db')
    conn.row_factory = sqlite3.Row
    return conn

# -----------------
# FRONTEND ROUTES
# -----------------
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')

# -----------------
# REST API ENDPOINTS
# -----------------
@app.route('/api/services', methods=['GET'])
def get_services():
    conn = get_db_connection()
    services = conn.execute('SELECT * FROM emergency_services').fetchall()
    conn.close()
    return jsonify([dict(s) for s in services])

@app.route('/api/knowledge', methods=['GET'])
def get_knowledge():
    """Serve the entire knowledge base JSON to the React frontend."""
    return jsonify(knowledge_base)

@app.route('/api/hospitals', methods=['GET'])
def get_hospitals():
    conn = get_db_connection()
    hospitals = conn.execute('SELECT * FROM hospitals').fetchall()
    conn.close()
    return jsonify([dict(h) for h in hospitals])

# -----------------
# NLP CHATBOT LOGIC
# -----------------
@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    user_msg = str(data.get('message', '')).lower()
    
    # NLP Search via Keyword matching against Knowledge Base
    best_match = None
    for keyword, info in knowledge_base.items():
        if keyword in user_msg:
            best_match = info
            break
            
    if best_match:
        reply_html = f"<strong>{best_match['name']} Protocol Initiated.</strong><br><br>"
        # Add ChatGPT style step by step instructions
        instructions = best_match['first_aid'].replace('\n', '<br>')
        reply_html += f"<em>Immediate Actions:</em><br>{instructions}<br><br>"
        
        # Multilingual Video Support
        if 'videos' in best_match and best_match['videos']:
            vid_links = best_match['videos']
            reply_html += "<strong>Watch Demonstration (Select Language):</strong><br>"
            reply_html += "<div style='display:flex; gap:5px; margin-top:5px;'>"
            for lang, url in vid_links.items():
                reply_html += f"<button class='lang-btn' onclick='playVideo(\"{url}\")'>{lang}</button>"
            reply_html += "</div>"
        
        reply_html += "<br>Would you like to dispatch an ambulance now?"
        
        return jsonify({
            'reply': reply_html,
            'intent': best_match['name'],
            'sos_enabled': True
        })

    # Default fallback
    if 'hi' in user_msg or 'hello' in user_msg or 'help' in user_msg:
        return jsonify({
            'reply': "Hello! I am your Intelligent HelpMate Agent. Please describe the emergency (e.g., 'bee sting', 'burns', or 'choking').",
            'sos_enabled': False
        })
    else:
        return jsonify({
            'reply': "Please perform this general First Aid immediately:\n1. Ensure the area is safe.\n2. Keep the person calm and still.\n3. Monitor their breathing and pulse.\n\nWould you like me to dispatch an ambulance?",
            'sos_enabled': True,
            'intent': 'Unknown Critical'
        })

# -----------------
# SOS DISPATCH SYSTEM
# -----------------
@app.route('/api/sos', methods=['POST'])
def receive_sos():
    data = request.json
    e_type = data.get('type', 'Unknown')
    lat = data.get('lat')
    lng = data.get('lng')

    if lat is None or lng is None:
        return jsonify({'error': 'Missing location data'}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO emergencies (type, lat, lng, status)
        VALUES (?, ?, ?, 'pending')
    ''', (e_type, lat, lng))
    emergency_id = cursor.lastrowid
    conn.commit()
    conn.close()

    return jsonify({'success': True, 'emergency_id': emergency_id, 'message': 'SOS sent!'})

@app.route('/api/emergencies', methods=['GET'])
def get_emergencies():
    conn = get_db_connection()
    emergencies = conn.execute('SELECT * FROM emergencies WHERE status = "pending"').fetchall()
    conn.close()
    return jsonify([dict(e) for e in emergencies])

@app.route('/api/dispatch/<int:emergency_id>', methods=['POST'])
def dispatch_emergency(emergency_id):
    conn = get_db_connection()
    conn.execute('UPDATE emergencies SET status = "dispatched" WHERE id = ?', (emergency_id,))
    conn.commit()
    conn.close()
    return jsonify({'success': True})

@app.route('/api/sos-status/<int:emergency_id>', methods=['GET'])
def check_sos_status(emergency_id):
    conn = get_db_connection()
    e = conn.execute('SELECT status FROM emergencies WHERE id = ?', (emergency_id,)).fetchone()
    conn.close()
    if e: return jsonify(dict(e))
    return jsonify({'error': 'Not found'}), 404

if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, host='0.0.0.0', port=port)
