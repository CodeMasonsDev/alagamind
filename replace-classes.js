const fs = require('fs');
const file = 'src/app/(features)/(setting)/settings/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const replacements = [
  ['bg-[linear-gradient(180deg,#fffdf4_0%,#f6f7fb_100%)]', 'bg-[linear-gradient(180deg,#fffdf4_0%,#f6f7fb_100%)] dark:bg-slate-950'],
  ['border-slate-200 bg-white shadow-sm', 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm'],
  ['border-teal-100 bg-teal-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-teal-700', 'border-teal-100 dark:border-teal-900/50 bg-teal-50 dark:bg-teal-900/20 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-teal-700 dark:text-teal-400'],
  ['bg-teal-500" />', 'bg-teal-500 dark:bg-teal-400" />'],
  ['text-slate-950">\n', 'text-slate-950 dark:text-white">\n'],
  ['text-slate-500\">\n', 'text-slate-500 dark:text-slate-400\">\n'],
  ['border-slate-200 bg-slate-50/80 p-5', 'border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 p-5'],
  ['text-slate-400\">\n', 'text-slate-400 dark:text-slate-500\">\n'],
  ['bg-slate-900 text-xl font-bold text-white', 'bg-slate-900 dark:bg-slate-800 text-xl font-bold text-white'],
  ['text-slate-300\" />', 'text-slate-300 dark:text-slate-500\" />'],
  ['border-slate-200 bg-white p-4', 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-4'],
  ['bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800', 'bg-slate-900 dark:bg-slate-100 px-4 py-2.5 text-sm font-semibold text-white dark:text-slate-900 transition-colors hover:bg-slate-800 dark:hover:bg-white'],
  ['border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50', 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50'],
  ['border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-700', 'border-rose-100 dark:border-rose-900/30 bg-rose-50 dark:bg-rose-900/10 px-3 py-2 text-sm text-rose-700 dark:text-rose-400'],
  ['border-emerald-100 bg-emerald-50 px-3 py-2 text-sm text-emerald-700', 'border-emerald-100 dark:border-emerald-900/30 bg-emerald-50 dark:bg-emerald-900/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-400'],
  ['border-b border-slate-200 px-6 py-5', 'border-b border-slate-200 dark:border-slate-800 px-6 py-5'],
  ['bg-slate-50/70 px-4 py-3', 'bg-slate-50/70 dark:bg-slate-800/50 px-4 py-3'],
  ['border-slate-200 bg-slate-50/70 p-4', 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 p-4'],
  ['text-slate-900\">\n', 'text-slate-900 dark:text-slate-100\">\n'],
  ['border-rose-200 bg-white shadow-sm', 'border-rose-200 dark:border-rose-900/30 bg-white dark:bg-slate-900 shadow-sm'],
  ['border-b border-rose-100 px-6 py-5', 'border-b border-rose-100 dark:border-rose-900/30 px-6 py-5'],
  ['border-slate-200 bg-slate-50/70 p-5', 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 p-5'],
  ['bg-white text-slate-600 shadow-sm', 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 shadow-sm dark:border dark:border-slate-700'],
  ['border-rose-200 bg-rose-50/70 p-5', 'border-rose-200 dark:border-rose-900/30 bg-rose-50/70 dark:bg-rose-900/10 p-5'],
  ['bg-white text-rose-600 shadow-sm', 'bg-white dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 shadow-sm dark:border dark:border-rose-800'],
  ['text-slate-600\">\n', 'text-slate-600 dark:text-slate-400\">\n'],
  ['border-rose-100 bg-white px-3 py-3 text-sm text-rose-700', 'border-rose-100 dark:border-rose-900/30 bg-white dark:bg-rose-900/20 px-3 py-3 text-sm text-rose-700 dark:text-rose-400'],
  ['bg-white px-4 py-2.5 text-sm font-semibold text-rose-400', 'bg-white dark:bg-rose-900/20 px-4 py-2.5 text-sm font-semibold text-rose-400 dark:text-rose-500'],
  ['border-slate-200 bg-white px-4 py-3', 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3'],
  ['bg-slate-50/70 px-4 text-sm text-slate-900 outline-none transition-colors focus:border-teal-200 focus:bg-white', 'bg-slate-50/70 dark:bg-slate-800/50 px-4 text-sm text-slate-900 dark:text-slate-100 outline-none transition-colors focus:border-teal-200 dark:focus:border-teal-400/50 focus:bg-white dark:focus:bg-slate-800'],
  ['? "border-emerald-100 bg-emerald-50 text-emerald-700"', '? "border-emerald-100 dark:border-emerald-900/30 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400"'],
  [': "border-rose-100 bg-rose-50 text-rose-700";', ': "border-rose-100 dark:border-rose-900/30 bg-rose-50 dark:bg-rose-900/10 text-rose-700 dark:text-rose-400";'],
  ['text-rose-500\">\n', 'text-rose-500 dark:text-rose-400\">\n']
];

for (const [search, replace] of replacements) {
  content = content.replaceAll(search, replace);
}

fs.writeFileSync(file, content);
console.log("Done");
