/**
 * LayarTix Customer Bioskop & Jam Tayang Controller
 * customer/js/bioskop_jam.js
 */

const user = LT.requireAuth('customer');
const session = LT.getSession();
if (!session.movieId) window.location.href = 'beranda.html';

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

let movie = allMovies.find(m => m.id === session.movieId);
if (!movie && session.movieTitle) {
  movie = {
    id: session.movieId,
    title: session.movieTitle,
    rating: session.movieRating || 'SU',
    genre: session.movieGenre || 'Film',
    duration: session.movieDuration || 120,
    price_base: session.price_base || 65000,
    poster: session.poster || ''
  };
}
if (movie) {
  if (session.poster) {
    movie.poster = session.poster;
  }
}
if (!movie) window.location.href = 'beranda.html';

const city = LT.getSelectedCity();
const cityDisplay = document.getElementById('cityDisplay');
if (cityDisplay) cityDisplay.textContent = city || 'Makassar';

// Movie prominent info banner
const rb = LT.getRatingBadge(movie.rating);
const titleHeader = document.getElementById('movieTitleHeader');
const ratingHeader = document.getElementById('movieRatingHeader');
const miniInfo = document.getElementById('movieMiniInfo');

if (titleHeader) titleHeader.textContent = movie.title;
if (ratingHeader) ratingHeader.textContent = `${movie.genre} · ${movie.duration} mnt`;
if (miniInfo) {
  miniInfo.innerHTML = `
    <img src="${movie.poster}" style="width:72px;height:102px;object-fit:cover;border-radius:10px;box-shadow:0 4px 16px rgba(0,0,0,0.5);"
         onerror="this.style.display='none'"/>
    <div style="flex:1">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
        <span class="badge" style="background:${rb.bg};color:${rb.color};font-size:10px;padding:2px 8px">${rb.label}</span>
        <span style="font-size:12px;color:var(--muted)">${movie.duration} menit</span>
      </div>
      <div style="font-size:16px;font-weight:800;line-height:1.2;margin-bottom:4px">${movie.title}</div>
      <div style="font-size:12px;color:var(--muted)">${movie.genre}</div>
    </div>
    <div style="text-align:right">
      <div style="font-size:10px;color:var(--muted)">Mulai dari</div>
      <div style="font-size:16px;font-weight:800;color:var(--gold)">${LT.formatRp(movie.price_base)}</div>
    </div>
  `;
}

// Date tabs
let selectedDate = '';
let selectedSeatType = 'Regular';
let pendingTime = null;
let pendingCinema = null;

function buildDateTabs() {
  const now = new Date();
  const container = document.getElementById('dateTabs');
  if (!container) return;
  let html = '';
  for (let i = 0; i < 8; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    const val = d.toISOString().split('T')[0];
    const day = d.toLocaleDateString('id-ID', { weekday: 'short' });
    const date = d.getDate();
    const month = d.toLocaleDateString('id-ID', { month: 'short' });
    if (!selectedDate) selectedDate = val;
    html += `<button class="date-tab ${i === 0 ? 'active' : ''}" id="dTab-${val}" onclick="selectDate('${val}',this)">
      <div style="font-size:9px;text-transform:uppercase">${day}</div>
      <div class="date-day">${date}</div>
      <div class="date-mon">${month}</div>
    </button>`;
  }
  container.innerHTML = html;
}

function selectDate(val, btn) {
  selectedDate = val;
  document.querySelectorAll('.date-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  renderCinemas();
}

function setSeatType(type, btn) {
  selectedSeatType = type;
  document.querySelectorAll('.seat-type-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  renderCinemas();
}

function renderCinemas() {
  let cinemas = LT.getCinemasForCity ? LT.getCinemasForCity(city) : LT.cinemas.filter(c => !city || c.city.toLowerCase().includes(city.toLowerCase()) || city.toLowerCase().includes(c.city.toLowerCase()));
  if (!cinemas || !cinemas.length) cinemas = LT.cinemas;
  const container = document.getElementById('cinemasList');
  if (!container) return;

  container.innerHTML = cinemas.map(c => {
    const isShowing = LT.isMovieShowingAtCinema(movie.id, c);

    // KONDISI: Jika film tidak sedang tayang di mall ini, tampilkan kartu disabled dengan tulisan jelas
    if (!isShowing) {
      return `<div class="cinema-card unavailable" style="opacity:0.8;background:rgba(239,68,68,0.03);border:1px dashed rgba(239,68,68,0.35);">
        <div class="cinema-header" style="background:rgba(239,68,68,0.06);border-bottom:1px dashed rgba(239,68,68,0.2)">
          <div style="display:flex;justify-content:space-between;align-items:flex-start">
            <div>
              <div class="cinema-name" style="color:rgba(255,255,255,0.75)">${c.name}</div>
              <div class="cinema-mall"> ${c.mall}, ${c.city}</div>
            </div>
            <span class="badge" style="background:rgba(239,68,68,0.15);color:#ef4444;border:1px solid rgba(239,68,68,0.3);font-size:10px;font-weight:700;padding:3px 8px;border-radius:6px">
              TIDAK TAYANG
            </span>
          </div>
          <div class="cinema-facilities" style="opacity:0.6">
            ${c.facilities.map(f => `<span class="facility-tag">${f}</span>`).join('')}
          </div>
        </div>
        <div style="padding:18px 16px;text-align:center;">
          <div style="font-size:13px;font-weight:700;color:#ef4444;margin-bottom:4px">
             Untuk saat ini film ini tidak tersedia di mall ini
          </div>
          <div style="font-size:11px;color:var(--muted)">
            Film "${movie.title}" saat ini belum dijadwalkan di ${c.name}. Silakan pilih mall lain yang masih menayangkan.
          </div>
        </div>
      </div>`;
    }

    // KONDISI: Film sedang tayang di mall ini
    const hasType = c.facilities.includes(selectedSeatType) || selectedSeatType === 'Regular';
    const availTimes = hasType ? LT.times : [];

    const pm = c.priceMultiplier || { Regular: 1, Premium: 1.4, IMAX: 1.8 };
    const basePrice = Number(movie.price_base) || Number(session.price_base) || 65000;
    let price = Math.round(basePrice * (Number(pm[selectedSeatType]) || 1));
    if (movie && movie.prices) {
      if (selectedSeatType === 'Regular' && movie.prices.regular) {
        price = Number(movie.prices.regular);
      } else if ((selectedSeatType === 'Premiere' || selectedSeatType === 'Premium') && movie.prices.premiere) {
        price = Number(movie.prices.premiere);
      } else if (selectedSeatType === 'IMAX' && movie.prices.imax) {
        price = Number(movie.prices.imax);
      }
    }
    const parking = LT.getCinemaParkingSlots(c);

    return `<div class="cinema-card">
      <div class="cinema-header">
        <div style="display:flex;justify-content:space-between;align-items:flex-start">
          <div>
            <div class="cinema-name">${c.name}</div>
            <div class="cinema-mall"> ${c.mall}, ${c.city}</div>
          </div>
          <div style="text-align:right">
            <div style="font-size:10px;color:var(--muted)">per tiket</div>
            <div style="font-size:14px;font-weight:700;color:var(--gold)">${LT.formatRp(price)}</div>
          </div>
        </div>
        <div class="cinema-facilities">
          ${c.facilities.map(f => `<span class="facility-tag">${f}</span>`).join('')}
        </div>
      </div>

      <!-- Real-Time Motor & Mobil Parking Info Widget -->
      <div style="margin:10px 14px 4px;padding:10px 12px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:10px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
          <span style="font-size:11px;font-weight:700;color:var(--text);letter-spacing:0.04em">SLOT PARKIR REAL-TIME:</span>
          <span style="font-size:10px;color:#22c55e;font-weight:600">● Live Sensor</span>
        </div>
        
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          <!-- Mobil Summary -->
          <div style="background:rgba(59,130,246,0.08);border:1px solid rgba(59,130,246,0.25);border-radius:8px;padding:6px 8px">
            <div style="display:flex;justify-content:space-between;font-size:10px;font-weight:700;color:#60a5fa">
              <span>MOBIL</span>
              <span>Sisa ${parking.totalCarAvailable}</span>
            </div>
            <div style="font-size:10px;color:rgba(255,255,255,0.6);margin-top:2px">
              ${parking.car[0].area.split('(')[0]}: <strong style="color:${parking.car[0].status.color}">${parking.car[0].status.label.split('(')[0]}</strong>
            </div>
          </div>

          <!-- Motor Summary -->
          <div style="background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.25);border-radius:8px;padding:6px 8px">
            <div style="display:flex;justify-content:space-between;font-size:10px;font-weight:700;color:#34d399">
              <span>MOTOR</span>
              <span>Sisa ${parking.totalMotorAvailable}</span>
            </div>
            <div style="font-size:10px;color:rgba(255,255,255,0.6);margin-top:2px">
              ${parking.motor[0].area.split('(')[0]}: <strong style="color:${parking.motor[0].status.color}">${parking.motor[0].status.label.split('(')[0]}</strong>
            </div>
          </div>
        </div>
      </div>

      <div class="cinema-times">
        <div class="times-label">Jam Tayang — ${new Date(selectedDate + 'T12:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
        ${availTimes.length ? `<div class="time-pills">
          ${LT.times.map((t, i) => `
            <button class="time-pill ${i === 3 || i === 4 ? 'almost-full' : ''}" 
                    onclick="selectTime('${c.id}','${t}','${selectedDate}',${price})">
              ${t}
              ${i === 3 || i === 4 ? '<br><span style="font-size:9px;opacity:0.7">hampir habis</span>' : ''}
            </button>
          `).join('')}
        </div>`
        : `<div style="font-size:13px;color:var(--muted)">Tipe kursi ${selectedSeatType} tidak tersedia di bioskop ini</div>`}
      </div>
    </div>`;
  }).join('');
}

function selectTime(cinemaId, time, date, price) {
  const currentCityCinemas = LT.getCinemasForCity ? LT.getCinemasForCity(city) : [];
  let cinema = LT.cinemas.find(c => c.id === cinemaId) || currentCityCinemas.find(c => c.id === cinemaId);
  if (!cinema) {
    cinema = {
      id: cinemaId,
      name: 'Cinema ' + city,
      mall: 'Mall ' + city,
      city: city
    };
  }
  const numericPrice = Number(price) || Number(movie.price_base) || 65000;
  pendingCinema = cinema;
  pendingTime = { time, date, price: numericPrice };

  // Check age warning
  if (LT.needsAgeWarning(movie.rating)) {
    const warn = LT.getAgeWarningText(movie.rating);
    const box = document.getElementById('ageModalBox');
    if (box) box.style.borderColor = warn.color;
    document.getElementById('ageBadge').textContent = warn.age;
    document.getElementById('ageBadge').style.color = warn.color;
    document.getElementById('ageTitle').textContent = warn.title;
    document.getElementById('ageTitle').style.color = warn.color;
    document.getElementById('ageText').textContent = warn.text;
    document.getElementById('ageModal').classList.add('open');
  } else {
    proceedToSeat();
  }
}

function confirmAge() {
  closeAgeModal();
  proceedToSeat();
}

function closeAgeModal() {
  const modal = document.getElementById('ageModal');
  if (modal) modal.classList.remove('open');
}

function proceedToSeat() {
  const session = LT.getSession();
  const ticketPrice = Number(pendingTime.price) || 65000;
  LT.setSession({
    ...session,
    cinemaId: pendingCinema.id,
    cinemaName: pendingCinema.name,
    mall: pendingCinema.mall,
    city: pendingCinema.city,
    date: pendingTime.date,
    time: pendingTime.time,
    seatType: selectedSeatType,
    seatPrice: ticketPrice,
    ticketPrice: ticketPrice
  });
  window.location.href = 'kursi.html';
}

buildDateTabs();
renderCinemas();


// ── Cross-tab sync: perubahan film/harga dari Admin ──
window.addEventListener('storage', (e) => {
  if (
    e.key === 'layartix_now_playing' ||
    e.key === 'layartix_admin_update'
  ) {
    // Reload data film terbaru (harga bisa berubah dari Admin)
    LT.initMovies();
    allMovies = LT.getAllMovies();
    try {
      const npRaw = localStorage.getItem('layartix_now_playing');
      if (npRaw) {
        const parsed = JSON.parse(npRaw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          allMovies = [...parsed, ...allMovies.filter(m => !parsed.find(p => p.id === m.id))];
        }
      }
    } catch (ex) {}
    renderCinemas();
  }
});
