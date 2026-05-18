PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY,
  username TEXT UNIQUE,
  password_hash TEXT,
  role TEXT CHECK(role IN ('owner','manager'))
);

CREATE TABLE IF NOT EXISTS teachers (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT
);

CREATE TABLE IF NOT EXISTS groups (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  teacher_id INTEGER REFERENCES teachers(id),
  course TEXT,
  schedule_time TEXT,
  schedule_days TEXT,
  monthly_fee INTEGER,
  created_at TEXT DEFAULT (date('now'))
);

CREATE TABLE IF NOT EXISTS students (
  id INTEGER PRIMARY KEY,
  full_name TEXT NOT NULL,
  ota_phone TEXT,
  ona_phone TEXT,
  telefon TEXT,
  group_id INTEGER REFERENCES groups(id),
  status TEXT DEFAULT 'active',
  joined_at TEXT DEFAULT (date('now'))
);

CREATE TABLE IF NOT EXISTS attendance (
  id INTEGER PRIMARY KEY,
  student_id INTEGER REFERENCES students(id),
  group_id INTEGER REFERENCES groups(id),
  date TEXT,
  status TEXT CHECK(status IN ('present','absent'))
);

CREATE TABLE IF NOT EXISTS payments (
  id INTEGER PRIMARY KEY,
  student_id INTEGER REFERENCES students(id),
  group_id INTEGER REFERENCES groups(id),
  month TEXT,
  amount INTEGER,
  paid INTEGER DEFAULT 0,
  paid_at TEXT
);

CREATE TABLE IF NOT EXISTS sms_logs (
  id INTEGER PRIMARY KEY,
  student_id INTEGER REFERENCES students(id),
  phone TEXT,
  message TEXT,
  sent_at TEXT DEFAULT (datetime('now')),
  status TEXT
);

CREATE TABLE IF NOT EXISTS student_transfers (
  id INTEGER PRIMARY KEY,
  student_id INTEGER REFERENCES students(id),
  from_group_id INTEGER,
  to_group_id INTEGER,
  reason TEXT,
  transferred_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);
