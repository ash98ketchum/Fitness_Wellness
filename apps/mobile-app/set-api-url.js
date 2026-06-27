const fs = require('fs');
const path = require('path');

const mode = process.argv[2]; // 'prod' or 'dev'

if (!mode || (mode !== 'prod' && mode !== 'dev')) {
  console.log('Usage: node set-api-url.js <prod|dev>');
  process.exit(1);
}

const TARGET_URL = mode === 'prod' 
  ? 'https://athelya-api.onrender.com' 
  : 'http://localhost:3000';

function replaceInDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Matches: 
      // 1. http://localhost:3000
      // 2. http://172.16.181.142:3000 (or any IP)
      // 3. https://athelya-api.onrender.com
      const regex = /https?:\/\/(localhost|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}):3000|https:\/\/athelya-api\.onrender\.com/g;
      
      if (regex.test(content)) {
        // Reset regex index
        regex.lastIndex = 0;
        const newContent = content.replace(regex, TARGET_URL);
        if (newContent !== content) {
          fs.writeFileSync(fullPath, newContent);
          console.log(`Updated API URL in: ${fullPath} -> ${TARGET_URL}`);
        }
      }
    }
  }
}

replaceInDir('src');
console.log(`Successfully switched API URLs to ${mode} mode (${TARGET_URL})`);
