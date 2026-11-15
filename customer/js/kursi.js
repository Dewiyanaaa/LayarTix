// kursi.js — Seat Picker Logic for LayarTix
'use strict';

const user = LT.requireAuth('customer');
const session = LT.getSession();
if (!session.movieId || !session.cinemaId) window.location.href = 'beranda.html';

LT.initMovies();
let allMovies = LT.getAllMovies();
try {
  const npRaw = localStorage.getItem('layartix_now_playing');
  if (npRaw) {
    const parsed = JSON.parse(npRaw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      allMovies = [...parsed, ...allMovies];
    }
  }
} catch (e) {}
const movie = allMovies.find(m => m.id === session.movieId);
const activePoster = session.poster || movie?.poster || '';
document.getElementById('seatMovieTitle').textContent = movie?.title || 'Pilih Kursi';
document.getElementById('seatCinemaInfo').textContent = `${session.cinemaName} · ${session.date} ${session.time}`;
document.getElementById('seatPriceDisplay').textContent = LT.formatRp(session.seatPrice || 65000);
document.getElementById('seatTypeLabel').textContent = session.seatType || 'Regular';

const posterEl = document.getElementById('screenPosterBg');
if (posterEl) {
  posterEl.src = activePoster;
  posterEl.onerror = function() { this.style.display = 'none'; };
}

const screenMovieInfoEl = document.getElementById('screenMovieInfo');
if (screenMovieInfoEl) screenMovieInfoEl.textContent = `${movie?.title || 'Film'} · ${session.cinemaName}`;

const rows = ['A','B','C','D','E','F','G'];
const seatsPerRow = 10;
const seatPrice = session.seatPrice || 65000;

// Generate sold seats (20% random, deterministic per session)
const soldSeats = new Set();
const seed = session.cinemaId + session.time;
let hash = 0;
for (let c of seed) hash = ((hash << 5) - hash) + c.charCodeAt(0);
hash = Math.abs(hash);

rows.forEach(r => {
  for (let n = 1; n <= seatsPerRow; n++) {
    const seatHash = (hash * (r.charCodeAt(0) + n * 7)) % 100;
    if (seatHash < 22) soldSeats.add(r + n);
  }
});

let selectedSeats = [];

function buildSeats() {
  const container = document.getElementById('seatsArea');
  container.innerHTML = rows.map(r => {
    // Determine Ergonomic Heatmap Zone
    const zoneClass = (r === 'A' || r === 'B') ? 'zone-front' : ((r === 'C' || r === 'D' || r === 'E') ? 'zone-middle' : 'zone-back');

    return `
    <div class="row-wrap ${zoneClass}">
      <div class="row-label">${r}</div>
      <div class="seats-row">
        ${Array.from({length: seatsPerRow}, (_,i) => i+1).map(n => {
          const id = r + n;
          const isSold = soldSeats.has(id);
          return `<button type="button" class="seat ${isSold?'sold':'available'}"
                          id="seat-${id}" data-row="${r}" data-seat="${id}"
                          ${isSold?'disabled':''}
                          onclick="handleSeatClick(this, '${id}', '${r}')"
                          title="Kursi ${id}">
            <span>${n}</span>
          </button>`;
        }).join('')}
      </div>
      <div class="row-label">${r}</div>
    </div>`;
  }).join('');
}

function handleSeatClick(btn, seatId, row) {
  if (btn.classList.contains('sold') || btn.disabled) return;
  toggleSeat(seatId, row, btn);
}

function toggleSeat(seatId, row, btn) {
  const idx = selectedSeats.indexOf(seatId);

  if (idx >= 0) {
    // Jika kursi yang sama diklik lagi -> Batalkan pilihan
    selectedSeats.splice(idx, 1);
    btn.classList.remove('selected');
    btn.classList.add('available');
    
    if (selectedSeats.length > 0) {
      const lastSeat = selectedSeats[selectedSeats.length - 1];
      const lastRow = lastSeat.charAt(0);
      const lastCol = parseInt(lastSeat.substring(1)) || 5;
      update3dPOV(lastSeat, lastRow, lastCol);
    } else {
      reset3dPOV();
    }
  } else {
    // Mode pemilihan kursi fleksibel: Jika pengguna mengklik kursi baru,
    // pengguna dapat mengganti kursi atau memilih hingga batas maksimal
    if (selectedSeats.length >= 10) { 
      LT.toast('Maksimal 10 kursi per transaksi', 'warning'); 
      return; 
    }

    selectedSeats.push(seatId);
    btn.classList.remove('available');
    btn.classList.add('selected');

    const col = parseInt(seatId.substring(1)) || 5;
    // Transisi 3D POV langsung mengarah ke kursi yang baru diklik
    update3dPOV(seatId, row, col);
  }

  updateSummary();
}

function update3dPOV(seatId, row, col) {
  const sim = LT.getSeatViewSimulation(row, col);
  const colNum = parseInt(col) || 5;
  const yawDelta = (colNum - 5.5); // negatif: kiri, positif: kanan

  // Transformasi kamera 3D: Layar bioskop memutar & bergeser relatif terhadap posisi mata penonton
  const screenRotateY = Math.round(yawDelta * 3.8);
  const screenTranslateX = Math.round(-yawDelta * 14);

  // Elevasi leher berdasarkan baris kursi A (depan) sampai G (belakang)
  const rowScaleMap = { 'A': 1.18, 'B': 1.12, 'C': 1.06, 'D': 1.0, 'E': 0.95, 'F': 0.90, 'G': 0.85 };
  const rowPitchRotateX = { 'A': -14, 'B': -9, 'C': -4, 'D': 0, 'E': 4, 'F': 7, 'G': 10 };
  const currentScale = rowScaleMap[row] || 1.0;
  const currentRotateX = rowPitchRotateX[row] || 0;

  const screenCurved = document.getElementById('screen3dCurved');
  if (screenCurved) {
    screenCurved.style.transform = `scale(${currentScale}) translateX(${screenTranslateX}px) rotateY(${screenRotateY}deg) rotateX(${currentRotateX}deg)`;
    screenCurved.style.boxShadow = `0 24px 70px rgba(0, 0, 0, 0.95), 0 0 60px ${sim.color}66`;
  }

  // Update HUD Camera POV Badge
  const hudBadge = document.getElementById('cameraHudBadge');
  const hudText = document.getElementById('cameraHudText');
  if (hudBadge && hudText) {
    hudBadge.style.borderColor = sim.color;
    hudText.style.color = sim.color;
    hudText.textContent = `POV KURSI ${seatId} (${sim.seatId}) · ${sim.yawText} · Elevasi ${sim.pitchText}`;
  }
}

function reset3dPOV() {
  const screenCurved = document.getElementById('screen3dCurved');
  if (screenCurved) {
    screenCurved.style.transform = 'scale(1) translateX(0px) rotateY(0deg) rotateX(-8deg)';
    screenCurved.style.boxShadow = '0 16px 50px rgba(0, 0, 0, 0.9), 0 0 45px rgba(255, 215, 0, 0.2)';
  }

  const hudBadge = document.getElementById('cameraHudBadge');
  const hudText = document.getElementById('cameraHudText');
  if (hudBadge && hudText) {
    hudBadge.style.borderColor = 'rgba(255, 215, 0, 0.35)';
    hudText.style.color = 'var(--gold)';
    hudText.textContent = 'PILIH KURSI UNTUK SIMULASI 3D POV';
  }
}

function updateSummary() {
  const total = selectedSeats.length * seatPrice;
  const seatsTxt = selectedSeats.length > 0 ? selectedSeats.join(', ') : 'Belum ada';
  const totalTxt = LT.formatRp(total);

  // Mobile bar
  document.getElementById('selectedSeatsInfo').textContent = seatsTxt;
  document.getElementById('totalPriceDisplay').textContent = totalTxt;

  // Desktop side panel
  document.getElementById('desktopSeatsList').textContent = seatsTxt;
  document.getElementById('desktopTotalPrice').textContent = totalTxt;

  const btnMobile = document.getElementById('continueBtn');
  const btnDesktop = document.getElementById('desktopContinueBtn');

  if (selectedSeats.length > 0) {
    btnMobile.style.opacity = '1';
    btnMobile.style.pointerEvents = 'auto';
    btnDesktop.style.opacity = '1';
    btnDesktop.style.pointerEvents = 'auto';
  } else {
    btnMobile.style.opacity = '0.4';
    btnMobile.style.pointerEvents = 'none';
    btnDesktop.style.opacity = '0.4';
    btnDesktop.style.pointerEvents = 'none';
  }
}

function goToFnb() {
  if (!selectedSeats.length) return;
  LT.setSession({
    ...LT.getSession(),
    selectedSeats,
    totalTicket: selectedSeats.length * seatPrice
  });
  window.location.href = 'fnb.html';
}

buildSeats();

