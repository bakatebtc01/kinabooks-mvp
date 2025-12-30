const API_URL = 'http://localhost:8080/api';
let token = localStorage.getItem('kb_token');

// Init
if (token) {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('dashboard-screen').classList.remove('hidden');
    loadStats();
}

// Navigation
function showSection(id) {
    // Hide all main subsections
    ['dashboard-content', 'invoices-screen', 'new-invoice-form', 'cashbook-screen', 'new-cash-form', 'reports-screen'].forEach(sid => {
        document.getElementById(sid).classList.add('hidden');
    });
    // Show target
    document.getElementById(id).classList.remove('hidden');

    if (id === 'invoices-screen') loadInvoices();
    if (id === 'cashbook-screen') loadCashBook();
    if (id === 'reports-screen') loadReports();
    if (id === 'dashboard-content') loadStats();
}

// Login
async function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (data.token) {
        token = data.token;
        localStorage.setItem('kb_token', token);
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('dashboard-screen').classList.remove('hidden');
        loadStats();
    } else {
        alert(data.error);
    }
}

function logout() {
    localStorage.removeItem('kb_token');
    location.reload();
}

// Stats
async function loadStats() {
    const res = await fetch(`${API_URL}/stats`);
    const data = await res.json();
    document.getElementById('total-income').innerText = `K${data.income.toFixed(2)}`;
    document.getElementById('total-expenses').innerText = `K${data.expense.toFixed(2)}`;
    document.getElementById('net-profit').innerText = `K${data.profit.toFixed(2)}`;
}

// Invoices
async function loadInvoices() {
    const res = await fetch(`${API_URL}/invoices`);
    const invoices = await res.json();
    const tbody = document.querySelector('#invoice-table tbody');
    tbody.innerHTML = '';
    invoices.forEach(inv => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${inv.id}</td><td>${inv.client}</td><td>${inv.date}</td><td>K${inv.amount.toFixed(2)}</td><td>${inv.status}</td>`;
        tbody.appendChild(tr);
    });
}

async function saveInvoice() {
    const client = document.getElementById('inv-client').value;
    const date = document.getElementById('inv-date').value;
    const amount = document.getElementById('inv-amount').value;

    const res = await fetch(`${API_URL}/invoices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client, date, amount })
    });

    const data = await res.json();
    if (data.status === 'success') {
        alert('Invoice Saved!');
        showSection('invoices-screen');
    } else {
        alert('Error saving invoice');
    }
}

// Cash Book
async function loadCashBook() {
    const res = await fetch(`${API_URL}/cashbook`);
    const txns = await res.json();
    const tbody = document.querySelector('#cashbook-table tbody');
    tbody.innerHTML = '';
    txns.forEach(t => {
        const tr = document.createElement('tr');
        const color = t.type === 'IN' ? 'green' : 'red';
        tr.innerHTML = `<td>${t.date}</td><td style="color:${color};font-weight:bold">${t.type}</td><td>${t.description}</td><td>K${t.amount.toFixed(2)}</td>`;
        tbody.appendChild(tr);
    });
}

async function saveCashTransaction() {
    const type = document.getElementById('cash-type').value;
    const date = document.getElementById('cash-date').value;
    const description = document.getElementById('cash-desc').value;
    const amount = document.getElementById('cash-amount').value;

    const res = await fetch(`${API_URL}/cashbook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, date, description, amount })
    });

    const data = await res.json();
    if (data.status === 'success') {
        alert('Transaction Saved!');
        showSection('cashbook-screen');
    } else {
        alert('Error saving transaction');
    }
}

// Reports
async function loadReports() {
    const res = await fetch(`${API_URL}/reports/pnl`);
    const data = await res.json();
    
    document.getElementById('rpt-income').innerText = `K${data.income.toFixed(2)}`;
    document.getElementById('rpt-expense').innerText = `K${data.totalExpense.toFixed(2)}`;
    const profit = data.profit;
    const pEl = document.getElementById('rpt-profit');
    pEl.innerText = `K${profit.toFixed(2)}`;
    pEl.style.color = profit >= 0 ? 'green' : 'red';

    const tbody = document.querySelector('#reports-table tbody');
    tbody.innerHTML = '';
    data.expenses.forEach(e => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${e.category}</td><td>K${e.amount.toFixed(2)}</td>`;
        tbody.appendChild(tr);
    });
}
