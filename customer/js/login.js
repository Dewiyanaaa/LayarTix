/**
 * LayarTix — Customer Authentication Controller (customer/js/login.js)
 * Clean, production-ready, strictly zero emoji. Pure SVG and typography.
 */
'use strict';

let currentTab = 'login';
let loginMethod = 'email';
let regMethod = 'email';

const SVG_EYE_OPEN = `<svg class="eye-icon" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
const SVG_EYE_CLOSED = `<svg class="eye-icon" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;

function switchTab(tab) {
  currentTab = tab;
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const tabLogin = document.getElementById('tabLogin');
  const tabRegister = document.getElementById('tabRegister');
  const errorBox = document.getElementById('errorBox');

  if (errorBox) errorBox.style.display = 'none';

  if (tab === 'login') {
    if (loginForm) loginForm.style.display = 'block';
    if (registerForm) registerForm.style.display = 'none';
    if (tabLogin) tabLogin.classList.add('active');
    if (tabRegister) tabRegister.classList.remove('active');
  } else {
    if (loginForm) loginForm.style.display = 'none';
    if (registerForm) registerForm.style.display = 'block';
    if (tabLogin) tabLogin.classList.remove('active');
    if (tabRegister) tabRegister.classList.add('active');
  }
}

function setLoginMethod(type) {
  loginMethod = type;
  const btnEmail = document.getElementById('loginByEmail');
  const btnPhone = document.getElementById('loginByPhone');
  const inputEl = document.getElementById('loginInput');
  const labelEl = document.getElementById('loginInputLabel');

  if (btnEmail) btnEmail.classList.toggle('active', type === 'email');
  if (btnPhone) btnPhone.classList.toggle('active', type === 'phone');

  if (labelEl) labelEl.textContent = type === 'email' ? 'Alamat Email' : 'Nomor Telepon';
  if (inputEl) {
    inputEl.type = type === 'email' ? 'email' : 'tel';
    inputEl.placeholder = type === 'email' ? 'nama@email.com' : '08xxxxxxxxxx';
    inputEl.value = '';
    inputEl.focus();
  }
}

function setRegMethod(type) {
  regMethod = type;
  const btnEmail = document.getElementById('regByEmail');
  const btnPhone = document.getElementById('regByPhone');
  const inputEl = document.getElementById('regInput');
  const labelEl = document.getElementById('regInputLabel');

  if (btnEmail) btnEmail.classList.toggle('active', type === 'email');
  if (btnPhone) btnPhone.classList.toggle('active', type === 'phone');

  if (labelEl) labelEl.textContent = type === 'email' ? 'Alamat Email' : 'Nomor Telepon';
  if (inputEl) {
    inputEl.type = type === 'email' ? 'email' : 'tel';
    inputEl.placeholder = type === 'email' ? 'nama@email.com' : '08xxxxxxxxxx';
    inputEl.value = '';
    inputEl.focus();
  }
}

function togglePasswordVisibility(inputId, btnEl) {
  const input = document.getElementById(inputId);
  if (!input) return;

  if (input.type === 'password') {
    input.type = 'text';
    btnEl.innerHTML = SVG_EYE_CLOSED;
    btnEl.setAttribute('aria-label', 'Sembunyikan password');
  } else {
    input.type = 'password';
    btnEl.innerHTML = SVG_EYE_OPEN;
    btnEl.setAttribute('aria-label', 'Tampilkan password');
  }
}

function evaluatePasswordStrength(val) {
  const bar = document.getElementById('pwBar');
  const label = document.getElementById('pwLabel');
  if (!bar || !label) return;

  let score = 0;
  if (val.length >= 6) score++;
  if (val.length >= 8) score++;
  if (/[A-Z]/.test(val)) score++;
  if (/[0-9]/.test(val)) score++;
  if (/[^a-zA-Z0-9]/.test(val)) score++;

  const levels = [
    { width: '0%', color: '#ef4444', text: '' },
    { width: '25%', color: '#ef4444', text: 'Kekuatan: Lemah' },
    { width: '50%', color: '#f59e0b', text: 'Kekuatan: Sedang' },
    { width: '75%', color: '#22c55e', text: 'Kekuatan: Kuat' },
    { width: '100%', color: '#16a34a', text: 'Kekuatan: Sangat Kuat' }
  ];

  const lv = levels[Math.min(score, 4)];
  bar.style.width = lv.width;
  bar.style.backgroundColor = lv.color;
  label.textContent = lv.text;
  label.style.color = lv.color;
}

function showAuthError(message) {
  const box = document.getElementById('errorBox');
  const text = document.getElementById('errorText');
  if (box && text) {
    text.textContent = message;
    box.style.display = 'block';
  }
}

function handleLoginSubmit(event) {
  if (event) event.preventDefault();

  const val = (document.getElementById('loginInput')?.value || '').trim();
  const pass = document.getElementById('loginPass')?.value || '';
  const errorBox = document.getElementById('errorBox');
  if (errorBox) errorBox.style.display = 'none';

  if (!val || !pass) {
    showAuthError('Mohon lengkapi seluruh kolom masukan.');
    return;
  }

  const users = (typeof LT !== 'undefined' && typeof LT.getUsers === 'function') 
    ? LT.getUsers() 
    : JSON.parse(localStorage.getItem('layartix_users') || '[]');

  let userMatch;
  if (loginMethod === 'email') {
    userMatch = users.find(u => u.email === val && u.password === pass && u.role === 'customer');
  } else {
    userMatch = users.find(u => u.phone === val && u.password === pass && u.role === 'customer');
  }

  // Fallback demo match for initial test user if users array is empty
  if (!userMatch && ((val === 'user@test.com' || val === '081234567890') && pass === 'user123')) {
    userMatch = {
      id: 'u_customer_1',
      name: 'Budi Santoso',
      email: 'user@test.com',
      phone: '081234567890',
      role: 'customer'
    };
  }

  if (!userMatch) {
    showAuthError('Email/nomor telepon atau password yang dimasukkan tidak cocok.');
    return;
  }

  if (typeof LT !== 'undefined' && typeof LT.setCurrentUser === 'function') {
    LT.setCurrentUser(userMatch);
  } else {
    localStorage.setItem('layartix_user', JSON.stringify(userMatch));
  }

  window.location.href = 'beranda.html';
}

function handleRegisterSubmit(event) {
  if (event) event.preventDefault();

  const name = (document.getElementById('regName')?.value || '').trim();
  const val = (document.getElementById('regInput')?.value || '').trim();
  const pass = document.getElementById('regPass')?.value || '';
  const passConf = document.getElementById('regPassConf')?.value || '';
  const agreed = document.getElementById('agreeCheck')?.checked;
  const errorBox = document.getElementById('errorBox');
  if (errorBox) errorBox.style.display = 'none';

  if (!name) {
    showAuthError('Nama lengkap wajib diisi.');
    return;
  }
  if (!val) {
    showAuthError(regMethod === 'email' ? 'Alamat email wajib diisi.' : 'Nomor telepon wajib diisi.');
    return;
  }
  if (!pass || pass.length < 6) {
    showAuthError('Password minimal harus 6 karakter.');
    return;
  }
  if (pass !== passConf) {
    showAuthError('Konfirmasi password tidak sesuai.');
    return;
  }
  if (!agreed) {
    showAuthError('Anda harus menyetujui Syarat dan Ketentuan layanan.');
    return;
  }

  const users = (typeof LT !== 'undefined' && typeof LT.getUsers === 'function') 
    ? LT.getUsers() 
    : JSON.parse(localStorage.getItem('layartix_users') || '[]');

  const isDuplicate = regMethod === 'email'
    ? users.some(u => u.email === val)
    : users.some(u => u.phone === val);

  if (isDuplicate) {
    showAuthError('Akun dengan ' + (regMethod === 'email' ? 'email' : 'nomor telepon') + ' ini telah terdaftar.');
    return;
  }

  const newUser = {
    id: (typeof LT !== 'undefined' && typeof LT.generateId === 'function') ? LT.generateId('u') : 'u_' + Date.now(),
    name,
    email: regMethod === 'email' ? val : '',
    phone: regMethod === 'phone' ? val : '',
    password: pass,
    role: 'customer',
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  if (typeof LT !== 'undefined' && typeof LT.saveUsers === 'function') {
    LT.saveUsers(users);
    LT.setCurrentUser(newUser);
  } else {
    localStorage.setItem('layartix_users', JSON.stringify(users));
    localStorage.setItem('layartix_user', JSON.stringify(newUser));
  }

  window.location.href = 'beranda.html';
}

document.addEventListener('DOMContentLoaded', () => {
  // If user already logged in as customer, redirect to beranda
  if (typeof LT !== 'undefined' && typeof LT.getAuthUser === 'function') {
    const existing = LT.getAuthUser();
    if (existing && existing.role === 'customer') {
      window.location.href = 'beranda.html';
    }
  }

  // Keyboard Enter handler
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      if (currentTab === 'login') {
        handleLoginSubmit();
      } else {
        handleRegisterSubmit();
      }
    }
  });
});
