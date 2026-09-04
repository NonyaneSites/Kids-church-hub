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
  ArrowRight
} from 'lucide-react';
import { AuthUser, Role, ClassId } from '../types/hub';
import { CLASSES_CONFIG } from '../data/classHubsData';

interface SignInGateProps {
  onSignIn: (user: AuthUser) => void;
  registeredAccounts: AuthUser[];
}

export const SignInGate: React.FC<SignInGateProps> = ({
  onSignIn,
  registeredAccounts = [],
}) => {
  const [activeMode, setActiveMode] = useState<'quick' | 'email'>('quick');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleEmailSubmit = (e: React.FormEvent) => {
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
      onSignIn({ ...found, isAuthenticated: true });
    } else {
      // Create guest or volunteer session if not registered
      const isDirectorEmail = emailInput.toLowerCase().includes('director') || emailInput.toLowerCase().includes('pastor');
      const newUser: AuthUser = {
        id: `usr_${Date.now()}`,
        email: emailInput.trim(),
        name: emailInput.split('@')[0].replace(/[\._]/g, ' '),
        role: isDirectorEmail ? 'director' : 'tech',
        roleTitle: isDirectorEmail ? 'Ministry Director' : 'Tech Volunteer',
        assignedClassId: isDirectorEmail ? 'all' : 'kb',
        avatarColor: 'from-blue-600 to-indigo-600',
        phone: '+27 82 000 0000',
        isAuthenticated: true,
      };
      onSignIn(newUser);
    }
  };

  const handleGuestSignIn = () => {
    // Check if guest account exists in registeredAccounts
    const existingGuest = registeredAccounts.find(a => a.id === 'usr-guest' || a.email.toLowerCase() === 'guest@crc.church');
    if (existingGuest) {
      onSignIn({ ...existingGuest, isAuthenticated: true });
      return;
    }

    const guestUser: AuthUser = {
      id: 'usr-guest',
      email: 'guest@crc.church',
      name: 'Guest Visitor',
      role: 'presenter',
      roleTitle: 'Guest Presenter (Stage HUD)',
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

  const getRoleIcon = (role: Role) => {
    switch (role) {
      case 'director':
        return <Globe className="w-4 h-4 text-purple-400" />;
      case 'admin':
        return <ShieldCheck className="w-4 h-4 text-amber-400" />;
      case 'tech':
        return <Tv className="w-4 h-4 text-blue-400" />;
      case 'presenter':
        return <Clock className="w-4 h-4 text-purple-400" />;
      case 'comms':
        return <Radio className="w-4 h-4 text-emerald-400" />;
      default:
        return <User className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#090910] text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background Decorative Ambient Glows */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-xl bg-[#141424] border border-white/10 rounded-3xl shadow-2xl p-6 sm:p-8 relative z-10 space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-700 via-indigo-600 to-blue-500 shadow-[0_0_25px_rgba(147,51,234,0.4)] text-white font-black text-xl mb-1">
            KC
          </div>
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              CRC KIDS CHURCH
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-bold flex items-center gap-1">
              <span>🇿🇦</span>
              <span>South Africa</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 max-w-md mx-auto">
            Multi-Class Service Command Center. Please sign in to access your assigned class console and ministry tools.
          </p>
        </div>

        {/* Guest 1-Click Fast Pass Option */}
        <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/30 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Visiting or Random Volunteer?</span>
            </div>
            <p className="text-[11px] text-gray-300 mt-0.5">
              Sign in immediately with the pre-configured Guest Account for Kingdom Builders.
            </p>
          </div>
          <button
            id="btn-signin-guest"
            onClick={handleGuestSignIn}
            className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-1.5 shrink-0"
          >
            <span>Continue as Guest</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Tab Toggle: Select Account vs Enter Email */}
        <div className="flex items-center gap-2 p-1 bg-black/40 rounded-xl border border-white/5 text-xs font-bold">
          <button
            onClick={() => setActiveMode('quick')}
            className={`flex-1 py-2 rounded-lg transition-all text-center flex items-center justify-center gap-1.5 ${
              activeMode === 'quick' ? 'bg-purple-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Select Account ({registeredAccounts.length})</span>
          </button>
          <button
            onClick={() => setActiveMode('email')}
            className={`flex-1 py-2 rounded-lg transition-all text-center flex items-center justify-center gap-1.5 ${
              activeMode === 'email' ? 'bg-purple-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Email Sign In</span>
          </button>
        </div>

        {/* Error notice */}
        {errorMessage && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Tab Content: Quick Account Picker */}
        {activeMode === 'quick' && (
          <div className="space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 px-1">
              Select Your Profile to Sign In:
            </div>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {registeredAccounts.map((account) => {
                const isDirector = account.role === 'director' || (account.role === 'admin' && account.assignedClassId === 'all');
                return (
                  <button
                    key={account.id}
                    onClick={() => onSignIn({ ...account, isAuthenticated: true })}
                    className="w-full p-3 rounded-2xl bg-white/5 hover:bg-purple-600/20 border border-white/5 hover:border-purple-500/40 text-left transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${account.avatarColor || 'from-purple-600 to-indigo-600'} text-white font-bold flex items-center justify-center text-sm shadow-md shrink-0`}>
                        {account.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors flex items-center gap-2">
                          <span>{account.name}</span>
                          {getRoleIcon(account.role)}
                        </div>
                        <div className="text-[11px] text-gray-400">
                          {account.roleTitle || account.role}
                        </div>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {getClassBadge(account.assignedClassId)}
                          {account.phone && (
                            <span className="text-[10px] text-gray-400 font-mono flex items-center gap-0.5">
                              <span>🇿🇦</span>
                              {account.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-purple-400 group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                        Sign In &rarr;
                      </span>
                      {isDirector && (
                        <div className="text-[9px] text-amber-400 font-mono mt-0.5">
                          All Classes
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab Content: Email & Password Form */}
        {activeMode === 'email' && (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label className="text-[11px] font-bold text-gray-300 block mb-1">
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

            <div>
              <label className="text-[11px] font-bold text-gray-300 block mb-1">
                Password or Service PIN (Optional for Demo)
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In to Console</span>
            </button>
          </form>
        )}

        {/* Access Permissions Policy Notice */}
        <div className="p-3 bg-black/40 border border-white/5 rounded-2xl text-[11px] text-gray-400 space-y-1">
          <div className="font-bold text-white flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-purple-400" />
            <span>Role-Based Access Policy</span>
          </div>
          <ul className="space-y-0.5 list-disc list-inside text-[10px]">
            <li><strong>Class Directors</strong>: Oversee all 5 classes & switch anytime.</li>
            <li><strong>Class Admins</strong>: Locked to their assigned class; manage team for that class.</li>
            <li><strong>Tech Leads</strong>: Directly locked to the Tech Console only.</li>
            <li><strong>Presenters</strong>: Dedicated Stage HUD countdown and lesson notes.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
