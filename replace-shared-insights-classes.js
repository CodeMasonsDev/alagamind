const fs = require('fs');
const file = 'src/components/features/insights-sessions/shared.tsx';
let content = fs.readFileSync(file, 'utf8');

const replacements = [
  ['"border-slate-200 bg-slate-50/80"', '"border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/50"'],
  ['"border-teal-100 bg-teal-50/80"', '"border-teal-100 dark:border-teal-900/40 bg-teal-50/80 dark:bg-teal-900/10"'],
  ['"border-amber-100 bg-amber-50/80"', '"border-amber-100 dark:border-amber-900/40 bg-amber-50/80 dark:bg-amber-900/10"'],
  ['"border-rose-100 bg-rose-50/80"', '"border-rose-100 dark:border-rose-900/40 bg-rose-50/80 dark:bg-rose-900/10"'],
  ['"border-violet-100 bg-violet-50/80"', '"border-violet-100 dark:border-violet-900/40 bg-violet-50/80 dark:bg-violet-900/10"'],

  ['"border-slate-200 bg-slate-100 text-slate-700"', '"border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"'],
  ['"border-teal-200 bg-teal-50 text-teal-700"', '"border-teal-200 dark:border-teal-900/40 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400"'],
  ['"border-amber-200 bg-amber-50 text-amber-700"', '"border-amber-200 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400"'],
  ['"border-rose-200 bg-rose-50 text-rose-700"', '"border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400"'],
  ['"border-violet-200 bg-violet-50 text-violet-700"', '"border-violet-200 dark:border-violet-900/40 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400"'],
  
  ['border-slate-200 bg-white shadow-sm', 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm'],
  
  ['border-b border-slate-200', 'border-b border-slate-200 dark:border-slate-800'],
  
  ['text-teal-600', 'text-teal-600 dark:text-teal-400'],
  ['text-slate-500', 'text-slate-500 dark:text-slate-400'],
  ['text-slate-950', 'text-slate-950 dark:text-slate-100'],
  ['text-slate-900', 'text-slate-900 dark:text-slate-100'],
  
  ['border-slate-100 bg-slate-50/80', 'border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/50'],
];

for (const [search, replace] of replacements) {
  content = content.replaceAll(search, replace);
}

fs.writeFileSync(file, content);
console.log("Done shared");
