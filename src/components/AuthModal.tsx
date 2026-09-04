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
  ShieldAlert,
  Phone,
  Trash2,
  Filter,
  CheckCircle2,
  Tag,
  MessageCircle,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { Role, AuthUser, ClassId, ClassInfo } from '../types/hub';
import { CLASSES_CONFIG } from '../data/classHubsData';
import { 
  validateSouthAfricanPhone, 
  formatSouthAfricanDisplay, 
  getSouthAfricaWhatsAppLink, 
  normalizeToE164ZA 
} from '../utils/southAfricaPhone';
import { clearAllSeedAccounts, resetToSeedAccounts } from '../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AuthUser;
  onLogin: (email: string, role?: Role, name?: string, classId?: ClassId) => void;
  onSwitchUser: (user: AuthUser) => void;
  onLogout: () => void;
  registeredAccounts: AuthUser[];
  onAddNewAccount: (user: AuthUser) => void;
  onDeleteAccount: (userId: string) => void;
  initialTab?: 'quick_switch' | 'login' | 'register' | 'manage' | 'permissions';
}

const AVATAR_COLORS = [
  'from-amber-500 to-orange-600',
  'from-blue-500 to-cyan-600',
  'from-purple-500 to-indigo-600',
  'from-pink-500 to-rose-600',
  'from-emerald-500 to-teal-600',
  'from-yellow-500 to-amber-600',
  'from-red-500 to-rose-700',
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogin,
  onSwitchUser,
  onLogout,
  registeredAccounts,
  onAddNewAccount,
  onDeleteAccount,
  initialTab = 'quick_switch',
}) => {
  const isDirector = currentUser?.role === 'director' || (currentUser?.role === 'admin' && currentUser?.assignedClassId === 'all');
  const isClassAdmin = currentUser?.role === 'admin' && currentUser?.assignedClassId !== 'all';
  const canCreateAccounts = isDirector || isClassAdmin;

  const [activeTab, setActiveTab] = useState<'quick_switch' | 'login' | 'register' | 'manage' | 'permissions'>(
    initialTab === 'register' && !canCreateAccounts ? 'quick_switch' : initialTab
  );
  
  // Custom Login State
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role>('admin');
  const [selectedClassId, setSelectedClassId] = useState<ClassId>('all');
  
  // Register Account State (Lock to admin's assigned class if not director)
  const defaultClass = isClassAdmin && currentUser.assignedClassId !== 'all' ? currentUser.assignedClassId : 'jy';
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regRole, setRegRole] = useState<Role>('tech');
  const [regClassId, setRegClassId] = useState<ClassId>(defaultClass);
  const [regRoleTitle, setRegRoleTitle] = useState('');
  const [regAvatarColor, setRegAvatarColor] = useState(AVATAR_COLORS[1]);

  // Manage Filter
  const [manageClassFilter, setManageClassFilter] = useState<string>('all_filter');
  const [manageSearch, setManageSearch] = useState('');

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
    onLogin(emailInput, selectedRole, nameInput || undefined, selectedClassId);
    setTimeout(() => {
      onClose();
      setSuccessMsg('');
    }, 600);
  };

  const handleQuickLogin = (user: AuthUser) => {
    onSwitchUser(user);
    const classLabel = user.assignedClassId === 'all' 
      ? 'All Classes' 
      : CLASSES_CONFIG.find(c => c.id === user.assignedClassId)?.name || user.assignedClassId;
    setSuccessMsg(`Signed in as ${user.name} (${user.role.toUpperCase()} • ${classLabel})`);
    setTimeout(() => {
      onClose();
      setSuccessMsg('');
    }, 500);
  };

  const handleRegisterNewUser = (e: React.FormEvent) => {
    e.preventDefault();

    // Enforce permissions: Only Director or Class Admin can register accounts
    if (!canCreateAccounts) {
      setErrorMsg('Unauthorized: Only directors and class admins have permission to create accounts.');
      return;
    }

    if (!regName.trim()) {
      setErrorMsg('Please enter the team member’s full name');
      return;
    }
    if (!regEmail.trim()) {
      setErrorMsg('Please enter a valid email address');
      return;
    }

    // WhatsApp / Phone is required and catered for South Africa
    if (!regPhone.trim()) {
      setErrorMsg('South African WhatsApp / Phone number is required.');
      return;
    }

    const zaValidation = validateSouthAfricanPhone(regPhone);
    if (!zaValidation.isValid) {
      setErrorMsg(zaValidation.errorMessage || 'Invalid South African mobile number (e.g. 082 123 4567 or +27 82 123 4567).');
      return;
    }

    // Class admins can only create accounts for their own class
    const effectiveClassId: ClassId = isClassAdmin && currentUser.assignedClassId !== 'all' 
      ? currentUser.assignedClassId 
      : regClassId;

    // Class admins cannot create directors or other admins
    const effectiveRole: Role = isClassAdmin && (regRole === 'director' || regRole === 'admin')
      ? 'tech'
      : regRole;

    const classInfo = CLASSES_CONFIG.find(c => c.id === effectiveClassId);
    const fallbackTitle = effectiveClassId === 'all'
      ? `${effectiveRole === 'director' ? 'Ministry Director' : effectiveRole === 'admin' ? 'Class Lead Admin' : effectiveRole === 'tech' ? 'Technical Lead' : effectiveRole === 'presenter' ? 'Lead Presenter' : 'Comms Lead'}`
      : `${classInfo?.shortCode || ''} ${effectiveRole === 'admin' ? 'Class Admin' : effectiveRole === 'tech' ? 'Tech Volunteer' : effectiveRole === 'presenter' ? 'Teacher / Storyteller' : 'Comms Desk'}`;

    const formattedPhone = formatSouthAfricanDisplay(regPhone);
    const zaWhatsApp = normalizeToE164ZA(regPhone).replace(/\+/g, '');

    const newAccount: AuthUser = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: regName.trim(),
      email: regEmail.trim().toLowerCase(),
      role: effectiveRole,
      assignedClassId: effectiveClassId,
      roleTitle: regRoleTitle.trim() || fallbackTitle,
      phone: formattedPhone,
      whatsapp: zaWhatsApp,
      avatarColor: regAvatarColor,
      isAuthenticated: true,
    };

    onAddNewAccount(newAccount);
    setSuccessMsg(`Account created for ${newAccount.name} (${classInfo?.name || 'All Classes'})!`);
    
    // Auto switch to newly created user
    setTimeout(() => {
      onSwitchUser(newAccount);
      onClose();
      setSuccessMsg('');
    }, 800);
  };

  const handleClearAllDefaultAccounts = () => {
    if (confirm('Are you sure you want to remove ALL default seed accounts? This will wipe the demo names so you can start with a clean slate.')) {
      clearAllSeedAccounts();
      // Delete from parent state
      registeredAccounts.forEach((acc) => {
        if (acc.id !== currentUser.id) {
          onDeleteAccount(acc.id);
        }
      });
      setSuccessMsg('Default seed accounts cleared. You can now add your own real team!');
    }
  };

  const handleResetToDefaultAccounts = () => {
    if (confirm('Reset accounts back to the default church seed accounts?')) {
      const resetList = resetToSeedAccounts();
      resetList.forEach((u) => onAddNewAccount(u));
      setSuccessMsg('Accounts reset to church defaults.');
    }
  };

  const filteredAccounts = registeredAccounts.filter((account) => {
    const matchesSearch = account.name.toLowerCase().includes(manageSearch.toLowerCase()) || 
                          account.email.toLowerCase().includes(manageSearch.toLowerCase());
    const matchesClass = manageClassFilter === 'all_filter' 
      ? true 
      : account.assignedClassId === manageClassFilter;
    return matchesSearch && matchesClass;
  });

  const getClassBadge = (classId: ClassId) => {
    if (classId === 'all') {
      return (
        <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide bg-purple-500/20 text-purple-300 border border-purple-500/40">
          All Classes (Director)
        </span>
      );
    }
    const c = CLASSES_CONFIG.find(cls => cls.id === classId);
    if (!c) return null;
    return (
      <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide border ${c.themeBadge}`}>
        {c.shortCode} • {c.colorName}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#161626] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-[0_0_15px_rgba(147,51,234,0.3)]">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-[0.2em] block mb-0.5">
                CRC KIDS CHURCH AUTH & CLASS HUBS
              </span>
              <h2 className="text-lg font-bold text-white tracking-tight">Account & Class Assignment</h2>
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
          <div className="p-3 bg-green-500/20 border border-green-500/40 rounded-xl text-xs font-bold text-green-300 flex items-center gap-2 animate-fadeIn shrink-0">
            <Check className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-xs font-bold text-red-300 flex items-center gap-2 animate-fadeIn shrink-0">
            <ShieldAlert className="w-4 h-4" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 bg-[#0e0e1a] p-1 rounded-xl border border-white/5 overflow-x-auto shrink-0">
          <button
            onClick={() => { setActiveTab('quick_switch'); setErrorMsg(''); }}
            className={`flex-1 min-w-[90px] py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeTab === 'quick_switch'
                ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Quick Switch</span>
          </button>

          {canCreateAccounts && (
            <button
              onClick={() => { setActiveTab('register'); setErrorMsg(''); }}
              className={`flex-1 min-w-[110px] py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
                activeTab === 'register'
                  ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5 text-purple-300" />
              <span>+ Add Account</span>
            </button>
          )}

          <button
            onClick={() => { setActiveTab('manage'); setErrorMsg(''); }}
            className={`flex-1 min-w-[110px] py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeTab === 'manage'
                ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Manage ({registeredAccounts.length})</span>
          </button>

          <button
            onClick={() => { setActiveTab('login'); setErrorMsg(''); }}
            className={`flex-1 min-w-[80px] py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeTab === 'login'
                ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>

          <button
            onClick={() => { setActiveTab('permissions'); setErrorMsg(''); }}
            className={`flex-1 min-w-[80px] py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeTab === 'permissions'
                ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Roles</span>
          </button>
        </div>

        {/* Scrollable Container for Tab Content */}
        <div className="overflow-y-auto pr-1 flex-1 space-y-4">
          
          {/* TAB 1: QUICK SWITCH (ACCOUNTS LIST WITH CLASS BADGES) */}
          {activeTab === 'quick_switch' && (
            <div className="space-y-4">
              <p className="text-xs text-gray-400">
                Select an authorized volunteer or teacher to immediately switch view, permissions, and jump into their specific class hub:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {registeredAccounts.map((user) => {
                  const isSelected = currentUser?.id === user.id || currentUser?.email === user.email;
                  return (
                    <button
                      key={user.id}
                      onClick={() => handleQuickLogin(user)}
                      className={`p-3.5 rounded-2xl border text-left flex items-start justify-between transition-all group ${
                        isSelected
                          ? 'bg-purple-600/20 border-purple-500 shadow-[0_0_20px_rgba(147,51,234,0.3)]'
                          : 'bg-black/30 border-white/10 hover:border-purple-500/40 hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl bg-gradient-to-br ${user.avatarColor || 'from-purple-500 to-indigo-600'} text-white font-bold flex items-center justify-center text-sm shadow-md shrink-0 mt-0.5`}
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
                          <p className="text-[11px] text-gray-400">{user.roleTitle || user.email}</p>
                          
                          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                            <span
                              className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
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
                            {getClassBadge(user.assignedClassId)}
                          </div>
                        </div>
                      </div>

                      {isSelected ? (
                        <span className="text-[10px] font-bold text-green-400 bg-green-500/10 px-2 py-0.5 rounded-md border border-green-500/30 shrink-0">
                          Active
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500 group-hover:text-purple-400 font-bold transition-colors shrink-0">
                          Select →
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setActiveTab('register')}
                  className="text-xs text-purple-400 hover:text-purple-300 font-bold flex items-center justify-center gap-1.5 mx-auto py-1"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Don't see your name? Add a new account here →</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: ADD NEW ACCOUNT / REGISTER VOLUNTEER */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterNewUser} className="space-y-4">
              <div className="bg-purple-950/20 border border-purple-500/30 rounded-2xl p-4 text-xs space-y-1">
                <span className="font-bold text-purple-300 flex items-center gap-1.5">
                  <UserPlus className="w-4 h-4" />
                  Add Team Account & Assign Class
                </span>
                <p className="text-gray-400 text-[11px] leading-relaxed">
                  Create an account for any volunteer, teacher, tech engineer, or youth leader. When they log in, they will be automatically directed to their assigned class hub!
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-300 uppercase tracking-wider mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Sipho Dlamini"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-300 uppercase tracking-wider mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="e.g. sipho@crc.church"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-300 uppercase tracking-wider mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Optional / PIN"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-300 uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>South Africa WhatsApp / Phone *</span>
                    <span className="text-emerald-400 font-normal text-[10px]">🇿🇦 Required for WhatsApp & Alerts</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="e.g. 082 123 4567 or +27 82 123 4567"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    Enter a valid South African mobile number (starts with 06, 07, 08 or +27).
                  </p>
                </div>
              </div>

              {/* Class Hub Assignment */}
              <div>
                <label className="block text-[10px] font-bold text-gray-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Assigned Class Hub *</span>
                  {isClassAdmin ? (
                    <span className="text-amber-400 font-bold text-[10px]">Locked to Your Class (Admin Policy)</span>
                  ) : (
                    <span className="text-purple-400 font-normal text-[10px]">User will automatically open this hub</span>
                  )}
                </label>

                {isClassAdmin ? (
                  <div className="p-3 rounded-xl bg-purple-900/20 border border-purple-500/40 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-white">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-400"></span>
                      <span>
                        {CLASSES_CONFIG.find(c => c.id === currentUser.assignedClassId)?.name || currentUser.assignedClassId} Class Hub
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-400 font-mono">
                      Restricted to your class
                    </span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setRegClassId('jy')}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        regClassId === 'jy'
                          ? 'bg-blue-600/30 border-blue-500 ring-2 ring-blue-500/40'
                          : 'bg-black/30 border-white/10 hover:border-blue-500/40'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-xs text-white">
                        <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                        Junior Youth
                      </div>
                      <div className="text-[10px] text-blue-300 font-mono">Blue Class • Gr 6-7</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRegClassId('tb')}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        regClassId === 'tb'
                          ? 'bg-pink-600/30 border-pink-500 ring-2 ring-pink-500/40'
                          : 'bg-black/30 border-white/10 hover:border-pink-500/40'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-xs text-white">
                        <span className="w-2 h-2 rounded-full bg-pink-400"></span>
                        TRAILBLAZERS
                      </div>
                      <div className="text-[10px] text-pink-300 font-mono">Pink Class • Gr 4-5</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRegClassId('kb')}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        regClassId === 'kb'
                          ? 'bg-red-600/30 border-red-500 ring-2 ring-red-500/40'
                          : 'bg-black/30 border-white/10 hover:border-red-500/40'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-xs text-white">
                        <span className="w-2 h-2 rounded-full bg-red-400"></span>
                        Kingdom Builders
                      </div>
                      <div className="text-[10px] text-red-300 font-mono">Red Class • Gr 1-3</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRegClassId('la-orange')}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        regClassId === 'la-orange'
                          ? 'bg-orange-600/30 border-orange-500 ring-2 ring-orange-500/40'
                          : 'bg-black/30 border-white/10 hover:border-orange-500/40'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-xs text-white">
                        <span className="w-2 h-2 rounded-full bg-orange-400"></span>
                        LA Orange
                      </div>
                      <div className="text-[10px] text-orange-300 font-mono">Orange • 5-6 yrs</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRegClassId('la-yellow')}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        regClassId === 'la-yellow'
                          ? 'bg-yellow-600/30 border-yellow-500 ring-2 ring-yellow-500/40'
                          : 'bg-black/30 border-white/10 hover:border-yellow-500/40'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-xs text-white">
                        <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                        LA Yellow
                      </div>
                      <div className="text-[10px] text-yellow-300 font-mono">Yellow • 3-4 yrs</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRegClassId('all')}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        regClassId === 'all'
                          ? 'bg-purple-600/30 border-purple-500 ring-2 ring-purple-500/40'
                          : 'bg-black/30 border-white/10 hover:border-purple-500/40'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-xs text-white">
                        <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                        All Classes
                      </div>
                      <div className="text-[10px] text-purple-300 font-mono">Director / Multi</div>
                    </button>
                  </div>
                )}
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-[10px] font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                  Assigned Duty / Role *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {isDirector && (
                    <button
                      type="button"
                      onClick={() => setRegRole('admin')}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        regRole === 'admin'
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                          : 'bg-black/30 border-white/10 text-gray-400 hover:text-white'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4 mx-auto mb-1" />
                      <div className="text-[11px] font-bold">Admin</div>
                      <div className="text-[9px] opacity-75">Class Lead</div>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setRegRole('tech')}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      regRole === 'tech'
                        ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                        : 'bg-black/30 border-white/10 text-gray-400 hover:text-white'
                    }`}
                  >
                    <Tv className="w-4 h-4 mx-auto mb-1" />
                    <div className="text-[11px] font-bold">Tech</div>
                    <div className="text-[9px] opacity-75">Audio & Visual</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRegRole('presenter')}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      regRole === 'presenter'
                        ? 'bg-purple-500/20 border-purple-500 text-purple-300'
                        : 'bg-black/30 border-white/10 text-gray-400 hover:text-white'
                    }`}
                  >
                    <Clock className="w-4 h-4 mx-auto mb-1" />
                    <div className="text-[11px] font-bold">Presenter</div>
                    <div className="text-[9px] opacity-75">Teacher / Stage</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRegRole('comms')}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      regRole === 'comms'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-black/30 border-white/10 text-gray-400 hover:text-white'
                    }`}
                  >
                    <Radio className="w-4 h-4 mx-auto mb-1" />
                    <div className="text-[11px] font-bold">Comms</div>
                    <div className="text-[9px] opacity-75">Timeline / Cues</div>
                  </button>
                </div>
              </div>

              {/* Custom Role Title & Avatar Color */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-300 uppercase tracking-wider mb-1">
                    Custom Title (Optional)
                  </label>
                  <input
                    type="text"
                    value={regRoleTitle}
                    onChange={(e) => setRegRoleTitle(e.target.value)}
                    placeholder="e.g. Lead Storyteller, Sound Captain"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-300 uppercase tracking-wider mb-1">
                    Avatar Color
                  </label>
                  <div className="flex items-center gap-2 pt-1">
                    {AVATAR_COLORS.map((col, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setRegAvatarColor(col)}
                        className={`w-7 h-7 rounded-lg bg-gradient-to-br ${col} transition-all ${
                          regAvatarColor === col ? 'ring-2 ring-white scale-110 shadow-md' : 'opacity-70 hover:opacity-100'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Register Account & Sign In Now</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: MANAGE ACCOUNTS (VIEW, WHATSAPP & DELETE) */}
          {activeTab === 'manage' && (
            <div className="space-y-4">
              {/* Clean Slate & Seed Accounts Controls */}
              {isDirector && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs">
                  <div className="flex items-center gap-2 text-amber-300">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <div>
                      <span className="font-bold">Manage Default People & Demo Names</span>
                      <p className="text-[11px] text-gray-400">Remove all default mock people to start with your actual church volunteer team.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleClearAllDefaultAccounts}
                      className="px-2.5 py-1 rounded-lg bg-red-600/40 hover:bg-red-600 border border-red-500/40 text-red-200 hover:text-white text-[11px] font-bold transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remove Default People</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleResetToDefaultAccounts}
                      title="Reset back to default seed accounts"
                      className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center gap-2 justify-between">
                <input
                  type="text"
                  value={manageSearch}
                  onChange={(e) => setManageSearch(e.target.value)}
                  placeholder="Search by name, email or phone..."
                  className="w-full sm:w-64 bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                />

                <select
                  value={manageClassFilter}
                  onChange={(e) => setManageClassFilter(e.target.value)}
                  className="w-full sm:w-auto bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="all_filter">All Classes</option>
                  <option value="jy">Junior Youth (Blue)</option>
                  <option value="tb">TRAILBLAZERS (Pink)</option>
                  <option value="kb">Kingdom Builders (Red)</option>
                  <option value="la-orange">LA Orange</option>
                  <option value="la-yellow">LA Yellow</option>
                  <option value="all">Director / Global</option>
                </select>
              </div>

              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {filteredAccounts.map((user) => {
                  const isCurrent = currentUser?.id === user.id;
                  const waNumber = user.whatsapp || user.phone;
                  const waLink = waNumber ? getSouthAfricaWhatsAppLink(waNumber) : '';

                  return (
                    <div
                      key={user.id}
                      className="p-3 bg-black/30 border border-white/5 hover:border-white/15 rounded-xl flex items-center justify-between gap-3 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl bg-gradient-to-br ${user.avatarColor || 'from-purple-500 to-indigo-600'} text-white font-bold flex items-center justify-center text-xs shadow shrink-0`}
                        >
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{user.name}</span>
                            {isCurrent && (
                              <span className="text-[9px] font-bold text-green-400 bg-green-500/10 px-1.5 py-0.2 rounded border border-green-500/30">
                                Active
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-gray-400">{user.email} • {user.roleTitle || user.role}</div>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            {getClassBadge(user.assignedClassId)}
                            {user.phone && (
                              <span className="text-[10px] text-gray-400 font-mono flex items-center gap-0.5">
                                <span>🇿🇦</span>
                                {user.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {waLink && (
                          <a
                            href={waLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-lg text-xs font-bold border border-emerald-500/30 transition-colors flex items-center gap-1"
                            title="Message on WhatsApp"
                          >
                            <MessageCircle className="w-3 h-3 text-emerald-400" />
                            <span className="hidden sm:inline">WhatsApp</span>
                          </a>
                        )}

                        {!isCurrent && (
                          <button
                            type="button"
                            onClick={() => handleQuickLogin(user)}
                            className="px-2.5 py-1 bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white rounded-lg text-xs font-bold border border-purple-500/30 transition-colors"
                          >
                            Switch
                          </button>
                        )}

                        {/* Allow deleting any account including preconfigured ones */}
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Remove account for ${user.name}?`)) {
                              onDeleteAccount(user.id);
                            }
                          }}
                          title="Delete this account"
                          className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {filteredAccounts.length === 0 && (
                  <div className="text-center py-8 text-gray-500 text-xs">
                    No accounts found matching your search.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: CUSTOM SIGN IN */}
          {activeTab === 'login' && (
            <form onSubmit={handleCustomLogin} className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="e.g. yourname@crc.church"
                      className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-1">
                    Password / PIN
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                    <input
                      type="password"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-1">
                    Select Target Class Hub
                  </label>
                  <select
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value as ClassId)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-semibold"
                  >
                    <option value="all">🌐 All Classes (Director / Overseer)</option>
                    <option value="jy">🔵 Junior Youth (Blue Class, Gr 6-7)</option>
                    <option value="tb">🌸 TRAILBLAZERS (Pink Class, Gr 4-5)</option>
                    <option value="kb">🔴 Kingdom Builders (Red Class, Gr 1-3)</option>
                    <option value="la-orange">🟠 Little Adventures Orange (5-6 yrs)</option>
                    <option value="la-yellow">🟡 Little Adventures Yellow (3-4 yrs)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In & Open Class Hub</span>
              </button>
            </form>
          )}

          {/* TAB 5: ROLES & PERMISSIONS GUIDE */}
          {activeTab === 'permissions' && (
            <div className="space-y-3">
              <div className="p-3 bg-black/30 border border-white/5 rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 text-amber-300 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4" />
                  Admin / Director
                </div>
                <p className="text-gray-400 text-[11px]">
                  Full control over all 5 classes, service templates, Holy Spirit time overrides, global broadcast cues, emergency stop, team rosters, and post-service reviews.
                </p>
              </div>

              <div className="p-3 bg-black/30 border border-white/5 rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 text-blue-300 font-bold text-xs">
                  <Tv className="w-4 h-4" />
                  Tech & Systems
                </div>
                <p className="text-gray-400 text-[11px]">
                  Manages worship tracks, lesson slide presentation, stage audio equipment checklist, DJ soundboard effects, and class incident resolution.
                </p>
              </div>

              <div className="p-3 bg-black/30 border border-white/5 rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 text-purple-300 font-bold text-xs">
                  <Clock className="w-4 h-4" />
                  Presenter (Stage HUD)
                </div>
                <p className="text-gray-400 text-[11px]">
                  Distraction-free high-visibility countdown timer, live slide synchronization cues, prompt chimes from the tech booth, and age-specific scripture lesson notes.
                </p>
              </div>

              <div className="p-3 bg-black/30 border border-white/5 rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-300 font-bold text-xs">
                  <Radio className="w-4 h-4" />
                  Communications (Comms)
                </div>
                <p className="text-gray-400 text-[11px]">
                  Service timeline coordinator, quick stage cues dispatcher ("Speed Up", "Wrap Up", "Pray"), and parent checkout tag verification lead.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs text-gray-400 shrink-0">
          <div>
            Signed in as: <strong className="text-white">{currentUser?.name || 'Pastor Hope'}</strong>{' '}
            <span className="text-purple-400 uppercase font-mono">({currentUser?.role || 'admin'})</span>
          </div>

          <button
            onClick={onLogout}
            className="text-xs text-red-400 hover:text-red-300 font-semibold transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};
