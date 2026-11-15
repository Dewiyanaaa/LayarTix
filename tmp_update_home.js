const fs = require('fs');
const path = 'd:/LayarTix/data.js';
let content = fs.readFileSync(path, 'utf8');

const movies = [
  {
    id: 'm_bapakjujur',
    title: 'Bapak Paling Jujur',
    genre: 'Comedy',
    rating: 'SU / 13+',
    duration: 103,
    status: 'now_playing',
    price_base: 60000,
    poster: 'https://picsum.photos/seed/bapakjujur2026/400/600',
    synopsis: 'Kisah komedi keluarga yang hangat dan mengocok perut tentang kejujuran seorang ayah yang justru memicu kekacauan lucu dalam kesehariannya.',
    cast: '',
    director: '',
    language: 'Indonesia',
    releaseDate: '2026-10-01'
  },
  {
    id: 'm_kuasagelap',
    title: 'Kuasa Gelap: Perjanjian Darah',
    genre: 'Horror',
    rating: 'D17+',
    duration: 120,
    status: 'now_playing',
    price_base: 65000,
    poster: 'https://picsum.photos/seed/kuasagelap2026/400/600',
    synopsis: 'Teror supranatural mencekam dari masa lalu yang menagih janji darah kelam dan mengancam keselamatan seluruh anggota keluarga.',
    cast: '',
    director: '',
    language: 'Indonesia',
    releaseDate: '2026-09-15'
  },
  {
    id: 'm_seporsimie',
    title: 'Seporsi Mie Ayam Sebelum Mati',
    genre: 'Drama',
    rating: '13+',
    duration: 112,
    status: 'now_playing',
    price_base: 55000,
    poster: 'https://picsum.photos/seed/seporsimie2026/400/600',
    synopsis: 'Perjalanan emosional menyentuh hati tentang harapan, penyesalan, dan makna kehidupan di balik semangkuk mie ayam terakhir sebelum perpisahan.',
    cast: '',
    director: '',
    language: 'Indonesia',
    releaseDate: '2026-08-20'
  },
  {
    id: 'm_lautbercerita',
    title: 'Laut Bercerita',
    genre: 'Historical Drama',
    rating: '13+',
    duration: 130,
    status: 'now_playing',
    price_base: 70000,
    poster: 'https://picsum.photos/seed/lautbercerita2026/400/600',
    synopsis: 'Adaptasi kisah menyayat hati tentang persahabatan, perjuangan aktivis mahasiswa, serta penantian panjang keluarga yang kehilangan di era kelam sejarah.',
    cast: '',
    director: '',
    language: 'Indonesia',
    releaseDate: '2026-07-05'
  },
  {
    id: 'm_empatmusim',
    title: 'Empat Musim Pertiwi',
    genre: 'Family Drama',
    rating: 'SU / 13+',
    duration: 115,
    status: 'now_playing',
    price_base: 62000,
    poster: 'https://picsum.photos/seed/empatmusim2026/400/600',
    synopsis: 'Drama keluarga puitis tentang kepulangan Pertiwi ke kampung halaman, merajut kembali luka lama dan kehangatan rumah melewati pergantian empat musim.',
    cast: '',
    director: '',
    language: 'Indonesia',
    releaseDate: '2026-06-10'
  }
];

const replacement = 'defaultNowPlaying: ' + JSON.stringify(movies, null, 2) + ',';
content = content.replace(/defaultNowPlaying:\s*\[[\s\S]*?\],/, replacement);
fs.writeFileSync(path, content, 'utf8');
console.log('Home page film catalog updated');
