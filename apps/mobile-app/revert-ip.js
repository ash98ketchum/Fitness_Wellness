const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('172.16.181.142:3000')) {
        content = content.replace(/172.16.181.142:3000/g, 'localhost:3000');
        fs.writeFileSync(fullPath, content);
        console.log('Reverted ' + fullPath);
      }
    }
  }
}

replaceInDir('src');
