// fnb.js — Kantin F&B, Cart & Multi-Payment (Split Bill) Logic for LayarTix
'use strict';

const user = LT.requireAuth('customer');
const session = LT.getSession();
const isBundling = !!(session.selectedSeats && session.selectedSeats.length > 0);

// Payment State (QRIS, VA, E-Wallet, Split Bill)
let selectedPaymentMethod = 'qris'; // 'qris' | 'va' | 'ewallet' | 'split'
let selectedVA = { name: 'BCA', number: '8214 0812 3456 7890' };
let selectedEwallet = 'GoPay';
let splitCount = 3;
let splitCollected = 0;
let splitContributors = [];

// Delivery Type: 'pickup' | 'in_seat'
let deliveryType = isBundling ? 'in_seat' : 'pickup';

function autoSyncSeatInfo() {
  const studioInput = document.getElementById('deliveryStudio');
  const seatInput = document.getElementById('deliverySeat');
  const syncBadge = document.getElementById('seatSyncBadge');
  const syncNotice = document.getElementById('seatSyncNotice');

  if (isBundling && session.selectedSeats?.length) {
    if (studioInput) studioInput.value = 'Studio 1';
    if (seatInput) seatInput.value = session.selectedSeats.join(', ');
    if (syncBadge) syncBadge.textContent = 'Auto-Sync Tiket Baru';
    if (syncNotice) syncNotice.textContent = `Tersinkronisasi otomatis dengan pemesanan tiket ${session.movieTitle || 'Film'} (Kursi: ${session.selectedSeats.join(', ')}).`;
    return;
  }

  // Standalone mode: Lookup user's latest active cinema booking from localStorage
  const activeBookings = (typeof LT !== 'undefined' && typeof LT.getUserBookings === 'function')
    ? LT.getUserBookings(user.id).filter(b => b.status === 'active')
    : [];

  if (activeBookings.length > 0) {
    const activeTicket = activeBookings[0];
    const seatsStr = (activeTicket.seats || []).join(', ') || 'D4';
    const studioStr = activeTicket.deliveryStudio || 'Studio 1';

    if (studioInput) studioInput.value = studioStr;
    if (seatInput) seatInput.value = seatsStr;
    if (syncBadge) {
      syncBadge.textContent = 'Auto-Sync Tiket Aktif';
      syncBadge.style.background = 'rgba(34,197,94,0.15)';
      syncBadge.style.color = '#22c55e';
    }
    if (syncNotice) {
      syncNotice.textContent = `Terkunci otomatis ke ${studioStr}, Kursi ${seatsStr} (${activeTicket.movieTitle} - ${activeTicket.cinemaName}). Makanan akan diantar langsung ke posisi duduk Anda.`;
    }

    // Also auto-sync pickup cinema to match the active ticket's cinema
    const select = document.getElementById('pickupCinemaSelect');
    if (select && activeTicket.cinemaId) {
      for (let i = 0; i < select.options.length; i++) {
        if (select.options[i].value === activeTicket.cinemaId || select.options[i].textContent.includes(activeTicket.cinemaName)) {
          select.selectedIndex = i;
          break;
        }
      }
    }
  } else {
    // Default fallback if no active tickets
    if (studioInput && !studioInput.value) studioInput.value = 'Studio 1';
    if (seatInput && !seatInput.value) seatInput.value = 'Kursi D4';
    if (syncBadge) {
      syncBadge.textContent = 'Default Kursi Studio';
      syncBadge.style.background = 'rgba(255,215,0,0.15)';
      syncBadge.style.color = '#ffd700';
    }
  }
}

function setDeliveryType(type) {
  deliveryType = type;
  const btnPickup = document.getElementById('btnDeliveryPickup');
  const btnInSeat = document.getElementById('btnDeliveryInSeat');
  const formBox = document.getElementById('inSeatFormBox');

  if (btnPickup) btnPickup.classList.toggle('active', type === 'pickup');
  if (btnInSeat) btnInSeat.classList.toggle('active', type === 'in_seat');
  if (formBox) {
    formBox.style.display = type === 'in_seat' ? 'block' : 'none';
    if (type === 'in_seat') {
      autoSyncSeatInfo();
    }
  }
}

// Mode setup
if (isBundling) {
  const backBtn = document.getElementById('fnbBackBtn');
  if (backBtn) backBtn.style.display = 'flex';
  const headerContainer = document.getElementById('headerTitleContainer');
  if (headerContainer) headerContainer.style.display = 'block';
  const modeBanner = document.getElementById('modeBanner');
  if (modeBanner) modeBanner.style.display = 'flex';

  const ht = document.getElementById('headerTitle');
  if (ht) ht.textContent = 'Bundling F&B & Pembayaran';
  const hs = document.getElementById('headerSubtitle');
  if (hs) hs.textContent = `${session.movieTitle || 'Film'} · ${session.selectedSeats.join(', ')}`;
  const mt = document.getElementById('modeTitle');
  if (mt) mt.textContent = `Bundling Tiket: ${session.movieTitle || ''}`;
  const md = document.getElementById('modeDesc');
  if (md) md.textContent = `${session.cinemaName || ''} · Kursi: ${session.selectedSeats.join(', ')}`;
  const mb = document.getElementById('modeBadge');
  if (mb) mb.textContent = 'Bundling Nonton';
  const cpr = document.getElementById('cinemaPickRow');
  if (cpr) cpr.style.display = 'none';

  // Auto-fill studio & seats for in-seat delivery from bundling session
  setTimeout(() => {
    setDeliveryType('in_seat');
    autoSyncSeatInfo();
  }, 100);
} else {
  // Mode navigasi tab langsung: bersihkan judul header pengantar
  const backBtn = document.getElementById('fnbBackBtn');
  if (backBtn) backBtn.style.display = 'none';
  const headerContainer = document.getElementById('headerTitleContainer');
  if (headerContainer) headerContainer.style.display = 'none';
  const modeBanner = document.getElementById('modeBanner');
  if (modeBanner) modeBanner.style.display = 'none';

  const ht = document.getElementById('headerTitle');
  if (ht) ht.textContent = '';
  const hs = document.getElementById('headerSubtitle');
  if (hs) hs.textContent = '';
  const mt = document.getElementById('modeTitle');
  if (mt) mt.textContent = '';

  const cpr = document.getElementById('cinemaPickRow');
  if (cpr) cpr.style.display = 'block';

  // Populate cinema select
  const city = LT.load('selected_city') || '';
  const cinemas = city ? LT.cinemas.filter(c => c.city.includes(city)) : LT.cinemas;
  const select = document.getElementById('pickupCinemaSelect');
  if (select) {
    select.innerHTML = (cinemas.length ? cinemas : LT.cinemas).map(c => `
      <option value="${c.id}" data-name="${c.name}" data-mall="${c.mall}" data-city="${c.city}">${c.name} (${c.mall})</option>
    `).join('');
  }

  // Check and auto-sync active ticket right away
  setTimeout(() => {
    autoSyncSeatInfo();
  }, 100);
}

function goBackOrHome() {
  if (isBundling) window.location.href = 'kursi.html';
  else window.location.href = 'beranda.html';
}

// F&B Cart & Split
const cart = {};
let splitEnabled = false;
let splitPeople = 2;

// Category Filter
const cats = ['Semua', 'Popcorn', 'Minuman', 'Makanan', 'Combo'];
let activeCat = 'Semua';
document.getElementById('catFilter').innerHTML = cats.map(c =>
  `<button class="cat-btn ${c === 'Semua' ? 'active' : ''}" onclick="setCat('${c}',this)">${c}</button>`
).join('');

function setCat(cat, btn) {
  activeCat = cat;
  document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderFnbGrid();
}

function renderFnbGrid() {
  const items = activeCat === 'Semua' ? LT.fnbMenu : LT.fnbMenu.filter(f => f.category === activeCat);
  document.getElementById('fnbGrid').innerHTML = items.map(f => {
    const qty = cart[f.id] || 0;
    return `<div class="fnb-item-card ${qty > 0 ? 'has-item' : ''}">
      <div class="fnb-emoji">${f.emoji}</div>
      <div class="fnb-name">${f.name}</div>
      <div class="fnb-desc">${f.desc}</div>
      <div class="fnb-price">${LT.formatRp(f.price)}</div>
      <div class="fnb-counter">
        <button class="counter-btn" onclick="changeQty('${f.id}',-1)">−</button>
        <div class="counter-qty">${qty}</div>
        <button class="counter-btn plus" onclick="changeQty('${f.id}',1)">+</button>
      </div>
    </div>`;
  }).join('');
  updateCartUI();
}

function changeQty(id, delta) {
  cart[id] = Math.max(0, (cart[id] || 0) + delta);
  renderFnbGrid();
  updateSplitCalc();
}

function getFnbSubtotal() {
  return Object.entries(cart).reduce((s, [id, qty]) => {
    const item = LT.fnbMenu.find(f => f.id === id);
    return s + (item ? item.price * qty : 0);
  }, 0);
}

function calculateTotals() {
  const ticketTotal = isBundling ? (session.totalTicket || 0) : 0;
  const fnbTotal = getFnbSubtotal();
  const subtotal = ticketTotal + fnbTotal;
  const tax = Math.round(subtotal * 0.1);
  const grand = subtotal + tax;
  return { ticketTotal, fnbTotal, subtotal, tax, grand };
}

function updateCartUI() {
  const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);
  const { grand } = calculateTotals();
  document.getElementById('cartItemCount').textContent = `${totalItems} makanan/minuman dipilih`;
  document.getElementById('cartSubtotal').textContent = LT.formatRp(grand);
}

// Switch View
function switchView(view) {
  if (view === 'checkout') {
    const { grand, fnbTotal } = calculateTotals();
    if (!isBundling && fnbTotal === 0) {
      LT.toast('Silakan pilih minimal 1 menu makanan/minuman', 'warning');
      return;
    }
    document.getElementById('viewMenu').style.display = 'none';
    document.getElementById('viewCheckout').style.display = 'block';
    document.getElementById('bottomCartBar').style.display = 'none';
    const tabsRow = document.getElementById('fnbTabsRow');
    if (tabsRow) tabsRow.style.display = 'flex';
    document.getElementById('tabBtnMenu').classList.remove('active');
    document.getElementById('tabBtnCheckout').classList.add('active');
    renderCheckoutView();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    document.getElementById('viewMenu').style.display = 'block';
    document.getElementById('viewCheckout').style.display = 'none';
    document.getElementById('bottomCartBar').style.display = 'flex';
    const tabsRow = document.getElementById('fnbTabsRow');
    if (tabsRow) tabsRow.style.display = 'none';
    document.getElementById('tabBtnMenu').classList.add('active');
    document.getElementById('tabBtnCheckout').classList.remove('active');
  }
}

function renderCheckoutView() {
  const { ticketTotal, fnbTotal, tax, grand } = calculateTotals();

  // Ticket rows (if bundling)
  if (isBundling) {
    document.getElementById('ticketSummaryRows').innerHTML = `
      <div class="summary-row">
        <span class="summary-label">Film</span>
        <span class="summary-value">${session.movieTitle || ''}</span>
      </div>
      <div class="summary-row">
        <span class="summary-label">Bioskop & Jam</span>
        <span class="summary-value">${session.cinemaName || ''} · ${session.time || ''}</span>
      </div>
      <div class="summary-row">
        <span class="summary-label">Kursi (${session.selectedSeats.length}x ${LT.formatRp(session.seatPrice)})</span>
        <span class="summary-value">${session.selectedSeats.join(', ')}</span>
      </div>
      <div class="summary-row">
        <span class="summary-label">Subtotal Tiket</span>
        <span class="summary-value">${LT.formatRp(ticketTotal)}</span>
      </div>
    `;
  } else {
    const select = document.getElementById('pickupCinemaSelect');
    const cinemaName = select?.options[select.selectedIndex]?.dataset.name || 'Bioskop Terpilih';
    document.getElementById('ticketSummaryRows').innerHTML = `
      <div class="summary-row">
        <span class="summary-label">Lokasi Pengambilan F&B</span>
        <span class="summary-value">${cinemaName}</span>
      </div>
    `;
  }

  // F&B item rows
  const fnbRows = Object.entries(cart).filter(([, q]) => q > 0).map(([id, qty]) => {
    const f = LT.fnbMenu.find(f => f.id === id);
    return `<div class="summary-row">
      <span class="summary-label">${f.emoji} ${f.name} x${qty}</span>
      <span class="summary-value">${LT.formatRp(f.price * qty)}</span>
    </div>`;
  }).join('');

  document.getElementById('fnbSummaryRows').innerHTML = fnbRows || (isBundling ? '' : '<div class="summary-row"><span class="summary-label">Belum ada makanan dipilih</span></div>');
  document.getElementById('taxDisplay').textContent = LT.formatRp(tax);
  document.getElementById('grandTotalDisplay').textContent = LT.formatRp(grand);

  // If split was enabled in menu, default to split payment method
  if (splitEnabled) {
    setPaymentMethod('split');
  } else {
    setPaymentMethod(selectedPaymentMethod || 'qris');
  }
}

// PAYMENT METHODS IMPLEMENTATION
function setPaymentMethod(method) {
  selectedPaymentMethod = method;
  ['qris', 'va', 'ewallet', 'split'].forEach(m => {
    const pill = document.getElementById('pm_' + m);
    if (pill) pill.classList.toggle('active', m === method);
    const box = document.getElementById('payBox_' + m);
    if (box) box.style.display = (m === method) ? 'block' : 'none';
  });

  const { grand } = calculateTotals();
  const payBtn = document.getElementById('payFinalBtn');

  if (method === 'qris') {
    LT.generateQR('qrisContainer', `LAYARTIX-QRIS|ID:${Date.now()}|TOTAL:${grand}`, 160);
    payBtn.textContent = ' Konfirmasi Pembayaran QRIS';
    payBtn.style.opacity = '1';
    payBtn.style.pointerEvents = 'auto';
  } else if (method === 'va') {
    payBtn.textContent = ` Salin VA & Bayar (${selectedVA.name})`;
    payBtn.style.opacity = '1';
    payBtn.style.pointerEvents = 'auto';
  } else if (method === 'ewallet') {
    payBtn.textContent = ` Bayar via ${selectedEwallet}`;
    payBtn.style.opacity = '1';
    payBtn.style.pointerEvents = 'auto';
  } else if (method === 'split') {
    initSplitTracker(grand);
  }
}

function selectVA(name, num, btn) {
  selectedVA = { name, number: num };
  document.querySelectorAll('#payBox_va .va-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  const disp = document.getElementById('vaNumberDisplay');
  if (disp) disp.textContent = num;
  const payBtn = document.getElementById('payFinalBtn');
  if (selectedPaymentMethod === 'va') {
    payBtn.textContent = `Salin VA & Bayar (${selectedVA.name})`;
  }
}

function copyAndSimulateVA() {
  const num = selectedVA.number;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(num.replace(/\s+/g, '')).catch(() => { });
  }
  LT.toast(`Nomor VA ${selectedVA.name} (${num}) berhasil disalin! Memverifikasi...`, 'info', 1000);
  const statusEl = document.getElementById('vaStatusText');
  if (statusEl) statusEl.textContent = 'Nomor VA disalin. Pembayaran diverifikasi...';

  // Verifikasi cepat tanpa delay berbelit
  setTimeout(() => {
    simulateVAPaymentSuccess();
  }, 400);
}

function simulateVAPaymentSuccess() {
  const statusEl = document.getElementById('vaStatusText');
  if (statusEl) {
    statusEl.innerHTML = '<span style="color:#22c55e;font-weight:700">Pembayaran VA Berhasil Diverifikasi! Status: LUNAS</span>';
  }
  processPayment(`Transfer Bank VA (${selectedVA.name} Lunas)`);
}

function selectEwallet(name, btn) {
  selectedEwallet = name;
  document.querySelectorAll('#payBox_ewallet .va-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  const payBtn = document.getElementById('payFinalBtn');
  if (selectedPaymentMethod === 'ewallet') {
    payBtn.textContent = `Buka & Bayar via ${selectedEwallet}`;
  }

  // Simulasi deep linking instan ketika logo/nama e-wallet diklik
  triggerEwalletDeepLink(name);
}

function triggerEwalletDeepLink(name) {
  LT.toast(`Membuka ${name}... Pembayaran terverifikasi otomatis.`, 'info', 800);
  setTimeout(() => {
    processPayment(`E-Wallet (${name} Terverifikasi)`);
  }, 300);
}

function changeSplitCount(delta) {
  splitCount = Math.max(2, Math.min(8, splitCount + delta));
  const el = document.getElementById('splitCountVal');
  if (el) el.textContent = splitCount;
  const { grand } = calculateTotals();
  initSplitTracker(grand);
}

function initSplitTracker(grand) {
  const cu = LT.getCurrentUser();
  const perPerson = Math.ceil(grand / splitCount);
  const tag = document.getElementById('splitPerPersonTag');
  if (tag) tag.textContent = LT.formatRp(perPerson);
  const targetDisp = document.getElementById('splitTargetDisplay');
  if (targetDisp) targetDisp.textContent = LT.formatRp(grand);

  // 1 QR CODE GABUNGAN
  LT.generateQR('splitQrContainer', `LAYARTIX-SPLIT-1QR|PEOPLE:${splitCount}|TOTAL:${grand}|CODE:${Date.now()}`, 160);

  // Host pays 1 share initially
  splitCollected = perPerson;
  splitContributors = [];
  splitContributors.push({
    name: (cu?.name || 'Anda') + ' (Host Pemesan)',
    amount: perPerson,
    status: 'lunas',
    time: 'Baru saja'
  });

  for (let i = 2; i <= splitCount; i++) {
    splitContributors.push({
      name: `Teman #${i}`,
      amount: perPerson,
      status: 'pending',
      time: '-'
    });
  }

  renderSplitTracker(grand);
}

function renderSplitTracker(grand) {
  const pct = Math.min(100, Math.round((splitCollected / grand) * 100));
  const pctEl = document.getElementById('splitStatusPercent');
  if (pctEl) pctEl.textContent = pct + '%';
  const bar = document.getElementById('splitProgressBar');
  if (bar) bar.style.width = pct + '%';
  const colEl = document.getElementById('splitCollectedDisplay');
  if (colEl) colEl.textContent = LT.formatRp(splitCollected);

  const list = document.getElementById('splitContributorsList');
  if (list) {
    list.innerHTML = splitContributors.map(c => `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 8px;border-radius:8px;background:${c.status === 'lunas' ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.03)'};border:1px solid ${c.status === 'lunas' ? 'rgba(34,197,94,0.3)' : 'transparent'}">
        <div style="display:flex;align-items:center;gap:6px">
          <span>${c.status === 'lunas' ? '' : ''}</span>
          <span style="font-weight:600;color:${c.status === 'lunas' ? '#22c55e' : 'var(--text)'}">${c.name}</span>
        </div>
        <div style="text-align:right">
          <span style="font-weight:700;color:${c.status === 'lunas' ? '#22c55e' : 'var(--muted)'}">${LT.formatRp(c.amount)}</span>
          <span style="font-size:10px;display:block;color:${c.status === 'lunas' ? '#22c55e' : '#ef4444'}">${c.status === 'lunas' ? 'LUNAS' : 'Belum bayar'}</span>
        </div>
      </div>
    `).join('');
  }

  const btnSim = document.getElementById('btnSimulateFriend');
  if (btnSim) {
    const hasPending = splitContributors.some(c => c.status === 'pending');
    btnSim.style.display = hasPending ? 'block' : 'none';
  }

  updateSplitPayBtn();
}

function simulateFriendPayment() {
  const { grand } = calculateTotals();
  const nextFriend = splitContributors.find(c => c.status === 'pending');
  if (!nextFriend) {
    LT.toast('Semua teman sudah melunasi patungan!', 'success');
    return;
  }
  nextFriend.status = 'lunas';
  nextFriend.time = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  splitCollected = Math.min(grand, splitCollected + nextFriend.amount);

  LT.toast(` ${nextFriend.name} berhasil scan 1 QR & membayar ${LT.formatRp(nextFriend.amount)}!`, 'success');
  renderSplitTracker(grand);

  if (splitCollected >= grand) {
    setTimeout(() => {
      LT.toast(' Seluruh patungan lunas 100%! Tiket diterbitkan...', 'success');
      setTimeout(() => processPayment('Split Bill (1 QR Gabungan Lunas)'), 1200);
    }, 600);
  }
}

function updateSplitPayBtn() {
  const { grand } = calculateTotals();
  const payBtn = document.getElementById('payFinalBtn');
  if (selectedPaymentMethod !== 'split') return;

  if (splitCollected >= grand) {
    payBtn.textContent = ' Patungan Lunas! Terbitkan Tiket';
    payBtn.style.opacity = '1';
    payBtn.style.pointerEvents = 'auto';
  } else {
    payBtn.textContent = ` Menunggu Pembayaran Teman (${LT.formatRp(grand - splitCollected)} lagi)`;
    payBtn.style.opacity = '0.7';
    payBtn.style.pointerEvents = 'auto';
  }
}

function processPayment(overrideMethod) {
  const { ticketTotal, fnbTotal, tax, grand } = calculateTotals();
  const cu = LT.getCurrentUser();

  const method = overrideMethod || (
    selectedPaymentMethod === 'qris' ? 'QRIS Standar (BCA/Mandiri/GoPay/OVO)' :
      selectedPaymentMethod === 'va' ? `Transfer Bank VA (${selectedVA.name})` :
        selectedPaymentMethod === 'ewallet' ? `E-Wallet (${selectedEwallet})` :
          'Split Bill (1 QR Gabungan)'
  );

  const fnbItems = Object.entries(cart).filter(([, q]) => q > 0).map(([id, qty]) => {
    const f = LT.fnbMenu.find(f => f.id === id);
    return { id: f.id, name: f.name, emoji: f.emoji, price: f.price, qty };
  });

  const studioInput = document.getElementById('deliveryStudio')?.value.trim();
  const seatInput = document.getElementById('deliverySeat')?.value.trim();
  const isInSeatDelivery = (deliveryType === 'in_seat');

  if (isBundling) {
    // Complete Movie Ticket + Bundling Booking
    const bookingId = LT.generateId('LTX');
    const movieTitleVal = session.movieTitle || 'Avatar: Fire & Ash';
    const cinemaNameVal = session.cinemaName || 'XXI Trans Studio Mall Makassar';
    const mallVal = session.mall || 'Trans Studio Mall';
    const cityVal = session.city || 'Makassar';
    const dateVal = session.date || new Date().toISOString().split('T')[0];
    const timeVal = session.time || '19:00';
    const seatsVal = (session.selectedSeats && session.selectedSeats.length) ? session.selectedSeats : ['C5', 'C6'];
    let posterVal = session.poster;
    if (!posterVal) {
      try {
        const npRaw = localStorage.getItem('layartix_now_playing');
        if (npRaw) {
          const parsed = JSON.parse(npRaw);
          const foundM = parsed.find(x => x.id === session.movieId);
          if (foundM && foundM.poster) posterVal = foundM.poster;
        }
      } catch (e) {}
    }
    const currentUserId = cu?.id || (user ? user.id : 'GUEST');
    const screenStudio = studioInput || session.screenStudio || 'Studio 1';

    const booking = {
      id: bookingId,
      userId: currentUserId,
      movieId: session.movieId || 'm_avatar3',
      movieTitle: movieTitleVal,
      movieRating: session.movieRating || 'D13',
      cinemaId: session.cinemaId || 'c_mks_1',
      cinemaName: cinemaNameVal,
      mall: mallVal,
      city: cityVal,
      date: dateVal,
      time: timeVal,
      seats: seatsVal,
      seatType: session.seatType || 'Regular',
      ticketPrice: session.seatPrice || 75000,
      totalTicket: ticketTotal || (seatsVal.length * (session.seatPrice || 75000)),
      fnbItems,
      totalFnb: fnbTotal,
      tax,
      grandTotal: grand,
      status: 'active',
      splitBill: (selectedPaymentMethod === 'split'),
      splitPeople: (selectedPaymentMethod === 'split') ? splitCount : null,
      paymentMethod: method,
      paidAt: new Date().toISOString(),
      qrData: `LAYARTIX|${bookingId}|${movieTitleVal}|${cinemaNameVal}|${seatsVal.join(',')}`,
      poster: posterVal,
      inSeatDelivery: fnbItems.length > 0 && isInSeatDelivery,
      deliveryStudio: screenStudio,
      deliverySeat: seatInput || seatsVal.join(', '),
      deliveryStatus: fnbItems.length > 0 && isInSeatDelivery ? 'preparing' : null,
      deliveryStatusTime: new Date().toISOString()
    };

    // Pastikan notifikasi tiket tersimpan di session
    if (typeof LT !== 'undefined' && typeof LT.setSession === 'function') {
      LT.setSession({ bookingId: booking.id, booking });
    }

    // Gunakan fungsi helper global saveAndRedirectToTickets
    if (typeof window.saveAndRedirectToTickets === 'function') {
      window.saveAndRedirectToTickets(booking);
    } else {
      LT.addBooking(booking);
      window.location.href = 'tiket.html';
    }
  } else {
    // Standalone Kantin F&B Order
    const select = document.getElementById('pickupCinemaSelect');
    const opt = select ? select.options[select.selectedIndex] : null;
    const orderId = LT.generateId('FNB');
    const order = {
      id: orderId,
      userId: cu?.id || 'GUEST',
      cinemaId: select ? select.value : 'C1',
      cinemaName: opt?.dataset.name || 'Bioskop',
      items: fnbItems,
      subtotal: fnbTotal,
      tax,
      total: grand,
      paymentMethod: method,
      orderedAt: new Date().toISOString(),
      status: isInSeatDelivery ? 'preparing' : 'ready_for_pickup',
      deliveryType: isInSeatDelivery ? 'in_seat' : 'pickup',
      deliveryStudio: studioInput || 'Studio 1',
      deliverySeat: seatInput || 'Kursi Penonton',
      deliveryStatus: isInSeatDelivery ? 'preparing' : null,
      deliveryStatusTime: new Date().toISOString(),
      qrData: `FNB-ORDER|${orderId}|${cu?.name || 'Customer'}|${grand}`
    };
    LT.addFnbOrder(order);
    window.location.href = 'tiket.html';
  }
}

renderFnbGrid();

