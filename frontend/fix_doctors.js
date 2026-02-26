const fs = require('fs');
let c = fs.readFileSync('src/app/doctors/page.tsx', 'utf8');
c = c.split('abel').join('abel');
fs.writeFileSync('src/app/doctors/page.tsx', c);
console.log('Done');

