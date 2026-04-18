const fs = require('fs');
const file = 'src/app/(features)/(setting)/help-support/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const replacements = [
  ['border-slate-200 bg-slate-50/80', 'border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/50'],
  ['hover:border-slate-300 hover:bg-white', 'hover:border-slate-300 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-800/80'],
  ['bg-white text-slate-700 shadow-sm', 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-sm dark:shadow-none dark:border dark:border-slate-700'],
  ['text-slate-400', 'text-slate-400 dark:text-slate-500'],
  ['text-slate-950', 'text-slate-950 dark:text-slate-100'],
  ['text-slate-500', 'text-slate-500 dark:text-slate-400'],
  ['text-slate-600', 'text-slate-600 dark:text-slate-400'],
  ['text-slate-700', 'text-slate-700 dark:text-slate-300'],
  ['open:bg-white', 'open:bg-white dark:open:bg-slate-800/80'],
  ['border-teal-100 bg-teal-50/80', 'border-teal-100 dark:border-teal-900/30 bg-teal-50/80 dark:bg-teal-900/10']
];

for (const [search, replace] of replacements) {
  content = content.replaceAll(search, replace);
}

fs.writeFileSync(file, content);
console.log("Done page.tsx");
