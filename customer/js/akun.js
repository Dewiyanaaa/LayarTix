// akun.js — Account Profile & Settings Logic for LayarTix
'use strict';

const user = LT.requireAuth('customer');

function renderUserData() {
  const currentUser = LT.getCurrentUser();
  if (!currentUser) return;
  document.getElementById('profileName').textContent = currentUser.name || 'Pengguna LayarTix';
  document.getElementById('profileContact').textContent = currentUser.email || currentUser.phone || '–';
  document.getElementById('avatarLarge').textContent = currentUser.avatar || '';

  const city = LT.load('selected_city') || 'Belum dipilih';
  document.getElementById('prefCity').textContent = 'Kota aktif: ' + city;
}

renderUserData();

// ── Edit Profile Logic ──
function editProfile() {
  const cu = LT.getCurrentUser();
  document.getElementById('editName').value = cu.name || '';
  document.getElementById('editEmail').value = cu.email || '';
  document.getElementById('editPhone').value = cu.phone || '';
  document.getElementById('editProfileModal').classList.add('open');
}

function closeEditProfileModal() {
  document.getElementById('editProfileModal').classList.remove('open');
}

function saveProfile() {
  const name = document.getElementById('editName').value.trim();
  const email = document.getElementById('editEmail').value.trim();
  const phone = document.getElementById('editPhone').value.trim();

  if (!name) { LT.toast('Nama tidak boleh kosong', 'warning'); return; }

  const cu = LT.getCurrentUser();
  cu.name = name;
  cu.email = email;
  cu.phone = phone;
  LT.setCurrentUser(cu);

  const users = LT.getUsers();
  const idx = users.findIndex(u => u.id === cu.id);
  if (idx >= 0) {
    users[idx] = cu;
    LT.saveUsers(users);
  }

  closeEditProfileModal();
  renderUserData();
  LT.toast('Profil berhasil diperbarui!', 'success');
}

// ── Role Switcher ──
function switchToAdmin() {
  window.location.href = '../../admin/html/dashboard.html';
}

function doLogout() {
  LT.logout();
  LT.toast('Anda telah keluar', 'info');
  setTimeout(() => {
    window.location.href = 'login.html';
  }, 400);
}

document.getElementById('editProfileModal').addEventListener('click', e => {
  if (e.target.id === 'editProfileModal') closeEditProfileModal();
});

