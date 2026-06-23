const fs = require('fs');

let p = fs.readFileSync('app/admin/page.tsx', 'utf8');

// Fix sidebar button text alignment
p = p.replace(
  '<LayoutDashboard className="h-4.5 w-4.5" />\n              Overview & Campaigns',
  '<LayoutDashboard className="h-4.5 w-4.5 shrink-0" />\n              <span className="leading-tight text-left">Overview & Campaigns</span>'
).replace(
  '<Package className="h-4.5 w-4.5" />\n              Manage Products',
  '<Package className="h-4.5 w-4.5 shrink-0" />\n              <span className="leading-tight text-left">Manage Products</span>'
).replace(
  '<Sliders className="h-4.5 w-4.5" />\n              Banners & Layouts',
  '<Sliders className="h-4.5 w-4.5 shrink-0" />\n              <span className="leading-tight text-left">Banners & Layouts</span>'
).replace(
  '<Users className="h-4.5 w-4.5" />\n              Subscribers Hub',
  '<Users className="h-4.5 w-4.5 shrink-0" />\n              <span className="leading-tight text-left">Subscribers Hub</span>'
);
p = p.replace(/className={`w-full flex items-center gap-3\.5/g, 'className={`w-full flex items-center text-left gap-3.5');

// Fix logo horizontal line alignment
p = p.replace(
  '<div className="flex items-center gap-2 px-2 py-4 mb-6 border-b border-orange-500/30">\n            <div className="h-8 w-8 rounded-lg bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30">',
  '<div className="flex items-center gap-3 px-6 h-20 -mt-6 -mx-6 mb-6 border-b border-orange-500/30">\n            <div className="h-8 w-8 rounded-lg bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30 shrink-0">'
);

fs.writeFileSync('app/admin/page.tsx', p);

// Fix OverviewTab tick buttons
let o = fs.readFileSync('app/admin/components/OverviewTab.tsx', 'utf8');
o = o.replace(/<div>\s*<ToggleRight/g, '<>\n                        <ToggleRight');
o = o.replace(/Showing\)\s*<\/div>/g, 'Showing)\n                      </>');
o = o.replace(/<div>\s*<ToggleLeft/g, '<>\n                        <ToggleLeft');
o = o.replace(/Hidden\)\s*<\/div>/g, 'Hidden)\n                      </>');
o = o.replace(/Applied\)\s*<\/div>/g, 'Applied)\n                      </>');
o = o.replace(/Inactive\s*<\/div>/g, 'Inactive\n                      </>');
fs.writeFileSync('app/admin/components/OverviewTab.tsx', o);
