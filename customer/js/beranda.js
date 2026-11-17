/**
 * LayarTix Customer Beranda Controller
 * customer/js/beranda.js
 */

// ── Auth Check & Dynamic Greeting ──
const user = LT.requireAuth('customer');
if (user) {
  const avatarEl = document.getElementById('userAvatar');
  const avatarFallback = avatarEl?.querySelector('.user-avatar-fallback');
  if (avatarFallback) {
    avatarFallback.textContent = user.avatar || '';
  } else if (avatarEl && !avatarEl.querySelector('.user-avatar-img')) {
    avatarEl.textContent = user.avatar || '';
  }
  if (typeof syncAllUserAvatars === 'function') {
    syncAllUserAvatars();
  }

  // Admin link visibility: Hanya tampil jika role akun adalah admin
  const adminHeaderLink = document.getElementById('adminHeaderLink');
  if (adminHeaderLink) {
    if (user.role === 'admin') {
      adminHeaderLink.style.display = 'inline-flex';
    } else {
      adminHeaderLink.style.display = 'none';
    }
  }

  // Greeting by time of day
  const hour = new Date().getHours();
  let timeGreeting = 'Selamat Malam';
  if (hour >= 4 && hour < 11) timeGreeting = 'Selamat Pagi';
  else if (hour >= 11 && hour < 15) timeGreeting = 'Selamat Siang';
  else if (hour >= 15 && hour < 18) timeGreeting = 'Selamat Sore';

  const userName = user.name ? user.name.split(' ')[0] : 'Sobat Nonton';

  const greetingTime = document.getElementById('greetingTime');
  const greetingName = document.getElementById('greetingName');
  if (greetingTime) greetingTime.textContent = `${timeGreeting},`;
  if (greetingName) greetingName.textContent = `${userName} `;

  const mobGreetingTime = document.getElementById('mobileGreetingTime');
  const mobGreetingName = document.getElementById('mobileGreetingName');
  if (mobGreetingTime) mobGreetingTime.textContent = `${timeGreeting},`;
  if (mobGreetingName) mobGreetingName.textContent = `${userName} `;
}

// -------------------------------------------------------------------
// -------------------------------------------------------------------
// DEFAULT SEED DATA — hanya digunakan jika localStorage kosong
const _defaultNowPlaying = [
  { id: "m_clayface", title: "Clayface", genre: "Thriller, Horror, Drama, Sci-fi", rating: "D17+", duration: 105, price_base: 65000, poster: "../assets/images/clayface.jpg", synopsis: "Transformasi mengerikan seorang aktor yang terobsesi dengan kesempurnaan hingga berubah menjadi entitas mematikan." },
  { id: "m_kuasagelap", title: "Kuasa Gelap: Perjanjian Darah", genre: "Horror", rating: "D17+", duration: 120, price_base: 65000, poster: "../assets/images/kuasa-gelap.jpg", synopsis: "Teror supranatural mencekam dari masa lalu yang menagih janji darah kelam." },
  { id: "m_pirunduk", title: "Pirunduk", genre: "Horror", rating: "D17+", duration: 96, price_base: 60000, poster: "../assets/images/pirunduk.png", synopsis: "Kisah horor menegangkan tentang sekumpulan remaja yang terjebak di gedung terlarang." },
  { id: "m_bapakjujur", title: "Bapak Paling Jujur", genre: "Comedy", rating: "SU / 13+", duration: 103, price_base: 60000, poster: "../assets/images/bapak-paling-jujur.jpg", synopsis: "Kisah komedi keluarga yang hangat." },
  { id: "m_streetfighter", title: "Street Fighter", genre: "Action, Drama", rating: "D17+", duration: 125, price_base: 65000, poster: "../assets/images/street-fighter.jpg", synopsis: "Pertarungan jalanan yang epik antara legenda beladiri." },
  { id: "m_ibu", title: "Ibu, Bagaimana Aku Tanpamu?", genre: "Drama, Family", rating: "SU / 13+", duration: 111, price_base: 55000, poster: "../assets/images/ibu-bagaimana-aku-tanpamu.jpg", synopsis: "Drama emosional tentang ikatan ibu-anak yang diuji oleh waktu." },
  { id: "m_sitivampir", title: "Siti Si Vampir", genre: "Horror, Comedy", rating: "13+", duration: 98, price_base: 55000, poster: "https://picsum.photos/seed/sitivampir2026/400/600", synopsis: "Kisah humor gelap tentang vampir muda yang mencari identitas." },
  { id: "m_othermommy", title: "Other Mommy", genre: "Horror, Thriller", rating: "D17+", duration: 104, price_base: 60000, poster: "https://picsum.photos/seed/othermommy2026/400/600", synopsis: "Misteri mengerikan di balik peran seorang ibu." },
  { id: "m_residentevil", title: "Resident Evil (2026)", genre: "Action, Sci-fi, Horror", rating: "D17+", duration: 118, price_base: 70000, poster: "https://picsum.photos/seed/residentevil2026/400/600", synopsis: "Kelanjutan epik melawan wabah bioteror." },
  { id: "m_beautifulpain", title: "Beautiful Pain", genre: "Romance, Drama", rating: "13+", duration: 110, price_base: 55000, poster: "https://picsum.photos/seed/beautifulpain2026/400/600", synopsis: "Cinta yang tumbuh di tengah penderitaan." },
  { id: "m_wargarusan", title: "Warga Rusun 609", genre: "Comedy, Horror", rating: "D17+", duration: 95, price_base: 60000, poster: "https://picsum.photos/seed/wargarusan2026/400/600", synopsis: "Komedi horor tentang penghuni apartemen seram." },
  { id: "m_verity", title: "Verity", genre: "Thriller, Mystery", rating: "D17+", duration: 115, price_base: 65000, poster: "https://picsum.photos/seed/verity2026/400/600", synopsis: "Intrik misteri yang mengungkap kebenaran tersembunyi." },
  { id: "m_henryfirstdate", title: "Henry's First Date", genre: "Romance, Comedy", rating: "13+", duration: 97, price_base: 55000, poster: "https://picsum.photos/seed/henryfirstdate2026/400/600", synopsis: "Kencan pertama Henry yang lucu dan canggung." },
  { id: "m_empatmusim", title: "Empat Musim Pertiwi", genre: "Family Drama", rating: "SU / 13+", duration: 115, price_base: 55000, poster: "https://picsum.photos/seed/empatmusim2026/400/600", synopsis: "Drama keluarga puitis tentang kepulangan Pertiwi ke kampung halaman." }
];

const _defaultUpcoming = [
  { id: "m_whalefall", title: "Whalefall", genre: "Adventure, Drama, Horror, Thriller", rating: "D17+", duration: 106, poster: "../assets/images/whalefall.jpg", synopsis: "Petualangan mistik di kedalaman laut yang menyingkap rahasia kuno.", cast: "Daniel Kraus, MTV Books", director: "Daniel Kraus", status: "upcoming", releaseDate: "2026-11-28" },
  { id: "m_lingsirwengi", title: "Lingsir Wengi: Motel Malioboro", genre: "Horror, Adventure", rating: "D17+", duration: 102, poster: "../assets/images/lingsir-wengi-motel-malioboro.jpg", synopsis: "Malam menakutkan di motel yang menyimpan kutukan gelap.", cast: "Ochi Rosdiana, Jeff Smith", director: "Adhe Dharmastriya", status: "upcoming", releaseDate: "2026-12-05" },
  { id: "m_dune_messiah", title: "Dune: Messiah", genre: "Sci-fi, Adventure", rating: "D17+", duration: 130, poster: "../assets/images/dune-messiah.jpg", synopsis: "Kelanjutan epik saga Dune, mengikuti pemberontakan dan takdir Paul Atreides.", cast: "Timothee Chalamet, Zendaya, Florence Pugh", director: "Denis Villeneuve", status: "upcoming", releaseDate: "2026-12-18" },
  { id: "m_toystory5", title: "Toy Story 5", genre: "Animasi, Petualangan, Keluarga", rating: "SU", duration: 104, poster: "../assets/images/toy-story-5.jpg", synopsis: "Woody, Buzz Lightyear, dan kawan-kawan menghadapi tantangan era modern.", cast: "Tom Hanks, Tim Allen, Joan Cusack", director: "Andrew Stanton", status: "upcoming", releaseDate: "2026-12-25" },
  { id: "m_aplikasiblis", title: "Aplikasi Iblis", genre: "Horror, Techno-Thriller", rating: "D17+", duration: 102, poster: "https://picsum.photos/seed/aplikasiblis2026/400/600", synopsis: "Aplikasi misterius yang mengendalikan pikiran penggunanya.", cast: "Bio One, Caitlin Halderman", director: "Kimo Stamboel", status: "upcoming", releaseDate: "2027-01-08" },
  { id: "m_avengersendgame", title: "Avengers Endgame: Encore", genre: "Action, Superhero", rating: "SU / 13+", duration: 185, poster: "https://picsum.photos/seed/avengers2026/400/600", synopsis: "Kemunculan kembali para pahlawan dalam pertempuran akhir.", cast: "Robert Downey Jr., Chris Evans", director: "Anthony & Joe Russo", status: "upcoming", releaseDate: "2027-01-15" }
];

/**
 * seedMoviesIfEmpty — Hanya seed data awal jika localStorage BENAR-BENAR kosong.
 * TIDAK pernah menghapus/menimpa data yang sudah dimodifikasi Admin.
 */
function seedMoviesIfEmpty() {
  const isSeeded = localStorage.getItem('layartix_movies_initialized');
  if (isSeeded) return; // Sudah diinisialisasi, jangan timpa perubahan Admin!

  const npRaw = localStorage.getItem('layartix_now_playing');
  const csRaw = localStorage.getItem('layartix_coming_soon');
  try {
    const npArr = npRaw ? JSON.parse(npRaw) : null;
    const csArr = csRaw ? JSON.parse(csRaw) : null;
    if (!Array.isArray(npArr)) {
      localStorage.setItem('layartix_now_playing', JSON.stringify(_defaultNowPlaying));
    }
    if (!Array.isArray(csArr)) {
      localStorage.setItem('layartix_coming_soon', JSON.stringify(_defaultUpcoming));
    }
    localStorage.setItem('layartix_movies', JSON.stringify([..._defaultNowPlaying, ..._defaultUpcoming]));
    localStorage.setItem('layartix_movies_initialized', 'true');
  } catch (e) {
    localStorage.setItem('layartix_now_playing', JSON.stringify(_defaultNowPlaying));
    localStorage.setItem('layartix_coming_soon', JSON.stringify(_defaultUpcoming));
    localStorage.setItem('layartix_movies', JSON.stringify([..._defaultNowPlaying, ..._defaultUpcoming]));
    localStorage.setItem('layartix_movies_initialized', 'true');
  }
}

/**
 * renderMovieCards — Render kartu film dari data localStorage (sudah termasuk
 * perubahan Admin CRUD). Dipanggil saat DOMContentLoaded dan saat storage event.
 */
function renderMovieCards() {
  let nowPlayingMovies = LT.getNowPlaying();
  let upcomingMovies   = LT.getComingSoon();

  const npCountEl = document.getElementById('nowPlayingCount');
  const csCountEl = document.getElementById('comingSoonCount');
  if (npCountEl) npCountEl.textContent = `${nowPlayingMovies.length} film`;
  if (csCountEl) csCountEl.textContent = `${upcomingMovies.length} film`;

  const container = document.getElementById('nowPlayingList') || document.getElementById('movies-container') || document.querySelector('.movie-grid');
  if (container) {
    container.innerHTML = nowPlayingMovies.length ? nowPlayingMovies.map(m => `
        <div class="movie-card" style="cursor:pointer;" onclick="showMovieDetail('${m.id}')">
          <div class="movie-poster-wrap">
            <span class="movie-rating-badge" style="background:rgba(239,68,68,0.9);color:#fff">${m.rating || '13+'}</span>
            <img src="${m.poster}" alt="${m.title}" class="movie-poster" loading="lazy" onerror="this.src='https://picsum.photos/seed/${m.id}/400/600'"/>
          </div>
          <div class="movie-info">
            <div class="movie-title" title="${m.title}">${m.title}</div>
            <div class="movie-meta">
              <span class="movie-genre" title="${m.genre}">${m.genre}</span>
              <span style="font-weight:600;color:var(--text);font-size:11px">${m.duration}m</span>
            </div>
          </div>
        </div>`).join('') : '<div style="padding:16px;color:var(--muted);font-size:13px">Belum ada film sedang tayang</div>';
  }

  const csContainer = document.getElementById('comingSoonList');
  if (csContainer) {
    csContainer.innerHTML = upcomingMovies.length ? upcomingMovies.map(m => `
        <div class="movie-card coming-overlay" style="cursor:pointer;" onclick="showMovieDetail('${m.id}')">
          <div class="movie-poster-wrap">
            <span class="movie-rating-badge" style="background:rgba(59,130,246,0.9);color:#fff">${m.rating || 'R13+'}</span>
            <img src="${m.poster}" alt="${m.title}" class="movie-poster" style="filter:brightness(0.75)" loading="lazy" onerror="this.src='https://picsum.photos/seed/${m.id}/400/600'"/>
          </div>
          <div class="movie-info">
            <div class="movie-title" title="${m.title}">${m.title}</div>
            <div class="movie-meta">
              <span class="movie-genre" title="${m.genre}">${m.genre}</span>
              <span style="font-weight:600;color:var(--text);font-size:11px">${m.duration}m</span>
            </div>
            ${m.releaseDate ? `<div style="font-size:10px;color:var(--gold);margin-top:auto;padding-top:4px;font-weight:600"> ${new Date(m.releaseDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</div>` : ''}
          </div>
        </div>`).join('') : '<div style="padding:16px;color:var(--muted);font-size:13px">Belum ada film akan datang</div>';
  }
}

// Fallback helper pemesanan instan jika dipanggil langsung
window.addTicketFromMovie = function(movie) {
  if (typeof movie === 'string') {
    handleBookingClick(movie);
  } else if (movie && movie.id) {
    handleBookingClick(movie.id);
  }
};


// Ensure movies are initialized and rendered after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  seedMoviesIfEmpty();   // seed HANYA jika localStorage kosong
  renderMovieCards();    // render dari localStorage (termasuk Admin CRUD)
  LT.initMovies();       // sinkronkan ke LT store untuk modul lain
});
// ── Cross-tab & same-tab sync: dengarkan perubahan Admin CRUD ──
window.addEventListener('storage', (e) => {
  if (
    e.key === 'layartix_now_playing' ||
    e.key === 'layartix_coming_soon' ||
    e.key === 'layartix_admin_update'
  ) {
    renderMovieCards();
    if (typeof buildHero === 'function')       buildHero();
    if (typeof renderMovieLists === 'function') renderMovieLists();
  }
});
// -------------------------------------------------------------------

// ── City Initialization (Default: Makassar) ──
const currentCity = LT.getSelectedCity();
const cityNameEl = document.getElementById('cityName');
if (cityNameEl) cityNameEl.textContent = currentCity;

// ── Hero Carousel & Strategic Partner Banners ──
let heroIdx = 0;
let heroSlidesData = [];

// Banner Iklan Sponsor & Mitra Strategis LayarTix
const partnerBanners = [
  {
    type: 'sponsor',
    title: 'Diskon 50% Tiket Nonton dengan QRIS BCA',
    subtitle: 'Maks. Cashback Rp 25.000 setiap Jumat-Minggu di seluruh jaringan bioskop mitra LayarTix',
    badge: ' BANK PARTNER',
    tagColor: '#3b82f6',
    image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80',
    btnText: 'Klaim Promo',
    btnAction: "LT.toast('Pilih metode QRIS BCA saat pembayaran untuk mendapatkan diskon 50%!','info',4000)"
  },
  {
    type: 'sponsor',
    title: 'Cashback 40% & Saldo Points bareng GoPay & OVO',
    subtitle: 'Nonton film hemat & nikmati poin reward transaksi untuk setiap pembelian tiket bioskop',
    badge: ' E-WALLET PARTNER',
    tagColor: '#00d2d3',
    image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=800&q=80',
    btnText: 'Gunakan E-Wallet',
    btnAction: "LT.toast('Pilih metode E-Wallet (GoPay/OVO/DANA) saat checkout tiket!','info',4000)"
  },
  {
    type: 'sponsor',
    title: 'Paket Bundling Popcorn XXI & Coca-Cola Spesial',
    subtitle: 'Hemat hingga Rp 35.000 untuk paket combo jumbo renyah langsung ambil di loket F&B bioskop',
    badge: ' F&B SPONSOR',
    tagColor: '#ffd700',
    image: 'https://images.unsplash.com/photo-1585647347483-22b66260dfff?auto=format&fit=crop&w=800&q=80',
    btnText: 'Pesan Snack',
    btnAction: "window.location.href='fnb.html'"
  }
];

function buildHero() {
  const nowPlaying = LT.getNowPlaying();
  const featuredMovies = nowPlaying.slice(0, 3).map(m => ({
    type: 'movie',
    id: m.id,
    title: m.title,
    subtitle: `${m.genre} · ${m.duration} mnt`,
    badge: LT.getRatingBadge(m.rating).label,
    tagColor: LT.getRatingBadge(m.rating).color,
    image: m.poster,
    btnText: 'Pesan Tiket',
    btnAction: `showMovieDetail('${m.id}')`
  }));

  // Gabungkan film blockbuster dengan banner sponsor mitra
  heroSlidesData = [...featuredMovies, ...partnerBanners];

  const slidesEl = document.getElementById('heroSlides');
  const dotsEl = document.getElementById('heroDots');
  if (!slidesEl) return;

  slidesEl.innerHTML = heroSlidesData.map(item => {
    return `<div class="hero-slide">
      <img src="${item.image}" alt="${item.title}" loading="lazy" onerror="this.src='https://picsum.photos/seed/${item.title}/600/300'"/>
      <div class="hero-overlay">
        <div class="hero-rating">
          <span class="badge" style="background:rgba(0,0,0,0.6);color:${item.tagColor};border:1px solid ${item.tagColor}40">
            ${item.badge}
          </span>
        </div>
        <div class="hero-title">${item.title}</div>
        <div class="hero-genre">${item.subtitle}</div>
        <button class="btn btn-primary btn-sm" style="margin-top:10px;padding:8px 18px;width:fit-content" onclick="${item.btnAction}">
          ${item.type === 'movie' ? ' ' : ' '} ${item.btnText}
        </button>
      </div>
    </div>`;
  }).join('');

  if (dotsEl) {
    dotsEl.innerHTML = heroSlidesData.map((_, i) =>
      `<div class="hero-dot ${i === 0 ? 'active' : ''}" id="dot-${i}" onclick="goToSlide(${i})"></div>`
    ).join('');
  }
}

function goToSlide(idx) {
  if (!heroSlidesData.length) return;
  heroIdx = (idx + heroSlidesData.length) % heroSlidesData.length;
  const slidesEl = document.getElementById('heroSlides');
  if (slidesEl) slidesEl.style.transform = `translateX(-${heroIdx * 100}%)`;
  document.querySelectorAll('.hero-dot').forEach((d, i) => d.classList.toggle('active', i === heroIdx));
}

buildHero();
const heroTimer = setInterval(() => goToSlide(heroIdx + 1), 4500);

// Swipe Support
const heroWrap = document.getElementById('heroWrap');
if (heroWrap) {
  let touchStart = 0;
  heroWrap.addEventListener('touchstart', e => touchStart = e.touches[0].clientX);
  heroWrap.addEventListener('touchend', e => {
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) goToSlide(heroIdx + (diff > 0 ? 1 : -1));
  });
}

// ── Smooth Scroll Helper ──
function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' });
  }
}

// ── Movie Filtering & Lists ──
let genreFilter = 'all';

function filterByGenre(genre, btn) {
  genreFilter = genre;
  document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  renderMovieLists();
}

function renderMovieLists() {
  // Read directly from localStorage
  const npAll = LT.getNowPlaying();
  const csAll = LT.getComingSoon();

  const filterFn = m => genreFilter === 'all' || (m.genre && m.genre.toLowerCase().includes(genreFilter.toLowerCase()));

  const np = npAll.filter(filterFn);
  const cs = csAll.filter(filterFn);

  const npCountEl = document.getElementById('nowPlayingCount');
  const csCountEl = document.getElementById('comingSoonCount');
  if (npCountEl) npCountEl.textContent = `${np.length} film`;
  if (csCountEl) csCountEl.textContent = `${cs.length} film`;

  const npList = document.getElementById('nowPlayingList');
  if (npList && !npList.querySelector('.btn-primary')) {
    npList.innerHTML = np.length
      ? np.map(m => movieCardHTML(m, false)).join('')
      : '<div style="padding:0 16px;color:var(--muted);font-size:13px">Semua tiket film ini telah Anda miliki di menu Tiket!</div>';
  }

  const csList = document.getElementById('comingSoonList');
  if (csList) {
    csList.innerHTML = cs.length
      ? cs.map(m => movieCardHTML(m, true)).join('')
      : '<div style="padding:0 16px;color:var(--muted);font-size:13px">Tidak ada film akan datang</div>';
  }
}

function movieCardHTML(m, isComing) {
  const rb = LT.getRatingBadge(m.rating);
  return `<div class="movie-card ${isComing ? 'coming-overlay' : ''}" onclick="showMovieDetail('${m.id}')">
    <div class="movie-poster-wrap">
      <span class="movie-rating-badge" style="background:${rb.bg};color:${rb.color}">${rb.label}</span>
      <img class="movie-poster" src="${m.poster}" alt="${m.title}"
           onerror="this.src='https://picsum.photos/seed/${m.id}/180/270'"
           ${isComing ? 'style="filter:brightness(0.75)"' : ''}/>
    </div>
    <div class="movie-info">
      <div class="movie-title" title="${m.title}">${m.title}</div>
      <div class="movie-meta">
        <span class="movie-genre" title="${m.genre}">${m.genre}</span>
        <span style="font-weight:600;color:var(--text)">${m.duration}m</span>
      </div>
      ${isComing && m.releaseDate ? `<div style="font-size:10px;color:var(--gold);margin-top:auto;padding-top:4px;font-weight:600"> ${new Date(m.releaseDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</div>` : ''}
    </div>
  </div>`;
}

// ── TIX Rekreasi Data (TIX ID Style) ──
const tixAttractionsData = [
  {
    id: 'att_1',
    category: 'Taman Rekreasi',
    title: 'Trans Studio Mall Makassar Theme Park',
    loc: 'TSM Makassar, Sulawesi Selatan',
    price: 185000,
    rating: '4.8 ',
    thumb: 'https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 'att_2',
    category: 'Aquarium & Edukasi',
    title: 'Jakarta Aquarium & Safari Neo Soho',
    loc: 'Grogol Petamburan, Jakarta',
    price: 175000,
    rating: '4.9 ',
    thumb: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 'att_3',
    category: 'Wahana Hiburan',
    title: 'Dufan Ancol Wonder Day Pass',
    loc: 'Ancol, Jakarta Utara',
    price: 220000,
    rating: '4.7 ',
    thumb: 'https://images.unsplash.com/photo-1576085898323-218337e3e43c?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 'att_4',
    category: 'Alam & Resort',
    title: 'Taman Safari Indonesia Puncak',
    loc: 'Bogor, Jawa Barat',
    price: 240000,
    rating: '4.9 ',
    thumb: 'https://images.unsplash.com/photo-1534567153574-2b12153a87f0?auto=format&fit=crop&w=500&q=80'
  }
];

function renderEventsAndAttractions() {
  const attractionsContainer = document.getElementById('attractionsList');
  if (attractionsContainer) {
    attractionsContainer.innerHTML = tixAttractionsData.map(a => `
      <div class="event-card" onclick="LT.toast('Voucher Rekreasi ${a.title} dapat ditukarkan di loket atraksi!','info',3000)">
        <img class="event-thumb" src="${a.thumb}" alt="${a.title}" onerror="this.src='https://picsum.photos/seed/${a.id}/250/130'"/>
        <div class="event-body">
          <div class="flex items-center justify-between mb-1">
            <span class="event-category" style="color:#22c55e"> ${a.category}</span>
            <span class="text-[10px] font-bold text-amber-400">${a.rating}</span>
          </div>
          <div class="event-title">${a.title}</div>
          <div class="event-loc"> ${a.loc}</div>
          <div class="event-footer">
            <span class="text-[10px] text-gray-400">Harga Tiket</span>
            <span class="event-price" style="color:#22c55e">${LT.formatRp(a.price)}</span>
          </div>
        </div>
      </div>
    `).join('');
  }
}

// renderMovieLists();
renderEventsAndAttractions();

// ── Movie Detail Modal (Informasi Film Bersih & Spoiler-Free) ──
let activeDetailMovieId = null;

function showMovieDetail(movieId) {
  const allMovies = LT.getAllMovies();
  const m = allMovies.find(x => x.id === movieId);
  if (!m) return;

  activeDetailMovieId = movieId;
  const rb = LT.getRatingBadge(m.rating);
  const advisory = LT.getContentAdvisory(m.rating, m.genre);
  const isComing = m.status === 'coming_soon' || m.status === 'upcoming';

  const modalContent = document.getElementById('movieModalContent');
  if (!modalContent) return;

  modalContent.innerHTML = `
    <div class="md:flex md:flex-row max-h-[88vh] overflow-y-auto">
      <!-- SISI KIRI: POSTER & BANNER INFO -->
      <div class="relative md:w-5/12 flex-shrink-0 bg-black/40">
        <img src="${m.poster}" alt="${m.title}" style="width:100%;height:260px;object-fit:cover;filter:brightness(0.7);"
             class="md:h-72 md:rounded-tl-2xl"
             onerror="this.src='https://picsum.photos/seed/${m.id}/480/280'"/>
        <div class="absolute inset-0 bg-gradient-to-t from-[#10111a] via-black/40 to-transparent flex items-end p-4">
          <div>
            <span class="badge" style="background:${rb.bg};color:${rb.color};font-weight:800;font-size:11px;margin-bottom:6px">${rb.label}</span>
            <div style="font-size:22px;font-weight:800;line-height:1.2;color:#fff">${m.title}</div>
            <div style="font-size:12px;color:var(--muted);margin-top:4px">${m.genre} · ${m.duration} mnt</div>
          </div>
        </div>
        <button onclick="closeMovieModal()" style="position:absolute;top:12px;right:12px;background:rgba(0,0,0,0.65);border:1px solid rgba(255,255,255,0.2);color:#fff;width:34px;height:34px;border-radius:50%;font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:10"></button>

        <!-- BATASAN USIA & CONTENT ADVISORY (TRANSPARAN UNTUK KELUARGA) -->
        <div class="p-4 bg-white/[0.02] border-t border-b md:border-b-0 border-white/10">
          <div class="flex items-center justify-between mb-2">
            <div class="text-xs font-bold text-amber-400 flex items-center gap-1.5">
              <span>CONTENT ADVISORY & SENSOR</span>
            </div>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded" style="background:${advisory.bg};color:${advisory.color};border:1px solid ${advisory.color}40">
              ${advisory.badge}
            </span>
          </div>
          <div class="text-[11px] text-gray-300 font-medium mb-3">${advisory.label}</div>
          <div class="space-y-2">
            ${advisory.items.map(it => `
              <div class="advisory-item-row">
                <div class="flex-1">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold text-white">${it.tag}</span>
                    <span class="text-[10px] text-amber-300 font-semibold px-1.5 py-0.2 rounded bg-amber-500/10">${it.level}</span>
                  </div>
                  <div class="text-[11px] text-gray-400 mt-0.5">${it.desc}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- SISI KANAN: SINOPSIS ESENSIAL & INFORMASI FILM BEBAS SPOILER -->
      <div class="p-5 md:p-6 md:w-7/12 flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
            <span class="text-xs font-bold uppercase tracking-wider text-amber-400">
              ${isComing ? 'INFORMASI FILM SEGERA TAYANG' : 'SINOPSIS & DETAIL FILM'}
            </span>
            ${m.releaseDate ? `<span class="text-[11px] font-semibold text-sky-400 bg-sky-500/10 px-2.5 py-0.5 rounded-full border border-sky-500/30">Tayang: ${new Date(m.releaseDate).toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'})}</span>` : ''}
          </div>

          <!-- DETAIL SINOPSIS & KREDIT -->
          <div id="modalTabInfo">
            <div style="font-size:13px;color:rgba(255,255,255,0.78);line-height:1.7;margin-bottom:16px">${m.synopsis}</div>
            
            <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px">
              <div style="background:var(--card);border:1px solid var(--border);border-radius:10px;padding:10px 14px;flex:1;min-width:110px">
                <div style="font-size:10px;color:var(--muted);margin-bottom:3px">SUTRADARA</div>
                <div style="font-size:13px;font-weight:600">${m.director || '–'}</div>
              </div>
              <div style="background:var(--card);border:1px solid var(--border);border-radius:10px;padding:10px 14px;flex:2;min-width:140px">
                <div style="font-size:10px;color:var(--muted);margin-bottom:3px">PEMERAN / AKTOR UTAMA</div>
                <div style="font-size:13px;font-weight:600">${m.cast || '–'}</div>
              </div>
            </div>

            <div style="display:flex;gap:8px;margin-bottom:18px">
              <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:10px 14px;flex:1">
                <div style="font-size:10px;color:var(--muted)">DURASI & GENRE</div>
                <div style="font-size:13px;font-weight:700;color:#fff">${m.duration} Menit · <span style="color:var(--gold)">${m.genre}</span></div>
              </div>
              ${isComing && m.releaseDate ? `<div style="background:rgba(59,130,246,0.1);border:1px solid rgba(59,130,246,0.25);border-radius:10px;padding:10px 14px;text-align:center;flex:1">
                <div style="font-size:10px;color:var(--muted)">ESTIMASI RILIS</div>
                <div style="font-size:13px;font-weight:700;color:#3b82f6">${new Date(m.releaseDate).toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'})}</div>
              </div>` : ''}
              ${!isComing ? `<div style="background:rgba(255,215,0,0.1);border:1px solid rgba(255,215,0,0.25);border-radius:10px;padding:10px 14px;text-align:center;flex:1">
                <div style="font-size:10px;color:var(--muted)">MULAI DARI</div>
                <div style="font-size:16px;font-weight:700;color:var(--gold)">${LT.formatRp(m.price_base)}</div>
              </div>` : ''}
            </div>
          </div>
        </div>

        <!-- Tombol Aksi / Penutup Modal -->
        ${!isComing ? `
        <div class="pt-4 border-t border-white/10 mt-2">
          <button class="btn btn-primary btn-full py-3.5 text-sm font-bold" onclick="handleBookingClick('${m.id}')"> Pilih Jadwal & Beli Tiket</button>
        </div>
        ` : `
        <div class="pt-4 border-t border-white/10 mt-2">
          <button class="btn btn-outline btn-full py-3 text-sm font-semibold border-white/20 text-white hover:bg-white/10" onclick="closeMovieModal()">Tutup Pengenalan Film</button>
        </div>
        `}
      </div>
    </div>
  `;
  document.getElementById('movieModal').classList.add('open');
}

function closeMovieModal() {
  const modal = document.getElementById('movieModal');
  if (modal) modal.classList.remove('open');
}

// ── Age Rating Warning Check (13+, 17+, 21+) ──
let pendingBookingMovieId = null;

function handleBookingClick(movieId) {
  let allMovies = (typeof LT !== 'undefined' && typeof LT.getAllMovies === 'function') ? LT.getAllMovies() : [];
  let m = allMovies.find(x => x.id === movieId);
  
  if (!m) {
    try {
      const storedNowPlaying = JSON.parse(localStorage.getItem('layartix_now_playing') || '[]');
      m = storedNowPlaying.find(x => x.id === movieId);
    } catch(e) {}
  }
  
  if (!m) {
    console.error('Film tidak ditemukan untuk ID:', movieId);
    return;
  }

  const ratingStr = (m.rating || '').toUpperCase();
  // Hanya lewati jika SU (Semua Umur)
  const isRestricted = ratingStr !== 'SU' && ratingStr !== 'SEMUA UMUR';

  if (isRestricted) {
    pendingBookingMovieId = movieId;
    closeMovieModal();
    openAgeWarningModal(m);
  } else {
    proceedToBooking(movieId);
  }
}

function openAgeWarningModal(movie) {
  const modal = document.getElementById('ageWarningModal');
  if (!modal) {
    proceedToBooking(movie.id);
    return;
  }
  const ratingStr = (movie.rating || '').toUpperCase();
  let ratingText = '13 TAHUN KE ATAS (13+)';
  let messageText = 'Perhatian: Film ini berating 13+. Apakah usia Anda sudah 13 tahun ke atas?';

  if (ratingStr === 'D21' || ratingStr === '21+') {
    ratingText = '21 TAHUN KE ATAS (21+)';
    messageText = 'Perhatian: Film ini berating 21+. Apakah usia Anda sudah 21 tahun ke atas?';
  } else if (ratingStr === 'D17' || ratingStr === '17+') {
    ratingText = '17 TAHUN KE ATAS (17+)';
    messageText = 'Perhatian: Film ini berating 17+. Apakah usia Anda sudah 17 tahun ke atas?';
  }

  const badgeEl = document.getElementById('ageModalRatingBadge');
  const titleEl = document.getElementById('ageModalMovieTitle');
  const descEl = document.getElementById('ageModalRatingDesc');
  const msgEl = document.getElementById('ageModalMessage');

  if (badgeEl) badgeEl.textContent = movie.rating || '17+';
  if (titleEl) titleEl.textContent = movie.title;
  if (descEl) descEl.textContent = ratingText;
  if (msgEl) msgEl.textContent = messageText;

  modal.classList.add('open');
}

function closeAgeWarningModal() {
  const modal = document.getElementById('ageWarningModal');
  if (modal) modal.classList.remove('open');
  pendingBookingMovieId = null;
}

function confirmAgeWarning() {
  if (pendingBookingMovieId) {
    const id = pendingBookingMovieId;
    closeAgeWarningModal();
    proceedToBooking(id);
  }
}

function proceedToBooking(movieId) {
  let allMovies = (typeof LT !== 'undefined' && typeof LT.getAllMovies === 'function') ? LT.getAllMovies() : [];
  let m = allMovies.find(x => x.id === movieId);
  if (!m) {
    try {
      const storedNowPlaying = JSON.parse(localStorage.getItem('layartix_now_playing') || '[]');
      m = storedNowPlaying.find(x => x.id === movieId);
    } catch(e) {}
  }
  LT.setSession({
    movieId,
    movieTitle: m?.title || '',
    movieRating: m?.rating || 'SU',
    poster: m?.poster || '',
    price_base: m?.price_base || 65000
  });
  closeMovieModal();
  window.location.href = 'bioskop_jam.html';
}

// Close detail on backdrop
const movieModalEl = document.getElementById('movieModal');
if (movieModalEl) {
  movieModalEl.addEventListener('click', e => {
    if (e.target.id === 'movieModal') closeMovieModal();
  });
}

// ── City Modal Controller ──
function openCityModal() {
  renderCityGrid(LT.cities);
  const modal = document.getElementById('cityModal');
  if (modal) modal.classList.add('open');
  const search = document.getElementById('citySearch');
  if (search) {
    search.value = '';
    setTimeout(() => search.focus(), 300);
  }
}

function closeCityModal() {
  const modal = document.getElementById('cityModal');
  if (modal) modal.classList.remove('open');
}

function filterCities(q) {
  const filtered = LT.cities.filter(c => c.toLowerCase().includes(q.toLowerCase()));
  renderCityGrid(filtered);
}

function renderCityGrid(cities) {
  const saved = LT.getSelectedCity();
  const grid = document.getElementById('cityGrid');
  if (!grid) return;
  grid.innerHTML = cities.map(c => `
    <button class="city-btn ${c === saved ? 'selected' : ''}" onclick="selectCity('${c}')">
      <span></span>
      <span>${c}</span>
    </button>
  `).join('');
}

function selectCity(city) {
  LT.setSelectedCity(city);
  const nameEl = document.getElementById('cityName');
  if (nameEl) nameEl.textContent = city;
  closeCityModal();
  LT.toast('Kota aktif diubah ke ' + city, 'success');
  renderMovieLists();
}

const cityModalEl = document.getElementById('cityModal');
if (cityModalEl) {
  cityModalEl.addEventListener('click', e => {
    if (e.target.id === 'cityModal') closeCityModal();
  });
}
