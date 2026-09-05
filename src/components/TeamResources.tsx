import React, { useState } from 'react';
import {
  Users,
  BookOpen,
  AlertTriangle,
  Plus,
  CheckCircle2,
  Phone,
  Shield,
  Clock,
  Sparkles,
  Gamepad2,
  FileText,
  X,
  UserPlus,
  Globe,
  Trash2,
  Crown,
  ShieldCheck,
  Lock,
  MessageCircle,
  AlertCircle
} from 'lucide-react';
import { TeamMember, LessonNotesData, IncidentLog, ClassId, ClassInfo, AuthUser } from '../types/hub';
import { getSouthAfricaWhatsAppLink } from '../utils/southAfricaPhone';

interface TeamResourcesProps {
  currentUser?: AuthUser;
  teamMembers: TeamMember[];
  lessonNotes: LessonNotesData;
  incidents: IncidentLog[];
  onAddIncident: (description: string, severity: 'low' | 'medium' | 'critical') => void;
  onResolveIncident: (id: string) => void;
  selectedClassId?: ClassId;
  activeClassInfo?: ClassInfo;
  registeredAccounts?: AuthUser[];
  onOpenAuthModal?: (tab?: 'quick_switch' | 'login' | 'register' | 'manage') => void;
  onRemoveTeamMember?: (memberId: string) => void;
  onDeleteAccount?: (userId: string) => void;
  onPromoteToClassAdmin?: (userId: string) => void;
  onRevokeClassAdmin?: (userId: string) => void;
}

export const TeamResources: React.FC<TeamResourcesProps> = ({
  currentUser,
  teamMembers,
  lessonNotes,
  incidents,
  onAddIncident,
  onResolveIncident,
  selectedClassId,
  activeClassInfo,
  registeredAccounts = [],
  onOpenAuthModal,
  onRemoveTeamMember,
  onDeleteAccount,
  onPromoteToClassAdmin,
  onRevokeClassAdmin,
}) => {
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [incidentText, setIncidentText] = useState('');
  const [incidentSeverity, setIncidentSeverity] = useState<'low' | 'medium' | 'critical'>('low');
  const [rosterFilter, setRosterFilter] = useState<'class' | 'all'>('class');
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [memberToRemove, setMemberToRemove] = useState<TeamMember | null>(null);
  const [accountToDelete, setAccountToDelete] = useState<AuthUser | null>(null);
  const [accountToToggleAdmin, setAccountToToggleAdmin] = useState<AuthUser | null>(null);

  const isDirector = currentUser?.role === 'director' || (currentUser?.role === 'admin' && currentUser?.assignedClassId === 'all');
  const isClassAdmin = Boolean(currentUser?.isClassAdmin) || (currentUser?.role === 'admin' && currentUser?.assignedClassId !== 'all');

  const showTemporaryNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleCreateIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!incidentText.trim()) return;
    onAddIncident(incidentText, incidentSeverity);
    setIncidentText('');
    setShowIncidentModal(false);
  };

  const handleRemoveMemberClick = (member: TeamMember) => {
    setMemberToRemove(member);
  };

  const handleExecuteRemoveMember = () => {
    if (!memberToRemove) return;
    if (onRemoveTeamMember) {
      onRemoveTeamMember(memberToRemove.id);
      showTemporaryNotice(`Removed ${memberToRemove.name} from the active class roster.`);
    }
    setMemberToRemove(null);
  };

  const handleDeleteAccountClick = (account: AuthUser) => {
    setAccountToDelete(account);
  };

  const handleExecuteDeleteAccount = () => {
    if (!accountToDelete) return;
    if (onDeleteAccount) {
      onDeleteAccount(accountToDelete.id);
      showTemporaryNotice(`Permanently deleted account for ${accountToDelete.name} from database.`);
    }
    setAccountToDelete(null);
  };

  const handleToggleAdminStatus = (account: AuthUser) => {
    setAccountToToggleAdmin(account);
  };

  const handleExecuteToggleAdmin = () => {
    if (!accountToToggleAdmin) return;
    const currentIsAdmin = Boolean(accountToToggleAdmin.isClassAdmin) || accountToToggleAdmin.role === 'admin';
    if (currentIsAdmin) {
      onRevokeClassAdmin?.(accountToToggleAdmin.id);
      showTemporaryNotice(`Revoked Class Admin status for ${accountToToggleAdmin.name}.`);
    } else {
      onPromoteToClassAdmin?.(accountToToggleAdmin.id);
      showTemporaryNotice(`Appointed ${accountToToggleAdmin.name} as Class Admin!`);
    }
    setAccountToToggleAdmin(null);
  };

  return (
    <div className="space-y-6">
      {/* Module Title Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#161626] p-4 sm:p-5 rounded-2xl border border-white/5 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-[0_0_15px_rgba(147,51,234,0.3)]">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">4. TEAM & RESOURCES</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-[10px] font-bold uppercase tracking-widest">
                CENTRAL HUB
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-extrabold uppercase tracking-wide">
                🇿🇦 CRC KIDS CHURCH JHB
              </span>
            </div>
            <p className="text-xs text-gray-400">Team roster, curriculum lesson notes & production incident review for Johannesburg.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenAuthModal && (
            <button
              onClick={() => onOpenAuthModal('register')}
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <UserPlus className="w-3.5 h-3.5 text-purple-400" />
              <span>+ Add Volunteer</span>
            </button>
          )}

          <button
            id="btn-open-incident-modal"
            onClick={() => setShowIncidentModal(true)}
            className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-[0_0_15px_rgba(147,51,234,0.4)] transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Log Incident</span>
          </button>
        </div>
      </div>

      {/* Temporary feedback banner */}
      {actionNotice && (
        <div className="p-3 bg-emerald-500/15 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center justify-between gap-2 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Inline Confirmation: Delete Account */}
      {accountToDelete && (
        <div className="p-4 bg-red-950/70 border border-red-500 rounded-2xl animate-in fade-in space-y-2.5 shadow-xl">
          <div className="flex items-center gap-2 text-red-300 font-bold text-xs">
            <Trash2 className="w-4 h-4 text-red-400 shrink-0" />
            <span>Confirm Permanent Account Deletion</span>
          </div>
          <p className="text-xs text-gray-200">
            Are you sure you want to permanently delete the profile for <strong>"{accountToDelete.name}"</strong> ({accountToDelete.email}) from the church database?
          </p>
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setAccountToDelete(null)}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-gray-300"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleExecuteDeleteAccount}
              className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-bold text-white flex items-center gap-1.5 shadow-lg shadow-red-900/50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Yes, Delete Account</span>
            </button>
          </div>
        </div>
      )}

      {/* Inline Confirmation: Remove Team Member from Class */}
      {memberToRemove && (
        <div className="p-4 bg-amber-950/70 border border-amber-500 rounded-2xl animate-in fade-in space-y-2.5 shadow-xl">
          <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
            <Users className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Remove from Class Roster</span>
          </div>
          <p className="text-xs text-gray-200">
            Are you sure you want to remove <strong>"{memberToRemove.name}"</strong> ({memberToRemove.role}) from this class roster?
          </p>
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setMemberToRemove(null)}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-gray-300"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleExecuteRemoveMember}
              className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-xs font-bold text-white flex items-center gap-1.5"
            >
              <span>Yes, Remove</span>
            </button>
          </div>
        </div>
      )}

      {/* Inline Confirmation: Toggle Admin */}
      {accountToToggleAdmin && (
        <div className="p-4 bg-indigo-950/70 border border-indigo-500 rounded-2xl animate-in fade-in space-y-2.5 shadow-xl">
          <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs">
            <Crown className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>Class Admin Authorization</span>
          </div>
          <p className="text-xs text-gray-200">
            {(Boolean(accountToToggleAdmin.isClassAdmin) || accountToToggleAdmin.role === 'admin')
              ? `Revoke Class Admin privileges for "${accountToToggleAdmin.name}"?`
              : `Appoint "${accountToToggleAdmin.name}" as Class Admin for ${accountToToggleAdmin.assignedClassId.toUpperCase()}?`}
          </p>
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setAccountToToggleAdmin(null)}
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

      {/* 3-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Card 1: Team Roster & Volunteer Accounts with Admin Roles & Working Delete Button */}
        <div className="bg-[#161626] rounded-2xl border border-white/5 p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <div>
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-[0.2em] block mb-0.5">ROLES & VOLUNTEERS</span>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-400" />
                <span>Team Roster</span>
              </h3>
            </div>
            
            {/* Legend for Admin Hierarchy */}
            <div className="flex items-center gap-1.5 text-[9px] font-bold">
              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-0.5">
                <Crown className="w-2.5 h-2.5" />
                <span>Director</span>
              </span>
              <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-0.5">
                <ShieldCheck className="w-2.5 h-2.5" />
                <span>Admin</span>
              </span>
            </div>
          </div>

          {/* Roster Filter Tabs */}
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5 text-[11px]">
            <button
              onClick={() => setRosterFilter('class')}
              className={`flex-1 py-1 px-2 rounded-lg font-bold transition-all text-center ${
                rosterFilter === 'class' ? 'bg-purple-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
              }`}
            >
              {activeClassInfo ? activeClassInfo.name : 'Class Team'}
            </button>
            <button
              onClick={() => setRosterFilter('all')}
              className={`flex-1 py-1 px-2 rounded-lg font-bold transition-all text-center ${
                rosterFilter === 'all' ? 'bg-purple-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
              }`}
            >
              All Accounts ({registeredAccounts.length})
            </button>
          </div>

          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {rosterFilter === 'class' ? (
              teamMembers.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-xs">
                  No volunteers currently assigned to this class roster.
                </div>
              ) : (
                teamMembers.map((member) => {
                  const canRemoveMember = isDirector || (isClassAdmin && currentUser?.assignedClassId === (selectedClassId || 'all'));

                  return (
                    <div
                      key={member.id}
                      className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between transition-all hover:border-purple-500/40 group"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${member.avatarColor} flex items-center justify-center text-white font-bold text-xs shadow-md shrink-0`}>
                          {member.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span>{member.name}</span>
                            {member.isOnline && (
                              <span className="w-1.5 h-1.5 rounded-full bg-green-400" title="Online"></span>
                            )}
                          </h4>
                          <p className="text-[11px] text-gray-400">{member.roleTitle}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {member.phone && (
                          <a
                            href={`tel:${member.phone}`}
                            className="p-1.5 rounded-lg bg-black/40 hover:bg-purple-600/30 text-gray-300 hover:text-purple-300 transition-colors"
                            title={`Call ${member.name}`}
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                        )}

                        {/* Working Remove Button with Admin permissions */}
                        {canRemoveMember ? (
                          <button
                            type="button"
                            onClick={() => handleRemoveMemberClick(member)}
                            className="p-1.5 rounded-lg bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/30 transition-colors"
                            title={`Remove ${member.name} from class roster`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <span
                            className="p-1.5 rounded-lg text-gray-600 cursor-not-allowed"
                            title="Only an Admin for this class can remove team members"
                          >
                            <Lock className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )
            ) : (
              registeredAccounts.map((account) => {
                const isAccDirector = account.role === 'director' || (account.role === 'admin' && account.assignedClassId === 'all');
                const isAccClassAdmin = Boolean(account.isClassAdmin) || (account.role === 'admin' && account.assignedClassId !== 'all');
                
                const canDeleteThisAccount = account.id !== currentUser?.id;

                const classBadge = 
                  account.assignedClassId === 'jy' ? 'bg-blue-500/20 text-blue-300 border-blue-500/40' :
                  account.assignedClassId === 'tb' ? 'bg-pink-500/20 text-pink-300 border-pink-500/40' :
                  account.assignedClassId === 'kb' ? 'bg-red-500/20 text-red-300 border-red-500/40' :
                  account.assignedClassId === 'la-orange' ? 'bg-orange-500/20 text-orange-300 border-orange-500/40' :
                  account.assignedClassId === 'la-yellow' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40' :
                  'bg-purple-500/20 text-purple-300 border-purple-500/40';

                return (
                  <div
                    key={account.id}
                    className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                      isAccDirector
                        ? 'bg-amber-950/20 border-amber-500/30'
                        : isAccClassAdmin
                        ? 'bg-purple-950/20 border-purple-500/30'
                        : 'bg-white/5 border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${account.avatarColor} flex items-center justify-center text-white font-bold text-xs shadow-md shrink-0`}>
                        {account.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white flex items-center gap-1.5 flex-wrap">
                          <span className="truncate">{account.name}</span>
                          
                          {/* Distinct Admin Badges */}
                          {isAccDirector ? (
                            <span className="px-1.5 py-0.2 rounded text-[8px] font-black uppercase tracking-wider bg-amber-500/30 text-amber-300 border border-amber-500/50 flex items-center gap-0.5 shrink-0">
                              <Crown className="w-2.5 h-2.5 text-amber-400" />
                              <span>DIRECTOR</span>
                            </span>
                          ) : isAccClassAdmin ? (
                            <span className="px-1.5 py-0.2 rounded text-[8px] font-black uppercase tracking-wider bg-purple-500/30 text-purple-300 border border-purple-500/50 flex items-center gap-0.5 shrink-0">
                              <ShieldCheck className="w-2.5 h-2.5 text-purple-400" />
                              <span>CLASS ADMIN</span>
                            </span>
                          ) : null}

                          <span className={`text-[8px] uppercase px-1 py-0.2 rounded border font-mono font-bold shrink-0 ${classBadge}`}>
                            {account.assignedClassId === 'all' ? 'ALL 5' : account.assignedClassId?.toUpperCase()}
                          </span>
                        </div>
                        <div className="text-[10px] text-gray-400 flex items-center gap-1 truncate">
                          <span>{account.roleTitle || account.role}</span>
                          <span>•</span>
                          <span className="font-mono truncate">{account.email}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions: Director Promote Toggle & Working Delete Button */}
                    <div className="flex items-center gap-1 shrink-0">
                      {/* Director Promotion Button */}
                      {isDirector && !isAccDirector && (
                        <button
                          type="button"
                          onClick={() => handleToggleAdminStatus(account)}
                          className={`px-2 py-1 rounded-lg text-[9px] font-bold uppercase transition-all ${
                            isAccClassAdmin
                              ? 'bg-purple-600/30 hover:bg-purple-600 text-purple-200 border border-purple-500/30'
                              : 'bg-white/5 hover:bg-purple-600/40 text-gray-300 hover:text-white border border-white/10'
                          }`}
                          title={isAccClassAdmin ? 'Revoke Class Admin status' : 'Promote to Class Admin for their class'}
                        >
                          {isAccClassAdmin ? 'Revoke Admin' : '+ Make Admin'}
                        </button>
                      )}

                      {/* Working Delete Button */}
                      {canDeleteThisAccount ? (
                        <button
                          type="button"
                          onClick={() => handleDeleteAccountClick(account)}
                          className="p-1.5 rounded-lg bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/30 transition-colors"
                          title={`Delete account for ${account.name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <span
                          className="p-1.5 text-gray-600 cursor-not-allowed"
                          title="Only authorized Admin for this class can delete"
                        >
                          <Lock className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="p-2.5 bg-black/40 border border-white/5 rounded-xl text-[10px] text-gray-400 space-y-1">
            <span className="font-bold text-gray-300 flex items-center gap-1">
              <Shield className="w-3 h-3 text-purple-400" />
              <span>Permission Rule</span>
            </span>
            <p>
              Only a <strong>Director</strong> can appoint Class Admins. Only an <strong>Admin</strong> can remove volunteers and accounts in their assigned class.
            </p>
          </div>
        </div>

        {/* Card 2: Lesson Notes */}
        <div className="bg-[#161626] rounded-2xl border border-white/5 p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <div>
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-[0.2em] block mb-0.5">CURRICULUM</span>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-400" />
                <span>Lesson Notes</span>
              </h3>
            </div>
            <span className="text-[11px] font-mono text-purple-300 bg-black/40 px-2 py-0.5 rounded-lg border border-white/10">{lessonNotes.slidesCount} Slides</span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
              <span className="text-[10px] uppercase font-bold text-purple-400 block">Main Scripture</span>
              <p className="font-bold text-white">{lessonNotes.mainScripture}</p>
            </div>

            <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
              <span className="text-[10px] uppercase font-bold text-green-400 block">Key Point</span>
              <p className="text-gray-200 font-medium">"{lessonNotes.keyPoint}"</p>
            </div>

            <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
              <span className="text-[10px] uppercase font-bold text-amber-400 block">Memory Verse</span>
              <p className="text-gray-200 italic">{lessonNotes.memoryVerse}</p>
            </div>

            <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
              <span className="text-[10px] uppercase font-bold text-blue-400 flex items-center gap-1">
                <Gamepad2 className="w-3.5 h-3.5" />
                <span>Illustration / Game</span>
              </span>
              <p className="text-gray-300">{lessonNotes.illustrationGame}</p>
            </div>
          </div>
        </div>

        {/* Card 3: Incident Log */}
        <div className="bg-[#161626] rounded-2xl border border-white/5 p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <div>
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-[0.2em] block mb-0.5">SERVICE HEALTH</span>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Incident Log</span>
              </h3>
            </div>
            <button
              id="btn-add-incident-top"
              onClick={() => setShowIncidentModal(true)}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-purple-300 border border-white/10 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {incidents.length === 0 ? (
              <div className="p-6 text-center text-gray-400 text-xs">
                No incidents reported today. All systems smooth!
              </div>
            ) : (
              incidents.map((inc) => (
                <div
                  key={inc.id}
                  className={`p-3 rounded-xl border flex items-start justify-between gap-2 transition-all ${
                    inc.status === 'resolved'
                      ? 'bg-black/30 border-green-500/30 text-gray-300'
                      : 'bg-amber-950/20 border-amber-500/50 text-white'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        inc.status === 'resolved'
                          ? 'bg-green-600/20 text-green-400'
                          : 'bg-amber-600/20 text-amber-400'
                      }`}
                    >
                      {inc.status === 'resolved' ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-gray-400">{inc.time}</span>
                        <span
                          className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                            inc.severity === 'critical'
                              ? 'bg-red-950 text-red-300'
                              : inc.severity === 'medium'
                              ? 'bg-amber-950 text-amber-300'
                              : 'bg-blue-950 text-blue-300'
                          }`}
                        >
                          {inc.severity}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-gray-200 mt-0.5">{inc.description}</p>
                      <span className="text-[10px] text-gray-400 block mt-0.5">By {inc.reportedBy}</span>
                    </div>
                  </div>

                  {inc.status === 'open' && (
                    <button
                      onClick={() => onResolveIncident(inc.id)}
                      className="px-2 py-1 rounded bg-green-600 hover:bg-green-500 text-[10px] font-bold text-white whitespace-nowrap"
                    >
                      Resolve
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          <button
            id="btn-add-incident-footer"
            onClick={() => setShowIncidentModal(true)}
            className="w-full py-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Incident</span>
          </button>
        </div>

      </div>

      {/* Add Incident Modal */}
      {showIncidentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-[#161626] border border-white/10 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <span>Log Production Incident</span>
              </h3>
              <button
                onClick={() => setShowIncidentModal(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateIncident} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-300 uppercase mb-1">
                  Incident Description
                </label>
                <input
                  type="text"
                  required
                  value={incidentText}
                  onChange={(e) => setIncidentText(e.target.value)}
                  placeholder="e.g. Wireless Mic 1 crackle on high notes"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-300 uppercase mb-1">Severity Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['low', 'medium', 'critical'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setIncidentSeverity(lvl)}
                      className={`py-2 rounded-xl font-bold uppercase transition-all ${
                        incidentSeverity === lvl
                          ? lvl === 'critical'
                            ? 'bg-red-600 text-white'
                            : lvl === 'medium'
                            ? 'bg-amber-600 text-white'
                            : 'bg-blue-600 text-white'
                          : 'bg-white/5 text-gray-400 hover:text-white'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowIncidentModal(false)}
                  className="px-4 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-[0_0_15px_rgba(147,51,234,0.4)]"
                >
                  Log Incident
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
