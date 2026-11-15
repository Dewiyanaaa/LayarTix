// admin.js – Dashboard Admin for LayarTix
// This script reads ticket transactions from localStorage (key: layartix_active_tickets)
// and renders statistics, transaction table, and city‑wise summary.
// It also provides PDF export of the entire report.

// Utility: safe parse JSON from localStorage
function getTickets() {
  const raw = localStorage.getItem('layartix_active_tickets');
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch (e) {
    console.error('Failed to parse tickets JSON', e);
    return [];
  }
}

function formatCurrency(num) {
  return 'Rp' + Number(num).toLocaleString('id-ID');
}

function renderStats(tickets) {
  const totalRevenue = tickets.reduce((sum, t) => sum + (Number(t.price) || 0), 0);
  const totalTickets = tickets.length;
  const activeMovies = [...new Set(tickets.map(t => t.title))];
  document.getElementById('totalRevenue').textContent = formatCurrency(totalRevenue);
  document.getElementById('totalTickets').textContent = totalTickets;
  document.getElementById('activeMovies').textContent = activeMovies.length;
}
  const totalRevenue = tickets.reduce((sum, t) => sum + (Number(t.price) || 0), 0);
  const totalTickets = tickets.length;
  const activeMovies = [...new Set(tickets.map(t => t.title))];
  document.getElementById('totalRevenue').textContent = formatCurrency(totalRevenue);
  document.getElementById('totalTickets').textContent = totalTickets;
  document.getElementById('activeMovies').textContent = activeMovies.length;
}

function renderTransactionTable(tickets, cityFilter = 'All') {
  const tbody = document.querySelector('#transactionTable tbody');
  tbody.innerHTML = '';
  const filtered = cityFilter === 'All' ? tickets : tickets.filter(t => t.city === cityFilter);
  filtered.forEach((t, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${idx + 1}</td>
      <td>${t.status || '-'}</td>
      <td>${t.name || '-'}</td>
      <td>${t.title || '-'}</td>
      <td>${t.seat || '-'}</td>
      <td>${t.cinema || '-'} (${t.city || '-'})</td>
      <td>${t.time || '-'}</td>
      <td>${formatCurrency(t.price)}</td>
    `;
    tbody.appendChild(tr);
  });
}

function getCityList(tickets) {
  const cities = new Set();
  tickets.forEach(t => t.city && cities.add(t.city));
  return Array.from(cities).sort();
}

function renderCityFilter(tickets) {
  const select = document.getElementById('cityFilter');
  if (!select) return;
  const cities = getCityList(tickets);
  select.innerHTML = '<option value="All">All</option>' +
    cities.map(c => `<option value="${c}">${c}</option>`).join('');
}

function renderCitySummary(tickets) {
  const tbody = document.querySelector('#citySummaryTable tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  const summary = {};
  tickets.forEach(t => {
    const city = t.city || 'Unknown';
    const cinema = t.cinema || 'Unknown';
    const key = `${city}||${cinema}`;
    if (!summary[key]) {
      summary[key] = { city, cinema, tickets: 0, revenue: 0 };
    }
    summary[key].tickets += 1;
    summary[key].revenue += Number(t.price) || 0;
  });
  const rows = Object.values(summary).sort((a, b) => a.city.localeCompare(b.city));
  rows.forEach(r => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${r.city}</td>
      <td>${r.cinema}</td>
      <td>${r.tickets}</td>
      <td>${formatCurrency(r.revenue)}</td>
    `;
    tbody.appendChild(tr);
  });
}

function downloadPdf() {
  // Generate PDF based on current city filter
  const selectedCity = document.getElementById('cityFilter') ? document.getElementById('cityFilter').value : 'All';
  const allTickets = getTickets();
  const tickets = selectedCity === 'All' ? allTickets : allTickets.filter(t => t.city === selectedCity);

  // Compute aggregates for the filtered set
  const totalRevenue = tickets.reduce((sum, t) => sum + (Number(t.price) || 0), 0);
  const totalTickets = tickets.length;
  const activeMovies = [...new Set(tickets.map(t => t.title))];

  // Build a temporary container for the PDF content
  const pdfContainer = document.createElement('div');
  pdfContainer.style.padding = '20px';
  const titleText = selectedCity === 'All' ? 'Laporan Pendapatan LayarTix - Semua Kota' : `Laporan Pendapatan LayarTix - Kota ${selectedCity}`;
  pdfContainer.innerHTML = `
    <h1>${titleText}</h1>
    <p><strong>Total Pendapatan:</strong> ${formatCurrency(totalRevenue)}</p>
    <p><strong>Total Tiket Terjual:</strong> ${totalTickets}</p>
    <p><strong>Film Aktif:</strong> ${activeMovies.length}</p>
    <h2>Daftar Transaksi</h2>
    <table style="width:100%;border-collapse:collapse;">
      <thead>
        <tr>
          <th>#</th>
          <th>Status</th>
          <th>Nama Pemesan</th>
          <th>Judul Film</th>
          <th>Kursi</th>
          <th>Bioskop (Kota)</th>
          <th>Waktu</th>
          <th>Harga</th>
        </tr>
      </thead>
      <tbody>
      </tbody>
    </table>
    <h2>Rekapitulasi per Kota & Bioskop</h2>
    <table style="width:100%;border-collapse:collapse;">
      <thead>
        <tr>
          <th>Kota</th>
          <th>Bioskop</th>
          <th>Total Tiket</th>
          <th>Revenue</th>
        </tr>
      </thead>
      <tbody></tbody>
    </table>
  `;

  // Populate transaction rows
  const txnTbody = pdfContainer.querySelector('table:nth-of-type(1) tbody');
  tickets.forEach((t, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${idx + 1}</td>
      <td>${t.status || '-'}</td>
      <td>${t.name || '-'}</td>
      <td>${t.title || '-'}</td>
      <td>${t.seat || '-'}</td>
      <td>${t.cinema || '-'} (${t.city || '-'})</td>
      <td>${t.time || '-'}</td>
      <td>${formatCurrency(t.price)}</td>
    `;
    txnTbody.appendChild(tr);
  });

  // Build city‑wise summary for the filtered tickets
  const summary = {};
  tickets.forEach(t => {
    const city = t.city || 'Unknown';
    const cinema = t.cinema || 'Unknown';
    const key = `${city}||${cinema}`;
    if (!summary[key]) {
      summary[key] = { city, cinema, tickets: 0, revenue: 0 };
    }
    summary[key].tickets += 1;
    summary[key].revenue += Number(t.price) || 0;
  });
  const cityTbody = pdfContainer.querySelector('table:nth-of-type(2) tbody');
  Object.values(summary).sort((a, b) => a.city.localeCompare(b.city)).forEach(r => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${r.city}</td>
      <td>${r.cinema}</td>
      <td>${r.tickets}</td>
      <td>${formatCurrency(r.revenue)}</td>
    `;
    cityTbody.appendChild(tr);
  });

  // Generate PDF using html2pdf on the temporary container
  const opt = {
    margin: 0.5,
    filename: selectedCity === 'All' ? 'Laporan_Admin_LayarTix_Seluruh_Kota.pdf' : `Laporan_Admin_LayarTix_${selectedCity}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
  };
  html2pdf().set(opt).from(pdfContainer).save();
}
  const element = document.getElementById('adminReport');
  const opt = {
    margin:       0.5,
    filename:     'Laporan_Admin_LayarTix.pdf',
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2 },
    jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
  };
  html2pdf().set(opt).from(element).save();
}

function loadDashboard() {
  const tickets = getTickets();
  // Populate city filter dropdown first
  renderCityFilter(tickets);
  const citySelect = document.getElementById('cityFilter');
  const currentFilter = citySelect ? citySelect.value : 'All';
  // Determine which tickets to display based on filter
  const filteredTickets = currentFilter === 'All' ? tickets : tickets.filter(t => t.city === currentFilter);
  // Render all components using the filtered dataset
  renderStats(filteredTickets);
  renderTransactionTable(filteredTickets, currentFilter);
  renderCitySummary(filteredTickets);
}
  const tickets = getTickets();
  renderStats(tickets);
  renderCityFilter(tickets);
  const citySelect = document.getElementById('cityFilter');
  const currentFilter = citySelect ? citySelect.value : 'All';
  renderTransactionTable(tickets, currentFilter);
  renderCitySummary(tickets);
}

// Initial load
loadDashboard();

// React to city filter change
const citySelectEl = document.getElementById('cityFilter');
if (citySelectEl) {
  citySelectEl.addEventListener('change', function () {
    const tickets = getTickets();
    renderTransactionTable(tickets, this.value);
  });
}

// Real‑time sync across tabs/windows
window.addEventListener('storage', function (e) {
  if (e.key === 'layartix_active_tickets') {
    loadDashboard();
  }
});

// Export function made global for the button `onclick`
window.downloadPdf = downloadPdf;
