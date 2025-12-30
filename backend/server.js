const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 8080;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));

// Database Setup
const db = new sqlite3.Database(':memory:'); // For MVP, in-memory DB (or use './kinabooks.db')

db.serialize(() => {
    // Users
    db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, email TEXT, password TEXT, role TEXT)");
    db.run("INSERT INTO users (email, password, role) VALUES ('admin', 'admin', 'Admin')");

    // Invoices
    db.run("CREATE TABLE IF NOT EXISTS invoices (id INTEGER PRIMARY KEY, client TEXT, amount REAL, date TEXT, status TEXT)");

    // Expenses
    db.run("CREATE TABLE IF NOT EXISTS expenses (id INTEGER PRIMARY KEY, supplier TEXT, amount REAL, category TEXT, date TEXT)");

    // Cash Book
    db.run("CREATE TABLE IF NOT EXISTS cashbook (id INTEGER PRIMARY KEY, type TEXT, amount REAL, description TEXT, date TEXT)");
});

// --- API Routes ---

// Login
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    db.get("SELECT * FROM users WHERE email = ? AND password = ?", [email, password], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (row) {
            res.json({ token: "mvp-token-123", role: row.role });
        } else {
            res.status(401).json({ error: "Invalid credentials" });
        }
    });
});

// Get Invoices
app.get('/api/invoices', (req, res) => {
    db.all("SELECT * FROM invoices", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Create Invoice
app.post('/api/invoices', (req, res) => {
    const { client, amount, date } = req.body;
    db.run("INSERT INTO invoices (client, amount, date, status) VALUES (?, ?, ?, 'Unpaid')", [client, amount, date], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, status: "success" });
    });
});

// Get Expenses
app.get('/api/expenses', (req, res) => {
    db.all("SELECT * FROM expenses", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Create Expense
app.post('/api/expenses', (req, res) => {
    const { supplier, amount, category, date } = req.body;
    db.run("INSERT INTO expenses (supplier, amount, category, date) VALUES (?, ?, ?, ?)", [supplier, amount, category, date], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, status: "success" });
    });
});

// Get Cash Book
app.get('/api/cashbook', (req, res) => {
    db.all("SELECT * FROM cashbook ORDER BY date DESC", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Create Cash Transaction
app.post('/api/cashbook', (req, res) => {
    const { type, amount, description, date } = req.body;
    db.run("INSERT INTO cashbook (type, amount, description, date) VALUES (?, ?, ?, ?)", [type, amount, description, date], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, status: "success" });
    });
});

// Dashboard Stats
app.get('/api/stats', (req, res) => {
    // Simple MVP Stats
    db.get("SELECT SUM(amount) as totalInvoices FROM invoices", (err, invRow) => {
        db.get("SELECT SUM(amount) as totalExpenses FROM expenses", (err, expRow) => {
             const income = invRow.totalInvoices || 0;
             const expense = expRow.totalExpenses || 0;
             res.json({ income, expense, profit: income - expense });
        });
    });
});

// Reports: Profit & Loss
app.get('/api/reports/pnl', (req, res) => {
    // Aggregate by Category (Expenses) and just Total for Invoices
    const report = { income: 0, expenses: [], totalExpense: 0, profit: 0 };
    
    db.get("SELECT SUM(amount) as total FROM invoices", (err, row) => {
        report.income = row.total || 0;
        
        db.all("SELECT category, SUM(amount) as total FROM expenses GROUP BY category", (err, rows) => {
             rows.forEach(r => {
                 report.expenses.push({ category: r.category, amount: r.total });
                 report.totalExpense += r.total;
             });
             report.profit = report.income - report.totalExpense;
             res.json(report);
        });
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`KinaBooks MVP running at http://localhost:${PORT}`);
});
