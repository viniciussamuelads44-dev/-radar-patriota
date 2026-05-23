const { DatabaseSync } = require('node:sqlite')
const path = require('path')
const fs = require('fs')

const DB_PATH = process.env.NODE_ENV === 'production'
  ? '/var/data/radar.db'
  : path.join(__dirname, '../../data/radar.db')

const dir = path.dirname(DB_PATH)
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

const db = new DatabaseSync(DB_PATH)

db.exec(`
  CREATE TABLE IF NOT EXISTS subscribers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    email TEXT,
    status TEXT DEFAULT 'pending',
    mp_subscription_id TEXT,
    mp_payer_email TEXT,
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    activated_at TEXT,
    cancelled_at TEXT
  );

  CREATE TABLE IF NOT EXISTS editions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT UNIQUE NOT NULL,
    content TEXT NOT NULL,
    sent_count INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    sent_at TEXT
  );

  CREATE TABLE IF NOT EXISTS send_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subscriber_id INTEGER,
    edition_id INTEGER,
    phone TEXT,
    status TEXT DEFAULT 'sent',
    error TEXT,
    sent_at TEXT DEFAULT (datetime('now', 'localtime'))
  );
`)

const prisma = {
  subscriber: {
    findMany: (opts = {}) => {
      let query = 'SELECT * FROM subscribers'
      const params = []
      if (opts.where) {
        const conditions = Object.entries(opts.where).map(([k, v]) => { params.push(v); return `${k} = ?` })
        query += ' WHERE ' + conditions.join(' AND ')
      }
      if (opts.orderBy) {
        const [col, dir] = Object.entries(opts.orderBy)[0]
        query += ` ORDER BY ${col} ${dir === 'desc' ? 'DESC' : 'ASC'}`
      }
      return db.prepare(query).all(...params)
    },
    findOne: (where) => {
      const conditions = Object.entries(where).map(([k]) => `${k} = ?`).join(' AND ')
      return db.prepare(`SELECT * FROM subscribers WHERE ${conditions} LIMIT 1`).get(...Object.values(where))
    },
    create: (data) => {
      const cols = Object.keys(data).join(', ')
      const placeholders = Object.keys(data).map(() => '?').join(', ')
      const result = db.prepare(`INSERT INTO subscribers (${cols}) VALUES (${placeholders})`).run(...Object.values(data))
      return db.prepare('SELECT * FROM subscribers WHERE id = ?').get(result.lastInsertRowid)
    },
    update: (where, data) => {
      const setClauses = Object.keys(data).map(k => `${k} = ?`).join(', ')
      const whereClause = Object.keys(where).map(k => `${k} = ?`).join(' AND ')
      db.prepare(`UPDATE subscribers SET ${setClauses} WHERE ${whereClause}`).run(...Object.values(data), ...Object.values(where))
    },
    count: (opts = {}) => {
      let query = 'SELECT COUNT(*) as count FROM subscribers'
      const params = []
      if (opts.where) {
        const conditions = Object.entries(opts.where).map(([k, v]) => { params.push(v); return `${k} = ?` })
        query += ' WHERE ' + conditions.join(' AND ')
      }
      return db.prepare(query).get(...params).count
    }
  },
  edition: {
    findOne: (where) => {
      const conditions = Object.entries(where).map(([k]) => `${k} = ?`).join(' AND ')
      return db.prepare(`SELECT * FROM editions WHERE ${conditions} LIMIT 1`).get(...Object.values(where))
    },
    findMany: () => db.prepare('SELECT * FROM editions ORDER BY date DESC').all(),
    create: (data) => {
      const cols = Object.keys(data).join(', ')
      const placeholders = Object.keys(data).map(() => '?').join(', ')
      const result = db.prepare(`INSERT INTO editions (${cols}) VALUES (${placeholders})`).run(...Object.values(data))
      return db.prepare('SELECT * FROM editions WHERE id = ?').get(result.lastInsertRowid)
    },
    update: (where, data) => {
      const setClauses = Object.keys(data).map(k => `${k} = ?`).join(', ')
      const whereClause = Object.keys(where).map(k => `${k} = ?`).join(' AND ')
      db.prepare(`UPDATE editions SET ${setClauses} WHERE ${whereClause}`).run(...Object.values(data), ...Object.values(where))
    }
  },
  sendLog: {
    create: (data) => {
      const cols = Object.keys(data).join(', ')
      const placeholders = Object.keys(data).map(() => '?').join(', ')
      db.prepare(`INSERT INTO send_log (${cols}) VALUES (${placeholders})`).run(...Object.values(data))
    }
  }
}

module.exports = { db, prisma }
