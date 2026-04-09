import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Home, Users, Activity, MessageSquare, ShieldCheck, ChevronDown, LayoutDashboard, Compass, Map } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const navItems = [
  { icon: Home, label: 'Dashboard', path: '/' },
  { icon: Users, label: 'Roster', path: '/roster' },
  { icon: Activity, label: 'Analysis', path: '/analysis' },
];

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isRecoveryOpen, setIsRecoveryOpen] = React.useState(location.pathname.startsWith('/recovery'));

  const handleRecoveryClick = (e: React.MouseEvent) => {
    if (location.pathname.startsWith('/recovery')) {
      setIsRecoveryOpen(!isRecoveryOpen);
    } else {
      navigate('/recovery');
      setIsRecoveryOpen(true);
    }
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-primary dark:bg-slate-950 text-white h-screen sticky top-0 transition-colors duration-300">
      <div className="p-6 flex items-center gap-2">
        <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
          <Activity className="text-primary w-5 h-5" />
        </div>
        <span className="text-xl font-bold tracking-tight">InjuryIQ</span>
      </div>
      
      <nav className="flex-1 px-4 py-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
              isActive 
                ? "bg-accent text-primary font-semibold shadow-lg shadow-accent/20" 
                : "text-white/60 hover:text-white hover:bg-white/10"
            )}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}

        {/* Recovery Dropdown */}
        <div className="space-y-1">
          <button
            onClick={handleRecoveryClick}
            className={cn(
              "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200",
              location.pathname.startsWith('/recovery')
                ? "bg-accent text-primary font-semibold shadow-lg shadow-accent/20"
                : "text-white/60 hover:text-white hover:bg-white/10"
            )}
          >
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5" />
              <span>Recovery</span>
            </div>
            <ChevronDown className={cn(
              "w-4 h-4 transition-transform duration-200",
              isRecoveryOpen ? "rotate-180" : ""
            )} />
          </button>

          <AnimatePresence>
            {isRecoveryOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden pl-4 space-y-1"
              >
                <button
                  onClick={() => navigate('/recovery?view=ROADMAP')}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-all",
                    location.search.includes('view=ROADMAP') || (location.pathname === '/recovery' && !location.search.includes('view=HUB'))
                      ? "text-accent font-bold"
                      : "text-white/40 hover:text-white hover:bg-white/5"
                  )}
                >
                  <Map className="w-4 h-4" />
                  <span>Progress Roadmap</span>
                </button>
                <button
                  onClick={() => navigate('/recovery?view=HUB')}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-all",
                    location.search.includes('view=HUB')
                      ? "text-accent font-bold"
                      : "text-white/40 hover:text-white hover:bg-white/5"
                  )}
                >
                  <Compass className="w-4 h-4" />
                  <span>Discovery Hub</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>
      
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-8 h-8 rounded-full bg-white/20" />
          <div className="flex flex-col">
            <span className="text-sm font-medium">Coach Martinez</span>
            <span className="text-xs text-white/40">Elite Academy</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

export function BottomNav() {
  const location = useLocation();
  
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-[#020617] border-t border-slate-200 dark:border-slate-800 px-6 py-3 flex justify-between items-center z-50 transition-colors duration-300">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) => cn(
            "flex flex-col items-center gap-1",
            isActive ? "text-accent" : "text-slate-400 dark:text-slate-500"
          )}
        >
          <item.icon className="w-6 h-6" />
          <span className="text-[10px] font-medium">{item.label}</span>
        </NavLink>
      ))}
      <NavLink
        to="/recovery"
        className={({ isActive }) => cn(
          "flex flex-col items-center gap-1",
          isActive ? "text-accent" : "text-slate-400 dark:text-slate-500"
        )}
      >
        <ShieldCheck className="w-6 h-6" />
        <span className="text-[10px] font-medium">Recovery</span>
      </NavLink>
    </nav>
  );
}
