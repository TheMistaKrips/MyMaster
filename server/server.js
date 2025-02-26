const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const db = new sqlite3.Database('./tickets.db');

app.use(cors());
app.use(bodyParser.json());

// Инициализация базы данных, если она не существует
db.serialize(() => {
    db.run(`
    CREATE TABLE IF NOT EXISTS tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      phone TEXT,
      address TEXT,
      task TEXT,
      time TEXT,
      completed BOOLEAN
    )
  `);
});

// Получение всех заявок
app.get('/tickets', (req, res) => {
    db.all('SELECT * FROM tickets', (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Добавление новой заявки
app.post('/tickets', (req, res) => {
    const { name, phone, address, task, time, completed } = req.body;
    const stmt = db.prepare(
        'INSERT INTO tickets (name, phone, address, task, time, completed) VALUES (?, ?, ?, ?, ?, ?)'
    );
    stmt.run(name, phone, address, task, time, completed, function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ id: this.lastID });
    });
});

// Обновление заявки
app.put('/tickets/:id', (req, res) => {
    const { id } = req.params;
    const { name, phone, address, task, time, completed } = req.body;
    const stmt = db.prepare(
        'UPDATE tickets SET name = ?, phone = ?, address = ?, task = ?, time = ?, completed = ? WHERE id = ?'
    );
    stmt.run(name, phone, address, task, time, completed, id, function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ updated: this.changes });
    });
});

// Удаление заявки
app.delete('/tickets/:id', (req, res) => {
    const { id } = req.params;
    const stmt = db.prepare('DELETE FROM tickets WHERE id = ?');
    stmt.run(id, function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ deleted: this.changes });
    });
});

// Запуск сервера
app.listen(5000, () => {
    console.log('Server is running on port 5000');
});
