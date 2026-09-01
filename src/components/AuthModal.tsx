import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  User, 
  Check, 
  X, 
  Tv, 
  Clock, 
  Radio, 
  Sparkles, 
  Layers, 
  LogIn, 
  UserPlus, 
  KeyRound,
  ShieldAlert
} from 'lucide-react';
import { Role, AuthUser } from '../types/hub';
import { PRECONFIGURED_USERS } from '../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AuthUser;
  onLogin: (email: string, role?: Role, name?: string) => void;
  onSwitchUser: (user: AuthUser) => void;
  onLogout: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogin,
  onSwitchUser,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'quick_switch' | 'login' | 'register' | 'permissions'>('quick_switch');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role>('admin');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) {
      setErrorMsg('Please enter an email address');
      return;
    }
    setErrorMsg('');
    setSuccessMsg('Logged in successfully!');
    onLogin(emailInput, selectedRole, nameInput || undefined);
    setTimeout(() => {
      onClose();
      setSuccessMsg('');
    }, 600);
  };

  const handleQuickLogin = (user: AuthUser) => {
    onSwitchUser(user);
    setSuccessMsg(`Signed in as ${user.name} (${user.role.toUpperCase()})`);
    setTimeout(() => {
      onClose();
      setSuccessMsg('');
    }, 500);
  };

  const roleDefinitions: {
    role: Role;
    label: string;
    description: string;
    icon: any;
    color: string;
    badgeColor: string;
    features: string[];
  }[] = [
    {
      role: 'admin',
      label: 'Admin (Director)',
      description: 'Complete control over service templates, schedule flow, emergency overrides, team, and reviews.',
      icon: ShieldCheck,
      color: 'from-amber-500/20 to-orange-600/20 border-amber-500/40 text-amber-300',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      features: [
        'Full Service Template Editor (Create, Edit, Apply)',
        'Holy Spirit & Emergency Overrides',
        'Team Management & Rosters',
        'Service Review & Analytics',
        'Tech Console & Presenter HUD Access',
      ],
    },
    {
      role: 'tech',
      label: 'Tech & Systems',
      description: 'Audio, slide presenter, pre-service checklist, sound effects, and real-time incident monitoring.',
      icon: Tv,
      color: 'from-blue-500/20 to-cyan-600/20 border-blue-500/40 text-blue-300',
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
      features: [
        'Full Tech Console & Media Controller',
        'Worship Audio Queue & Slides Presenter',
        'Pre-Service Hardware Checklist',
        'DJ Booth SFX & Instant Stage Cues',
        'Real-time Incident Alerts & Resolution',
      ],
    },
    {
      role: 'presenter',
      label: 'Presenter (Stage)',
      description: 'Stage HUD with high-resolution countdown timer, live slide cues, and lesson notes.',
      icon: Clock,
      color: 'from-purple-500/20 to-indigo-600/20 border-purple-500/40 text-purple-300',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      features: [
        'Presenter Stage HUD & Live Countdown Timer',
        'Next Up Segment Preview',
        'Instant Stage Cue Toasts & Chimes',
        'Lesson Scripture & Talking Points',
      ],
    },
    {
      role: 'comms',
      label: 'Communications',
      description: 'Live timeline monitoring, segment progression, backstage notifications, and Holy Spirit triggers.',
      icon: Radio,
      color: 'from-emerald-500/20 to-teal-600/20 border-emerald-500/40 text-emerald-300',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      features: [
        'Comms Live Timeline & Segment Tracker',
        'Stage Cue Dispatcher to Presenter',
        'Backstage Direct Notifications',
        'Holy Spirit Mode Flow Overrides',
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#161626] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-[0_0_15px_rgba(147,51,234,0.3)]">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-[0.2em] block mb-0.5">
                SUPABASE AUTH & ROLE SYSTEM
              </span>
              <h2 className="text-lg font-bold text-white tracking-tight">Kids Church Hub Authentication</h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Toast Message */}
        {successMsg && (
          <div className="p-3 bg-green-500/20 border border-green-500/40 rounded-xl text-xs font-bold text-green-300 flex items-center gap-2 animate-fadeIn">
            <Check className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-xs font-bold text-red-300 flex items-center gap-2 animate-fadeIn">
            <ShieldAlert className="w-4 h-4" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 bg-[#0e0e1a] p-1 rounded-xl border border-white/5">
          <button
            onClick={() => setActiveTab('quick_switch')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'quick_switch'
                ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Quick Role Switch</span>
          </button>

          <button
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'login'
                ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Custom Login</span>
          </button>

          <button
            onClick={() => setActiveTab('permissions')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'permissions'
                ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Role Tiers</span>
          </button>
        </div>

        {/* TAB 1: QUICK ROLE SWITCH (PRE-CONFIGURED USERS) */}
        {activeTab === 'quick_switch' && (
          <div className="space-y-4">
            <p className="text-xs text-gray-400">
              Select an authorized Kids Church serving team member to immediately switch view and permission tiers:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PRECONFIGURED_USERS.map((user) => {
                const isSelected = currentUser?.id === user.id || currentUser?.email === user.email;
                return (
                  <button
                    key={user.id}
                    onClick={() => handleQuickLogin(user)}
                    className={`p-4 rounded-2xl border text-left flex items-start justify-between transition-all group ${
                      isSelected
                        ? 'bg-purple-600/20 border-purple-500 shadow-[0_0_20px_rgba(147,51,234,0.3)]'
                        : 'bg-black/30 border-white/10 hover:border-purple-500/40 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl bg-gradient-to-br ${user.avatarColor} text-white font-bold flex items-center justify-center text-sm shadow-md`}
                      >
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
                            {user.name}
                          </h4>
                          {isSelected && (
                            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-400">{user.email}</p>
                        <span
                          className={`inline-block mt-1.5 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                            user.role === 'admin'
                              ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                              : user.role === 'tech'
                              ? 'bg-blue-500/10 text-blue-300 border-blue-500/30'
                              : user.role === 'presenter'
                              ? 'bg-purple-500/10 text-purple-300 border-purple-500/30'
                              : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                          }`}
                        >
                          {user.role}
                        </span>
                      </div>
                    </div>

                    {isSelected ? (
                      <span className="text-[10px] font-bold text-green-400 bg-green-500/10 px-2 py-0.5 rounded-md border border-green-500/30">
                        Active
                      </span>
                    ) : (
                      <span className="text-xs text-gray-500 group-hover:text-purple-400 font-bold transition-colors">
                        Select →
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: CUSTOM LOGIN / REGISTRATION */}
        {activeTab === 'login' && (
          <form onSubmit={handleCustomLogin} className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-1">
                  Full Name (Optional)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="e.g. Pastor Michael"
                    className="w-full pl-9 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="team.member@crc.church"
                    required
                    className="w-full pl-9 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                  Assigned Supabase Role
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['admin', 'tech', 'presenter', 'comms'] as Role[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setSelectedRole(r)}
                      className={`py-2 px-3 rounded-xl border text-center text-xs font-bold uppercase transition-all ${
                        selectedRole === r
                          ? 'bg-purple-600 text-white border-purple-400 shadow-[0_0_12px_rgba(147,51,234,0.4)]'
                          : 'bg-black/30 border-white/10 text-gray-400 hover:text-white'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(147,51,234,0.4)] transition-all"
            >
              <LogIn className="w-4 h-4" />
              <span>Authenticate & Save to Supabase Table</span>
            </button>
          </form>
        )}

        {/* TAB 3: ROLE TIERS & PERMISSIONS TABLE */}
        {activeTab === 'permissions' && (
          <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
            <div className="space-y-3">
              {roleDefinitions.map((def) => {
                const IconComponent = def.icon;
                return (
                  <div
                    key={def.role}
                    className="p-4 rounded-2xl bg-black/30 border border-white/10 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-xl border ${def.color}`}>
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white">{def.label}</h4>
                          <p className="text-[11px] text-gray-400">{def.description}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${def.badgeColor}`}>
                        {def.role}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1 border-t border-white/5">
                      {def.features.map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-[11px] text-gray-300">
                          <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs text-gray-400">
          <div>
            Signed in as: <strong className="text-white">{currentUser?.name || 'Pastor Hope'}</strong>{' '}
            <span className="text-purple-400 uppercase font-mono">({currentUser?.role || 'admin'})</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onLogout}
              className="text-red-400 hover:text-red-300 font-bold hover:underline"
            >
              Sign Out
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded-lg font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
