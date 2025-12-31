const API = 'http://localhost:5432';

let token = null;
let map = L.map('mapContainer').setView([21.2514, 81.6296], 15);
let markers = [];

const loginBtn = document.getElementById('loginBtn');
const emailInput = document.getElementById('email');
const nameInput = document.getElementById('name');
const userInfo = document.getElementById('userInfo');

loginBtn.addEventListener('click', async () => {
  const email = emailInput.value.trim();
  const name = nameInput.value.trim();
  if (!email || !name) return alert('Enter email and name');
  try {
    const res = await fetch(`${API}/auth/oauth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name })
    });
        const data = await res.json();
        if (res.ok) {
          token = data.token;
        }
      } catch (err) {
        console.error('Login error:', err);
      }
    });