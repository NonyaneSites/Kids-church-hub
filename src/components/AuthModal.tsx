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
  RotateCcw,
  Crown,
  Shield,
  Eye,
  EyeOff,
  ChevronRight,
  Database,
  Copy,
  RefreshCw,
  Server,
  Wifi,
  WifiOff,
  ExternalLink,
  Code,
  CheckCircle
} from 'lucide-react';
import { Role, AuthUser, ClassId, ClassInfo } from '../types/hub';
import { CLASSES_CONFIG } from '../data/classHubsData';
import { 
  validateSouthAfricanPhone, 
  formatSouthAfricanDisplay, 
  getSouthAfricaWhatsAppLink, 
  normalizeToE164ZA 
} from '../utils/southAfricaPhone';
import { 
  getSupabaseConfig, 
  saveCustomSupabaseConfig, 
  clearCustomSupabaseConfig, 
  testSupabaseConnection, 
  syncAllAccountsToSupabase, 
  SUPABASE_STAFF_ACCOUNTS_SQL,
  clearAllSeedAccounts, 
  resetToSeedAccounts 
} from '../lib/supabase';

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
  onClearDefaultAccounts?: () => void;
  onResetDefaultAccounts?: () => void;
  onPromoteToClassAdmin?: (userId: string) => void;
  onRevokeClassAdmin?: (userId: string) => void;
  onSyncAccounts?: () => Promise<any>;
  initialTab?: 'quick_switch' | 'login' | 'register' | 'manage' | 'permissions' | 'database';
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
  onClearDefaultAccounts,
  onResetDefaultAccounts,
  onPromoteToClassAdmin,
  onRevokeClassAdmin,
  initialTab = 'quick_switch',
}) => {
  const isDirector = currentUser?.role === 'director' || (currentUser?.role === 'admin' && currentUser?.assignedClassId === 'all');
  const isClassAdmin = Boolean(currentUser?.isClassAdmin) || (currentUser?.role === 'admin' && currentUser?.assignedClassId !== 'all') || (currentUser?.role as string) === 'class-admin';
  const canCreateAccounts = isDirector || isClassAdmin;

  const [activeTab, setActiveTab] = useState<'quick_switch' | 'login' | 'register' | 'manage' | 'permissions' | 'database'>(
    initialTab === 'register' && !canCreateAccounts ? 'quick_switch' : initialTab
  );
  
  // Custom Confirmation Dialog States (Replaces window.confirm)
  const [userToDelete, setUserToDelete] = useState<AuthUser | null>(null);
  const [isConfirmingClearDefaults, setIsConfirmingClearDefaults] = useState(false);
  const [isConfirmingResetDefaults, setIsConfirmingResetDefaults] = useState(false);
  const [userToToggleAdmin, setUserToToggleAdmin] = useState<AuthUser | null>(null);

  // Supabase Cloud Configuration & Sync State
  const [supabaseConfig, setSupabaseConfig] = useState(() => getSupabaseConfig());
  const [sbUrlInput, setSbUrlInput] = useState(() => getSupabaseConfig().url);
  const [sbKeyInput, setSbKeyInput] = useState(() => getSupabaseConfig().anonKey);
  const [isTestingSb, setIsTestingSb] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    tableExists?: boolean;
    accountsCount?: number;
  } | null>(null);
  const [isSyncingSb, setIsSyncingSb] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const handleSaveSupabaseConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sbUrlInput.trim() || !sbKeyInput.trim()) {
      setErrorMsg('Please enter both your Supabase Project URL and Anon API Key.');
      return;
    }
    setErrorMsg('');
    const success = saveCustomSupabaseConfig(sbUrlInput.trim(), sbKeyInput.trim());
    if (success) {
      setSupabaseConfig(getSupabaseConfig());
      setSuccessMsg('Supabase credentials saved! Testing connection...');
      await handleTestSupabaseConnection();
    } else {
      setErrorMsg('Failed to save Supabase credentials.');
    }
  };

  const handleClearSupabaseConfig = () => {
    clearCustomSupabaseConfig();
    setSupabaseConfig(getSupabaseConfig());
    setSbUrlInput('');
    setSbKeyInput('');
    setTestResult(null);
    setSuccessMsg('Supabase credentials disconnected. Accounts are stored in local storage.');
  };

  const handleTestSupabaseConnection = async () => {
    setIsTestingSb(true);
    setTestResult(null);
    try {
      const res = await testSupabaseConnection();
      setTestResult(res);
      if (res.success && res.tableExists) {
        setSuccessMsg(res.message);
      } else if (res.success && !res.tableExists) {
        setErrorMsg('Supabase reached, but table "staff_accounts" is missing. Run the SQL script below!');
      } else {
        setErrorMsg(res.message);
      }
    } catch (e: any) {
      setTestResult({
        success: false,
        message: e?.message || 'Connection test failed',
        tableExists: false,
        accountsCount: 0,
      });
      setErrorMsg('Connection test failed: ' + (e?.message || 'Unknown error'));
    } finally {
      setIsTestingSb(false);
    }
  };

  const handleSyncToSupabase = async () => {
    setIsSyncingSb(true);
    setErrorMsg('');
    try {
      const res = await syncAllAccountsToSupabase(registeredAccounts);
      if (res.success) {
        setSuccessMsg(`Successfully synced ${res.count} account(s) to Supabase cloud!`);
        await handleTestSupabaseConnection();
      } else {
        setErrorMsg(`Sync failed: ${res.error || 'Check that staff_accounts table exists in Supabase.'}`);
      }
    } catch (e: any) {
      setErrorMsg('Sync error: ' + (e?.message || 'Unknown error'));
    } finally {
      setIsSyncingSb(false);
    }
  };

  const handleCopySql = () => {
    try {
      navigator.clipboard.writeText(SUPABASE_STAFF_ACCOUNTS_SQL);
      setCopiedSql(true);
      setSuccessMsg('Supabase SQL table schema copied to clipboard!');
      setTimeout(() => setCopiedSql(false), 2500);
    } catch (e) {
      setErrorMsg('Failed to copy to clipboard.');
    }
  };

  // Custom Login State
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role>('admin');
  const [selectedClassId, setSelectedClassId] = useState<ClassId>('all');
  
  // Quick Switch PIN verification challenge
  const [pendingSwitchUser, setPendingSwitchUser] = useState<AuthUser | null>(null);
  const [switchPinInput, setSwitchPinInput] = useState('');
  const [showSwitchPin, setShowSwitchPin] = useState(false);

  // Register Account State (Lock to admin's assigned class if not director)
  const defaultClass = isClassAdmin && currentUser.assignedClassId !== 'all' ? currentUser.assignedClassId : 'jy';
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPin, setRegPin] = useState('2026');
  const [regPhone, setRegPhone] = useState('');
  const [regRole, setRegRole] = useState<Role>('tech');
  const [regClassId, setRegClassId] = useState<ClassId>(defaultClass);
  const [regRoleTitle, setRegRoleTitle] = useState('');
  const [regAvatarColor, setRegAvatarColor] = useState(AVATAR_COLORS[1]);
  const [regIsClassAdmin, setRegIsClassAdmin] = useState(false);

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

  const handleInitiateQuickSwitch = (targetUser: AuthUser) => {
    if (targetUser.id === currentUser?.id) {
      setErrorMsg('You are already authenticated as this user.');
      return;
    }
    setErrorMsg('');
    setPendingSwitchUser(targetUser);
    setSwitchPinInput('');
  };

  const handleConfirmQuickSwitch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingSwitchUser) return;

    const expectedPin = pendingSwitchUser.pin || '2026';
    if (switchPinInput.trim() === expectedPin || switchPinInput.trim() === '2026') {
      onSwitchUser({ ...pendingSwitchUser, isAuthenticated: true });
      const classLabel = pendingSwitchUser.assignedClassId === 'all' 
        ? 'All Classes' 
        : CLASSES_CONFIG.find(c => c.id === pendingSwitchUser.assignedClassId)?.name || pendingSwitchUser.assignedClassId;
      setSuccessMsg(`Switched to ${pendingSwitchUser.name} (${pendingSwitchUser.role.toUpperCase()} • ${classLabel})`);
      setPendingSwitchUser(null);
      setTimeout(() => {
        onClose();
        setSuccessMsg('');
      }, 500);
    } else {
      setErrorMsg('Incorrect PIN. Please enter the security PIN for this account (Demo default: 2026).');
    }
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

    // Class admins cannot create directors
    const effectiveRole: Role = isClassAdmin && regRole === 'director'
      ? 'tech'
      : regRole;

    const classInfo = CLASSES_CONFIG.find(c => c.id === effectiveClassId);
    const fallbackTitle = effectiveClassId === 'all'
      ? `${effectiveRole === 'director' ? 'Ministry Director' : effectiveRole === 'admin' ? 'Class Lead Admin' : effectiveRole === 'tech' ? 'Technical Lead' : effectiveRole === 'presenter' ? 'Lead Presenter' : 'Comms Lead'}`
      : `${classInfo?.shortCode || ''} ${regIsClassAdmin ? 'Class Admin' : effectiveRole === 'tech' ? 'Tech Volunteer' : effectiveRole === 'presenter' ? 'Teacher / Storyteller' : 'Comms Desk'}`;

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
      isClassAdmin: isDirector ? regIsClassAdmin : false,
      pin: regPin.trim() || '2026',
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
    setErrorMsg('');
    setIsConfirmingClearDefaults(true);
  };

  const handleExecuteClearAllDefaults = () => {
    if (onClearDefaultAccounts) {
      onClearDefaultAccounts();
    } else {
      clearAllSeedAccounts();
    }
    setIsConfirmingClearDefaults(false);
    setSuccessMsg('Default demo accounts permanently removed from database.');
  };

  const handleResetToDefaultAccounts = () => {
    setErrorMsg('');
    setIsConfirmingResetDefaults(true);
  };

  const handleExecuteResetDefaults = () => {
    if (onResetDefaultAccounts) {
      onResetDefaultAccounts();
    } else {
      resetToSeedAccounts();
    }
    setIsConfirmingResetDefaults(false);
    setSuccessMsg('Reset database back to default staff roster.');
  };

  const handlePromoteOrRevokeAdmin = (user: AuthUser) => {
    if (!isDirector) {
      setErrorMsg('Only the Director has permission to grant or revoke Class Admin roles.');
      return;
    }
    setUserToToggleAdmin(user);
  };

  const handleExecuteToggleAdmin = () => {
    if (!userToToggleAdmin) return;
    const currentIsAdmin = Boolean(userToToggleAdmin.isClassAdmin) || userToToggleAdmin.role === 'admin';
    if (currentIsAdmin) {
      onRevokeClassAdmin?.(userToToggleAdmin.id);
      setSuccessMsg(`Revoked Class Admin privileges for ${userToToggleAdmin.name}.`);
    } else {
      onPromoteToClassAdmin?.(userToToggleAdmin.id);
      setSuccessMsg(`Promoted ${userToToggleAdmin.name} to Class Admin for ${userToToggleAdmin.assignedClassId.toUpperCase()}!`);
    }
    setUserToToggleAdmin(null);
  };

  const handleDeleteUserClick = (user: AuthUser) => {
    if (user.id === currentUser.id) {
      setErrorMsg('You cannot delete your own currently active account session.');
      return;
    }
    setErrorMsg('');
    setUserToDelete(user);
  };

  const handleExecuteDeleteUser = () => {
    if (!userToDelete) return;
    onDeleteAccount(userToDelete.id);
    setSuccessMsg(`Account for "${userToDelete.name}" successfully removed from database.`);
    setUserToDelete(null);
  };

  const getClassBadge = (classId: ClassId) => {
    if (classId === 'all') {
      return (
        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/40">
          All 5 Classes
        </span>
      );
    }
    const c = CLASSES_CONFIG.find(cls => cls.id === classId);
    if (!c) return null;
    return (
      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide border ${c.themeBadge}`}>
        {c.shortCode} • {c.name}
      </span>
    );
  };

  const filteredAccounts = registeredAccounts.filter((acc) => {
    const matchesSearch = 
      acc.name.toLowerCase().includes(manageSearch.toLowerCase()) ||
      acc.email.toLowerCase().includes(manageSearch.toLowerCase()) ||
      (acc.phone && acc.phone.includes(manageSearch));

    const matchesClass = 
      manageClassFilter === 'all_filter' || 
      acc.assignedClassId === manageClassFilter;

    return matchesSearch && matchesClass;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-[#121222] border border-white/10 rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl relative max-h-[92vh] flex flex-col">
        
        {/* Header Ribbon */}
        <div className="flex items-center justify-between pb-3 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-700 via-indigo-600 to-amber-500 flex items-center justify-center text-white font-black text-sm shadow-[0_0_20px_rgba(147,51,234,0.4)]">
              KC
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-black text-white uppercase tracking-tight">
                  CRC KIDS CHURCH
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-black tracking-wide">
                  🇿🇦 JOHANNESBURG
                </span>
              </div>
              <p className="text-[11px] text-gray-400">
                Team Access & Role Authority Center
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 p-1 bg-black/40 rounded-2xl border border-white/5 text-xs font-bold shrink-0 overflow-x-auto">
          <button
            onClick={() => {
              setActiveTab('quick_switch');
              setPendingSwitchUser(null);
              setErrorMsg('');
            }}
            className={`py-1.5 px-3 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'quick_switch' ? 'bg-purple-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Staff Roster</span>
          </button>

          {canCreateAccounts && (
            <button
              onClick={() => {
                setActiveTab('register');
                setPendingSwitchUser(null);
                setErrorMsg('');
              }}
              className={`py-1.5 px-3 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'register' ? 'bg-purple-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Register</span>
            </button>
          )}

          <button
            onClick={() => {
              setActiveTab('manage');
              setPendingSwitchUser(null);
              setErrorMsg('');
            }}
            className={`py-1.5 px-3 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'manage' ? 'bg-purple-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Manage & Remove</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('permissions');
              setPendingSwitchUser(null);
              setErrorMsg('');
            }}
            className={`py-1.5 px-3 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'permissions' ? 'bg-purple-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Hierarchy Rules</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('database');
              setPendingSwitchUser(null);
              setErrorMsg('');
              setSupabaseConfig(getSupabaseConfig());
            }}
            className={`py-1.5 px-3 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'database' ? 'bg-purple-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Supabase DB</span>
            {supabaseConfig.isConfigured ? (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            ) : (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400/80" />
            )}
          </button>
        </div>

        {/* Feedback Messages */}
        {errorMsg && (
          <div className="p-3 bg-red-500/15 border border-red-500/40 rounded-xl text-xs text-red-300 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button onClick={() => setErrorMsg('')} className="text-red-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-500/15 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg('')} className="text-emerald-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Tab Body */}
        <div className="overflow-y-auto flex-1 pr-1 space-y-4">
          
          {/* TAB 1: QUICK SWITCH WITH PIN PROTECTION */}
          {activeTab === 'quick_switch' && (
            <div className="space-y-4">
              {pendingSwitchUser ? (
                /* INLINE PIN CHALLENGE MODAL */
                <form onSubmit={handleConfirmQuickSwitch} className="p-4 bg-black/50 border border-purple-500/40 rounded-2xl space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${pendingSwitchUser.avatarColor || 'from-purple-600 to-indigo-600'} text-white font-bold flex items-center justify-center text-xs shadow-md`}>
                        {pendingSwitchUser.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>Authenticate as {pendingSwitchUser.name}</span>
                        </div>
                        <div className="text-[10px] text-gray-400">{pendingSwitchUser.roleTitle || pendingSwitchUser.role}</div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setPendingSwitchUser(null)}
                      className="text-xs text-gray-400 hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-gray-300">
                        Enter Security PIN
                      </label>
                      <span className="text-[10px] text-amber-400 font-mono">
                        Demo PIN: <strong>2026</strong>
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        type={showSwitchPin ? 'text' : 'password'}
                        value={switchPinInput}
                        onChange={(e) => setSwitchPinInput(e.target.value)}
                        placeholder="••••"
                        maxLength={8}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white placeholder-gray-600 text-center tracking-[0.4em] font-mono text-base font-bold focus:outline-none focus:border-purple-500 transition-colors"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setShowSwitchPin(!showSwitchPin)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showSwitchPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSwitchPinInput(pendingSwitchUser.pin || '2026')}
                      className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-[11px] font-semibold transition-colors"
                    >
                      Auto-Fill (2026)
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-1.5"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>Verify & Switch Station</span>
                    </button>
                  </div>
                </form>
              ) : null}

              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-gray-400 px-1">
                  <span>Johannesburg Team Profiles ({registeredAccounts.length}):</span>
                  <span className="text-[10px] text-purple-400 font-normal">PIN Protected</span>
                </div>

                <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                  {registeredAccounts.map((account) => {
                    const isCurrent = currentUser?.id === account.id;
                    const isAccDirector = account.role === 'director' || (account.role === 'admin' && account.assignedClassId === 'all');
                    const isAccClassAdmin = Boolean(account.isClassAdmin) || (account.role === 'admin' && account.assignedClassId !== 'all');

                    return (
                      <div
                        key={account.id}
                        className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                          isCurrent
                            ? 'bg-purple-900/30 border-purple-500/60 ring-1 ring-purple-500/40'
                            : isAccDirector
                            ? 'bg-amber-950/20 border-amber-500/30'
                            : isAccClassAdmin
                            ? 'bg-purple-950/20 border-purple-500/30'
                            : 'bg-white/5 border-white/5 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${account.avatarColor || 'from-purple-600 to-indigo-600'} text-white font-black flex items-center justify-center text-sm shadow-md shrink-0`}>
                            {account.name.charAt(0).toUpperCase()}
                          </div>
                          
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-white flex items-center gap-2 flex-wrap">
                              <span>{account.name}</span>
                              {isCurrent && (
                                <span className="px-1.5 py-0.2 rounded bg-green-500/20 text-green-300 text-[8px] font-black uppercase border border-green-500/40">
                                  Logged In
                                </span>
                              )}
                              
                              {/* Distinction Badges */}
                              {isAccDirector ? (
                                <span className="px-1.5 py-0.2 rounded text-[8px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-0.5 shrink-0">
                                  <Crown className="w-2.5 h-2.5 text-amber-400" />
                                  <span>DIRECTOR</span>
                                </span>
                              ) : isAccClassAdmin ? (
                                <span className="px-1.5 py-0.2 rounded text-[8px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-0.5 shrink-0">
                                  <ShieldCheck className="w-2.5 h-2.5 text-purple-400" />
                                  <span>CLASS ADMIN</span>
                                </span>
                              ) : null}
                            </div>
                            
                            <div className="text-[11px] text-gray-400 truncate">
                              {account.roleTitle || account.role}
                            </div>
                            
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              {getClassBadge(account.assignedClassId)}
                              {account.phone && (
                                <span className="text-[10px] text-gray-400 font-mono">
                                  {account.phone}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0">
                          {isCurrent ? (
                            <span className="text-[11px] font-bold text-green-400 px-2.5 py-1 rounded-lg bg-green-500/10 border border-green-500/30">
                              Active
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleInitiateQuickSwitch(account)}
                              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1"
                            >
                              <KeyRound className="w-3 h-3" />
                              <span>Switch</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: REGISTER NEW ACCOUNT */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterNewUser} className="space-y-4">
              <div className="p-3 bg-purple-950/20 border border-purple-500/20 rounded-2xl text-xs text-gray-300 space-y-1">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                  <span>Johannesburg Staff Registration</span>
                </div>
                <p className="text-[11px] text-gray-400">
                  {isDirector
                    ? 'As Director, you have authority to create accounts for any class and grant Class Admin roles.'
                    : `As Class Admin, you can add volunteers to your assigned class: ${currentUser.assignedClassId.toUpperCase()}.`}
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
                    placeholder="e.g. Sipho Ndlovu"
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
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-300 uppercase tracking-wider mb-1">
                    South African Mobile / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="082 123 4567 or +27 82 123 4567"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-300 uppercase tracking-wider mb-1">
                    Assigned PIN / Passcode *
                  </label>
                  <input
                    type="text"
                    required
                    value={regPin}
                    onChange={(e) => setRegPin(e.target.value)}
                    placeholder="2026"
                    maxLength={8}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 font-mono text-center tracking-widest font-bold"
                  />
                </div>
              </div>

              {/* Class Selection */}
              <div>
                <label className="block text-[10px] font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                  Assigned Class Hub *
                </label>
                
                {isClassAdmin && currentUser.assignedClassId !== 'all' ? (
                  <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/40 text-xs">
                    <span className="text-gray-400">Class Admins are restricted to their own class: </span>
                    <strong className="text-white uppercase">{currentUser.assignedClassId}</strong>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {CLASSES_CONFIG.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setRegClassId(c.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          regClassId === c.id
                            ? `${c.accentBorder} bg-black/50 ring-2 ring-purple-500/40`
                            : 'bg-black/30 border-white/10 hover:border-purple-500/40'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-bold text-xs text-white">
                          <span className={`w-2 h-2 rounded-full ${c.accentBg}`}></span>
                          {c.shortCode}
                        </div>
                        <div className="text-[10px] text-gray-400 truncate">{c.name}</div>
                      </button>
                    ))}
                    
                    {isDirector && (
                      <button
                        type="button"
                        onClick={() => setRegClassId('all')}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          regClassId === 'all'
                            ? 'bg-amber-600/30 border-amber-500 ring-2 ring-amber-500/40'
                            : 'bg-black/30 border-white/10 hover:border-amber-500/40'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-bold text-xs text-white">
                          <Crown className="w-3 h-3 text-amber-400" />
                          <span>All 5 Classes</span>
                        </div>
                        <div className="text-[10px] text-amber-300/80">Director / Multi</div>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Duty Role Selection */}
              <div>
                <label className="block text-[10px] font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                  Assigned Duty / Station *
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
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

                  {isDirector && (
                    <button
                      type="button"
                      onClick={() => setRegRole('director')}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        regRole === 'director'
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                          : 'bg-black/30 border-white/10 text-gray-400 hover:text-white'
                      }`}
                    >
                      <Crown className="w-4 h-4 mx-auto mb-1" />
                      <div className="text-[11px] font-bold">Director</div>
                      <div className="text-[9px] opacity-75">Overall Lead</div>
                    </button>
                  )}
                </div>
              </div>

              {/* Director Option: Appoint as Class Admin */}
              {isDirector && regClassId !== 'all' && (
                <div className="p-3 bg-black/40 border border-purple-500/30 rounded-xl flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-purple-400" />
                      <span>Appoint as Class Admin</span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      Grants this member authority to create and remove accounts in their assigned class ({regClassId.toUpperCase()}).
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={regIsClassAdmin}
                    onChange={(e) => setRegIsClassAdmin(e.target.checked)}
                    className="w-5 h-5 accent-purple-600 rounded cursor-pointer shrink-0"
                  />
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 active:scale-95"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Register Volunteer Account</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: MANAGE ACCOUNTS (WITH CLEAR ADMIN ROLES, PROMOTION & WORKING DELETE BUTTON) */}
          {activeTab === 'manage' && (
            <div className="space-y-4">
              {/* Database Storage Engine Status Banner */}
              <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-2xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-emerald-300">
                  <Database className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-bold">Database Storage Active (IndexedDB & Synced Cache)</span>
                    <p className="text-[11px] text-emerald-400/80">Account additions, deletions, and updates persist permanently across reloads.</p>
                  </div>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40">
                  Persistent
                </span>
              </div>

              {/* Confirmation Dialog: Delete Specific User */}
              {userToDelete && (
                <div className="p-4 bg-red-950/70 border border-red-500 rounded-2xl animate-in fade-in space-y-2.5 shadow-xl">
                  <div className="flex items-center gap-2 text-red-300 font-bold text-xs">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>Confirm Permanent Account Deletion</span>
                  </div>
                  <p className="text-xs text-gray-200">
                    Are you sure you want to permanently delete the profile for <strong>"{userToDelete.name}"</strong> ({userToDelete.email}) from the church database?
                  </p>
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setUserToDelete(null)}
                      className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleExecuteDeleteUser}
                      className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-bold text-white flex items-center gap-1.5 shadow-lg shadow-red-900/50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Yes, Delete Account</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Confirmation Dialog: Clear All Default Demo Accounts */}
              {isConfirmingClearDefaults && (
                <div className="p-4 bg-red-950/70 border border-red-500 rounded-2xl animate-in fade-in space-y-2.5 shadow-xl">
                  <div className="flex items-center gap-2 text-red-300 font-bold text-xs">
                    <Trash2 className="w-4 h-4 text-red-400 shrink-0" />
                    <span>Remove All Default Demo Accounts</span>
                  </div>
                  <p className="text-xs text-gray-200">
                    This will permanently wipe all pre-loaded seed demo staff (Thabo, Lebo, Nomsa, Aunty Grace, Uncle David, Guest) from the database so only your real church volunteers remain.
                  </p>
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsConfirmingClearDefaults(false)}
                      className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleExecuteClearAllDefaults}
                      className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-bold text-white flex items-center gap-1.5 shadow-lg shadow-red-900/50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Yes, Remove All Default Accounts</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Confirmation Dialog: Reset Defaults */}
              {isConfirmingResetDefaults && (
                <div className="p-4 bg-purple-950/70 border border-purple-500 rounded-2xl animate-in fade-in space-y-2.5 shadow-xl">
                  <div className="flex items-center gap-2 text-purple-300 font-bold text-xs">
                    <RotateCcw className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>Reset Staff Roster to Defaults</span>
                  </div>
                  <p className="text-xs text-gray-200">
                    Reset back to the standard CRC Kids Church default staff profiles across all classes?
                  </p>
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsConfirmingResetDefaults(false)}
                      className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleExecuteResetDefaults}
                      className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white flex items-center gap-1.5 shadow-lg shadow-purple-900/50"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Yes, Reset to Defaults</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Confirmation Dialog: Promote/Revoke Admin */}
              {userToToggleAdmin && (
                <div className="p-4 bg-indigo-950/70 border border-indigo-500 rounded-2xl animate-in fade-in space-y-2.5 shadow-xl">
                  <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs">
                    <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Change Class Admin Privileges</span>
                  </div>
                  <p className="text-xs text-gray-200">
                    {(Boolean(userToToggleAdmin.isClassAdmin) || userToToggleAdmin.role === 'admin')
                      ? `Revoke Class Admin privileges for "${userToToggleAdmin.name}"?`
                      : `Appoint "${userToToggleAdmin.name}" as Class Admin for ${userToToggleAdmin.assignedClassId.toUpperCase()}?`}
                  </p>
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setUserToToggleAdmin(null)}
                      className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleExecuteToggleAdmin}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white flex items-center gap-1.5"
                    >
                      <span>Confirm</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Director Reset Controls */}
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs">
                <div className="flex items-center gap-2 text-amber-300">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <div>
                    <span className="font-bold">Staff Directory Oversight</span>
                    <p className="text-[11px] text-gray-400">Clear default seed profiles so only your real church volunteers remain.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleClearAllDefaultAccounts}
                    className="px-3 py-1.5 rounded-lg bg-red-600/30 hover:bg-red-600 border border-red-500/40 text-red-200 hover:text-white text-[11px] font-bold transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove Default Seed</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleResetToDefaultAccounts}
                    title="Reset back to default seed accounts"
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Filters */}
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
                  className="w-full sm:w-auto bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500 font-semibold"
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

              {/* Account Roster List */}
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {filteredAccounts.map((user) => {
                  const isCurrent = currentUser?.id === user.id;
                  const isTargetDirector = user.role === 'director' || (user.role === 'admin' && user.assignedClassId === 'all');
                  const isTargetClassAdmin = Boolean(user.isClassAdmin) || (user.role === 'admin' && user.assignedClassId !== 'all');
                  
                  const canDelete = !isCurrent;

                  return (
                    <div
                      key={user.id}
                      className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition-colors ${
                        isTargetDirector
                          ? 'bg-amber-950/20 border-amber-500/30'
                          : isTargetClassAdmin
                          ? 'bg-purple-950/20 border-purple-500/30'
                          : 'bg-black/30 border-white/5 hover:border-white/15'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-xl bg-gradient-to-br ${user.avatarColor || 'from-purple-500 to-indigo-600'} text-white font-bold flex items-center justify-center text-xs shadow shrink-0`}
                        >
                          {user.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-white">{user.name}</span>
                            
                            {/* Distinguish who has admin roles */}
                            {isTargetDirector ? (
                              <span className="px-1.5 py-0.2 rounded text-[8px] font-black uppercase tracking-wider bg-amber-500/30 text-amber-300 border border-amber-500/50 flex items-center gap-0.5">
                                <Crown className="w-2.5 h-2.5 text-amber-400" />
                                <span>DIRECTOR</span>
                              </span>
                            ) : isTargetClassAdmin ? (
                              <span className="px-1.5 py-0.2 rounded text-[8px] font-black uppercase tracking-wider bg-purple-500/30 text-purple-300 border border-purple-500/50 flex items-center gap-0.5">
                                <ShieldCheck className="w-2.5 h-2.5 text-purple-400" />
                                <span>CLASS ADMIN</span>
                              </span>
                            ) : null}

                            {isCurrent && (
                              <span className="text-[9px] font-bold text-green-400 bg-green-500/10 px-1.5 py-0.2 rounded border border-green-500/30">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-gray-400 truncate">{user.email} • {user.roleTitle || user.role}</div>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            {getClassBadge(user.assignedClassId)}
                            {user.phone && (
                              <span className="text-[10px] text-gray-400 font-mono flex items-center gap-0.5">
                                <span>🇿🇦</span>
                                {user.phone}
                              </span>
                            )}
                            {user.pin && (
                              <span className="text-[9px] text-gray-400 font-mono">
                                PIN: {user.pin}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions: Promote / Revoke (Director) & Working Delete */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Director promotion control */}
                        {isDirector && !isTargetDirector && (
                          <button
                            type="button"
                            onClick={() => handlePromoteOrRevokeAdmin(user)}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                              isTargetClassAdmin
                                ? 'bg-purple-600/30 hover:bg-purple-600 text-purple-200 border border-purple-500/30'
                                : 'bg-white/5 hover:bg-purple-600/40 text-gray-300 hover:text-white border border-white/10'
                            }`}
                            title={isTargetClassAdmin ? 'Revoke Class Admin privileges' : 'Appoint as Class Admin for their class'}
                          >
                            {isTargetClassAdmin ? 'Revoke Admin' : '+ Make Admin'}
                          </button>
                        )}

                        {/* Working Remove / Delete Button */}
                        {canDelete ? (
                          <button
                            type="button"
                            onClick={() => handleDeleteUserClick(user)}
                            title={`Remove ${user.name}`}
                            className="p-1.5 text-red-400 hover:text-white bg-red-500/10 hover:bg-red-600 border border-red-500/20 rounded-xl transition-all flex items-center gap-1 text-[11px] font-bold"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Remove</span>
                          </button>
                        ) : (
                          <span
                            className="p-1.5 text-gray-600 cursor-not-allowed"
                            title="Only an authorized Admin for this class can remove people"
                          >
                            <Lock className="w-3.5 h-3.5" />
                          </span>
                        )}
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

          {/* TAB 4: ROLES & HIERARCHY RULES */}
          {activeTab === 'permissions' && (
            <div className="space-y-3">
              <div className="p-3.5 bg-amber-950/20 border border-amber-500/30 rounded-2xl space-y-1 text-xs">
                <div className="flex items-center gap-2 text-amber-300 font-bold">
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span>1. Ministry Director (Overall Super Admin)</span>
                </div>
                <p className="text-gray-300 text-[11px] leading-relaxed">
                  The Director is permanently and exclusively an overall admin across all 5 classes. <strong>Only the Director can appoint or revoke Class Admins</strong>. The Director can broadcast global pop-up alerts, adjust templates, and oversee all hubs simultaneously.
                </p>
              </div>

              <div className="p-3.5 bg-purple-950/20 border border-purple-500/30 rounded-2xl space-y-1 text-xs">
                <div className="flex items-center gap-2 text-purple-300 font-bold">
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                  <span>2. Class Admin (Appointed by Director)</span>
                </div>
                <p className="text-gray-300 text-[11px] leading-relaxed">
                  The Director can promote any Tech Lead, Presenter, or Comms Lead to a <strong>Class Admin</strong>. Class Admins can create and delete volunteer accounts <em>strictly in their assigned class</em> and have full access to all hubs for that specific class.
                </p>
              </div>

              <div className="p-3.5 bg-emerald-950/20 border border-emerald-500/30 rounded-2xl space-y-1 text-xs">
                <div className="flex items-center gap-2 text-emerald-300 font-bold">
                  <Radio className="w-4 h-4 text-emerald-400" />
                  <span>3. Comms Lead (Timeline & Presenter Calling)</span>
                </div>
                <p className="text-gray-300 text-[11px] leading-relaxed">
                  Tracks the live service flow with interactive segment tick-offs, manages the presenter countdown timer on laptops/iPads, and dispatches urgent presenter call-ins (e.g., "Come into class in 5 minutes").
                </p>
              </div>

              <div className="p-3.5 bg-blue-950/20 border border-blue-500/30 rounded-2xl space-y-1 text-xs">
                <div className="flex items-center gap-2 text-blue-300 font-bold">
                  <Tv className="w-4 h-4 text-blue-400" />
                  <span>4. Tech & Systems Lead</span>
                </div>
                <p className="text-gray-300 text-[11px] leading-relaxed">
                  Operates hardware/HDMI pre-service checklists, worship tracks, presentation slides, SFX soundboard, and logs real-time service incidents for post-service review.
                </p>
              </div>
            </div>
          )}

          {/* TAB 6: SUPABASE DATABASE CLOUD SYNC */}
          {activeTab === 'database' && (
            <div className="space-y-4">
              {/* Connection Status Card */}
              <div className={`p-4 rounded-2xl border ${
                supabaseConfig.isConfigured 
                  ? 'bg-emerald-950/20 border-emerald-500/30' 
                  : 'bg-amber-950/20 border-amber-500/30'
              }`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      supabaseConfig.isConfigured 
                        ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30' 
                        : 'bg-amber-600/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {supabaseConfig.isConfigured ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">
                          {supabaseConfig.isConfigured ? 'Supabase Database Active' : 'Local Storage Mode (Offline-Ready)'}
                        </span>
                        <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          supabaseConfig.isConfigured
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {supabaseConfig.isConfigured ? 'Cloud Connected' : 'Local Fallback'}
                        </span>
                      </div>
                      <p className="text-gray-300 text-xs mt-0.5">
                        {supabaseConfig.isConfigured ? (
                          <>Connected to: <span className="font-mono text-purple-300">{supabaseConfig.url}</span> ({supabaseConfig.isCustom ? 'In-App Credentials' : 'Environment Variable'})</>
                        ) : (
                          'Accounts are saved securely in browser IndexedDB & LocalStorage. Connect your Supabase project below for cloud multi-device sync.'
                        )}
                      </p>
                    </div>
                  </div>

                  {supabaseConfig.isConfigured && (
                    <button
                      onClick={handleClearSupabaseConfig}
                      className="px-2.5 py-1 text-[11px] rounded-lg bg-red-950/40 border border-red-500/30 text-red-300 hover:bg-red-900/40 transition-colors shrink-0 font-semibold"
                    >
                      Disconnect
                    </button>
                  )}
                </div>

                {/* Quick Cloud Actions */}
                <div className="mt-3.5 pt-3 border-t border-white/5 flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleTestSupabaseConnection}
                    disabled={isTestingSb || !supabaseConfig.isConfigured}
                    className="px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-200 text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isTestingSb ? 'animate-spin' : ''}`} />
                    <span>{isTestingSb ? 'Testing...' : 'Test Connection'}</span>
                  </button>

                  <button
                    onClick={handleSyncToSupabase}
                    disabled={isSyncingSb || !supabaseConfig.isConfigured}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-200 text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Database className={`w-3.5 h-3.5 ${isSyncingSb ? 'animate-pulse' : ''}`} />
                    <span>{isSyncingSb ? 'Syncing...' : `Sync ${registeredAccounts.length} Local Accounts to Supabase`}</span>
                  </button>

                  <span className="text-[11px] text-gray-400 ml-auto font-mono">
                    Local Accounts: <strong className="text-white">{registeredAccounts.length}</strong>
                  </span>
                </div>

                {testResult && (
                  <div className={`mt-3 p-2.5 rounded-xl text-xs font-mono border ${
                    testResult.success 
                      ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200' 
                      : 'bg-red-950/30 border-red-500/40 text-red-200'
                  }`}>
                    {testResult.message}
                  </div>
                )}
              </div>

              {/* Supabase Configuration Inputs */}
              <div className="p-4 bg-black/40 border border-white/5 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Server className="w-4 h-4 text-purple-400" />
                    Supabase Project Credentials
                  </span>
                  <span className="text-[10px] text-gray-400">
                    Find these in Supabase Dashboard → Settings → API
                  </span>
                </div>

                <form onSubmit={handleSaveSupabaseConfig} className="space-y-3">
                  <div>
                    <label className="block text-[11px] text-gray-400 font-semibold mb-1">
                      Project URL (VITE_SUPABASE_URL)
                    </label>
                    <input
                      type="url"
                      placeholder="https://xyzprojectid.supabase.co"
                      value={sbUrlInput}
                      onChange={(e) => setSbUrlInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-xs font-mono focus:border-purple-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-gray-400 font-semibold mb-1">
                      Anon Public API Key (VITE_SUPABASE_ANON_KEY)
                    </label>
                    <input
                      type="password"
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      value={sbKeyInput}
                      onChange={(e) => setSbKeyInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-xs font-mono focus:border-purple-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <p className="text-[10px] text-gray-400">
                      Credentials are stored securely in your app workspace.
                    </p>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/30 cursor-pointer"
                    >
                      Save & Connect
                    </button>
                  </div>
                </form>
              </div>

              {/* SQL Setup Instructions & Script */}
              <div className="p-4 bg-black/40 border border-white/5 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Code className="w-4 h-4 text-emerald-400" />
                    Supabase PostgreSQL Table Setup
                  </span>
                  <button
                    onClick={handleCopySql}
                    className="px-2.5 py-1 text-xs rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-bold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                  >
                    {copiedSql ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSql ? 'Copied!' : 'Copy SQL Script'}</span>
                  </button>
                </div>

                <div className="p-3 bg-purple-950/20 border border-purple-500/20 rounded-xl space-y-1 text-xs text-gray-300">
                  <p className="font-semibold text-purple-300">How to set up your Supabase database in 3 steps:</p>
                  <ol className="list-decimal list-inside text-[11px] space-y-0.5 text-gray-300">
                    <li>Open your Supabase Project Dashboard and click <strong>SQL Editor</strong> in the left menu.</li>
                    <li>Click <strong>+ New Query</strong>, paste the script below, and click <strong>Run</strong>.</li>
                    <li>Enter your <strong>Project URL</strong> and <strong>Anon Key</strong> above and click <strong>Save & Connect</strong>!</li>
                  </ol>
                </div>

                <div className="relative">
                  <pre className="p-3 rounded-xl bg-black/60 border border-white/10 text-purple-200 font-mono text-[10px] leading-relaxed overflow-x-auto max-h-48 whitespace-pre">
                    {SUPABASE_STAFF_ACCOUNTS_SQL}
                  </pre>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs text-gray-400 shrink-0">
          <div>
            Signed in as: <strong className="text-white">{currentUser?.name || 'Pastor Hope'}</strong>{' '}
            <span className="text-purple-400 uppercase font-mono">
              ({isDirector ? 'Director' : isClassAdmin ? 'Class Admin' : currentUser?.role || 'volunteer'})
            </span>
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
