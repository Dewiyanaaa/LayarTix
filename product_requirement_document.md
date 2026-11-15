# Product Requirements Document (PRD): LayarTix

## 1. Ikhtisar Produk (Product Overview)

**LayarTix** adalah aplikasi pemesanan tiket bioskop komprehensif berbasis web/mobile yang dirancang untuk memberikan pengalaman menonton yang imersif, praktis, dan terintegrasi dari ujung ke ujung. Aplikasi ini mencakup **Opening Cinematic (Splash Screen)** berdurasi 6 detik dengan identitas merek LayarTix, sisi **Customer** (mulai dari pemilihan kota di seluruh Indonesia, peringatan usia, simulasi kursi 3D, *split bill*, pembelian F&B *bundling*, e-tiket *offline*, hingga jurnal kenangan pribadi), serta sisi **Admin** (pengelolaan transaksi, manajemen refund otomatis 40%, dan pelaporan lengkap yang dapat diunduh ke format PDF).

## 2. Tujuan & Sasaran (Goals & Objectives)

* **Cinematic Branding:** Menyajikan sambutan pembuka (*opening splash screen*) berdurasi sekitar 6 detik yang estetik dan elegan dengan logo serta tulisan **LayarTix** sebelum pengguna masuk ke menu utama/autentikasi.
* **Seamless Experience:** Menghilangkan hambatan antre cetak tiket fisik melalui fitur *E-Ticket* yang dapat diakses secara *offline*.
* **Kenyamanan Ergonomis:** Membantu penonton memilih posisi duduk terbaik melalui visualisasi interaktif yang memperhitungkan sudut pandang layar (*view angle*) dan posisi leher.
* **Fleksibilitas Finansial:** Memfasilitasi transaksi bersama melalui fitur *Split Bill* (patungan) dan sistem *refund* otomatis 40% ke *e-wallet* saat pembatalan tiket.
* **Keamanan & Privasi:** Memberikan ruang privat bagi pengguna untuk mencatat kenangan menonton melalui Jurnal Kenangan (*Private Movie Diary*).
* **Manajemen Bisnis yang Kuat:** Membekali admin dengan dasbor pemantauan real-time dan modul laporan berstandar profesional yang siap diekspor ke PDF.

## 3. Fitur & Alur Pengguna (Feature Specifications)

### A. Opening Splash Screen (Layar Pembuka LayarTix)
* **Durasi & Animasi:** Saat aplikasi pertama kali dibuka, pengguna disuguhkan layar pembuka sinematik bertuliskan **LayarTix** dengan efek visual/animasi elegan berdurasi sekitar **6 detik**.
* **Transisi Otomatis:** Setelah animasi selesai, aplikasi secara otomatis mengarahkan pengguna ke halaman Autentikasi / Masuk (*Login/Register*).

### B. Autentikasi & Akun (Menu 4)
* **Pendaftaran/Masuk:** Mendukung autentikasi via **Nomor Telepon** (verifikasi cepat) atau **Email & Password**.
* **CinePay E-Wallet:** Dompet digital internal untuk pembayaran instan dan penerimaan dana *refund* otomatis.

### C. Beranda & Pemilihan Kota (Menu 1)
* **Pemilihan Kota:** Daftar pilihan kota lengkap yang mencakup seluruh kota di Indonesia yang memiliki jaringan bioskop aktif.
* **Katalog Film:** Terbagi menjadi **Sedang Tayang** (*Now Playing*) dan **Akan Datang** (*Coming Soon*).

### D. Peringatan Usia (Content Warning)
* **Sensor Usia 17+ / 21+:** Peringatan dengan teks besar dan jelas yang muncul secara wajib tepat sebelum pengguna memilih kursi, memastikan kepatuhan usia penonton.

### E. Pemilihan Kursi Interaktif (Simulasi 3D-Like)
* **Denah Studio Bioskop:** Visualisasi kursi baris A sampai G dengan indikator kursi tersedia, dipilih, dan terjual.
* **Panduan Ergonomis Leher:** Memberikan informasi real-time mengenai kenyamanan tangkapan mata dan posisi leher berdasarkan baris kursi yang dipilih.

### F. Bundling Makanan (F&B) & Split Bill
* **Pemesanan Makanan Sekaligus:** Opsional penambahan menu F&B (popcorn, minuman, snack) langsung setelah memilih kursi.
* **Fitur Split Bill (Patungan):** Membagi total tagihan tiket dan makanan untuk beberapa orang, menghasilkan **1 QR Code pembayaran gabungan** yang praktis.

### G. E-Ticket Offline
* **Akses Tanpa Internet:** E-tiket dan voucher F&B tersimpan secara lokal di perangkat, mengantisipasi kondisi sinyal atau kuota habis di lokasi bioskop.
* **Scan Masuk Studio:** Penonton cukup menunjukkan QR Code di HP kepada petugas tanpa perlu mencetak tiket fisik.

### H. Kebijakan Pembatalan & Refund 40%
* **Pembatalan Mandiri:** Pengguna dapat membatalkan tiket aktif melalui aplikasi.
* **Refund Otomatis:** Sistem secara otomatis memotong dan mengembalikan **40% dari total harga** langsung ke saldo *e-wallet* pengguna.

### I. Tiket Saya & Jurnal Kenangan (Menu 3)
* **Riwayat & Tiket Aktif:** Pemisahan tab antara tiket yang akan datang dan riwayat tiket selesai.
* **Jurnal Kenangan Pribadi:** Fitur catatan personal dan rating film setelah menonton yang bersifat privat (hanya dapat dilihat oleh pemilik akun).

### J. Kantin Bioskop Terpisah (Menu 2)
* Menu khusus untuk memesan makanan dan minuman secara mandiri tanpa harus memesan tiket film.

## 4. Fitur Utama Sisi Admin (Admin Panel)

* **Dashboard Kendali Real-Time:** Ringkasan statistik harian (total tiket terjual, pendapatan kotor, total *refund* 40%, dan porsi F&B).
* **Manajemen Operasional:** Pengelolaan film, jadwal bioskop, harga, dan kontrol pemrosesan refund.
* **Modul Laporan Lengkap & Unduh PDF:** Filter laporan komprehensif dengan tombol ekspor PDF berformat resmi.

## 5. Alur Pengguna (User Flow Summary)

1. **Buka Aplikasi -> Tampil Opening Splash Screen "LayarTix" (6 Detik)** -> 2. **Login/Register** -> 3. **Pilih Kota di Indonesia** -> 4. **Pilih Film di Beranda** -> 5. **Pilih Bioskop & Jam Tayang** -> 6. **Peringatan Usia (Jika 17+/21+)** -> 7. **Pilih Kursi dengan Simulasi 3D** -> 8. **Tambah Makanan & Atur Split Bill (1 QR Code)** -> 9. **Pembayaran Sukses via E-Wallet** -> 10. **E-Ticket Offline Tersimpan di HP** -> 11. **Masuk Bioskop / Selesai Nonton & Tulis Jurnal Kenangan**.

## 6. Metrik Keberhasilan (Success Metrics)

* Tingkat penyelesaian pemesanan (*conversion rate*).
* Adopsi fitur *E-Ticket offline* dan kepuasan pengguna terhadap pengalaman sinematik **LayarTix**.