const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'src/lib/data/market/MockMarketDataProvider.ts');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(/timestamp: new Date\(\)\.toISOString\(\),/g, "timestamp: new Date().toISOString(),\n        publisher: 'Knowith Capital',\n        url: 'https://knowith.com/news',");

fs.writeFileSync(filePath, content);
console.log('Fixed:', filePath);
