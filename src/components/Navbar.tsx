import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Radio, 
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
  ChevronDown,
  Globe,
  UserPlus,
  Check,
  LogOut,
  Megaphone,
  Crown,
  Database,
  Menu,
  X
} from 'lucide-react';
import { Role, ServiceSegment, AuthUser, ClassId, ClassInfo } from '../types/hub';
import { CLASSES_CONFIG } from '../data/classHubsData';

interface NavbarProps {
  activeRole: Role;
  setActiveRole: (role: Role) => void;
  onOpenHolySpiritModal: () => void;
  onOpenMobileSimulator?: () => void;
  onToggleEmergency: () => void;
  isEmergencyActive: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentSegment?: ServiceSegment;
  currentUser: AuthUser;
  onOpenAuthModal: (tab?: 'quick_switch' | 'login' | 'register' | 'manage' | 'permissions') => void;
  onLogout?: () => void;
  selectedClassId: ClassId;
  onSelectClass: (classId: ClassId) => void;
  allClasses: ClassInfo[];
  onOpenDirectorAnnouncement?: () => void;
  isMobileMode?: boolean;
  onToggleMobileMode?: () => void;
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
  onLogout,
  selectedClassId,
  onSelectClass,
  allClasses,
  onOpenDirectorAnnouncement,
}) => {
  const [systemTime, setSystemTime] = useState<string>('');
  const [isClassDropdownOpen, setIsClassDropdownOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

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

  // Close dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsClassDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        // Only close if clicking outside the menu button as well
        const menuBtn = document.getElementById('btn-mobile-menu-toggle');
        if (menuBtn && !menuBtn.contains(event.target as Node)) {
          setIsMobileMenuOpen(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isDirector = currentUser?.role === 'director' || (currentUser?.role === 'admin' && currentUser?.assignedClassId === 'all');
  const isClassAdmin = Boolean(currentUser?.isClassAdmin) || (currentUser?.role === 'admin' && currentUser?.assignedClassId !== 'all');
  const canCreateAccounts = isDirector || isClassAdmin;
  const isTechOnly = currentUser?.role === 'tech';
  const isPresenterOnly = currentUser?.role === 'presenter';
  const isCommsOnly = currentUser?.role === 'comms';

  const activeClass = allClasses.find((c) => c.id === selectedClassId) || allClasses[0];

  const getClassBadgeStyle = (id: ClassId) => {
    switch (id) {
      case 'jy':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'tb':
        return 'bg-pink-500/20 text-pink-300 border-pink-500/40';
      case 'kb':
        return 'bg-red-500/20 text-red-300 border-red-500/40';
      case 'la-orange':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/40';
      case 'la-yellow':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40';
      default:
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
    }
  };

  const navTabs = [
    ...(isDirector ? [{ id: 'all-classes', label: '0. All Classes', icon: Globe, color: 'text-purple-400' }] : []),
    ...(!isTechOnly && !isPresenterOnly ? [{ id: 'comms', label: '1. Comms', icon: Radio, color: 'text-emerald-400' }] : []),
    ...(!isPresenterOnly && !isCommsOnly ? [{ id: 'tech', label: '2. Tech', icon: Tv, color: 'text-blue-400' }] : []),
    ...(!isTechOnly && !isCommsOnly ? [{ id: 'presenter', label: '3. Stage HUD', icon: Clock, color: 'text-amber-400' }] : []),
    ...(!isTechOnly && !isPresenterOnly && !isCommsOnly ? [
      { id: 'team', label: '4. Team', icon: HeartHandshake, color: 'text-purple-300' },
      { id: 'planner', label: '5. Planner', icon: CalendarDays, color: 'text-indigo-400' },
    ] : []),
    ...(isDirector ? [{ id: 'templates', label: '6. Templates', icon: Layers, color: 'text-purple-400' }] : []),
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0e0e1a]/95 backdrop-blur-md border-b border-purple-900/30 px-3 sm:px-6 py-2 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col gap-2">
        
        {/* Top Row: Brand, Class Hub Selector, and Action Bar */}
        <div className="flex items-center justify-between gap-2.5">
          
          {/* Left: Brand & Class Hub Switcher */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-700 to-indigo-600 flex items-center justify-center shadow-[0_0_15px_rgba(147,51,234,0.4)] shrink-0 text-white font-black text-sm">
                KC
              </div>
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-white flex items-center gap-1">
                    CRC KIDS <span className="text-purple-400">HUBS</span>
                  </h1>
                  <span className="hidden sm:inline-flex px-1.5 py-0.2 rounded-full border border-amber-500/40 bg-amber-500/15 text-[9px] font-extrabold text-amber-300 uppercase tracking-wide">
                    🇿🇦 JHB
                  </span>
                </div>
                <p className="text-[9px] text-gray-400 font-medium hidden md:block">
                  Production Command • All 5 Classes
                </p>
              </div>
            </div>

            {/* CLASS HUB DROPDOWN SELECTOR */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => {
                  if (isDirector) {
                    setIsClassDropdownOpen(!isClassDropdownOpen);
                  }
                }}
                title={isDirector ? 'Switch Class Hub' : `Assigned to ${activeClass.name}`}
                className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl border transition-all text-left shadow-sm min-h-[38px] ${
                  !isDirector ? 'cursor-default opacity-90' : 'cursor-pointer hover:border-purple-400 active:scale-95'
                } ${
                  selectedClassId === 'all'
                    ? 'bg-purple-950/40 border-purple-500/50 text-white'
                    : selectedClassId === 'jy'
                    ? 'bg-blue-950/40 border-blue-500/50 text-white'
                    : selectedClassId === 'tb'
                    ? 'bg-pink-950/40 border-pink-500/50 text-white'
                    : selectedClassId === 'kb'
                    ? 'bg-red-950/40 border-red-500/50 text-white'
                    : selectedClassId === 'la-orange'
                    ? 'bg-orange-950/40 border-orange-500/50 text-white'
                    : 'bg-yellow-950/40 border-yellow-500/50 text-white'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  {selectedClassId === 'all' ? (
                    <Globe className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  ) : (
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                      selectedClassId === 'jy' ? 'bg-blue-400' :
                      selectedClassId === 'tb' ? 'bg-pink-400' :
                      selectedClassId === 'kb' ? 'bg-red-400' :
                      selectedClassId === 'la-orange' ? 'bg-orange-400' : 'bg-yellow-400'
                    }`}></span>
                  )}
                  <div>
                    <div className="text-xs font-bold leading-tight flex items-center gap-1">
                      <span className="truncate max-w-[100px] sm:max-w-none">
                        {selectedClassId === 'all' ? 'All Classes' : activeClass.name}
                      </span>
                      <span className={`text-[8px] sm:text-[9px] uppercase px-1 py-0.2 rounded border font-mono hidden xs:inline ${getClassBadgeStyle(selectedClassId)}`}>
                        {selectedClassId === 'all' ? 'Director' : activeClass.colorName}
                      </span>
                    </div>
                  </div>
                </div>
                {isDirector ? (
                  <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform shrink-0 ${isClassDropdownOpen ? 'rotate-180' : ''}`} />
                ) : (
                  <span className="text-[8px] text-gray-500 px-1 py-0.5 rounded bg-white/5 border border-white/10 hidden sm:inline">
                    Locked
                  </span>
                )}
              </button>

              {/* Dropdown Menu (Strictly accessible by Directors) */}
              {isClassDropdownOpen && isDirector && (
                <div className="absolute left-0 mt-2 w-72 bg-[#141424] border border-white/10 rounded-2xl shadow-2xl p-2 z-50 animate-fadeIn space-y-1">
                  <div className="px-2 py-1 text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                    Director Class Switcher:
                  </div>

                  {/* All Classes Overview Option */}
                  <button
                    onClick={() => {
                      onSelectClass('all');
                      setActiveTab('all-classes');
                      setIsClassDropdownOpen(false);
                    }}
                    className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between transition-colors min-h-[44px] ${
                      selectedClassId === 'all' ? 'bg-purple-600/30 border border-purple-500/50 text-white' : 'hover:bg-white/5 text-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-purple-400 shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-white">All Classes Command Center</div>
                        <div className="text-[10px] text-gray-400">Master 5-class monitoring & global broadcast</div>
                      </div>
                    </div>
                    {selectedClassId === 'all' && <Check className="w-4 h-4 text-purple-400" />}
                  </button>

                  <div className="h-[1px] bg-white/10 my-1"></div>

                  {/* 5 Individual Class Options */}
                  {allClasses.map((cls) => {
                    const isSelected = selectedClassId === cls.id;
                    const dotColor = cls.id === 'jy' ? 'bg-blue-400' :
                                     cls.id === 'tb' ? 'bg-pink-400' :
                                     cls.id === 'kb' ? 'bg-red-400' :
                                     cls.id === 'la-orange' ? 'bg-orange-400' : 'bg-yellow-400';
                    return (
                      <button
                        key={cls.id}
                        onClick={() => {
                          onSelectClass(cls.id);
                          if (activeTab === 'all-classes') {
                            setActiveTab('comms');
                          }
                          setIsClassDropdownOpen(false);
                        }}
                        className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between transition-colors min-h-[44px] ${
                          isSelected ? 'bg-white/10 border border-white/20 text-white' : 'hover:bg-white/5 text-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${dotColor}`}></span>
                          <div>
                            <div className="text-xs font-bold text-white flex items-center gap-1.5">
                              <span>{cls.name}</span>
                              <span className="text-[9px] text-gray-400 font-normal">({cls.colorName})</span>
                            </div>
                            <div className="text-[10px] text-gray-400">{cls.grade} • {cls.ageGroup}</div>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Action Icons & Mobile Hamburger */}
          <div className="flex items-center gap-1.5 sm:gap-2 justify-end shrink-0">
            
            {/* Director Global Broadcast Announcement Button (Desktop) */}
            {isDirector && onOpenDirectorAnnouncement && (
              <button
                onClick={onOpenDirectorAnnouncement}
                title="Broadcast Director Alert to all 5 classes"
                className="hidden lg:flex px-2.5 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600 border border-purple-500/40 text-purple-200 hover:text-white font-bold text-xs items-center gap-1.5 transition-all shadow-sm min-h-[38px]"
              >
                <Megaphone className="w-3.5 h-3.5 text-purple-300 animate-pulse" />
                <span>Broadcast Alert</span>
              </button>
            )}

            {/* Holy Spirit Mode Trigger Button (Desktop) */}
            {!isTechOnly && (
              <button
                id="btn-holy-spirit-mode"
                onClick={onOpenHolySpiritModal}
                className="hidden lg:flex group relative px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 text-slate-950 font-bold text-xs items-center gap-1.5 shadow-lg shadow-amber-900/30 hover:brightness-110 active:scale-95 transition-all min-h-[38px]"
              >
                <Flame className="w-3.5 h-3.5 text-slate-950 fill-slate-950" />
                <span>Holy Spirit (+3m)</span>
              </button>
            )}

            {/* Emergency Alert Indicator Badge */}
            {isEmergencyActive && (
              <button
                id="btn-emergency-indicator"
                onClick={onToggleEmergency}
                className="px-2.5 py-1.5 rounded-xl bg-red-600 text-white font-bold text-xs flex items-center gap-1 animate-glow-red min-h-[38px]"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">EMERGENCY</span>
              </button>
            )}

            {/* Quick Add Account Button (Desktop) */}
            {canCreateAccounts && (
              <button
                onClick={() => onOpenAuthModal('register')}
                title="Register volunteer account & assign class"
                className="hidden lg:flex p-2 rounded-xl bg-[#161626] border border-white/5 text-purple-300 hover:text-white hover:border-purple-500/40 hover:bg-purple-600/20 transition-all items-center gap-1 text-xs font-semibold min-h-[38px]"
              >
                <UserPlus className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-[11px]">+ Account</span>
              </button>
            )}

            {/* Authenticated User Pill Button (Tap to switch user) */}
            <button
              id="btn-quick-user-switch"
              onClick={() => onOpenAuthModal('quick_switch')}
              className="flex items-center gap-1.5 sm:gap-2 p-1 sm:p-1.5 sm:pr-2.5 rounded-xl bg-[#161626] border border-white/10 hover:border-purple-500/50 transition-all group shadow-sm min-h-[38px]"
              title="Click to switch active user account or sign in"
            >
              <div
                className={`w-7 h-7 rounded-lg bg-gradient-to-br ${currentUser?.avatarColor || 'from-amber-500 to-orange-600'} text-white font-bold flex items-center justify-center text-xs shadow-sm shrink-0`}
              >
                {currentUser?.name ? currentUser.name.charAt(0) : 'U'}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-[11px] font-bold text-white group-hover:text-purple-300 transition-colors leading-tight truncate max-w-[90px]">
                  {currentUser?.name || 'User'}
                </div>
                <div className="text-[8px] font-extrabold uppercase font-mono text-purple-400 leading-none mt-0.5">
                  {currentUser?.role === 'director' || (currentUser?.role === 'admin' && currentUser?.assignedClassId === 'all')
                    ? 'Director' 
                    : `${currentUser?.role || 'volunteer'}`}
                </div>
              </div>
            </button>

            {/* Mobile Hamburger Menu Toggle Button (Visible on < lg screens) */}
            <button
              id="btn-mobile-menu-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-[#161626] border border-white/10 text-gray-300 hover:text-white hover:border-purple-500/40 min-h-[44px] min-w-[44px] flex items-center justify-center transition-all active:scale-95"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5 text-purple-400" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Quick Sign Out Button (Desktop) */}
            {onLogout && (
              <button
                onClick={onLogout}
                title="Sign Out"
                className="hidden lg:flex p-2 rounded-xl bg-[#161626] border border-white/10 hover:border-red-500/50 hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-all items-center justify-center min-h-[38px] min-w-[38px]"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Second Row: Module Navigation Tabs Bar with Touch Targets */}
        <nav 
          aria-label="Module Navigation"
          className="flex items-center gap-1 bg-[#161626] p-1 rounded-xl border border-white/5 overflow-x-auto no-scrollbar scroll-smooth w-full"
        >
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`nav-tab-${tab.id}`}
                onClick={() => {
                  setActiveTab(tab.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 min-h-[44px] touch-manipulation ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/5 active:bg-white/10'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : tab.color}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Mobile Menu Drawer (Collapsible for small screens) */}
      {isMobileMenuOpen && (
        <div 
          ref={mobileMenuRef}
          className="lg:hidden mt-2 p-3 bg-[#141424] border border-white/10 rounded-2xl shadow-2xl space-y-3 animate-in fade-in slide-in-from-top-2"
        >
          {/* User & Role Status Section */}
          <div className="p-3 bg-black/40 rounded-xl border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-9 h-9 rounded-xl bg-gradient-to-br ${currentUser?.avatarColor || 'from-amber-500 to-orange-600'} text-white font-bold flex items-center justify-center text-sm shadow-sm`}
              >
                {currentUser?.name ? currentUser.name.charAt(0) : 'U'}
              </div>
              <div>
                <div className="text-xs font-bold text-white">{currentUser?.name}</div>
                <div className="text-[10px] text-purple-400 font-mono uppercase">
                  {currentUser?.role === 'director' ? 'Ministry Director' : `${currentUser?.role} • ${currentUser?.assignedClassId?.toUpperCase()}`}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                onOpenAuthModal('quick_switch');
                setIsMobileMenuOpen(false);
              }}
              className="px-2.5 py-1.5 rounded-lg bg-purple-600/30 hover:bg-purple-600 border border-purple-500/40 text-purple-200 hover:text-white font-bold text-[11px] min-h-[36px]"
            >
              Switch User
            </button>
          </div>

          {/* Quick Action Grid for Mobile */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* Holy Spirit Mode */}
            {!isTechOnly && (
              <button
                onClick={() => {
                  onOpenHolySpiritModal();
                  setIsMobileMenuOpen(false);
                }}
                className="p-2.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 text-slate-950 font-bold flex items-center justify-center gap-2 min-h-[44px] shadow-sm"
              >
                <Flame className="w-4 h-4 fill-slate-950" />
                <span>Holy Spirit (+3m)</span>
              </button>
            )}

            {/* Director Announcement */}
            {isDirector && onOpenDirectorAnnouncement && (
              <button
                onClick={() => {
                  onOpenDirectorAnnouncement();
                  setIsMobileMenuOpen(false);
                }}
                className="p-2.5 rounded-xl bg-purple-600/30 border border-purple-500/40 text-purple-200 font-bold flex items-center justify-center gap-2 min-h-[44px]"
              >
                <Megaphone className="w-4 h-4 text-purple-300" />
                <span>Broadcast Alert</span>
              </button>
            )}

            {/* Add Volunteer Account */}
            {canCreateAccounts && (
              <button
                onClick={() => {
                  onOpenAuthModal('register');
                  setIsMobileMenuOpen(false);
                }}
                className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-purple-300 font-bold flex items-center justify-center gap-2 min-h-[44px]"
              >
                <UserPlus className="w-4 h-4 text-purple-400" />
                <span>+ Add Volunteer</span>
              </button>
            )}

            {/* Emergency Screen Blanking Toggle */}
            <button
              onClick={() => {
                onToggleEmergency();
                setIsMobileMenuOpen(false);
              }}
              className={`p-2.5 rounded-xl font-bold flex items-center justify-center gap-2 min-h-[44px] ${
                isEmergencyActive 
                  ? 'bg-red-600 text-white shadow-lg' 
                  : 'bg-rose-950/40 border border-rose-500/40 text-rose-300'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>{isEmergencyActive ? 'Clear Emergency' : 'Emergency Blank'}</span>
            </button>

            {/* Sign Out */}
            {onLogout && (
              <button
                onClick={() => {
                  onLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="p-2.5 rounded-xl bg-red-950/30 border border-red-500/30 text-red-300 font-bold flex items-center justify-center gap-2 min-h-[44px]"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
