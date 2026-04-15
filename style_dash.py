import sys

with open('src/app/(features)/dashboard/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Imports
if 'useTheme' not in content:
    content = content.replace(
        'import { useEffect, useState } from \"react\";',
        'import { useEffect, useState } from \"react\";\nimport { useTheme } from \"next-themes\";\nimport { motion } from \"framer-motion\";\nimport { Sun, Moon, Monitor } from \"lucide-react\";'
    )

# 2. Main Background
content = content.replace(
    'bg-[linear-gradient(180deg,#fffdf4_0%,#f6f7fb_100%)]',
    'bg-slate-50 dark:bg-[#030612] transition-colors duration-700'
)

# 3. TopBar
content = content.replace(
    '<header className=\"sticky top-0 z-10 flex items-center justify-between border-b bg-white pl-14 pr-4 py-4 sm:pr-6 lg:pl-8 lg:pr-8\">',
    '<header className=\"sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/80 dark:border-slate-800 dark:bg-[#030612]/80 backdrop-blur-md pl-14 pr-4 py-4 sm:pr-6 lg:pl-8 lg:pr-8 transition-colors duration-700\">'
)

if 'ThemeToggle />' not in content:
    content = content.replace(
        '<span className=\"text-slate-900\">Dashboard</span>\n      </div>',
        '<span className=\"text-slate-900 dark:text-white\">Dashboard</span>\n      </div>\n      <ThemeToggle />'
    )

    theme_toggle = '''
/* -- Shared Theme Toggle -- */
function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className=\"h-10 w-10 rounded-xl border border-slate-200/50 bg-white/30 dark:border-white/[0.06] dark:bg-white/[0.02]\" />
    );
  }

  const themes = [
    { id: \"light\", label: \"Light\", Icon: Sun },
    { id: \"dark\", label: \"Dark\", Icon: Moon },
    { id: \"system\", label: \"System\", Icon: Monitor },
  ];

  return (
    <div className=\"relative z-50\">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className=\"flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/50 bg-white/60 text-slate-700 shadow-sm backdrop-blur-md transition-all hover:bg-white/80 dark:border-white/[0.08] dark:bg-white/[0.02] dark:text-slate-300 dark:hover:bg-white/[0.06] dark:hover:text-white\"
        aria-label=\"Toggle theme\"
      >
        {theme === \"dark\" ? (
          <Moon className=\"h-[18px] w-[18px]\" strokeWidth={2.5} />
        ) : theme === \"light\" ? (
          <Sun className=\"h-[18px] w-[18px]\" strokeWidth={2.5} />
        ) : (
          <Monitor className=\"h-[18px] w-[18px]\" strokeWidth={2.5} />
        )}
      </button>

      <motion.div
        initial={false}
        animate={{ opacity: isOpen ? 1 : 0, y: isOpen ? 0 : -10, pointerEvents: isOpen ? \"auto\" : \"none\" }}
        transition={{ duration: 0.2 }}
        className=\"absolute right-0 mt-3 flex w-[140px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white/80 p-1.5 shadow-[0_20px_40px_rgba(0,0,0,0.05)] backdrop-blur-3xl dark:border-slate-700/50 dark:bg-slate-900/80 dark:shadow-[0_20px_40px_rgba(0,0,0,0.4)]\"
      >
        {themes.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => {
              setTheme(id);
              setIsOpen(false);
            }}
            className={\lex items-center gap-3 rounded-xl px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all duration-300 \\}
          >
            <Icon className=\"h-[14px] w-[14px]\" strokeWidth={2.5} />
            {label}
          </button>
        ))}
      </motion.div>
      
      {isOpen && (
        <div 
          className=\"fixed inset-0 z-[-1]\" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
'''
    content += "\n" + theme_toggle

# Text colors globally
content = content.replace('text-slate-900', 'text-slate-900 dark:text-white')
content = content.replace('text-slate-950', 'text-slate-900 dark:text-white')
content = content.replace('text-slate-500', 'text-slate-500 dark:text-slate-400')
content = content.replace('text-slate-600', 'text-slate-600 dark:text-slate-300')
# Cards etc
content = content.replace('bg-white', 'bg-white dark:bg-slate-800/40 dark:backdrop-blur-sm')
content = content.replace('border-slate-200', 'border-slate-200 dark:border-slate-700/50')
content = content.replace('border-slate-100', 'border-slate-100 dark:border-slate-700/50')
content = content.replace('bg-slate-100', 'bg-slate-100 dark:bg-slate-700/40')
# SVG circles 
content = content.replace('className=\"text-slate-100\"', 'className=\"text-slate-100 dark:text-slate-700/40\"')


# Fix inner SVGs where dark modes might break slightly by specific patches if needed.
# For example, text-white dark:text-white replacement glitch check
content = content.replace('dark:text-white dark:text-white', 'dark:text-white')

with open('src/app/(features)/dashboard/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print(\"Dashboard fully patched to support dark themes!\")
