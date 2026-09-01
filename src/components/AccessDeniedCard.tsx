import React from 'react';
import { ShieldAlert, Lock, UserCheck, ArrowRight } from 'lucide-react';
import { Role, AuthUser } from '../types/hub';

interface AccessDeniedCardProps {
  requiredRole: 'Admin' | 'Tech' | 'Presenter' | 'Comms';
  currentUser: AuthUser;
  onOpenAuthModal: () => void;
  onSwitchToAllowedTab?: () => void;
}

export const AccessDeniedCard: React.FC<AccessDeniedCardProps> = ({
  requiredRole,
  currentUser,
  onOpenAuthModal,
  onSwitchToAllowedTab,
}) => {
  return (
    <div className="min-h-[420px] flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-[#161626] border border-white/10 rounded-3xl p-6 sm:p-8 text-center space-y-5 shadow-2xl relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)]">
          <Lock className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-[0.2em] block">
            ROLE-GATED PERMISSION REQUIRED
          </span>
          <h3 className="text-xl font-bold text-white tracking-tight">
            {requiredRole} Access Required
          </h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">
            You are currently signed in as <strong className="text-white">{currentUser?.name || 'User'}</strong> with the{' '}
            <span className="text-purple-300 font-semibold uppercase">{currentUser?.role || 'Guest'}</span> role. This module is restricted to authorized {requiredRole} personnel.
          </p>
        </div>

        {/* Current Permissions Status */}
        <div className="bg-black/40 rounded-2xl p-4 border border-white/5 text-left text-xs space-y-2">
          <div className="flex items-center justify-between text-gray-400">
            <span>Current Role:</span>
            <span className="text-white font-mono font-bold uppercase">{currentUser?.role || 'Guest'}</span>
          </div>
          <div className="flex items-center justify-between text-gray-400">
            <span>Required Role:</span>
            <span className="text-amber-300 font-mono font-bold">{requiredRole}</span>
          </div>
          <div className="flex items-center justify-between text-gray-400">
            <span>Auth Table Status:</span>
            <span className="text-emerald-400 font-mono">Authenticated ✓</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={onOpenAuthModal}
            className="flex-1 py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(147,51,234,0.4)] transition-all"
          >
            <UserCheck className="w-4 h-4" />
            <span>Switch to {requiredRole} Account</span>
          </button>

          {onSwitchToAllowedTab && (
            <button
              onClick={onSwitchToAllowedTab}
              className="py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Back to My View</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
