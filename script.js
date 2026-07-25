// --- 1. SHARED STATE & DARK MODE LOGIC ---
const themeButtons = document.querySelectorAll('.theme-toggle-btn');
function applyTheme() {
  if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
    themeButtons.forEach(btn => btn.textContent = btn.classList.contains('theme-toggle-absolute') ? '☀️' : '☀️ Light Mode');
  } else {
    document.body.classList.remove('dark-mode');
    themeButtons.forEach(btn => btn.textContent = btn.classList.contains('theme-toggle-absolute') ? '🌙' : '🌙 Dark Mode');
  }
}
themeButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const newTheme = document.body.classList.contains('dark-mode') ? 'light' : 'dark';
    localStorage.setItem('theme', newTheme);
    applyTheme();
  });
});
applyTheme(); // Run on load
// --- 2. LOGIN LOGIC ---
const loginView = document.getElementById('login-view');
const dashboardView = document.getElementById('dashboard-view');
const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const submitBtn = document.getElementById('submit-btn');
const messageContainer = document.getElementById('message-container');
function showMessage(type, text) {
  messageContainer.textContent = text;
  messageContainer.className = `message-box ${type}`;
}
loginForm.addEventListener('submit', function(event) {
  event.preventDefault();
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  submitBtn.disabled = true;
  submitBtn.textContent = 'Authenticating...';
  showMessage('', '');
  setTimeout(() => {
    if (email === 'admin@company.com' && password === 'password123') {
      showMessage('success', 'Authentication successful! Redirecting...');
      setTimeout(() => {
        // TRANSITION TO DASHBOARD
        loginView.style.display = 'none';
        dashboardView.style.display = 'block';
        renderTable(clients); // Initialize Dashboard data
      }, 800);
    } else {
      showMessage('error', 'Invalid email or password. Try admin@company.com / password123');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Sign In';
    }
  }, 1000);
});
// --- 3. DASHBOARD CRUD LOGIC ---
let clients = [
  { id: 1, company: "Acme Corp", contact: "Alice Smith", status: "Active", value: 15000 },
  { id: 2, company: "TechFlow Solutions", contact: "Bob Jones", status: "Pending", value: 8500 },
  { id: 3, company: "GlobalNet", contact: "Carol White", status: "Closed", value: 0 },
  { id: 4, company: "DataSync Inc", contact: "David Brown", status: "Active", value: 22000 }
];
const tableBody = document.getElementById('table-body');
const searchInput = document.getElementById('search-input');
const statusFilter = document.getElementById('status-filter');
const kpiCount = document.getElementById('kpi-count');
const kpiRevenue = document.getElementById('kpi-revenue');
const addClientForm = document.getElementById('add-client-form');
const formatCurrency = (number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(number);
function renderTable(dataArray) {
  tableBody.innerHTML = "";
  dataArray.forEach(client => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><strong>${client.company}</strong></td>
      <td>${client.contact}</td>
      <td><span class="badge ${client.status.toLowerCase()}">${client.status}</span></td>
      <td>${formatCurrency(client.value)}</td>
      <td><button class="btn-danger" onclick="deleteClient(${client.id})">Delete</button></td>
    `;
    tableBody.appendChild(row);
  });
  updateKPIs(dataArray);
}
function updateKPIs(dataArray) {
  kpiCount.textContent = dataArray.length;
  const totalRevenue = dataArray.reduce((sum, client) => sum + client.value, 0);
  kpiRevenue.textContent = formatCurrency(totalRevenue);
}
function filterData() {
  const searchTerm = searchInput.value.toLowerCase();
  const statusTerm = statusFilter.value;
  const filteredClients = clients.filter(client => {
    const matchesSearch = client.company.toLowerCase().includes(searchTerm);
    const matchesStatus = statusTerm === "All" || client.status === statusTerm;
    return matchesSearch && matchesStatus;
  });
  renderTable(filteredClients);
}
function handleAddClient(event) {
  event.preventDefault(); 
  const newClient = {
    id: Date.now(),
    company: document.getElementById('new-company').value,
    contact: document.getElementById('new-contact').value,
    status: document.getElementById('new-status').value,
    value: parseFloat(document.getElementById('new-value').value)
  };
  clients.push(newClient);
  addClientForm.reset();
  filterData();
}
function deleteClient(idToDelete) {
  clients = clients.filter(client => client.id !== idToDelete);
  filterData();
}
// Dashboard Event Listeners
searchInput.addEventListener('input', filterData);
statusFilter.addEventListener('change', filterData);
addClientForm.addEventListener('submit', handleAddClient);