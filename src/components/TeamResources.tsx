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
  X
} from 'lucide-react';
import { TeamMember, LessonNotesData, IncidentLog } from '../types/hub';

interface TeamResourcesProps {
  teamMembers: TeamMember[];
  lessonNotes: LessonNotesData;
  incidents: IncidentLog[];
  onAddIncident: (description: string, severity: 'low' | 'medium' | 'critical') => void;
  onResolveIncident: (id: string) => void;
}

export const TeamResources: React.FC<TeamResourcesProps> = ({
  teamMembers,
  lessonNotes,
  incidents,
  onAddIncident,
  onResolveIncident,
}) => {
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [incidentText, setIncidentText] = useState('');
  const [incidentSeverity, setIncidentSeverity] = useState<'low' | 'medium' | 'critical'>('low');

  const handleCreateIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!incidentText.trim()) return;
    onAddIncident(incidentText, incidentSeverity);
    setIncidentText('');
    setShowIncidentModal(false);
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
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">4. TEAM & RESOURCES</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-[10px] font-bold uppercase tracking-widest">
                CENTRAL HUB
              </span>
            </div>
            <p className="text-xs text-gray-400">Everything in one place: Team roster, lesson curriculum notes & real-time incident tracker.</p>
          </div>
        </div>

        <button
          id="btn-open-incident-modal"
          onClick={() => setShowIncidentModal(true)}
          className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-[0_0_15px_rgba(147,51,234,0.4)] transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Log Incident</span>
        </button>
      </div>

      {/* 3-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Card 1: Team Roster */}
        <div className="bg-[#161626] rounded-2xl border border-white/5 p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <div>
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-[0.2em] block mb-0.5">ROLES & VOLUNTEERS</span>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-400" />
                <span>Team Roster</span>
              </h3>
            </div>
            <span className="text-[11px] font-mono text-purple-300 bg-black/40 px-2 py-0.5 rounded-lg border border-white/10">{teamMembers.length} Active</span>
          </div>

          <div className="space-y-2.5">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between transition-all hover:border-purple-500/40"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${member.avatarColor} flex items-center justify-center text-white font-bold text-xs shadow-md`}>
                    {member.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>{member.name}</span>
                      {member.isOnline && (
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                      )}
                    </h4>
                    <p className="text-[11px] text-gray-400">{member.roleTitle}</p>
                  </div>
                </div>

                {member.phone && (
                  <a
                    href={`tel:${member.phone}`}
                    className="p-1.5 rounded-lg bg-black/40 hover:bg-purple-600/30 text-gray-300 hover:text-purple-300 transition-colors"
                    title={`Call ${member.name}`}
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            ))}
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
