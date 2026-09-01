import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Radio, 
  Smartphone, 
  Tv, 
  ShieldAlert, 
  Clock, 
  Layers, 
  HeartHandshake, 
  CalendarDays,
  Flame,
  Activity,
  User,
  ShieldCheck,
  KeyRound
} from 'lucide-react';
import { Role, ServiceSegment, AuthUser } from '../types/hub';

interface NavbarProps {
  activeRole: Role;
  setActiveRole: (role: Role) => void;
  onOpenHolySpiritModal: () => void;
  onOpenMobileSimulator: () => void;
  onToggleEmergency: () => void;
  isEmergencyActive: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentSegment?: ServiceSegment;
  currentUser: AuthUser;
  onOpenAuthModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeRole,
  setActiveRole,
  onOpenHolySpiritModal,
  onOpenMobileSimulator,
  onToggleEmergency,
  isEmergencyActive,
  activeTab,
  setActiveTab,
  currentSegment,
  currentUser,
  onOpenAuthModal,
}) => {
  const [systemTime, setSystemTime] = useState<string>('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setSystemTime(
        now.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const roles: { id: Role; label: string; icon: string; name: string; color: string }[] = [
    { id: 'admin', label: 'Admin', icon: '🛡️', name: 'Director', color: 'bg-purple-950/70 border-purple-500/40 text-purple-200 shadow-[0_0_10px_rgba(147,51,234,0.3)]' },
    { id: 'comms', label: 'Comms', icon: '🗣️', name: 'Nomsa', color: 'bg-emerald-950/70 border-emerald-500/40 text-emerald-200 shadow-[0_0_10px_rgba(16,185,129,0.3)]' },
    { id: 'tech', label: 'Tech & Systems', icon: '🖥️', name: 'Thabo', color: 'bg-blue-950/70 border-blue-500/40 text-blue-200 shadow-[0_0_10px_rgba(59,130,246,0.3)]' },
    { id: 'presenter', label: 'Presenter', icon: '🎤', name: 'Lebo', color: 'bg-amber-950/70 border-amber-500/40 text-amber-200 shadow-[0_0_10px_rgba(245,158,11,0.3)]' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0e0e1a]/95 backdrop-blur-md border-b border-purple-900/30 px-4 lg:px-6 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Brand and Service Title */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-purple-600 flex items-center justify-center shadow-[0_0_15px_rgba(147,51,234,0.5)] shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                KIDS CHURCH <span className="text-purple-400">HUB</span>
              </h1>
              <div className="px-2.5 py-0.5 rounded-full border border-green-500/30 bg-green-500/10 flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest">Live Broadcast</span>
              </div>
            </div>
            <p className="text-[11px] text-gray-400 flex items-center gap-1.5 font-medium">
              <span>CRC Dream Week Conference</span>
              <span className="text-gray-600">•</span>
              <span className="text-purple-300">Day 3: Bigger Together</span>
            </p>
          </div>
        </div>

        {/* Center: Module Navigation Tabs */}
        <div className="flex items-center gap-1 bg-[#161626] p-1 rounded-xl border border-white/5 overflow-x-auto">
          <button
            id="nav-tab-comms"
            onClick={() => setActiveTab('comms')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'comms'
                ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]'
                : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
            <span>1. Comms</span>
          </button>

          <button
            id="nav-tab-tech"
            onClick={() => setActiveTab('tech')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'tech'
                ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]'
                : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
            }`}
          >
            <Tv className="w-3.5 h-3.5 text-blue-400" />
            <span>2. Tech & Systems</span>
          </button>

          <button
            id="nav-tab-presenter"
            onClick={() => setActiveTab('presenter')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'presenter'
                ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]'
                : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Presenter HUD</span>
          </button>

          <button
            id="nav-tab-team"
            onClick={() => setActiveTab('team')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'team'
                ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]'
                : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
            }`}
          >
            <HeartHandshake className="w-3.5 h-3.5 text-purple-300" />
            <span>4. Team Hub</span>
          </button>

          <button
            id="nav-tab-planner"
            onClick={() => setActiveTab('planner')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'planner'
                ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]'
                : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5 text-indigo-400" />
            <span>5. Planner</span>
          </button>

          <button
            id="nav-tab-templates"
            onClick={() => setActiveTab('templates')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'templates'
                ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]'
                : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-purple-400" />
            <span>6. Templates</span>
            <span className="text-[9px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1 rounded">
              Admin
            </span>
          </button>
        </div>

        {/* Right: Immersive Telemetry & System Clock & Auth */}
        <div className="flex items-center gap-3">
          
          {/* Current Segment + System Clock Readout */}
          <div className="hidden xl:flex items-center gap-3">
            <div className="text-right">
              <div className="text-[10px] text-gray-500 uppercase tracking-widest leading-none">Current Segment</div>
              <div className="text-xs font-bold text-white max-w-[140px] truncate mt-0.5">
                {currentSegment ? currentSegment.title : 'Worship: "Unstoppable God"'}
              </div>
            </div>

            <div className="h-8 w-[1px] bg-white/10"></div>

            <div className="text-right">
              <div className="text-[10px] text-gray-500 uppercase tracking-widest leading-none font-mono">System Clock</div>
              <div className="text-base font-mono font-bold text-white leading-none mt-0.5">
                {systemTime || '10:42:18'}
              </div>
            </div>
          </div>

          {/* Holy Spirit Mode Trigger Button */}
          <button
            id="btn-holy-spirit-mode"
            onClick={onOpenHolySpiritModal}
            className="group relative px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-900/30 hover:brightness-110 active:scale-95 transition-all animate-pulse"
          >
            <Flame className="w-4 h-4 text-slate-950 fill-slate-950" />
            <span className="hidden sm:inline">Holy Spirit</span>
            <span className="sm:hidden">Override</span>
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400"></span>
            </span>
          </button>

          {/* Emergency Alert Badge */}
          {isEmergencyActive && (
            <button
              id="btn-emergency-indicator"
              onClick={onToggleEmergency}
              className="px-2.5 py-1.5 rounded-xl bg-red-600 text-white font-bold text-xs flex items-center gap-1 animate-glow-red"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>EMERGENCY</span>
            </button>
          )}

          {/* Mobile Mockup Simulator View */}
          <button
            id="btn-mobile-simulator"
            onClick={onOpenMobileSimulator}
            title="Preview 3 Mobile Roles"
            className="p-2 rounded-xl bg-[#161626] border border-white/5 text-gray-300 hover:text-purple-300 hover:border-purple-500/40 transition-all flex items-center gap-1 text-xs font-semibold"
          >
            <Smartphone className="w-4 h-4 text-purple-400" />
          </button>

          {/* Authenticated User Pill Button */}
          <button
            onClick={onOpenAuthModal}
            className="flex items-center gap-2 p-1.5 pr-3 rounded-2xl bg-[#161626] border border-white/10 hover:border-purple-500/50 transition-all group shadow-sm"
          >
            <div
              className={`w-7 h-7 rounded-xl bg-gradient-to-br ${currentUser?.avatarColor || 'from-amber-500 to-orange-600'} text-white font-bold flex items-center justify-center text-xs shadow-sm`}
            >
              {currentUser?.name ? currentUser.name.charAt(0) : 'U'}
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-[11px] font-bold text-white group-hover:text-purple-300 transition-colors leading-tight">
                {currentUser?.name || 'Pastor Hope'}
              </div>
              <div className="text-[9px] font-extrabold uppercase font-mono text-purple-400 leading-none mt-0.5">
                {currentUser?.role || 'admin'}
              </div>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};

