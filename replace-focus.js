const fs = require('fs');
const file = 'src/components/dashboard/focus-momentum-card.tsx';
let content = fs.readFileSync(file, 'utf8');

const replacements = [
  ['bg-white', 'bg-white dark:bg-slate-900'],
  
  // Text colors
  ['text-slate-900', 'text-slate-900 dark:text-slate-100'],
  ['text-slate-500', 'text-slate-500 dark:text-slate-400'],
  ['text-slate-400', 'text-slate-400 dark:text-slate-500'],
  ['text-slate-300', 'text-slate-300 dark:text-slate-600'],
  
  // Borders
  ['border-slate-200', 'border-slate-200 dark:border-slate-800'],
  
  // Custom backgrounds
  ['bg-slate-100', 'bg-slate-100 dark:bg-slate-800'],
  ['bg-slate-50', 'bg-slate-50 dark:bg-slate-800/50'],

  // Emotion Buttons logic
  ['bg-teal-500', 'bg-teal-500 dark:bg-teal-600'],
  ['bg-teal-200 opacity-70', 'bg-teal-200 dark:bg-teal-900/60 opacity-70'],
  ['text-teal-600', 'text-teal-600 dark:text-teal-500']
];

for (const [search, replace] of replacements) {
  content = content.replaceAll(search, replace);
}

fs.writeFileSync(file, content);
console.log("Done focus card script");
