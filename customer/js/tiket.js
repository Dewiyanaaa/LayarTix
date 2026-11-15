
// Showtime Countdown, Timezone & Auto-Expire Helpers
function getCityDateObj(dateStr, timeStr, city) {
  if (!dateStr || !timeStr) return null;
  // Parse base date & time string e.g. "2026-11-15 19:00"
  let cleanDate = dateStr.trim();
  let cleanTime = timeStr.trim();
  if (cleanTime.length === 5) cleanTime += ':00';

  const tz = (typeof LT !== 'undefined' && typeof LT.getCityTimeZone === 'function')
    ? LT.getCityTimeZone(city || 'Makassar')
    : 'WITA';
  const offset = tz === 'WIT' ? '+09:00' : (tz === 'WITA' ? '+08:00' : '+07:00');

  const isoStr = `${cleanDate}T${cleanTime}${offset}`;
  const d = new Date(isoStr);
  return isNaN(d.getTime()) ? new Date(cleanDate + ' ' + cleanTime) : d;
}

function getShowtimeDiff(dateStr, timeStr, city) {
  const target = getCityDateObj(dateStr, timeStr, city);
  if (!target || isNaN(target.getTime())) return null;
  const now = new Date();
  const diffMs = target.getTime() - now.getTime();
  return { target, diffMs, minutesLeft: Math.round(diffMs / 60000) };
}

// Auto-Expire: Mengarsipkan tiket aktif yang jam tayangnya sudah lewat secara real-time
function autoExpirePassedTickets() {
  if (typeof LT === 'undefined' || typeof LT.getBookings !== 'function') return;
  const bookings = LT.getBookings();
  let changed = false;
  const now = new Date();

  bookings.forEach(b => {
    if (b.status === 'active') {
      const target = getCityDateObj(b.date, b.time, b.city);
      if (target && !isNaN(target.getTime())) {
        // Jika waktu sekarang sudah melewati jam tayang + durasi film (atau jam mulai tayang)
        if (now.getTime() > target.getTime()) {
          b.status = 'used';
          b.expiredAt = now.toISOString();
          changed = true;
          // Buat draft jurnal otomatis jika belum ada
          const existingJ = LT.getJournalForBooking(b.id);
          if (!existingJ) {
            LT.saveJournal({
              bookingId: b.id,
              userId: b.userId,
              rating: 5,
              text: `Menonton ${b.movieTitle} di ${b.cinemaName}. Pengalaman sinema yang luar biasa!`,
              private: false,
              savedAt: now.toISOString()
            });
          }
        }
      }
    }
  });

  if (changed) {
    LT.saveBookings(bookings);
  }
}

// Showtime Countdown & Notification Helpers

// In-Seat F&B Delivery Progress Simulator (Real-time tracking: Sedang Disiapkan -> Dalam Perjalanan -> Selesai Diantar)
function getDeliveryProgress(orderOrBooking) {
  const orderTimeStr = orderOrBooking.deliveryStatusTime || orderOrBooking.orderedAt || orderOrBooking.paidAt || new Date().toISOString();
  const orderTime = new Date(orderTimeStr).getTime();
  const elapsedMinutes = Math.max(0, (Date.now() - orderTime) / 60000);

  // Simulation timeline:
  // 0 - 2 mins: Sedang Disiapkan di Kantin F&B
  // 2 - 5 mins: Dalam Perjalanan Pengantaran ke Kursi Studio
  // > 5 mins: Selesai Diantar ke Kursi Penonton
  if (elapsedMinutes < 2) {
    return {
      step: 1,
      progressPercent: 35,
      statusText: 'Sedang Disiapkan di Dapur Kantin',
      badgeText: ' DISIAPKAN',
      badgeBg: 'rgba(245,158,11,0.15)',
      badgeColor: '#f59e0b',
      borderColor: 'rgba(245,158,11,0.3)',
      barGradient: 'linear-gradient(90deg, #f59e0b, #ffd700)',
      estMinutes: '3-4 menit lagi tiba',
      icon: ''
    };
  } else if (elapsedMinutes < 5) {
    return {
      step: 2,
      progressPercent: 75,
      statusText: 'Petugas Menuju ke Kursi Studio Anda',
      badgeText: ' DALAM PENGANTARAN',
      badgeBg: 'rgba(59,130,246,0.15)',
      badgeColor: '#60a5fa',
      borderColor: 'rgba(59,130,246,0.35)',
      barGradient: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
      estMinutes: 'Tiba sesaat lagi (~1 mnt)',
      icon: ''
    };
  } else {
    return {
      step: 3,
      progressPercent: 100,
      statusText: 'Makanan Berhasil Diantar ke Kursi',
      badgeText: ' SELESAI DIANTAR',
      badgeBg: 'rgba(34,197,94,0.15)',
      badgeColor: '#22c55e',
      borderColor: 'rgba(34,197,94,0.35)',
      barGradient: 'linear-gradient(90deg, #22c55e, #10b981)',
      estMinutes: 'Selamat menikmati film!',
      icon: ''
    };
  }
}

function checkShowtimeNotifications() {
  const allBookings = LT.getUserBookings(user.id).filter(b => b.status === 'active');
  const notified1h = JSON.parse(localStorage.getItem('lt_notified_1h') || '[]');
  const notified10m = JSON.parse(localStorage.getItem('lt_notified_10m') || '[]');

  allBookings.forEach(b => {
    const diff = getShowtimeDiff(b.date, b.time);
    if (!diff) return;

    // 1 Hour Alert (between 45 and 65 minutes left)
    if (diff.minutesLeft <= 65 && diff.minutesLeft >= 45 && !notified1h.includes(b.id)) {
      notified1h.push(b.id);
      localStorage.setItem('lt_notified_1h', JSON.stringify(notified1h));
      LT.toast(` PENGINGAT 1 JAM: Film ${b.movieTitle} di ${b.cinemaName} mulai pukul ${b.time}. Harap berangkat lebih awal antisipasi kemacetan!`, 'warning', 7000);
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        new Notification(' LayarTix: Film Dimulai 1 Jam Lagi!', {
          body: `${b.movieTitle} di ${b.cinemaName} pukul ${b.time}. Cek status rute & parkir!`,
          icon: b.poster || ''
        });
      }
    }

    // 10 Minutes Countdown Alert (<= 12 min)
    if (diff.minutesLeft <= 12 && diff.minutesLeft > 0 && !notified10m.includes(b.id)) {
      notified10m.push(b.id);
      localStorage.setItem('lt_notified_10m', JSON.stringify(notified10m));
      LT.toast(` HITUNGAN MUNDUR 10 MENIT: Pintu teater ${b.movieTitle} segera dibuka! Masuk sekarang ke teater.`, 'error', 8000);
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        new Notification(' LayarTix: 10 Menit Menuju Penayangan!', {
          body: `Pintu teater segera ditutup untuk film ${b.movieTitle}. Segera scan tiket Anda!`,
          icon: b.poster || ''
        });
      }
    }
  });
}

if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
  Notification.requestPermission();
}

// tiket.js — My Tickets, Journal & Cancellation Logic for LayarTix
'use strict';

const user = LT.requireAuth('customer');

// Check for new booking from session
const session = LT.getSession();
if (session.bookingId && session.booking) {
  // Pastikan booking dari session tersimpan ke list tiket
  LT.addBooking(session.booking);
  const banner = document.getElementById('newTicketBanner');
  if (banner) banner.style.display = '';
  const infoEl = document.getElementById('newTicketInfo');
  if (infoEl) {
    const seatsStr = Array.isArray(session.booking.seats) ? session.booking.seats.join(', ') : (session.booking.seats || '');
    infoEl.textContent = `${session.booking.movieTitle} · ${seatsStr} · ${session.booking.cinemaName}`;
  }
  LT.clearSession();
}

let cancelBookingId = null;
let journalBookingId = null;
let currentJournalPhoto = null;
let selectedRating = 0;

function switchTab(tab, btn) {
  document.getElementById('activeSection').style.display = tab === 'active' ? '' : 'none';
  document.getElementById('historySection').style.display = tab === 'history' ? '' : 'none';
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  if (tab === 'active') {
    renderActiveTickets();
  }
}

function renderBookings() {
  renderActiveTickets();
}

function renderActiveTickets() {
  loadActiveTickets();
}

function loadActiveTickets() {
  // 1. Baca langsung dari layartix_active_tickets
  let allBookings = [];
  try {
    const raw = localStorage.getItem('layartix_active_tickets');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        allBookings = parsed;
      }
    }
  } catch(e) {
    console.error('Error membaca layartix_active_tickets:', e);
  }

  // Fallback ke LT.getUserBookings jika belum ada di key utama
  if (!allBookings || allBookings.length === 0) {
    allBookings = (typeof LT !== 'undefined' && typeof LT.getBookings === 'function')
      ? LT.getBookings()
      : [];
  }

  // Pisahkan tiket aktif dan riwayat
  const active = allBookings.filter(b => b.status === 'active' || !b.status);
  const history = allBookings.filter(b => b.status && b.status !== 'active');

  // Urutkan tiket terbaru di paling atas (reverse dari array push)
  const activeToRender = [...active].reverse();
  const historyToRender = [...history].reverse();

  // Standalone F&B orders
  const fnbOrders = (typeof LT !== 'undefined' && typeof LT.getFnbOrders === 'function')
    ? LT.getFnbOrders().filter(o => !user || o.userId === user.id || !o.userId || o.userId === 'GUEST')
    : [];

  // Render ke container active-tickets-container dan activeList
  renderList('active-tickets-container', activeToRender, fnbOrders, true);
  renderList('activeList', activeToRender, fnbOrders, true);
  renderList('historyList', historyToRender, [], false);
}

// Ekspos ke window agar dapat dipanggil instan kapan saja
window.renderActiveTickets = renderActiveTickets;
window.loadActiveTickets = loadActiveTickets;
window.renderBookings = renderBookings;

// Langsung panggil renderActiveTickets() di awal skrip
renderActiveTickets();

// DOMContentLoaded listener untuk memastikan kartu tiket langsung dirender otomatis saat halaman dibuka
document.addEventListener('DOMContentLoaded', () => {
  renderActiveTickets();
});

// Event listener storage agar jika ada tab lain / pembayaran selesai, tiket langsung update seketika
window.addEventListener('storage', (e) => {
  if (e.key === 'layartix_active_tickets' || e.key === 'lt_bookings') {
    renderActiveTickets();
  }
});

function renderList(containerId, bookings, fnbOrders, isActive) {
  const container = document.getElementById(containerId);
  if (!container) return;
  let html = '';

  // Standalone F&B cards (if active)
  if (isActive && fnbOrders && fnbOrders.length > 0) {
    html += `<div style="padding:0 16px 8px;font-size:13px;font-weight:700;color:var(--gold);display:flex;align-items:center;gap:6px">
       Pesanan &amp; Antar Kursi F&B (${fnbOrders.length})
    </div>`;
    html += fnbOrders.map(o => {
      // Calculate dynamic simulated delivery status based on time
      const statusInfo = getDeliveryProgress(o);

      return `
      <div class="ticket-card" style="border-color:${statusInfo.borderColor};background:linear-gradient(135deg,#121a16,#12121a);margin-bottom:14px">
        <div class="ticket-top">
          <div style="font-size:38px;padding:10px 4px">${statusInfo.icon}</div>
          <div class="ticket-info">
            <div class="ticket-movie">
              ${o.deliveryType === 'in_seat' ? 'Antar ke Kursi Studio (In-Seat)' : 'Pesanan Kantin F&B'}
            </div>
            <div class="ticket-cinema"> Bioskop: ${o.cinemaName}</div>
            ${o.deliveryType === 'in_seat' ? `
              <div style="font-size:11px;font-weight:600;color:var(--gold);margin-top:2px">
                 Tujuan: ${o.deliveryStudio || 'Studio 1'} · Kursi: ${o.deliverySeat || 'Duduk'}
              </div>
            ` : ''}
            <div class="ticket-meta" style="margin-top:4px">
              <span class="ticket-meta-item"> ${LT.formatRp(o.total)}</span>
              <span class="ticket-meta-item"> ${new Date(o.orderedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div style="margin-top:8px">
              <span class="ticket-status" style="background:${statusInfo.badgeBg};color:${statusInfo.badgeColor};border:1px solid ${statusInfo.badgeColor}44">
                ${statusInfo.badgeText}
              </span>
            </div>
          </div>
        </div>

        <!-- Real-time In-Seat Delivery Progress Bar -->
        <div style="padding:10px 16px;background:rgba(255,255,255,0.03);border-top:1px solid rgba(255,255,255,0.06);border-bottom:1px solid rgba(255,255,255,0.06)">
          <div style="display:flex;align-items:center;justify-content:space-between;font-size:11px;color:rgba(255,255,255,0.7);margin-bottom:6px">
            <span style="font-weight:600;color:${statusInfo.badgeColor}">${statusInfo.statusText}</span>
            <span style="font-size:10px;color:var(--muted)">Est: ${statusInfo.estMinutes}</span>
          </div>
          <div style="width:100%;height:6px;background:rgba(255,255,255,0.1);border-radius:4px;overflow:hidden">
            <div style="width:${statusInfo.progressPercent}%;height:100%;background:${statusInfo.barGradient};border-radius:4px;transition:width 0.5s ease"></div>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--muted);margin-top:4px">
            <span style="color:${statusInfo.step >= 1 ? 'var(--gold)' : ''}">1. Disiapkan</span>
            <span style="color:${statusInfo.step >= 2 ? 'var(--gold)' : ''}">2. Diantar Petugas</span>
            <span style="color:${statusInfo.step >= 3 ? '#22c55e' : ''}">3. Sampai di Kursi</span>
          </div>
        </div>

        <div style="padding:10px 16px 6px;font-size:12px;color:var(--muted)">
          Menu: ${(o.items || []).map(it => `${it.emoji || ''} ${it.name} x${it.qty}`).join(', ')}
        </div>
        <div class="ticket-actions" style="padding:4px 16px 14px">
          <button class="btn btn-outline btn-sm" onclick="showFnbQr('${o.id}')"> QR Validasi Petugas</button>
        </div>
      </div>
    `}).join('');
  }

  // Jika ada tiket, pastikan teks kosong HILANG dan kartu tiket dirender
  if (bookings && bookings.length > 0) {
    html += bookings.map(b => ticketCardHTML(b)).join('');
    container.innerHTML = html;

    // Generate QR for active tickets
    bookings.forEach(b => {
      if (b.status === 'active') {
        setTimeout(() => LT.generateQR('qr-mini-' + b.id, b.qrData, 60), 100);
      }
    });
    return;
  }

  // Hanya jika benar-benar kosong (panjang array === 0)
  if (!bookings.length && (!fnbOrders || !fnbOrders.length)) {
    container.innerHTML = `<div class="empty-state">
      <div class="empty-icon">${isActive ? '' : ''}</div>
      <div class="empty-title">${isActive ? 'Belum Ada Tiket Aktif' : 'Belum Ada Riwayat'}</div>
      <div class="empty-desc">${isActive ? 'Pesan tiket sekarang dan nikmati pengalaman bioskop terbaik!' : 'Tiket yang sudah digunakan atau dibatalkan akan muncul di sini.'}</div>
      ${isActive ? `<a href="beranda.html"><button class="btn btn-primary" style="margin-top:16px;padding:12px 24px"> Pesan Tiket</button></a>` : ''}
    </div>`;
    return;
  }

  container.innerHTML = html;
}

function showFnbQr(orderId) {
  const orders = LT.getFnbOrders();
  const o = orders.find(x => x.id === orderId);
  if (!o) return;
  document.getElementById('qrBookingId').textContent = o.id;
  document.getElementById('qrMovieInfo').textContent = 'Voucher Pengambilan Kantin F&B';
  document.getElementById('qrCinemaInfo').textContent = `${o.cinemaName} · Total: ${LT.formatRp(o.total)}`;
  document.getElementById('qrDisplay').innerHTML = '';
  LT.generateQR('qrDisplay', o.qrData, 180);
  document.getElementById('qrModal').classList.add('open');
}

function getResolvedPoster(b) {
  if (b && b.poster) {
    return b.poster;
  }
  try {
    const npRaw = localStorage.getItem('layartix_now_playing');
    if (npRaw) {
      const parsed = JSON.parse(npRaw);
      const found = parsed.find(x => x.id === b.movieId || (x.title && b.movieTitle && x.title.toLowerCase() === b.movieTitle.toLowerCase()));
      if (found && found.poster) {
        return found.poster;
      }
    }
  } catch (e) {}
  try {
    const csRaw = localStorage.getItem('layartix_coming_soon');
    if (csRaw) {
      const parsed = JSON.parse(csRaw);
      const found = parsed.find(x => x.id === b.movieId || (x.title && b.movieTitle && x.title.toLowerCase() === b.movieTitle.toLowerCase()));
      if (found && found.poster) {
        return found.poster;
      }
    }
  } catch (e) {}
  return 'https://picsum.photos/seed/' + (b?.movieId || 'movie') + '/400/600';
}

function ticketCardHTML(b) {
  const journal = (typeof LT !== 'undefined' && typeof LT.getJournalForBooking === 'function')
    ? LT.getJournalForBooking(b.id)
    : null;
  const statusClass = { active: 'status-active', used: 'status-used', cancelled: 'status-cancelled' }[b.status] || 'status-active';
  const statusLabel = { active: 'AKTIF', used: 'SELESAI', cancelled: 'DIBATALKAN' }[b.status] || 'AKTIF';
  const refund40 = Math.round(((b.totalTicket || b.grandTotal) || 0) * 0.4);
  const screenStudio = b.deliveryStudio || b.studio || 'Studio 1';
  const seatNumbers = Array.isArray(b.seats) ? b.seats.join(', ') : (b.seats || 'F21');
  const posterSrc = getResolvedPoster(b);
  const tz = (typeof LT !== 'undefined' && typeof LT.getCityTimeZone === 'function')
    ? LT.getCityTimeZone(b.city || 'Makassar')
    : 'WITA';

  return `
  <div class="classic-ticket-wrapper">
    <!-- Classic Admit One Cinema Ticket Shape -->
    <div class="classic-ticket-card">
      <!-- Scalloped punch holes / notches -->
      <div class="ticket-notch notch-left-top"></div>
      <div class="ticket-notch notch-left-bottom"></div>
      <div class="ticket-notch notch-right-top"></div>
      <div class="ticket-notch notch-right-bottom"></div>
      <div class="ticket-notch notch-middle-top"></div>
      <div class="ticket-notch notch-middle-bottom"></div>

      <!-- SISI KIRI: Deep Cinematic Blue (Area Utama Film & Waktu) -->
      <div class="ticket-main-blue">
        <div class="ticket-inner-border"></div>

        <!-- Top Header & Stars -->
        <div class="ticket-cinema-header">
          <div class="ticket-stars">    </div>
          <div class="ticket-brand-tag">LAYARTIX CINEMA</div>
        </div>

        <!-- Movie Details -->
        <div class="ticket-movie-content">
          <img class="ticket-mini-poster" src="${posterSrc}" alt="${b.movieTitle}"
               onerror="this.style.display='none'"/>
          <div class="ticket-movie-info">
            <h3 class="ticket-vintage-title">${b.movieTitle}</h3>
            <div class="ticket-cinema-name"> ${b.cinemaName || 'LayarTix XXI'}</div>
            <div class="ticket-badges-row">
              <span class="ticket-pill-badge">${b.movieRating || '13+'}</span>
              <span class="ticket-pill-badge" style="color:#ffffff;border-color:rgba(255,255,255,0.3)">${b.seatType || 'Regular'}</span>
              ${b.splitBill ? `<span class="ticket-pill-badge" style="color:#fca5a5;border-color:#ef4444">Split Bill (${b.splitPeople})</span>` : ''}
            </div>
          </div>
        </div>

        <!-- Bottom Specs Strip: DATE/TIME, SCREEN, SEAT -->
        <div class="ticket-specs-strip">
          <div class="spec-block">
            <span class="spec-label">DATE / TIME</span>
            <span class="spec-val">${b.date || 'Hari Ini'} · ${b.time || '19:00'} ${LT.getCityTimeZone ? LT.getCityTimeZone(b.city || 'Makassar') : 'WITA'}</span>
          </div>
          <div class="spec-block" style="text-align:center">
            <span class="spec-label">SCREEN</span>
            <span class="spec-val gold">${screenStudio}</span>
          </div>
          <div class="spec-block" style="text-align:right">
            <span class="spec-label">SEAT</span>
            <span class="spec-val gold">${seatNumbers}</span>
          </div>
        </div>
      </div>

      <!-- Garis Perforasi Vertikal di Tengah (Punched Dashed Line) -->
      <div class="ticket-perforation-divider"></div>

      <!-- SISI KANAN: Vintage Cream / Light Beige Stub (QR & ADMIT ONE) -->
      <div class="ticket-stub-cream">
        <div class="stub-qr-box" id="qr-mini-${b.id}"></div>
        <div class="stub-booking-id">${b.id}</div>
        <div class="stub-admit-one">ADMIT ONE</div>
        <div style="font-size:9px;color:#64748b;margin-top:6px;font-weight:600;letter-spacing:0.05em">SCAN DI PINTU STUDIO</div>
      </div>
    </div>

    <!-- Panel Status, Lalu Lintas & Aksi Tiket di Bawah Tiket Klasik -->
    <div class="ticket-card-footer-box">
      <div class="ticket-status-row">
        <span style="font-size:12px;color:rgba(255,255,255,0.7)">
          Total Pembayaran: <strong style="color:var(--gold)">${LT.formatRp(b.grandTotal || b.totalTicket || 0)}</strong>
        </span>
        <span class="ticket-status ${statusClass}">
          ${statusLabel}
        </span>
      </div>


      ${b.fnbItems?.length ? (() => {
        const isDelivery = b.inSeatDelivery;
        const statusInfo = getDeliveryProgress(b);

        return `
        <div style="margin:0 0 12px;padding:10px 12px;background:rgba(34,197,94,0.06);border:1px solid rgba(34,197,94,0.2);border-radius:10px">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
            <div style="font-size:12px;font-weight:700;color:#22c55e;display:flex;align-items:center;gap:6px">
               ${isDelivery ? 'In-Seat Delivery (Antar ke Kursi)' : 'Pesanan Kantin F&B'}
            </div>
            <span style="font-size:10px;padding:2px 8px;border-radius:12px;background:${statusInfo.badgeBg};color:${statusInfo.badgeColor};border:1px solid ${statusInfo.badgeColor}44">
              ${statusInfo.badgeText}
            </span>
          </div>
          ${isDelivery ? `
            <div style="font-size:11px;font-weight:600;color:var(--gold);margin-bottom:6px">
               Diantar ke: ${screenStudio} · Kursi: ${seatNumbers}
            </div>
            <div style="width:100%;height:5px;background:rgba(255,255,255,0.1);border-radius:3px;overflow:hidden;margin-bottom:6px">
              <div style="width:${statusInfo.progressPercent}%;height:100%;background:${statusInfo.barGradient};border-radius:3px"></div>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:9px;color:var(--muted);margin-bottom:8px">
              <span>1. Disiapkan</span>
              <span>2. Diantar Petugas</span>
              <span>3. Sampai di Kursi</span>
            </div>
          ` : ''}
          <div style="font-size:11px;color:rgba(255,255,255,0.7)">
            ${b.fnbItems.map(f => `${f.emoji} ${f.name} x${f.qty}`).join(' · ')}
          </div>
        </div>`;
      })() : ''}

      <!-- Tombol Aksi Tiket & In-Seat Delivery -->
      <div class="ticket-actions-grid">
        ${b.status === 'active' ? `
          <button class="btn btn-outline btn-sm" onclick="showFullscreenTicket('${b.id}')"> Tampilan Layar Penuh</button>
          <button class="btn-inseat-order" onclick="orderFnbToMySeat('${b.id}')">
             Pesan Makanan ke Kursi Saya (In-Seat Delivery)
          </button>
          <button class="btn btn-danger btn-sm" onclick="openCancelModal('${b.id}')">
             Batal (Refund ${LT.formatRp(refund40)})
          </button>
        ` : ''}
        ${b.status === 'used' ? `
          ${journal
            ? `<button class="btn btn-outline btn-sm" onclick="openJournalModal('${b.id}',true)"> Lihat Jurnal Kenangan</button>`
            : `<button class="btn btn-gold btn-sm" onclick="openJournalModal('${b.id}',false)"> Tulis Jurnal Kenangan</button>`
          }
        ` : ''}
        ${b.status === 'cancelled' ? `
          <div style="font-size:12px;color:var(--muted)">Refund ${LT.formatRp(b.refundAmount || refund40)} → Rekening/E-Wallet Asal (Flexi-Ticket)</div>
        ` : ''}
      </div>

      ${journal && b.status === 'used' ? `
      <div class="journal-entry" style="margin-top:12px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
          <div class="journal-rating">${''.repeat(journal.rating)}</div>
          <span style="font-size:10px;padding:2px 8px;border-radius:10px;background:rgba(255,215,0,0.1);color:var(--gold);border:1px solid rgba(255,215,0,0.2)">Jurnal Kenangan</span>
        </div>
        <div class="journal-text">"${journal.text}"</div>
        ${journal.photo ? `
          <div class="journal-photo-box">
            <img class="journal-photo-img" src="${journal.photo}" alt="Foto Kenangan Bioskop" />
          </div>
        ` : ''}
        <div class="journal-date" style="margin-top:6px">
          ${b.movieTitle} · ${b.cinemaName} · ${new Date(journal.savedAt).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>` : ''}
    </div>
  </div>`;
}

// Fullscreen E-Ticket Utuh (Gaya Klasik Admit One Sisi Biru & Krem Lengkap)
function showFullscreenTicket(bookingId) {
  const bookings = LT.getUserBookings(user.id);
  const b = bookings.find(b => b.id === bookingId);
  if (!b) return;

  const target = document.getElementById('fullscreenCardTarget');
  if (!target) return;

  const screenStudio = b.deliveryStudio || 'Studio 1';
  const seatNumbers = Array.isArray(b.seats) ? b.seats.join(', ') : (b.seats || 'F21');
  const tz = LT.getCityTimeZone(b.city || 'Makassar');
  const posterSrc = getResolvedPoster(b);

  target.innerHTML = `
    <div class="classic-ticket-wrapper" style="margin:0;filter:drop-shadow(0 25px 50px rgba(0,0,0,0.9))">
      <div class="classic-ticket-card">
        <!-- Notches -->
        <div class="ticket-notch notch-left-top"></div>
        <div class="ticket-notch notch-left-bottom"></div>
        <div class="ticket-notch notch-right-top"></div>
        <div class="ticket-notch notch-right-bottom"></div>
        <div class="ticket-notch notch-middle-top"></div>
        <div class="ticket-notch notch-middle-bottom"></div>

        <!-- SISI KIRI: Deep Cinematic Blue -->
        <div class="ticket-main-blue">
          <div class="ticket-inner-border"></div>
          <div class="ticket-cinema-header">
            <div class="ticket-stars"></div>
            <div class="ticket-brand-tag">LAYARTIX CINEMA PASS</div>
          </div>
          <div class="ticket-movie-content">
            <img class="ticket-mini-poster" src="${posterSrc}" alt="${b.movieTitle}"
                 onerror="this.style.display='none'"/>
            <div class="ticket-movie-info">
              <h3 class="ticket-vintage-title" style="font-size:18px">${b.movieTitle}</h3>
              <div class="ticket-cinema-name">${b.cinemaName || 'LayarTix XXI'} (${b.city || 'Makassar'})</div>
              <div class="ticket-badges-row">
                <span class="ticket-pill-badge">${b.movieRating || '13+'}</span>
                <span class="ticket-pill-badge" style="color:#ffffff;border-color:rgba(255,255,255,0.3)">${b.seatType || 'Regular'}</span>
                <span class="ticket-pill-badge" style="color:#60a5fa;border-color:#3b82f6">${tz}</span>
              </div>
            </div>
          </div>
          <div class="ticket-specs-strip">
            <div class="spec-block">
              <span class="spec-label">DATE / TIME</span>
              <span class="spec-val">${b.date || 'Hari Ini'} · ${b.time || '19:00'} ${tz}</span>
            </div>
            <div class="spec-block" style="text-align:center">
              <span class="spec-label">SCREEN</span>
              <span class="spec-val gold">${screenStudio}</span>
            </div>
            <div class="spec-block" style="text-align:right">
              <span class="spec-label">SEAT</span>
              <span class="spec-val gold">${seatNumbers}</span>
            </div>
          </div>
        </div>

        <!-- Perforation -->
        <div class="ticket-perforation-divider"></div>

        <!-- SISI KANAN: Vintage Cream Stub -->
        <div class="ticket-stub-cream">
          <div class="stub-qr-box" id="qr-fullscreen-${b.id}"></div>
          <div class="stub-booking-id" style="font-size:12px;letter-spacing:1px">${b.id}</div>
          <div class="stub-admit-one">ADMIT ONE</div>
          <div style="font-size:9px;color:#64748b;margin-top:6px;font-weight:600;letter-spacing:0.05em">SCAN DI PINTU STUDIO</div>
        </div>
      </div>
    </div>
  `;

  setTimeout(() => { LT.generateQR(`qr-fullscreen-${b.id}`, b.qrData, 170); }, 50);

  // Request browser fullscreen on the modal container
  const modal = document.getElementById('fullscreenTicketModal');
  if (modal && modal.requestFullscreen) {
    modal.requestFullscreen().catch(err => console.warn('Fullscreen request failed:', err));
  }

  toggleFullscreenBrightness(false);
  if (modal) modal.classList.add('open');
}

function closeFullscreenTicket() {
  const modal = document.getElementById('fullscreenTicketModal');
  if (modal) modal.classList.remove('open');
  toggleFullscreenBrightness(false);
}

document.getElementById('fullscreenTicketModal')?.addEventListener('click', e => {
  if (e.target.id === 'fullscreenTicketModal') closeFullscreenTicket();
});

function toggleFullscreenBrightness(boost) {
  const modal = document.getElementById('fullscreenTicketModal');
  const btnMax = document.getElementById('btnFsMaxBright');
  const btnNorm = document.getElementById('btnFsNormBright');
  if (boost) {
    if (modal) modal.style.filter = 'brightness(1.3) contrast(1.1)';
    if (btnMax) btnMax.style.display = 'none';
    if (btnNorm) btnNorm.style.display = 'inline-block';
    LT.toast('Kecerahan layar ditingkatkan maksimal untuk scan e-ticket petugas bioskop!', 'info', 2000);
  } else {
    if (modal) modal.style.filter = 'none';
    if (btnMax) btnMax.style.display = 'inline-block';
    if (btnNorm) btnNorm.style.display = 'none';
  }
}

// QR Modal & Brightness booster
function showQr(bookingId) {
  const bookings = (typeof LT !== 'undefined' && typeof LT.getBookings === 'function') ? LT.getBookings() : [];
  const b = bookings.find(b => b.id === bookingId);
  if (!b) return;
  const seatStr = Array.isArray(b.seats) ? b.seats.join(', ') : (b.seats || 'F21');
  document.getElementById('qrBookingId').textContent = b.id;
  document.getElementById('qrMovieInfo').textContent = b.movieTitle;
  document.getElementById('qrCinemaInfo').textContent = `${b.cinemaName} · ${b.date} ${b.time} · ${seatStr}`;
  document.getElementById('qrDisplay').innerHTML = '';
  LT.generateQR('qrDisplay', b.qrData, 180);
  toggleBrightness(false);
  document.getElementById('qrModal').classList.add('open');
}

function closeQrModal() {
  document.getElementById('qrModal').classList.remove('open');
  toggleBrightness(false);
}

document.getElementById('qrModal').addEventListener('click', e => {
  if (e.target.id === 'qrModal') closeQrModal();
});

function toggleBrightness(boost) {
  const modal = document.querySelector('#qrModal .modal');
  const btnMax = document.getElementById('btnMaxBright');
  const btnNorm = document.getElementById('btnNormalBright');
  if (boost) {
    if (modal) modal.style.filter = 'brightness(1.3) contrast(1.1)';
    if (btnMax) btnMax.style.display = 'none';
    if (btnNorm) btnNorm.style.display = 'inline-block';
    LT.toast('Kecerahan ditingkatkan untuk kemudahan scan QR petugas bioskop! ', 'info', 2000);
  } else {
    if (modal) modal.style.filter = 'none';
    if (btnMax) btnMax.style.display = 'inline-block';
    if (btnNorm) btnNorm.style.display = 'none';
  }
}

// Cancel Modal
function openCancelModal(bookingId) {
  cancelBookingId = bookingId;
  const bookings = LT.getUserBookings(user.id);
  const b = bookings.find(b => b.id === bookingId);
  if (!b) return;
  const refund = Math.round((b.totalTicket || 0) * 0.4);
  document.getElementById('cancelMovieName').textContent = b.movieTitle;
  document.getElementById('cancelRefundAmt').textContent = LT.formatRp(refund);
  document.getElementById('cancelModal').classList.add('open');
}

function closeCancelModal() {
  document.getElementById('cancelModal').classList.remove('open');
  cancelBookingId = null;
}

document.getElementById('cancelModal').addEventListener('click', e => {
  if (e.target.id === 'cancelModal') closeCancelModal();
});

function confirmCancel() {
  if (!cancelBookingId) return;
  const bookings = LT.getBookings();
  const idx = bookings.findIndex(b => b.id === cancelBookingId);
  if (idx < 0) return;

  const b = bookings[idx];
  const refund = Math.round((b.totalTicket || 0) * 0.4);

  bookings[idx].status = 'cancelled';
  bookings[idx].refundAmount = refund;
  bookings[idx].cancelledAt = new Date().toISOString();
  LT.saveBookings(bookings);

  // Restore movie to Now Playing so it's visible on beranda again
  const allMovies = LT.getAllMovies();
  const movieToRestore = allMovies.find(m => m.id === b.movieId);
  if (movieToRestore) {
    LT.restoreNowPlayingMovie(movieToRestore);
  }

  closeCancelModal();
  LT.toast(`Tiket dibatalkan. Refund ${LT.formatRp(refund)} diproses ke rekening/e-wallet asal (1x24 jam) `, 'success', 4000);
  renderBookings();
}

// Journal Modal
function openJournalModal(bookingId, viewOnly) {
  journalBookingId = bookingId;
  const bookings = LT.getUserBookings(user.id);
  const b = bookings.find(b => b.id === bookingId);
  if (!b) return;

  const existing = LT.getJournalForBooking(bookingId);
  document.getElementById('journalMovieInfo').innerHTML = `<strong>${b.movieTitle}</strong> · ${b.cinemaName} · ${b.date}`;

  selectedRating = existing?.rating || 0;
  renderStars();

  document.getElementById('journalText').value = existing?.text || '';
  document.getElementById('journalPrivate').checked = existing?.private !== false;

  currentJournalPhoto = existing?.photo || null;
  const previewWrap = document.getElementById('journalPhotoPreviewWrap');
  const previewImg = document.getElementById('journalPhotoPreview');
  const uploadPrompt = document.getElementById('journalUploadPrompt');

  if (currentJournalPhoto) {
    if (previewImg) previewImg.src = currentJournalPhoto;
    if (previewWrap) previewWrap.style.display = 'block';
    if (uploadPrompt) uploadPrompt.style.display = 'none';
  } else {
    if (previewImg) previewImg.src = '';
    if (previewWrap) previewWrap.style.display = 'none';
    if (uploadPrompt) uploadPrompt.style.display = 'block';
  }

  if (viewOnly && existing) {
    document.getElementById('journalText').disabled = true;
    const dropZone = document.getElementById('journalDropZone');
    if (dropZone) dropZone.style.pointerEvents = 'none';
  } else {
    document.getElementById('journalText').disabled = false;
    const dropZone = document.getElementById('journalDropZone');
    if (dropZone) dropZone.style.pointerEvents = 'auto';
  }

  document.getElementById('journalModal').classList.add('open');
}

function handleJournalPhotoUpload(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    LT.toast('Silakan pilih file foto gambar (JPG, PNG, WEBP)!', 'warning');
    return;
  }

  // Compress / scale image to base64 so it can be saved in localStorage safely
  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image();
    img.onload = function() {
      const canvas = document.createElement('canvas');
      const maxDim = 800;
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        }
      } else {
        if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.75);
      currentJournalPhoto = compressedDataUrl;

      const previewWrap = document.getElementById('journalPhotoPreviewWrap');
      const previewImg = document.getElementById('journalPhotoPreview');
      const uploadPrompt = document.getElementById('journalUploadPrompt');

      if (previewImg) previewImg.src = currentJournalPhoto;
      if (previewWrap) previewWrap.style.display = 'block';
      if (uploadPrompt) uploadPrompt.style.display = 'none';
      LT.toast('Foto kenangan berhasil dipilih!', 'success');
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function removeJournalPhoto(e) {
  if (e) e.stopPropagation();
  currentJournalPhoto = null;
  const photoInput = document.getElementById('journalPhotoInput');
  if (photoInput) photoInput.value = '';
  const previewWrap = document.getElementById('journalPhotoPreviewWrap');
  const uploadPrompt = document.getElementById('journalUploadPrompt');
  if (previewWrap) previewWrap.style.display = 'none';
  if (uploadPrompt) uploadPrompt.style.display = 'block';
}

function closeJournalModal() {
  document.getElementById('journalModal').classList.remove('open');
  journalBookingId = null;
  currentJournalPhoto = null;
  const photoInput = document.getElementById('journalPhotoInput');
  if (photoInput) photoInput.value = '';
}

document.getElementById('journalModal').addEventListener('click', e => {
  if (e.target.id === 'journalModal') closeJournalModal();
});

function renderStars() {
  document.getElementById('starRating').innerHTML = [1, 2, 3, 4, 5].map(n =>
    `<button class="star-btn ${n <= selectedRating ? 'active' : ''}" onclick="setRating(${n})"
           style="filter:${n <= selectedRating ? 'none' : 'grayscale(1)'}"></button>`
  ).join('');
}

function setRating(n) {
  selectedRating = n;
  renderStars();
}

function saveJournal() {
  if (!journalBookingId) return;
  const text = document.getElementById('journalText').value.trim();
  if (!text) { LT.toast('Tulis catatan dulu ya!', 'warning'); return; }
  if (!selectedRating) { LT.toast('Berikan rating filmnya!', 'warning'); return; }

  LT.saveJournal({
    bookingId: journalBookingId,
    userId: user.id,
    rating: selectedRating,
    text,
    photo: currentJournalPhoto || '',
    private: document.getElementById('journalPrivate').checked,
    savedAt: new Date().toISOString()
  });

  closeJournalModal();
  LT.toast('Jurnal kenangan tersimpan', 'success');
  renderBookings();
}

// In-Seat Quick Order shortcut from Active Ticket card
function orderFnbToMySeat(bookingId) {
  const bookings = LT.getUserBookings(user.id);
  const b = bookings.find(x => x.id === bookingId);
  if (!b) return;

  // Save selected session cinema and seats for In-Seat delivery
  LT.save('selected_city', b.city || 'Makassar');
  const tempSession = {
    cinemaId: b.cinemaId,
    cinemaName: b.cinemaName,
    mall: b.mall || b.cinemaName,
    city: b.city || 'Makassar',
    selectedSeats: b.seats || ['E5'],
    movieTitle: b.movieTitle,
    date: b.date,
    time: b.time
  };
  LT.setSession(tempSession);
  LT.toast(`Membuka Kantin untuk ${b.cinemaName} (Kursi: ${(b.seats || []).join(', ')})... `, 'info', 2000);
  setTimeout(() => window.location.href = 'fnb.html', 400);
}

renderBookings();


// Poll reminders every 30 seconds
setInterval(checkShowtimeNotifications, 30000);
setTimeout(checkShowtimeNotifications, 1500);

// Admin header link check
if (user.role === 'admin') {
  const adminLink = document.getElementById('adminHeaderLink');
  if (adminLink) adminLink.style.display = 'inline-flex';
}

