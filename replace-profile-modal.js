const fs = require('fs');
const file = 'src/components/insights-reports/profile-overview-modal.tsx';
let content = fs.readFileSync(file, 'utf8');

const replacements = [
  ['bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.16),_transparent_35%),linear-gradient(135deg,#f8fffe_0%,#f8fafc_55%,#ffffff_100%)]', 'bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.16),_transparent_35%),linear-gradient(135deg,#f8fffe_0%,#f8fafc_55%,#ffffff_100%)] dark:bg-none dark:bg-slate-900'],
  ['bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] px-6', 'bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] dark:bg-none dark:bg-slate-950 px-6'],
  ['from-sky-50 to-white text-sky-700', 'from-sky-50 dark:from-sky-900/20 to-white dark:to-slate-800 text-sky-700 dark:text-sky-400'],
  ['from-teal-50 to-white text-teal-700', 'from-teal-50 dark:from-teal-900/20 to-white dark:to-slate-800 text-teal-700 dark:text-teal-400'],
  ['from-amber-50 to-white text-amber-700', 'from-amber-50 dark:from-amber-900/20 to-white dark:to-slate-800 text-amber-700 dark:text-amber-400'],
  ['bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] px-4', 'bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] dark:bg-none dark:bg-slate-800/40 dark:hover:bg-slate-800 px-4'],
  ['bg-slate-100 text-sm', 'bg-slate-100 dark:bg-slate-800 text-sm'],
  ['border border-teal-200 bg-teal-50 px-2.5', 'border border-teal-200 dark:border-teal-900/50 bg-teal-50 dark:bg-teal-900/20 px-2.5'],
  ['text-teal-700 shadow-sm backdrop-blur', 'text-teal-700 dark:text-teal-400 shadow-sm backdrop-blur'],
  ['border border-teal-200 bg-teal-50 text-teal-600 shadow-sm', 'border border-teal-200 dark:border-teal-900/50 bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 shadow-sm'],
  ['text-teal-700">\\n                                {formatToken(section.flag)}', 'text-teal-700 dark:text-teal-400">\\n                                {formatToken(section.flag)}']
];

for (const [search, replace] of replacements) {
  content = content.replaceAll(search, replace);
}

fs.writeFileSync(file, content);
console.log("Done profile overview modal");
