const fs = require('fs');
const path = require('path');

const dir = 'app/admin/components';

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

function processDir(dirPath) {
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // We will match the classes considering delimiters: spaces, quotes, backticks, braces
      for (const [oldClass, newClass] of Object.entries(classMap)) {
         const escapedOldClass = oldClass.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
         const regex = new RegExp('(^|[ \\n\\t"\'`\\{])' + escapedOldClass + '([ \\n\\t"\'`\\}])', 'g');
         // Run twice in case of overlapping matches like 'bg-black bg-black'
         content = content.replace(regex, '$1' + newClass + '$2');
         content = content.replace(regex, '$1' + newClass + '$2');
      }
      
      content = content.replace(/(^|[ \n\t"'\`\{])text-white([ \n\t"'\`\}])/g, '$1text-gray-900$2');
      content = content.replace(/(^|[ \n\t"'\`\{])text-white([ \n\t"'\`\}])/g, '$1text-gray-900$2');
      
      content = content.replace(/text-gray-900(.*?)from-orange-500/g, 'text-white$1from-orange-500');
      content = content.replace(/from-orange-500(.*?)text-gray-900/g, 'from-orange-500$1text-white');
      content = content.replace(/text-gray-900(.*?)bg-orange-500/g, 'text-white$1bg-orange-500');
      content = content.replace(/bg-orange-500(.*?)text-gray-900/g, 'bg-orange-500$1text-white');
      content = content.replace(/text-gray-900(.*?)bg-blue-600/g, 'text-white$1bg-blue-600');
      content = content.replace(/bg-blue-600(.*?)text-gray-900/g, 'bg-blue-600$1text-white');
      content = content.replace(/text-gray-900(.*?)bg-red-500/g, 'text-white$1bg-red-500');
      content = content.replace(/bg-red-500(.*?)text-gray-900/g, 'bg-red-500$1text-white');
      content = content.replace(/text-gray-900(.*?)bg-green-500/g, 'text-white$1bg-green-500');
      content = content.replace(/bg-green-500(.*?)text-gray-900/g, 'bg-green-500$1text-white');
      content = content.replace(/selection:text-gray-900/g, 'selection:text-white');
      
      fs.writeFileSync(fullPath, content, 'utf8');
    }
  }
}

processDir(dir);
console.log('Done components!');
