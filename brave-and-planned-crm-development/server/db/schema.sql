PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

CREATE TABLE IF NOT EXISTS users (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  username   TEXT NOT NULL UNIQUE,
  full_name  TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role       TEXT NOT NULL CHECK(role IN ('owner', 'manager')),
  is_active  INTEGER NOT NULL DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS teachers (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name  TEXT NOT NULL,
  phone      TEXT,
  username   TEXT UNIQUE,
  password_hash TEXT,
  is_active  INTEGER NOT NULL DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS groups (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  name         TEXT NOT NULL,
  teacher_id   INTEGER REFERENCES teachers(id) ON DELETE SET NULL,
  schedule_days TEXT,
  start_time   TEXT,
  end_time     TEXT,
  monthly_fee  INTEGER DEFAULT 0,
  is_active    INTEGER DEFAULT 1,
  created_at   TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS students (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name    TEXT NOT NULL,
  phone        TEXT,
  parent_phone TEXT,
  parent_name  TEXT,
  status       TEXT DEFAULT 'active' CHECK(status IN ('active','inactive','frozen')),
  notes        TEXT,
  created_at   TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS group_students (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  group_id   INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  joined_at  TEXT DEFAULT (datetime('now')),
  left_at    TEXT,
  is_active  INTEGER DEFAULT 1,
  UNIQUE(group_id, student_id)
);

CREATE TABLE IF NOT EXISTS attendance (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  group_id   INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  date       TEXT NOT NULL,
  status     TEXT NOT NULL CHECK(status IN ('present','absent','late','excused')),
  note       TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(group_id, student_id, date)
);

CREATE TABLE IF NOT EXISTS payments (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  group_id   INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  month      TEXT NOT NULL,
  amount     INTEGER NOT NULL DEFAULT 0,
  paid       INTEGER NOT NULL DEFAULT 0,
  paid_at    TEXT,
  note       TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(student_id, group_id, month)
);

CREATE TABLE IF NOT EXISTS transfers (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id    INTEGER NOT NULL REFERENCES students(id),
  from_group_id INTEGER NOT NULL REFERENCES groups(id),
  to_group_id   INTEGER NOT NULL REFERENCES groups(id),
  transfer_date TEXT DEFAULT (date('now')),
  note          TEXT,
  done_by       INTEGER REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS sms_logs (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER REFERENCES students(id),
  phone      TEXT NOT NULL,
  message    TEXT NOT NULL,
  month      TEXT,
  status     TEXT DEFAULT 'pending',
  sent_at    TEXT DEFAULT (datetime('now'))
);
