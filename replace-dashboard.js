const fs = require('fs');
const file = 'src/app/(features)/dashboard/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const replacements = [
  // Layout wrappers
  ['bg-[linear-gradient(180deg,#fffdf4_0%,#f6f7fb_100%)]', 'bg-[linear-gradient(180deg,#fffdf4_0%,#f6f7fb_100%)] dark:bg-none dark:bg-slate-950'],
  ['bg-white', 'bg-white dark:bg-slate-900'],
  
  // Text colors
  ['text-slate-900', 'text-slate-900 dark:text-slate-100'],
  ['text-slate-950', 'text-slate-950 dark:text-slate-100'],
  ['text-slate-500', 'text-slate-500 dark:text-slate-400'],
  ['text-slate-600', 'text-slate-600 dark:text-slate-400'],
  ['text-slate-400', 'text-slate-400 dark:text-slate-500'],
  ['text-slate-300', 'text-slate-300 dark:text-slate-600'], // for the backslash in TopBar
  
  // Borders
  ['border-slate-200', 'border-slate-200 dark:border-slate-800'],
  ['border-slate-100', 'border-slate-100 dark:border-slate-800'],
  
  // Hover & custom backgrounds
  ['hover:bg-slate-50', 'hover:bg-slate-50 dark:hover:bg-slate-800'],
  ['bg-slate-100', 'bg-slate-100 dark:bg-slate-800'],
  ['bg-slate-50', 'bg-slate-50 dark:bg-slate-800/50'],

  // Emotion Buttons
  ['border-teal-400 bg-teal-50 text-teal-600', 'border-teal-400 dark:border-teal-900/50 bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400'],
  
  // Integrated suite badge & icon logic
  ['bg-teal-50 text-teal-600 border-teal-100', 'bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 border-teal-100 dark:border-teal-900/50'],
  ['bg-teal-50 text-teal-500', 'bg-teal-50 dark:bg-teal-900/20 text-teal-500 dark:text-teal-400'],
  ['bg-slate-100 text-slate-500 border-slate-200', 'bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800'],
  ['bg-blue-50 text-blue-500', 'bg-blue-50 dark:bg-blue-900/20 text-blue-500 dark:text-blue-400'],
  ['bg-purple-50 text-purple-500', 'bg-purple-50 dark:bg-purple-900/20 text-purple-500 dark:text-purple-400'],
  
  // Button logic
  ['bg-slate-900 text-white dark:bg-slate-900 dark:text-slate-100', 'bg-slate-900 dark:bg-teal-600 text-white'], 
  // Wait, I messed up the order in my head. I should replace exactly what's there.
  ['bg-slate-900 text-white hover:bg-slate-800', 'bg-slate-900 dark:bg-teal-600 text-white hover:bg-slate-800 dark:hover:bg-teal-500']
];

for (const [search, replace] of replacements) {
  content = content.replaceAll(search, replace);
}

fs.writeFileSync(file, content);
console.log("Done dashboard page script");
