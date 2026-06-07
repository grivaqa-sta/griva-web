const fs = require('fs');
const path = require('path');

const dir = 'app/admin';

const classMap = {
  'bg-black': 'bg-white',
  'bg-black/40': 'bg-gray-50',
  'bg-black/45': 'bg-gray-50',
  'bg-black/60': 'bg-black/20',
  'bg-black/90': 'bg-white/90',
  'text-gray-100': 'text-gray-900',
  'text-gray-200': 'text-gray-800',
  'text-gray-300': 'text-gray-700',
  'text-gray-400': 'text-gray-500',
  'text-gray-500': 'text-gray-400',
  'border-gray-855': 'border-gray-200',
  'divide-gray-850': 'divide-gray-200',
  'hover:bg-white/5': 'hover:bg-gray-100',
  'hover:text-white': 'hover:text-gray-900',
  'bg-gray-855': 'bg-gray-100',
  'bg-gray-800': 'bg-gray-200',
};

function replaceTheme(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  content = content.replace(/className=(["'\`])([\s\S]*?)\1/g, (match, quote, inner) => {
    let words = inner.split(/([ \n\t]+)/); // preserve whitespace
    
    // Check if the whole className block contains an orange/blue/red/green bg to preserve text-white
    const hasColoredBg = words.some(w => w.includes('bg-orange-500') || w.includes('from-orange-500') || w.includes('bg-blue-600') || w.includes('bg-red-500') || w.includes('bg-green-500') || w.includes('selection:'));
    
    for (let i = 0; i < words.length; i++) {
      let w = words[i].trim();
      if (!w) continue;
      
      // Strip any quotes or brackets that might be attached from JSX
      let stripped = w.replace(/^["'{\[`]+|["'}\]`]+$/g, '');
      
      if (classMap[stripped]) {
        words[i] = words[i].replace(stripped, classMap[stripped]);
      } else if (stripped === 'text-white' && !hasColoredBg) {
        words[i] = words[i].replace('text-white', 'text-gray-900');
      } else if (stripped === 'text-white/80' && !hasColoredBg) {
        words[i] = words[i].replace('text-white/80', 'text-gray-700');
      }
    }
    
    return 'className=' + quote + words.join('') + quote;
  });
  
  fs.writeFileSync(filePath, content, 'utf8');
}

function processDir(dirPath) {
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      replaceTheme(fullPath);
    }
  }
}

processDir(dir);
console.log('Done!');
