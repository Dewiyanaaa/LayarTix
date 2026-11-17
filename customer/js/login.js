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

function fillQuickCreds(usernameOrEmail, password) {
  const inputEl = document.getElementById('loginInput');
  const passEl = document.getElementById('loginPass');
  if (inputEl) inputEl.value = usernameOrEmail;
  if (passEl) passEl.value = password;
  const errorBox = document.getElementById('errorBox');
  if (errorBox) errorBox.style.display = 'none';
}

function handleLoginSubmit(event) {
  if (event) event.preventDefault();

  const inputEl = document.getElementById('loginInput');
  const passEl = document.getElementById('loginPass');
  const val = (inputEl ? inputEl.value : '').trim();
  const pass = (passEl ? passEl.value : '').trim();
  const errorBox = document.getElementById('errorBox');
  if (errorBox) errorBox.style.display = 'none';

  if (!val || !pass) {
    showAuthError('Mohon masukkan username/email dan password.');
    return;
  }

  const valLower = val.toLowerCase();
  let userMatch = null;

  // 1. HARDCODED IMMEDIATE SYSTEM MATCH (Selalu berhasil tanpa bergantung localStorage yang korup)
  if ((valLower === 'admin' || valLower === 'admin@layartix.com') && pass === 'admin123') {
    userMatch = {
      id: 'u_admin',
      name: 'Super Administrator',
      email: 'admin@layartix.com',
      username: 'admin',
      phone: '081200000000',
      password: 'admin123',
      role: 'admin',
      adminRole: 'super_admin',
      branchId: null,
      branchName: 'Semua Cabang (Super Admin)',
      city: null,
      wallet: 0,
      avatar: '',
      createdAt: new Date().toISOString()
    };
  } else if ((valLower === 'admin_nipah' || valLower === 'nipah@layartix.com') && pass === 'nipah123') {
    userMatch = {
      id: 'u_admin_nipah',
      name: 'Admin Nipah Mall XXI',
      email: 'nipah@layartix.com',
      username: 'admin_nipah',
      phone: '081211111111',
      password: 'nipah123',
      role: 'admin',
      adminRole: 'branch_admin',
      branchId: 'c_mks_4',
      branchName: 'XXI Nipah Park',
      city: 'Makassar',
      wallet: 0,
      avatar: '',
      createdAt: new Date().toISOString()
    };
  } else if ((valLower === 'admin_gorontalo' || valLower === 'gorontalo@layartix.com') && pass === 'gorontalo123') {
    userMatch = {
      id: 'u_admin_gorontalo',
      name: 'Admin Gorontalo Mall',
      email: 'gorontalo@layartix.com',
      username: 'admin_gorontalo',
      phone: '081222222222',
      password: 'gorontalo123',
      role: 'admin',
      adminRole: 'branch_admin',
      branchId: 'c_gorontalo_1',
      branchName: 'XXI Gorontalo Mall',
      city: 'Gorontalo',
      wallet: 0,
      avatar: '',
      createdAt: new Date().toISOString()
    };
  } else if ((valLower === 'user@test.com' || valLower === 'budi' || val === '081234567890') && pass === 'user123') {
    userMatch = {
      id: 'u_test',
      name: 'Budi Santoso',
      email: 'user@test.com',
      username: 'budi',
      phone: '081234567890',
      password: 'user123',
      role: 'customer',
      wallet: 500000,
      avatar: '',
      createdAt: new Date().toISOString()
    };
  }

  // 2. Jika bukan akun sistem default, periksa di database localStorage (untuk customer baru)
  if (!userMatch) {
    if (typeof LT !== 'undefined' && typeof LT.seedIfEmpty === 'function') {
      LT.seedIfEmpty();
    }
    const users = (typeof LT !== 'undefined' && typeof LT.getUsers === 'function') 
      ? LT.getUsers() 
      : JSON.parse(localStorage.getItem('layartix_users') || '[]');

    userMatch = users.find(u => {
      const matchUser = (u.username && u.username.toLowerCase() === valLower) ||
                        (u.email && u.email.toLowerCase() === valLower) ||
                        (u.phone && u.phone === val);
      return matchUser && u.password === pass;
    });
  }

  if (!userMatch) {
    showAuthError('Username, email atau password yang dimasukkan salah.');
    return;
  }

  // Simpan sesi aktif ke localStorage
  if (typeof LT !== 'undefined' && typeof LT.setCurrentUser === 'function') {
    LT.setCurrentUser(userMatch);
  } else {
    localStorage.setItem('layartix_user', JSON.stringify(userMatch));
    const sessionObj = {
      id: userMatch.id,
      name: userMatch.name,
      username: userMatch.username || userMatch.email,
      email: userMatch.email,
      role: userMatch.role === 'admin' ? (userMatch.adminRole || 'super_admin') : 'customer',
      branchId: userMatch.branchId || null,
      branchName: userMatch.branchName || (userMatch.role === 'admin' ? 'Semua Cabang' : null),
      city: userMatch.city || null,
      loggedInAt: new Date().toISOString()
    };
    localStorage.setItem('layartix_session', JSON.stringify(sessionObj));
  }

  // Pastikan user admin tersimpan di daftar users localStorage jika belum ada
  try {
    let allUsers = (typeof LT !== 'undefined' && typeof LT.getUsers === 'function') ? LT.getUsers() : [];
    if (!allUsers.some(u => u.id === userMatch.id)) {
      allUsers.push(userMatch);
      if (typeof LT !== 'undefined' && typeof LT.saveUsers === 'function') {
        LT.saveUsers(allUsers);
      } else {
        localStorage.setItem('layartix_users', JSON.stringify(allUsers));
      }
    }
  } catch(e) {}

  // Arahkan ke halaman tujuan berdasarkan role
  if (userMatch.role === 'admin') {
    window.location.href = '../../admin/html/dashboard.html';
  } else {
    window.location.href = 'beranda.html';
  }
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
