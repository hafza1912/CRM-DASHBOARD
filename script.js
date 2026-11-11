// ==========================================
// 1. FIREBASE SETUP
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
// Notice we imported 'initializeFirestore' here
import { initializeFirestore, collection, onSnapshot, addDoc, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyD2JWvj1tDWB-mWUgXSHC4TY3KcTZ3LSzM",
  authDomain: "crm-dashboard-775e6.firebaseapp.com",
  projectId: "crm-dashboard-775e6",
  storageBucket: "crm-dashboard-775e6.firebasestorage.app",
  messagingSenderId: "168710500229",
  appId: "1:168710500229:web:bc07f6d3e63e08e6475eec"
};

const app = initializeApp(firebaseConfig);

// This forces Firebase to bypass restrictive Wi-Fi firewalls or Antivirus blocks
const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  useFetchStreams: false
});

let clients = [];

// ==========================================
// 2. DOM ELEMENTS
// ==========================================
const loginForm = document.getElementById('login-form');
const loginView = document.getElementById('login-view');
const errorMsg = document.getElementById('error-msg');
const appView = document.getElementById('app-view');
const tableBody = document.getElementById('table-body');
const addForm = document.getElementById('add-form');
const totalRevenueEl = document.getElementById('total-revenue');
const themeBtn = document.getElementById('theme-toggle');

// ==========================================
// 3. THEME TOGGLE (Moon/Sun)
// ==========================================
if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark-mode');
  themeBtn.innerText = '☀️'; 
} else {
  themeBtn.innerText = '🌙'; 
}

themeBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  if (document.body.classList.contains('dark-mode')) {
    localStorage.setItem('theme', 'dark');
    themeBtn.innerText = '☀️';
  } else {
    localStorage.setItem('theme', 'light');
    themeBtn.innerText = '🌙';
  }
});

// ==========================================
// 4. FIREBASE REAL-TIME SYNC
// ==========================================
function listenToClients() {
  console.log("Attempting to connect to Firebase...");
  
  onSnapshot(collection(db, "clients"), (snapshot) => {
    console.log("Firebase connection successful! Found", snapshot.size, "clients.");
    clients = []; 
    snapshot.forEach((doc) => {
      clients.push({ id: doc.id, ...doc.data() });
    });
    renderTable();
  }, (error) => {
    console.error("FIREBASE ERROR:", error.message);
  });
}

// ==========================================
// 5. LOGIN LOGIC
// ==========================================
loginForm.addEventListener('submit', function(event) {
  event.preventDefault(); 

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  if (email === 'admin@company.com' && password === 'password123') {
    loginView.style.display = 'none';
    appView.style.display = 'flex'; 
    
    // Trigger the database fetch ONLY after the user clicks Log In
    listenToClients(); 
  } else {
    errorMsg.style.display = 'block';
    loginForm.classList.add('shake');
    setTimeout(() => { loginForm.classList.remove('shake'); }, 400);
  }
});

// ==========================================
// 6. RENDER HTML TABLE & REVENUE
// ==========================================
function renderTable() {
  tableBody.innerHTML = '';
  let total = 0; 
  
  clients.forEach(client => {
    total += Number(client.value); 
    
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${client.company}</td>
      <td>${client.contact}</td>
      <td><strong>${client.status}</strong></td>
      <td>₹${Number(client.value).toLocaleString('en-IN')}</td>
      <td><button class="btn-danger" onclick="deleteClient('${client.id}')">Delete</button></td>
    `;
    tableBody.appendChild(row);
  });

  if (totalRevenueEl) {
    totalRevenueEl.innerText = `₹${total.toLocaleString('en-IN')}`;
  }
}

// ==========================================
// 7. FIREBASE CRUD (ADD & DELETE)
// ==========================================
addForm.addEventListener('submit', async function(event) {
  event.preventDefault(); 

  const newClient = {
    company: document.getElementById('add-company').value,
    contact: document.getElementById('add-contact').value,
    status: document.getElementById('add-status').value,
    value: Number(document.getElementById('add-value').value)
  };

  await addDoc(collection(db, "clients"), newClient);
  addForm.reset();
});

window.deleteClient = async function(idToDelete) {
  await deleteDoc(doc(db, "clients", idToDelete));
};