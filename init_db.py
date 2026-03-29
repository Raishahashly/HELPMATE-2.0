import sqlite3

def init_db():
    conn = sqlite3.connect('helpmate.db')
    cursor = conn.cursor()

    # Drop existing tables to refresh schema
    cursor.execute('DROP TABLE IF EXISTS doctors')
    cursor.execute('DROP TABLE IF EXISTS emergency_services')
    cursor.execute('DROP TABLE IF EXISTS hospitals')
    cursor.execute('DROP TABLE IF EXISTS emergencies')

    # Create the 'emergency_services' table (replacing doctors)
    cursor.execute('''
        CREATE TABLE emergency_services (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            type TEXT NOT NULL,
            contact_no TEXT NOT NULL
        )
    ''')

    # Create the 'hospitals' table with coordinates for the dashboard map
    cursor.execute('''
        CREATE TABLE hospitals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            lat REAL NOT NULL,
            lng REAL NOT NULL,
            contact_no TEXT NOT NULL
        )
    ''')

    # Create the 'emergencies' table for the SOS dispatch system
    cursor.execute('''
        CREATE TABLE emergencies (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT NOT NULL,
            lat REAL NOT NULL,
            lng REAL NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            status TEXT DEFAULT 'pending', 
            hospital_assigned INTEGER,
            FOREIGN KEY(hospital_assigned) REFERENCES hospitals(id)
        )
    ''')

    # Seed Emergency Services
    initial_services = [
        ('Fire Control Room', 'Fire Safety', '101'),
        ('Ambulance Dispatch', 'Medical', '102'),
        ('Police Station', 'Security/Police', '100'),
        ('National Emergency No', 'General', '112')
    ]
    cursor.executemany('INSERT INTO emergency_services (name, type, contact_no) VALUES (?, ?, ?)', initial_services)

    # Seed one generic map hospital
    initial_hospitals = [
        ('City General Hospital', 40.7128, -74.0060, '911')
    ]
    cursor.executemany('INSERT INTO hospitals (name, lat, lng, contact_no) VALUES (?, ?, ?, ?)', initial_hospitals)

    conn.commit()
    conn.close()
    print("Database V3 initialized! Added emergency_services.")

if __name__ == '__main__':
    init_db()
