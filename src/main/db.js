const sqlite3 = require('sqlite3')
sqlite3.verbose()
const db = new sqlite3.Database('history.db')

// Create table if not exists
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS conversions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL,
      format TEXT NOT NULL,
      resolution TEXT,
      size INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`)
  })
  
export  const saveConversion = (filename, format, resolution = null, size = null) => {
    return new Promise((resolve, reject) => {
      const stmt = db.prepare(`
        INSERT INTO conversions (filename, format, resolution, size)
        VALUES (?, ?, ?, ?)
      `)
      
      stmt.run([filename, format, resolution, size], function(err) {
        if (err) {
          reject(err)
          return
        }
        resolve(this.lastID)
      })
      stmt.finalize()
    })
  }
  
export  const getAllConversions = () => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM conversions ORDER BY created_at DESC', (err, rows) => {
        if (err) {
          reject(err)
          return
        }
        resolve(rows)
      })
    })
  }
