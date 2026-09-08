import React, { useState } from 'react';
import { 
  Lock, 
  User, 
  LogIn, 
  ShieldCheck, 
  Tv, 
  Clock, 
  Radio, 
  Globe, 
  UserCheck, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles,
  ArrowRight,
  KeyRound,
  Smartphone,
  Mail,
  Shield,
  Crown,
  ChevronLeft,
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
  RotateCw
} from 'lucide-react';
import { AuthUser, Role, ClassId } from '../types/hub';
import { CLASSES_CONFIG } from '../data/classHubsData';
import { CrcLogo } from './CrcLogo';

interface SignInGateProps {
  onSignIn: (user: AuthUser) => void;
  registeredAccounts: AuthUser[];
  onAddNewAccount?: (newUser: AuthUser) => void;
  isSyncing?: boolean;
  syncError?: string | null;
  onRefreshAccounts?: () => void;
  fetchAttempted?: boolean;
}

export const SignInGate: React.FC<SignInGateProps> = ({
  onSignIn,
  registeredAccounts = [],
  onAddNewAccount,
  isSyncing = false,
  syncError = null,
  onRefreshAccounts,
  fetchAttempted = false,
}) => {
  const [selectedAccount, setSelectedAccount] = useState<AuthUser | null>(null);
  const [authMethod, setAuthMethod] = useState<'pin' | 'otp'>('pin');
  
  // PIN Form State
  const [enteredPin, setEnteredPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  
  // OTP Form State
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);

  // Mode Selection
  const [activeMode, setActiveMode] = useState<'accounts' | 'email' | 'register'>('accounts');
  const [emailInput, setEmailInput] = useState('');

  // Register New Account State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regRole, setRegRole] = useState<Role>('director');
  const [regClassId, setRegClassId] = useState<ClassId | 'all'>('all');
  const [regPhone, setRegPhone] = useState('');
  const [regPin, setRegPin] = useState('');
  const [approvalPin, setApprovalPin] = useState('');
  const [showApprovalPin, setShowApprovalPin] = useState(false);
  
  // Feedback Messages
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isRetrying, setIsRetrying] = useState(false);

  const handleManualRetry = async () => {
    setIsRetrying(true);
    try {
      if (onRefreshAccounts) {
        await onRefreshAccounts();
      }
    } finally {
      setTimeout(() => setIsRetrying(false), 600);
    }
  };

  const handleHardReload = () => {
    try {
      localStorage.removeItem('kch_custom_supabase_url');
      localStorage.removeItem('kch_custom_supabase_anon_key');
    } catch (e) {}
    window.location.href = window.location.pathname + '?v=' + Date.now();
  };

  // Role filter in account list
  const [filterRole, setFilterRole] = useState<'all' | 'director' | 'admin' | 'tech' | 'presenter' | 'comms'>('all');

  const handleSelectAccountForAuth = (account: AuthUser) => {
    setSelectedAccount(account);
    setEnteredPin('');
    setEnteredOtp('');
    setGeneratedOtp(null);
    setIsOtpSent(false);
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!selectedAccount) return;

    const expectedPin = (selectedAccount.pin || '').trim();
    if (expectedPin && enteredPin.trim() === expectedPin) {
      onSignIn({ ...selectedAccount, isAuthenticated: true });
    } else {
      setErrorMessage('Invalid Security PIN. Please enter the correct PIN assigned to this account.');
    }
  };

  const handleSendOtp = () => {
    if (!selectedAccount) return;
    const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(randomCode);
    setIsOtpSent(true);
    setErrorMessage('');
    setSuccessMessage(`SMS & Email OTP dispatched! Simulated code: ${randomCode}`);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!selectedAccount || !generatedOtp) return;

    if (enteredOtp.trim() === generatedOtp) {
      onSignIn({ ...selectedAccount, isAuthenticated: true });
    } else {
      setErrorMessage(`Invalid 6-digit verification code. Please enter the code sent to ${selectedAccount.phone || 'your phone'}.`);
    }
  };

  const handleEmailSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!emailInput.trim()) {
      setErrorMessage('Please enter your church email address.');
      return;
    }

    const found = registeredAccounts.find(
      (a) => a.email.toLowerCase() === emailInput.trim().toLowerCase()
    );

    if (found) {
      handleSelectAccountForAuth(found);
    } else {
      setErrorMessage(`No registered account found for '${emailInput}'. Please select an account from the roster or register with the Director.`);
    }
  };

  const handleGuestSignIn = () => {
    const existingGuest = registeredAccounts.find(a => a.id === 'usr-guest' || a.email.toLowerCase() === 'guest@crc.church');
    if (existingGuest) {
      onSignIn({ ...existingGuest, isAuthenticated: true });
      return;
    }

    const guestUser: AuthUser = {
      id: 'usr-guest',
      email: 'guest@crc.church',
      name: 'Guest Volunteer',
      role: 'presenter',
      roleTitle: 'Guest Observer (Stage HUD View)',
      assignedClassId: 'kb',
      avatarColor: 'from-purple-600 to-indigo-700',
      phone: '+27 82 123 4567',
      isAuthenticated: true,
    };
    onSignIn(guestUser);
  };

  const getClassBadge = (classId: ClassId) => {
    if (classId === 'all') {
      return (
        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/40">
          All 5 Classes (Director)
        </span>
      );
    }
    const c = CLASSES_CONFIG.find(cls => cls.id === classId);
    if (!c) return null;
    return (
      <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide border ${c.themeBadge}`}>
        {c.shortCode} • {c.name}
      </span>
    );
  };

  const filteredAccounts = registeredAccounts.filter((acc) => {
    if (filterRole === 'all') return true;
    if (filterRole === 'director') return acc.role === 'director' || (acc.role === 'admin' && acc.assignedClassId === 'all');
    if (filterRole === 'admin') return acc.isClassAdmin === true || (acc.role === 'admin' && acc.assignedClassId !== 'all');
    return acc.role === filterRole;
  });

  return (
    <div className="min-h-screen bg-[#080811] text-slate-100 flex flex-col items-center justify-center p-3 sm:p-6 relative overflow-hidden font-sans">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/6 -left-32 w-[500px] h-[500px] bg-purple-700/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/6 -right-32 w-[500px] h-[500px] bg-indigo-700/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-xl bg-[#121222]/90 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-5 sm:p-8 relative z-10 space-y-6">
        
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-1">
            <CrcLogo className="w-14 h-14 shadow-xl" />
          </div>
          
          <div>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase">
                CRC KIDS CHURCH
              </h1>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-black tracking-wide flex items-center gap-1 shadow-sm">
                <span>🇿🇦</span>
                <span>JOHANNESBURG</span>
              </span>
            </div>
            <p className="text-xs text-purple-300 font-semibold tracking-wide mt-1">
              Multi-Class Production & Service Command Network
            </p>
            <p className="text-[11px] text-gray-400 max-w-md mx-auto mt-0.5">
              Secure authentication required to access church consoles, audio controls, and stage timelines.
            </p>
          </div>
        </div>

        {/* VIEW 1: AUTHENTICATION CHALLENGE (When an account has been selected) */}
        {selectedAccount ? (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Back to roster selector button */}
            <button
              onClick={() => setSelectedAccount(null)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Staff Roster</span>
            </button>

            {/* Selected Profile Card Summary */}
            <div className="p-4 rounded-2xl bg-black/40 border border-purple-500/30 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${selectedAccount.avatarColor || 'from-purple-600 to-indigo-600'} text-white font-black flex items-center justify-center text-lg shadow-lg shrink-0`}>
                  {selectedAccount.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-black text-white">{selectedAccount.name}</span>
                    
                    {/* Role / Admin Badges */}
                    {selectedAccount.role === 'director' || (selectedAccount.role === 'admin' && selectedAccount.assignedClassId === 'all') ? (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                        <Crown className="w-3 h-3 text-amber-400" />
                        <span>DIRECTOR (OVERALL ADMIN)</span>
                      </span>
                    ) : selectedAccount.isClassAdmin || selectedAccount.role === 'admin' ? (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-purple-400" />
                        <span>CLASS ADMIN</span>
                      </span>
                    ) : null}
                  </div>
                  
                  <div className="text-xs text-gray-300 font-medium">
                    {selectedAccount.roleTitle || selectedAccount.role}
                  </div>
                  
                  <div className="flex items-center gap-2 mt-1">
                    {getClassBadge(selectedAccount.assignedClassId)}
                    {selectedAccount.phone && (
                      <span className="text-[10px] text-gray-400 font-mono flex items-center gap-0.5">
                        <span>🇿🇦</span>
                        {selectedAccount.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Notification messages */}
            {errorMessage && (
              <div className="p-3 bg-red-500/15 border border-red-500/40 rounded-xl text-xs text-red-300 flex items-center gap-2 animate-shake">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3 bg-emerald-500/15 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Auth Method Selector */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-black/40 rounded-xl border border-white/5 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setAuthMethod('pin');
                  setErrorMessage('');
                }}
                className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  authMethod === 'pin' ? 'bg-purple-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Security PIN / Passcode</span>
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setAuthMethod('otp');
                  setErrorMessage('');
                }}
                className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  authMethod === 'otp' ? 'bg-purple-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>SMS / Email OTP Code</span>
              </button>
            </div>

            {/* METHOD 1: PIN FORM */}
            {authMethod === 'pin' && (
              <form onSubmit={handleVerifyPin} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-gray-300">
                      Enter Security PIN
                    </label>
                  </div>
                  
                  <div className="relative">
                    <input
                      type={showPin ? 'text' : 'password'}
                      value={enteredPin}
                      onChange={(e) => setEnteredPin(e.target.value)}
                      placeholder="••••"
                      maxLength={8}
                      className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/15 text-white placeholder-gray-600 text-center tracking-[0.4em] font-mono text-lg font-bold focus:outline-none focus:border-purple-500 transition-colors"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1"
                    >
                      {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">
                    Enter the assigned security PIN for {selectedAccount.name}.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2 active:scale-95"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Verify PIN & Enter Console</span>
                  </button>
                </div>
              </form>
            )}

            {/* METHOD 2: SMS / EMAIL OTP VERIFICATION */}
            {authMethod === 'otp' && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="p-3 bg-purple-950/20 border border-purple-500/20 rounded-xl space-y-1 text-xs text-gray-300">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-purple-400" />
                    <span>Two-Factor Authentication Dispatch</span>
                  </div>
                  <p className="text-[11px] text-gray-400">
                    A 6-digit one-time code will be dispatched to <strong>{selectedAccount.phone || '+27 82 555 0192'}</strong> and <strong>{selectedAccount.email}</strong>.
                  </p>
                </div>

                {!isOtpSent ? (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Send 6-Digit OTP to Phone / Email</span>
                  </button>
                ) : (
                  <div className="space-y-3">
                    {/* Simulated SMS banner for user convenience */}
                    {generatedOtp && (
                      <div className="p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-xl flex items-center justify-between gap-2 text-xs">
                        <div className="text-[11px] text-indigo-200">
                          <span>Simulated SMS Code: </span>
                          <strong className="font-mono text-white text-sm bg-black/40 px-2 py-0.5 rounded border border-indigo-400/40 ml-1">
                            {generatedOtp}
                          </strong>
                        </div>
                        <button
                          type="button"
                          onClick={() => setEnteredOtp(generatedOtp)}
                          className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold shrink-0"
                        >
                          Use Code
                        </button>
                      </div>
                    )}

                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-gray-300 block mb-1">
                        Enter 6-Digit OTP Code
                      </label>
                      <input
                        type="text"
                        value={enteredOtp}
                        onChange={(e) => setEnteredOtp(e.target.value)}
                        placeholder="••••••"
                        maxLength={6}
                        className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/15 text-white placeholder-gray-600 text-center tracking-[0.5em] font-mono text-lg font-bold focus:outline-none focus:border-purple-500 transition-colors"
                        autoFocus
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-[11px] font-semibold transition-colors"
                      >
                        Resend Code
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2 active:scale-95"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Verify OTP & Unlock Station</span>
                      </button>
                    </div>
                  </div>
                )}
              </form>
            )}
          </div>
        ) : (
          /* VIEW 2: ACCOUNT SELECTION ROSTER */
          <div className="space-y-4">
            {/* Quick Guest Fast Pass banner */}
            <div className="p-3.5 rounded-2xl bg-purple-950/30 border border-purple-500/30 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>Visiting Volunteer or Presenter?</span>
                </div>
                <p className="text-[11px] text-gray-300 mt-0.5">
                  Instant 1-click guest pass for Stage HUD viewing (Kingdom Builders).
                </p>
              </div>
              <button
                id="btn-signin-guest"
                onClick={handleGuestSignIn}
                className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-1.5 shrink-0"
              >
                <span>Guest Fast-Pass</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Tab: Select Profile vs Email Search */}
            {/* MODE SELECTOR */}
            <div className="flex items-center gap-2 p-1 bg-black/40 rounded-xl border border-white/5 text-xs font-bold">
              <button
                onClick={() => setActiveMode('accounts')}
                className={`flex-1 py-2 rounded-lg transition-all text-center flex items-center justify-center gap-1.5 ${
                  activeMode === 'accounts' ? 'bg-purple-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Roster ({registeredAccounts.length})</span>
              </button>
              <button
                onClick={() => setActiveMode('email')}
                className={`flex-1 py-2 rounded-lg transition-all text-center flex items-center justify-center gap-1.5 ${
                  activeMode === 'email' ? 'bg-purple-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Email Lookup</span>
              </button>
              <button
                onClick={() => setActiveMode('register')}
                className={`flex-1 py-2 rounded-lg transition-all text-center flex items-center justify-center gap-1.5 ${
                  activeMode === 'register' ? 'bg-amber-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Crown className="w-3.5 h-3.5 text-amber-300" />
                <span>Register Account</span>
              </button>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* ROLE FILTER CHIPS */}
            {activeMode === 'accounts' && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setFilterRole('all')}
                  className={`px-2.5 py-1 rounded-lg transition-all whitespace-nowrap ${
                    filterRole === 'all' ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  All ({registeredAccounts.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterRole('director')}
                  className={`px-2.5 py-1 rounded-lg transition-all whitespace-nowrap flex items-center gap-1 ${
                    filterRole === 'director' ? 'bg-amber-600 text-white' : 'bg-white/5 text-amber-300/70 hover:text-amber-300'
                  }`}
                >
                  <Crown className="w-3 h-3" />
                  <span>Director</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFilterRole('admin')}
                  className={`px-2.5 py-1 rounded-lg transition-all whitespace-nowrap flex items-center gap-1 ${
                    filterRole === 'admin' ? 'bg-purple-600 text-white' : 'bg-white/5 text-purple-300/70 hover:text-purple-300'
                  }`}
                >
                  <ShieldCheck className="w-3 h-3" />
                  <span>Class Admins</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFilterRole('comms')}
                  className={`px-2.5 py-1 rounded-lg transition-all whitespace-nowrap flex items-center gap-1 ${
                    filterRole === 'comms' ? 'bg-emerald-600 text-white' : 'bg-white/5 text-emerald-300/70 hover:text-emerald-300'
                  }`}
                >
                  <Radio className="w-3 h-3" />
                  <span>Comms Timekeepers</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFilterRole('tech')}
                  className={`px-2.5 py-1 rounded-lg transition-all whitespace-nowrap flex items-center gap-1 ${
                    filterRole === 'tech' ? 'bg-blue-600 text-white' : 'bg-white/5 text-blue-300/70 hover:text-blue-300'
                  }`}
                >
                  <Tv className="w-3 h-3" />
                  <span>Tech Leads</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFilterRole('presenter')}
                  className={`px-2.5 py-1 rounded-lg transition-all whitespace-nowrap flex items-center gap-1 ${
                    filterRole === 'presenter' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-indigo-300/70 hover:text-indigo-300'
                  }`}
                >
                  <Clock className="w-3 h-3" />
                  <span>Presenters</span>
                </button>
              </div>
            )}

            {/* TAB: ACCOUNTS LIST */}
            {activeMode === 'accounts' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-gray-400 px-1">
                  <div className="flex items-center gap-1.5">
                    <span>Select Profile to Authenticate:</span>
                    {onRefreshAccounts && (
                      <button
                        type="button"
                        onClick={onRefreshAccounts}
                        disabled={isSyncing}
                        className="p-1 text-purple-400 hover:text-purple-300 hover:bg-white/5 rounded-lg transition-colors"
                        title="Sync with cloud database"
                      >
                        <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                      </button>
                    )}
                  </div>
                  <span className="text-[10px] text-purple-400 font-normal">
                    {isSyncing ? 'Connecting to Database...' : 'PIN or OTP required'}
                  </span>
                </div>
                
                {/* Offline Warning Banner if accounts are cached but remote fetch encountered an error */}
                {syncError && registeredAccounts.length > 0 && (
                  <div className="p-2.5 bg-amber-500/15 border border-amber-500/30 rounded-xl text-xs text-amber-200 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                      <span className="text-[11px] truncate">Offline Cache Active • {syncError}</span>
                    </div>
                    {onRefreshAccounts && (
                      <button
                        type="button"
                        onClick={onRefreshAccounts}
                        disabled={isSyncing}
                        className="text-[11px] font-bold text-amber-300 hover:text-white underline shrink-0 cursor-pointer"
                      >
                        Retry
                      </button>
                    )}
                  </div>
                )}

                <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                  {isSyncing && registeredAccounts.length === 0 ? (
                    <div className="text-center py-10 px-4 bg-white/5 rounded-2xl border border-white/5 space-y-3">
                      <RefreshCw className="w-6 h-6 text-purple-400 animate-spin mx-auto" />
                      <div className="text-xs font-bold text-white">Connecting to Church Database...</div>
                      <div className="text-[11px] text-gray-400">Loading verified staff accounts from Supabase cloud</div>
                    </div>
                  ) : syncError && registeredAccounts.length === 0 ? (
                    <div className="text-center py-7 px-4 bg-red-950/25 rounded-2xl border border-red-500/30 space-y-3">
                      <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
                      <div className="text-xs font-bold text-white">Could Not Connect to Church Database</div>
                      <p className="text-[11px] text-red-300/90 max-w-sm mx-auto leading-relaxed">
                        {syncError}
                      </p>
                      <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                        {onRefreshAccounts && (
                          <button
                            type="button"
                            onClick={handleManualRetry}
                            disabled={isSyncing || isRetrying}
                            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 active:scale-95 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-purple-900/30 disabled:opacity-60"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing || isRetrying ? 'animate-spin' : ''}`} />
                            <span>{isSyncing || isRetrying ? 'Connecting...' : 'Retry Connection'}</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={handleHardReload}
                          title="Purges any cached browser scripts and forces a fresh reload"
                          className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 active:scale-95 text-white font-medium text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer border border-white/10"
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                          <span>Reload App</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleGuestSignIn}
                          className="px-3.5 py-2.5 bg-emerald-600/80 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-lg shadow-emerald-950/40"
                        >
                          Fast Pass
                        </button>
                      </div>
                      <div className="text-[10px] text-gray-400 pt-1">
                        Target: <span className="font-mono text-purple-300">CRC Kids Supabase Cloud</span>
                      </div>
                    </div>
                  ) : filteredAccounts.length === 0 ? (
                    <div className="text-center py-8 px-4 bg-white/5 rounded-2xl border border-white/5 space-y-3">
                      <p className="text-xs text-gray-400">
                        {registeredAccounts.length === 0
                          ? 'No staff accounts found in database. An authorized Director must register the first account.'
                          : 'No staff accounts found for this role filter.'}
                      </p>
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => setActiveMode('register')}
                          className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl transition-all"
                        >
                          Register Staff Account
                        </button>
                        <button
                          type="button"
                          onClick={handleGuestSignIn}
                          className="px-3 py-2 bg-white/10 hover:bg-white/20 text-gray-200 font-bold text-xs rounded-xl transition-all"
                        >
                          Fast Pass
                        </button>
                      </div>
                    </div>
                  ) : (
                    filteredAccounts.map((account) => {
                      const isDirector = account.role === 'director' || (account.role === 'admin' && account.assignedClassId === 'all');
                      const isClassAdmin = account.isClassAdmin || (account.role === 'admin' && account.assignedClassId !== 'all');

                      return (
                        <button
                          key={account.id}
                          onClick={() => handleSelectAccountForAuth(account)}
                          className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between group ${
                            isDirector
                              ? 'bg-amber-950/20 hover:bg-amber-950/40 border-amber-500/30 hover:border-amber-400'
                              : isClassAdmin
                              ? 'bg-purple-950/20 hover:bg-purple-950/40 border-purple-500/30 hover:border-purple-400'
                              : 'bg-white/5 hover:bg-white/10 border-white/5 hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${account.avatarColor || 'from-purple-600 to-indigo-600'} text-white font-black flex items-center justify-center text-sm shadow-md shrink-0`}>
                              {account.name.charAt(0).toUpperCase()}
                            </div>
                            
                            <div>
                              <div className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors flex items-center gap-2 flex-wrap">
                                <span>{account.name}</span>
                                
                                {/* Distinction Badges */}
                                {isDirector ? (
                                  <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/50 flex items-center gap-0.5">
                                    <Crown className="w-2.5 h-2.5 text-amber-400" />
                                    <span>DIRECTOR</span>
                                  </span>
                                ) : isClassAdmin ? (
                                  <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/50 flex items-center gap-0.5">
                                    <ShieldCheck className="w-2.5 h-2.5 text-purple-400" />
                                    <span>CLASS ADMIN</span>
                                  </span>
                                ) : null}
                              </div>
                              
                              <div className="text-[11px] text-gray-400">
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

                          <div className="text-right shrink-0">
                            <span className="text-xs font-bold text-purple-400 group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                              <span>Authenticate</span>
                              <span>&rarr;</span>
                            </span>
                            <div className="text-[9px] text-gray-400 font-mono mt-0.5 flex items-center justify-end gap-1">
                              <Lock className="w-2.5 h-2.5 text-purple-400" />
                              <span>Protected</span>
                            </div>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* TAB: EMAIL LOOKUP */}
            {activeMode === 'email' && (
              <form onSubmit={handleEmailSearchSubmit} className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold text-gray-300 block mb-1 uppercase tracking-wider">
                    Church Email Address
                  </label>
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="e.g. director@crc.church or thabo@crc.church"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-purple-500 transition-colors"
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Find Account & Proceed to PIN Verification</span>
                </button>
              </form>
            )}

            {/* TAB: REGISTER ACCOUNT */}
            {activeMode === 'register' && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setErrorMessage('');
                  if (!regName.trim()) {
                    setErrorMessage('Full name is required.');
                    return;
                  }
                  if (!regEmail.trim()) {
                    setErrorMessage('Email address is required.');
                    return;
                  }

                  const cleanEmail = regEmail.trim().toLowerCase();
                  if (registeredAccounts.some((a) => (a.email || '').toLowerCase() === cleanEmail)) {
                    setErrorMessage(`An account with email "${cleanEmail}" is already registered.`);
                    return;
                  }

                  if (!regPin.trim() || regPin.trim().length < 4) {
                    setErrorMessage('Please enter a secure 4 to 6-digit security PIN for this account.');
                    return;
                  }

                  // Verify Approval Authorization Code
                  const DIRECTOR_APPROVAL_PINS = ['7492', '2504'];
                  const STAFF_APPROVAL_PINS = ['5813', '7492', '2504'];

                  const requiresDirectorApproval = regRole === 'director' || regRole === 'admin';
                  const isApproved = requiresDirectorApproval
                    ? DIRECTOR_APPROVAL_PINS.includes(approvalPin.trim())
                    : STAFF_APPROVAL_PINS.includes(approvalPin.trim());

                  if (!isApproved) {
                    if (requiresDirectorApproval) {
                      setErrorMessage('Authorization Denied: Registering a Director or Class Admin account requires Pastor Hope or Ministry Director approval (PIN: 7492 or Director Override PIN).');
                    } else {
                      setErrorMessage('Authorization Denied: Registration requires an authorized Director or Lead Admin approval PIN. Please request the approval PIN from your Kids Ministry Director.');
                    }
                    return;
                  }

                  const effectiveRole: Role = regRole;
                  const effectiveClassId: ClassId | 'all' = effectiveRole === 'director' ? 'all' : regClassId;
                  const fallbackTitle = effectiveRole === 'director'
                    ? 'Ministry Director'
                    : effectiveRole === 'admin'
                    ? 'Class Admin'
                    : effectiveRole === 'tech'
                    ? 'Technical Lead'
                    : effectiveRole === 'presenter'
                    ? 'Lead Presenter'
                    : 'Comms Timekeeper';

                  const newAccount: AuthUser = {
                    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                    name: regName.trim(),
                    email: cleanEmail,
                    role: effectiveRole,
                    assignedClassId: effectiveClassId,
                    roleTitle: fallbackTitle,
                    phone: regPhone.trim() || '+27 82 123 4567',
                    avatarColor: effectiveRole === 'director' ? 'from-amber-500 to-orange-600' : effectiveRole === 'admin' ? 'from-purple-500 to-indigo-600' : effectiveRole === 'tech' ? 'from-blue-500 to-cyan-600' : effectiveRole === 'presenter' ? 'from-pink-500 to-rose-600' : 'from-emerald-500 to-teal-600',
                    isClassAdmin: effectiveRole === 'admin' || effectiveRole === 'director',
                    pin: regPin.trim(),
                    isAuthenticated: true,
                  };

                  if (onAddNewAccount) {
                    onAddNewAccount(newAccount);
                  }
                  setSuccessMessage(`Account created for ${newAccount.name}! Entering as ${newAccount.roleTitle}...`);
                  setTimeout(() => {
                    onSignIn(newAccount);
                  }, 600);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="text-[11px] font-bold text-gray-300 block mb-1 uppercase tracking-wider">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Pastor Hope or Thabo Ndlovu"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-amber-500 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-300 block mb-1 uppercase tracking-wider">
                    Church Email Address *
                  </label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="e.g. hope@crc.church"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-amber-500 transition-colors"
                    required
                  />
                </div>

                {/* Role selection */}
                <div>
                  <label className="text-[11px] font-bold text-gray-300 block mb-1.5 uppercase tracking-wider">
                    Select Your Role / Station *
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setRegRole('director');
                        setRegClassId('all');
                      }}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        regRole === 'director'
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300 ring-1 ring-amber-500/50'
                          : 'bg-black/30 border-white/10 text-gray-400 hover:text-white'
                      }`}
                    >
                      <Crown className="w-4 h-4 mx-auto mb-1 text-amber-400" />
                      <div className="text-[11px] font-bold">Director</div>
                      <div className="text-[9px] opacity-75">All Oversight</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRegRole('admin')}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        regRole === 'admin'
                          ? 'bg-purple-500/20 border-purple-500 text-purple-300 ring-1 ring-purple-500/50'
                          : 'bg-black/30 border-white/10 text-gray-400 hover:text-white'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4 mx-auto mb-1 text-purple-400" />
                      <div className="text-[11px] font-bold">Class Admin</div>
                      <div className="text-[9px] opacity-75">Room Lead</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRegRole('tech')}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        regRole === 'tech'
                          ? 'bg-blue-500/20 border-blue-500 text-blue-300 ring-1 ring-blue-500/50'
                          : 'bg-black/30 border-white/10 text-gray-400 hover:text-white'
                      }`}
                    >
                      <Tv className="w-4 h-4 mx-auto mb-1 text-blue-400" />
                      <div className="text-[11px] font-bold">Tech</div>
                      <div className="text-[9px] opacity-75">Audio & Visual</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRegRole('presenter')}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        regRole === 'presenter'
                          ? 'bg-pink-500/20 border-pink-500 text-pink-300 ring-1 ring-pink-500/50'
                          : 'bg-black/30 border-white/10 text-gray-400 hover:text-white'
                      }`}
                    >
                      <Clock className="w-4 h-4 mx-auto mb-1 text-pink-400" />
                      <div className="text-[11px] font-bold">Presenter</div>
                      <div className="text-[9px] opacity-75">Stage / Story</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRegRole('comms')}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        regRole === 'comms'
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500/50'
                          : 'bg-black/30 border-white/10 text-gray-400 hover:text-white'
                      }`}
                    >
                      <Radio className="w-4 h-4 mx-auto mb-1 text-emerald-400" />
                      <div className="text-[11px] font-bold">Comms</div>
                      <div className="text-[9px] opacity-75">Timekeeping</div>
                    </button>
                  </div>
                </div>

                {regRole !== 'director' && (
                  <div>
                    <label className="text-[11px] font-bold text-gray-300 block mb-1 uppercase tracking-wider">
                      Assigned Class Hub
                    </label>
                    <select
                      value={regClassId}
                      onChange={(e) => setRegClassId(e.target.value as ClassId)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500"
                    >
                      {CLASSES_CONFIG.map((c) => (
                        <option key={c.id} value={c.id} className="bg-gray-900 text-white">
                          {c.shortCode} - {c.name} ({c.ageGroup})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-gray-300 block mb-1 uppercase tracking-wider">
                      Mobile Number
                    </label>
                    <input
                      type="text"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="e.g. 082 123 4567"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-gray-300 block mb-1 uppercase tracking-wider">
                      Account Login PIN *
                    </label>
                    <input
                      type="password"
                      maxLength={6}
                      value={regPin}
                      onChange={(e) => setRegPin(e.target.value)}
                      placeholder="4-6 digits"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Approval Authorization PIN Requirement */}
                <div className="p-3.5 bg-amber-950/25 border border-amber-500/40 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5 uppercase tracking-wider">
                      <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                      <span>{regRole === 'director' || regRole === 'admin' ? 'Director Authorization PIN *' : 'Ministry Approval PIN *'}</span>
                    </label>
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Approval Code Required
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-300 leading-relaxed">
                    {regRole === 'director' || regRole === 'admin'
                      ? 'Ministry Executive Security Rule: Creating a Director or Class Admin account requires Pastor Hope’s authorization (PIN: 7492).'
                      : 'Account Creation Security Rule: Accounts cannot be created without approval. Enter authorization code provided by Pastor Hope or your Ministry Director (e.g. 5813 or 7492).'}
                  </p>
                  <div className="relative">
                    <input
                      type={showApprovalPin ? 'text' : 'password'}
                      value={approvalPin}
                      onChange={(e) => setApprovalPin(e.target.value)}
                      placeholder={regRole === 'director' || regRole === 'admin' ? 'Enter Director Authorization PIN' : 'Enter Ministry Approval Code'}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-amber-500/50 text-white placeholder-gray-500 text-xs font-mono focus:outline-none focus:border-amber-400 transition-colors pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowApprovalPin(!showApprovalPin)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white cursor-pointer"
                      title={showApprovalPin ? 'Hide PIN' : 'Show PIN'}
                    >
                      {showApprovalPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white text-xs font-bold rounded-xl shadow-lg shadow-amber-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Crown className="w-4 h-4" />
                  <span>Verify Approval & Create {regRole === 'director' ? 'Director' : regRole.toUpperCase()} Account</span>
                </button>
              </form>
            )}

            {/* Access Permissions Policy Notice */}
            <div className="p-3 bg-black/40 border border-white/5 rounded-2xl text-[11px] text-gray-400 space-y-1.5">
              <div className="font-bold text-white flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-purple-400" />
                <span>Johannesburg Campus Access Security Policy</span>
              </div>
              <ul className="space-y-1 list-disc list-inside text-[10px]">
                <li><strong className="text-amber-300">Ministry Director:</strong> Complete oversight of all 5 class hubs, global alerts & only Director grants Class Admin roles.</li>
                <li><strong className="text-purple-300">Class Admins:</strong> Appointed exclusively by Director. Full access to their class hubs, team roster, and class accounts.</li>
                <li><strong className="text-emerald-300">Comms Controllers:</strong> Dedicated service timekeepers managing timers, cues, and schedule pacing.</li>
                <li><strong className="text-blue-300">Tech & Presenters:</strong> Single-purpose direct console or stage HUD for minimal distraction.</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
