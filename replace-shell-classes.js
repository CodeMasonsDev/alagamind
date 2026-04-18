const fs = require('fs');
const file = 'src/components/settings/settings-page-shell.tsx';
let content = fs.readFileSync(file, 'utf8');

const replacements = [
  ['"border-slate-200 bg-slate-100 text-slate-700"', '"border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"'],
  ['"border-teal-100 bg-teal-50 text-teal-700"', '"border-teal-100 dark:border-teal-900/50 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400"'],
  ['"border-amber-100 bg-amber-50 text-amber-700"', '"border-amber-100 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400"'],
  ['"border-rose-100 bg-rose-50 text-rose-700"', '"border-rose-100 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400"'],
  ['"border-violet-100 bg-violet-50 text-violet-700"', '"border-violet-100 dark:border-violet-900/50 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400"'],
  
  ['"border-slate-200 bg-slate-50/80"', '"border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/50"'],
  ['"border-teal-100 bg-teal-50/80"', '"border-teal-100 dark:border-teal-900/30 bg-teal-50/80 dark:bg-teal-900/10"'],
  ['"border-amber-100 bg-amber-50/80"', '"border-amber-100 dark:border-amber-900/30 bg-amber-50/80 dark:bg-amber-900/10"'],
  ['"border-rose-100 bg-rose-50/80"', '"border-rose-100 dark:border-rose-900/30 bg-rose-50/80 dark:bg-rose-900/10"'],
  ['"border-violet-100 bg-violet-50/80"', '"border-violet-100 dark:border-violet-900/30 bg-violet-50/80 dark:bg-violet-900/10"'],

  ['bg-[linear-gradient(180deg,#fffdf4_0%,#f6f7fb_100%)]', 'bg-[linear-gradient(180deg,#fffdf4_0%,#f6f7fb_100%)] dark:bg-none dark:bg-slate-950'],
  
  ['border-slate-200 bg-white shadow-sm', 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm'],
  
  ['text-slate-950', 'text-slate-950 dark:text-white'],
  ['text-slate-500', 'text-slate-500 dark:text-slate-400'],
  ['text-slate-400', 'text-slate-400 dark:text-slate-500'],
  
  ['border-b border-slate-200', 'border-b border-slate-200 dark:border-slate-800'],
  
  ['border border-teal-100 bg-teal-50', 'border border-teal-100 dark:border-teal-900/50 bg-teal-50 dark:bg-teal-900/20'],
  ['text-teal-700', 'text-teal-700 dark:text-teal-400'],
  ['bg-teal-500', 'bg-teal-500 dark:bg-teal-400']
];

for (const [search, replace] of replacements) {
  content = content.replaceAll(search, replace);
}

fs.writeFileSync(file, content);
console.log("Done settings-page-shell.tsx");
