import React, { useState, useEffect } from 'react';
import Dashboard from './pages/Dashboard';
import { 
  UploadCloud, 
  FileText, 
  BarChart3, 
  History, 
  Sun, 
  Moon, 
  Flame, 
  Activity,
  Layers
} from 'lucide-react';

export default function App() {
  // Theme state default to light as per reference screenshots
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });
  
  // Navigation active tab
  const [activeTab, setActiveTab] = useState('ingest');

  // Handle document selected globally for Digitized Viewer cross-tab interaction
  const [activeDocument, setActiveDocument] = useState(null);

  // Sync theme to document element
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const navItems = [
    {
      id: 'ingest',
      label: 'Ingest & Upload',
      sub: 'Stage moulding plans',
      icon: UploadCloud
    },
    {
      id: 'viewer',
      label: 'Digitized Viewer',
      sub: 'Parsed document blocks',
      icon: FileText
    },
    {
      id: 'analytics',
      label: 'Analytics',
      sub: 'Tonnage & cluster signals',
      icon: BarChart3
    },
    {
      id: 'logs',
      label: 'Historical Logs',
      sub: 'Saved moulding archive',
      icon: History
    }
  ];

  const activeItem = navItems.find(item => item.id === activeTab) || navItems[0];

  return (
    <div className="min-h-screen flex bg-[#f8fafc] text-slate-800 dark:bg-[#090d16] dark:text-slate-100 transition-colors duration-200">
      
      {/* 1. Left Sidebar */}
      <aside className="w-72 shrink-0 bg-white dark:bg-[#0f172a] border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between z-30 transition-colors duration-200">
        <div>
          {/* Logo Branding */}
          <div className="p-6 border-b border-slate-100 dark:border-slate-800/60 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#f97316] flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-orange-500/20">
              F
            </div>
            <div>
              <h1 className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white uppercase">
                FORGE.IQ
              </h1>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                PARSING ENGINE V3.2
              </p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="p-4 space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-150 text-left relative ${
                    isActive 
                      ? 'bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-white font-bold' 
                      : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/30'
                  }`}
                >
                  {/* Left Orange Indicator */}
                  {isActive && (
                    <span className="absolute left-0 top-3 bottom-3 w-1 rounded-r bg-[#f97316]" />
                  )}
                  <Icon size={18} className={isActive ? 'text-[#f97316]' : 'text-slate-400 dark:text-slate-500'} />
                  <div>
                    <div className="text-[13px] font-semibold tracking-tight leading-none">
                      {item.label}
                    </div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-medium leading-none">
                      {item.sub}
                    </div>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Sidebar Status */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-850 bg-slate-50/60 dark:bg-[#0b0f19]/40">
          <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mb-2">
            Engine Status
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-300">READY</span>
            </div>
            <div className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
              98.4%
            </div>
          </div>
        </div>
      </aside>

      {/* 2. Right Content Wrapper */}
      <div className="flex-grow flex flex-col min-w-0">
        
        {/* Top Header Navbar */}
        <header className="h-16 shrink-0 bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 px-8 flex items-center justify-between z-20 sticky top-0 transition-colors duration-200">
          
          {/* Header Left: Tab Breadcrumb */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#f97316] font-bold uppercase tracking-wider flex items-center gap-1.5 shrink-0">
              {activeItem.label}
            </span>
            <span className="text-slate-300 dark:text-slate-700 font-semibold">/</span>
            <span className="text-slate-400 dark:text-slate-500 font-medium truncate">
              {activeItem.sub}
            </span>
          </div>

          {/* Header Right: Telemetry & Theme Switcher */}
          <div className="flex items-center gap-6">
            
            {/* Temperature Metric */}
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-350">
              <Flame size={14} className="text-[#f97316] animate-pulse" />
              <span className="font-mono font-bold">1042°C</span>
            </div>

            {/* Throughput Metric */}
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-350">
              <Activity size={14} className="text-cyan-500" />
              <span className="font-mono font-bold">4.2 t/h</span>
            </div>

            <div className="w-px h-4 bg-slate-200 dark:bg-slate-800" />

            {/* Light/Dark Toggle Switch */}
            <button
              onClick={toggleTheme}
              className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors border border-slate-200/40 dark:border-transparent"
              aria-label="Toggle Theme Mode"
            >
              {theme === 'light' ? (
                <Moon size={16} />
              ) : (
                <Sun size={16} />
              )}
            </button>
          </div>
        </header>

        {/* Scrollable Main Content */}
        <main className="flex-grow overflow-y-auto">
          <Dashboard 
            activeTab={activeTab} 
            setActiveTab={setActiveTab}
            activeDocument={activeDocument}
            setActiveDocument={setActiveDocument}
          />
        </main>
      </div>
    </div>
  );
}