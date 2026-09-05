import React, { useState, useEffect, useRef } from 'react';
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
  KeyRound,
  ChevronDown,
  Globe,
  UserPlus,
  Check,
  LogOut,
  Megaphone,
  Crown
} from 'lucide-react';
import { Role, ServiceSegment, AuthUser, ClassId, ClassInfo } from '../types/hub';
import { CLASSES_CONFIG } from '../data/classHubsData';

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
  isMobileMode,
  onToggleMobileMode,
}) => {
  const [systemTime, setSystemTime] = useState<string>('');
  const [isClassDropdownOpen, setIsClassDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  return (
    <header className="sticky top-0 z-40 bg-[#0e0e1a]/95 backdrop-blur-md border-b border-purple-900/30 px-3 sm:px-6 py-2.5 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2.5">
        
        {/* Left: Brand & Class Hub Switcher */}
        <div className="flex items-center justify-between lg:justify-start gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-700 to-indigo-600 flex items-center justify-center shadow-[0_0_15px_rgba(147,51,234,0.4)] shrink-0 text-white font-black text-sm">
              KC
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="text-base font-extrabold tracking-tight text-white flex items-center gap-1">
                  CRC KIDS CHURCH <span className="text-purple-400">HUBS</span>
                </h1>
                <div className="flex px-2 py-0.5 rounded-full border border-amber-500/40 bg-amber-500/15 items-center gap-1">
                  <span className="text-[10px] font-extrabold text-amber-300 uppercase tracking-wide">🇿🇦 Johannesburg</span>
                </div>
              </div>
              <p className="text-[10px] text-gray-400 font-medium">
                Campus Production Command • All 5 Classes
              </p>
            </div>
          </div>

          {/* CLASS HUB DROPDOWN SELECTOR (DIRECTORS ONLY CAN SWITCH; CLASS ADMINS/TECHS LOCKED) */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => {
                if (isDirector) {
                  setIsClassDropdownOpen(!isClassDropdownOpen);
                }
              }}
              title={isDirector ? 'Switch Class Hub' : `Assigned to ${activeClass.name} (Only Directors have multi-class switching access)`}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all text-left shadow-sm ${
                !isDirector ? 'cursor-default opacity-90' : 'cursor-pointer hover:border-purple-400'
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
                  <Globe className="w-3.5 h-3.5 text-purple-400" />
                ) : (
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    selectedClassId === 'jy' ? 'bg-blue-400' :
                    selectedClassId === 'tb' ? 'bg-pink-400' :
                    selectedClassId === 'kb' ? 'bg-red-400' :
                    selectedClassId === 'la-orange' ? 'bg-orange-400' : 'bg-yellow-400'
                  }`}></span>
                )}
                <div>
                  <div className="text-xs font-bold leading-tight flex items-center gap-1.5">
                    <span>{selectedClassId === 'all' ? 'All Classes' : activeClass.name}</span>
                    <span className={`text-[9px] uppercase px-1.5 py-0.2 rounded border font-mono ${getClassBadgeStyle(selectedClassId)}`}>
                      {selectedClassId === 'all' ? 'Director' : activeClass.colorName}
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-400 leading-none mt-0.5">
                    {selectedClassId === 'all' ? 'Overseer Command' : `${activeClass.colorName} • ${activeClass.grade}`}
                  </div>
                </div>
              </div>
              {isDirector ? (
                <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isClassDropdownOpen ? 'rotate-180' : ''}`} />
              ) : (
                <span className="text-[9px] text-gray-500 px-1 py-0.5 rounded bg-white/5 border border-white/10 ml-1">
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
                  className={`w-full p-2 rounded-xl text-left flex items-center justify-between transition-colors ${
                    selectedClassId === 'all' ? 'bg-purple-600/30 border border-purple-500/50 text-white' : 'hover:bg-white/5 text-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-purple-400" />
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
                      className={`w-full p-2 rounded-xl text-left flex items-center justify-between transition-colors ${
                        isSelected ? 'bg-white/10 border border-white/20 text-white' : 'hover:bg-white/5 text-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${dotColor}`}></span>
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

        {/* Center: Module Navigation Tabs (STRICT ROLE ISOLATION) */}
        <div className="flex items-center gap-1 bg-[#161626] p-1 rounded-xl border border-white/5 overflow-x-auto shrink-0">
          
          {/* Tech-only role view: ONLY Tech tab */}
          {isTechOnly && (
            <button
              id="nav-tab-tech"
              onClick={() => setActiveTab('tech')}
              className="px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)] flex items-center gap-2"
            >
              <Tv className="w-4 h-4 text-blue-300" />
              <span>Tech & Audio Console</span>
            </button>
          )}

          {/* Presenter-only role view: ONLY Stage HUD tab */}
          {isPresenterOnly && (
            <button
              id="nav-tab-presenter"
              onClick={() => setActiveTab('presenter')}
              className="px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)] flex items-center gap-2"
            >
              <Clock className="w-4 h-4 text-amber-300" />
              <span>Stage Presenter HUD</span>
            </button>
          )}

          {/* Comms-only role view: ONLY Comms tab */}
          {isCommsOnly && (
            <button
              id="nav-tab-comms"
              onClick={() => setActiveTab('comms')}
              className="px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)] flex items-center gap-2"
            >
              <Radio className="w-4 h-4 text-emerald-300" />
              <span>Comms & Timeline</span>
            </button>
          )}

          {/* Directors and Class Admins */}
          {!isTechOnly && !isPresenterOnly && !isCommsOnly && (
            <>
              {/* All Classes tab: STRICTLY DIRECTORS ONLY */}
              {isDirector && (
                <button
                  id="nav-tab-all-classes"
                  onClick={() => setActiveTab('all-classes')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    activeTab === 'all-classes'
                      ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5 text-purple-400" />
                  <span>0. All Classes</span>
                </button>
              )}

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
                <span>2. Tech</span>
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
                <span>3. Stage HUD</span>
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
                <span>4. Team</span>
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

              {/* Templates tab: ONLY Directors */}
              {isDirector && (
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
                </button>
              )}
            </>
          )}
        </div>

        {/* Right: Immersive Telemetry & System Clock & Auth */}
        <div className="flex items-center gap-2.5 justify-end">
          
          {/* Director Global Broadcast Announcement Button */}
          {isDirector && onOpenDirectorAnnouncement && (
            <button
              onClick={onOpenDirectorAnnouncement}
              title="Broadcast Director Alert to all 5 classes"
              className="px-2.5 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600 border border-purple-500/40 text-purple-200 hover:text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Megaphone className="w-3.5 h-3.5 text-purple-300 animate-pulse" />
              <span className="hidden xl:inline">Broadcast Alert</span>
            </button>
          )}

          {/* Holy Spirit Mode Trigger Button (Hidden for Tech-only) */}
          {!isTechOnly && (
            <button
              id="btn-holy-spirit-mode"
              onClick={onOpenHolySpiritModal}
              className="group relative px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-900/30 hover:brightness-110 active:scale-95 transition-all"
            >
              <Flame className="w-3.5 h-3.5 text-slate-950 fill-slate-950" />
              <span className="hidden xl:inline">Holy Spirit</span>
              <span className="xl:hidden">Spirit</span>
            </button>
          )}

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

          {/* Quick Add Account Button (Strictly Directors and Appointed Class Admins) */}
          {canCreateAccounts && (
            <button
              onClick={() => onOpenAuthModal('register')}
              title="Register a new volunteer account & assign class"
              className="p-2 rounded-xl bg-[#161626] border border-white/5 text-purple-300 hover:text-white hover:border-purple-500/40 hover:bg-purple-600/20 transition-all flex items-center gap-1 text-xs font-semibold"
            >
              <UserPlus className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden xl:inline text-[11px]">+ Account</span>
            </button>
          )}

          {/* Mobile Phone Mode Switcher Button */}
          <button
            id="btn-mobile-simulator"
            onClick={onToggleMobileMode || onOpenMobileSimulator}
            title={isMobileMode ? "Switch to Full Desktop View" : "Switch to Mobile Phone View"}
            className={`px-2.5 py-1.5 rounded-xl border transition-all text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 ${
              isMobileMode
                ? 'bg-purple-600 text-white border-purple-500 shadow-purple-600/30'
                : 'bg-[#161626] border-white/5 text-purple-300 hover:text-white hover:border-purple-500/40 hover:bg-purple-600/20'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline text-[11px]">
              {isMobileMode ? 'Phone Mode' : 'Phone View'}
            </span>
          </button>

          {/* Authenticated User Pill Button */}
          <button
            onClick={() => onOpenAuthModal('quick_switch')}
            className="flex items-center gap-2 p-1.5 pr-2.5 rounded-2xl bg-[#161626] border border-white/10 hover:border-purple-500/50 transition-all group shadow-sm"
          >
            <div
              className={`w-7 h-7 rounded-xl bg-gradient-to-br ${currentUser?.avatarColor || 'from-amber-500 to-orange-600'} text-white font-bold flex items-center justify-center text-xs shadow-sm`}
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
                  : `${currentUser?.role || 'volunteer'} • ${currentUser?.assignedClassId || ''}`}
              </div>
            </div>
          </button>

          {/* Quick Sign Out Button */}
          {onLogout && (
            <button
              onClick={onLogout}
              title="Sign Out"
              className="p-2 rounded-xl bg-[#161626] border border-white/10 hover:border-red-500/50 hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-all flex items-center justify-center"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
