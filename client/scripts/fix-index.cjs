const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../dist/index.html');
const html = fs.readFileSync(file, 'utf8').replace(/ crossorigin/g, '');
fs.writeFileSync(file, html);
console.log('dist/index.html — file:// 열기용으로 crossorigin 제거 완료');
