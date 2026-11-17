// akun.js — Account Profile & Settings Logic for LayarTix
'use strict';

const user = LT.requireAuth('customer');

function renderUserData() {
  const currentUser = LT.getCurrentUser();
  if (!currentUser) return;
  document.getElementById('profileName').textContent = currentUser.name || 'Pengguna LayarTix';
  document.getElementById('profileContact').textContent = currentUser.email || currentUser.phone || '–';

  // Render Foto Profil (localStorage check layartix_user_avatar)
  const savedAvatar = localStorage.getItem('layartix_user_avatar');
  const imgEl = document.getElementById('profileAvatarImg');
  const fallbackEl = document.getElementById('profileAvatarFallback');
  const btnRemove = document.getElementById('btnRemoveAvatar');

  if (savedAvatar) {
    if (imgEl) {
      imgEl.src = savedAvatar;
      imgEl.style.display = 'block';
    }
    if (fallbackEl) fallbackEl.style.display = 'none';
    if (btnRemove) btnRemove.style.display = 'inline-block';
  } else {
    if (imgEl) {
      imgEl.src = '';
      imgEl.style.display = 'none';
    }
    if (fallbackEl) {
      fallbackEl.style.display = 'inline-block';
      fallbackEl.textContent = currentUser.avatar || '';
    }
    if (btnRemove) btnRemove.style.display = 'none';
  }

  const city = LT.load('selected_city') || 'Belum dipilih';
  document.getElementById('prefCity').textContent = 'Kota aktif: ' + city;

  if (typeof syncAllUserAvatars === 'function') {
    syncAllUserAvatars();
  }
}

// ── Profile Photo Upload & Remove Handler ──
function triggerProfileUpload() {
  const input = document.getElementById('profileImageInput');
  if (input) input.click();
}

function handleProfilePhotoUpload(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    LT.toast('Silakan pilih file gambar yang valid', 'warning');
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    const base64Data = e.target.result;
    try {
      localStorage.setItem('layartix_user_avatar', base64Data);

      // Sinkronkan juga ke sesi akun aktif agar konsisten
      const cu = LT.getCurrentUser();
      if (cu) {
        cu.customAvatar = base64Data;
        LT.setCurrentUser(cu);
      }

      // Reaktif update DOM tanpa reload
      const imgEl = document.getElementById('profileAvatarImg');
      const fallbackEl = document.getElementById('profileAvatarFallback');
      const btnRemove = document.getElementById('btnRemoveAvatar');

      if (imgEl) {
        imgEl.src = base64Data;
        imgEl.style.display = 'block';
      }
      if (fallbackEl) fallbackEl.style.display = 'none';
      if (btnRemove) btnRemove.style.display = 'inline-block';

      if (typeof syncAllUserAvatars === 'function') {
        syncAllUserAvatars();
      }

      LT.toast('Foto profil berhasil diperbarui!', 'success');
    } catch (err) {
      console.error(err);
      LT.toast('Ukuran gambar terlalu besar untuk disimpan', 'error');
    }
  };
  reader.readAsDataURL(file);
  event.target.value = '';
}

function removeProfilePhoto() {
  localStorage.removeItem('layartix_user_avatar');

  const cu = LT.getCurrentUser();
  if (cu) {
    delete cu.customAvatar;
    LT.setCurrentUser(cu);
  }

  // Reaktif reset DOM ke avatar default
  const imgEl = document.getElementById('profileAvatarImg');
  const fallbackEl = document.getElementById('profileAvatarFallback');
  const btnRemove = document.getElementById('btnRemoveAvatar');

  if (imgEl) {
    imgEl.src = '';
    imgEl.style.display = 'none';
  }
  if (fallbackEl) {
    fallbackEl.style.display = 'inline-block';
    fallbackEl.textContent = (cu && cu.avatar) || '';
  }
  if (btnRemove) btnRemove.style.display = 'none';

  if (typeof syncAllUserAvatars === 'function') {
    syncAllUserAvatars();
  }

  LT.toast('Foto profil berhasil dihapus, kembali ke default.', 'info');
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

