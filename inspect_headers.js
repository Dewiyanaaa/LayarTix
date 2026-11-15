const fs = require('fs');

const files = [
  'customer/html/beranda.html',
  'customer/html/fnb.html',
  'customer/html/tiket.html',
  'customer/html/parkir.html',
  'customer/html/bioskop_jam.html',
  'customer/html/kursi.html',
  'customer/html/akun.html'
];

files.forEach(f => {
  console.log('=== ' + f + ' ===');
  const content = fs.readFileSync(f, 'utf8');
  const headerMatch = content.match(/<header class="app-header"[\s\S]*?<\/header>/);
  if (headerMatch) {
    console.log(headerMatch[0].replace(/\s+/g, ' ').substring(0, 180));
  } else {
    console.log('No app-header found!');
  }
});

