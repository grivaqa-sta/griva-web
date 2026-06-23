const fs = require('fs');

let p = fs.readFileSync('app/admin/page.tsx', 'utf8');

// Fix sidebar logo bar to exactly h-20 so its bottom border aligns with the main header border
p = p.replace(
  'flex items-center gap-2 px-2 py-4 mb-6 border-b border-orange-500/30',
  'flex items-center gap-3 px-6 h-20 -mt-6 -mx-6 mb-6 border-b border-orange-500/30'
).replace(
  'h-8 w-8 rounded-lg bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30">',
  'h-8 w-8 rounded-lg bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30 shrink-0">'
);

fs.writeFileSync('app/admin/page.tsx', p);
console.log('Done - border alignment fixed');
