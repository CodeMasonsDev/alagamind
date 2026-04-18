const fs = require('fs');
const path = require('path');

const dir = 'src/components/insights-reports/';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

const replacements = [
  // Text colors
  ['text-slate-900', 'text-slate-900 dark:text-slate-100'],
  ['text-slate-950', 'text-slate-950 dark:text-slate-100'],
  ['text-slate-500', 'text-slate-500 dark:text-slate-400'],
  ['text-slate-600', 'text-slate-600 dark:text-slate-400'],
  ['text-slate-700', 'text-slate-700 dark:text-slate-300'],
  
  // Borders
  ['border-slate-200', 'border-slate-200 dark:border-slate-800'],
  ['border-slate-100', 'border-slate-100 dark:border-slate-800'],
  ['border-slate-300', 'border-slate-300 dark:border-slate-700'],
  
  // Backgrounds
  ['bg-white', 'bg-white dark:bg-slate-900'],
  ['bg-slate-50', 'bg-slate-50 dark:bg-slate-800/50'],
  ['bg-slate-50/80', 'bg-slate-50/80 dark:bg-slate-900/50'],

  // Specific buttons
  ['bg-slate-900 text-white hover:bg-slate-800', 'bg-slate-900 dark:bg-teal-600 text-white hover:bg-slate-800 dark:hover:bg-teal-500'],
  
  // Overrides to avoid breaking specific transparent things
  ['dark:text-slate-100 dark:text-slate-100', 'dark:text-slate-100'],
  ['dark:border-slate-800 dark:border-slate-800', 'dark:border-slate-800'],
  ['dark:text-slate-400 dark:text-slate-400', 'dark:text-slate-400'],
  ['dark:bg-slate-900 dark:bg-slate-900', 'dark:bg-slate-900']
];

for (const f of files) {
  const filePath = path.join(dir, f);
  let content = fs.readFileSync(filePath, 'utf8');
  for (const [search, replace] of replacements) {
    content = content.replaceAll(search, replace);
  }
  // fix bad background replacement of bg-white inside icons
  content = content.replaceAll('bg-white dark:bg-slate-900 text-teal-600', 'bg-white dark:bg-teal-900/40 text-teal-600 dark:text-teal-400');
  content = content.replaceAll('bg-white dark:bg-slate-900 text-rose-600', 'bg-white dark:bg-rose-900/40 text-rose-600 dark:text-rose-400');
  // fix bad button replacements
  content = content.replaceAll('bg-white dark:bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 transition-colors hover:bg-slate-50 dark:bg-slate-800/50', 'bg-white dark:bg-white/5 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 transition-colors hover:bg-slate-50 dark:hover:bg-white/10 dark:border-white/10');

  fs.writeFileSync(filePath, content);
}
console.log("Done all component files");
