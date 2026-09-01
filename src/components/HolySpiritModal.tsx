import React, { useState } from 'react';
import { 
  Flame, 
  Clock, 
  SkipForward, 
  CheckCircle2, 
  Send, 
  X, 
  Radio, 
  Tv, 
  Mic2,
  Sparkles,
  Zap
} from 'lucide-react';
import { ServiceSegment } from '../types/hub';

interface HolySpiritModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSegment: ServiceSegment;
  onApplyOverride: (options: {
    action: 'extend' | 'shorten' | 'skip';
    adjustmentMinutes: number;
    reason?: string;
  }) => void;
  targetEndTimeFormatted: string;
}

export const HolySpiritModal: React.FC<HolySpiritModalProps> = ({
  isOpen,
  onClose,
  currentSegment,
  onApplyOverride,
  targetEndTimeFormatted,
}) => {
  const [selectedAction, setSelectedAction] = useState<'extend' | 'shorten' | 'skip'>('extend');
  const [extendMinutes, setExtendMinutes] = useState<number>(3);
  const [shortenMinutes, setShortenMinutes] = useState<number>(2);
  const [customReason, setCustomReason] = useState<string>('Kids entering deep worship & ministry response');
  const [justUpdated, setJustUpdated] = useState<boolean>(false);
  const [lastDispatchedInfo, setLastDispatchedInfo] = useState<{
    action: string;
    minutes: number;
    newEndTime: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleExecute = () => {
    const mins = selectedAction === 'extend' ? extendMinutes : selectedAction === 'shorten' ? shortenMinutes : 0;
    onApplyOverride({
      action: selectedAction,
      adjustmentMinutes: mins,
      reason: customReason,
    });

    setLastDispatchedInfo({
      action: selectedAction === 'extend' ? 'Worship / Segment extended' : selectedAction === 'shorten' ? 'Segment shortened' : 'Skipped to next segment',
      minutes: mins,
      newEndTime: targetEndTimeFormatted,
    });

    setJustUpdated(true);
    setTimeout(() => {
      setJustUpdated(false);
    }, 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#161626] border border-amber-500/40 rounded-2xl shadow-2xl shadow-amber-950/50 overflow-hidden">
        {/* Glow Header */}
        <div className="bg-amber-950/40 p-5 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.3)]">
              <Flame className="w-5 h-5 text-amber-400 fill-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">3. HOLY SPIRIT MODE</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold uppercase tracking-widest border border-amber-500/30">
                  REAL-TIME OVERRIDE
                </span>
              </div>
              <p className="text-xs text-amber-200/80">Be flexible and stay in sync across all stages</p>
            </div>
          </div>

          <button
            id="btn-close-holy-spirit"
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Active Segment Banner */}
          <div className="bg-black/40 p-4 rounded-xl border border-white/5 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider">Current Segment</span>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2 mt-0.5">
                <span>{currentSegment.title}</span>
                <span className="text-xs font-normal text-gray-400">({currentSegment.assignedLead})</span>
              </h3>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Current Target End</span>
              <p className="text-sm font-mono font-bold text-amber-400 mt-0.5">{targetEndTimeFormatted}</p>
            </div>
          </div>

          {/* Action Grid */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-300">
              Extend or Adjust: What do you want to adjust?
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Option 1: Extend */}
              <button
                id="btn-action-extend"
                onClick={() => setSelectedAction('extend')}
                className={`p-4 rounded-xl border text-left transition-all relative ${
                  selectedAction === 'extend'
                    ? 'bg-amber-950/40 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                    : 'bg-white/5 border-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-1">
                  <Flame className="w-4 h-4 fill-amber-400" />
                  <span>Extend Worship</span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">Add more time to praise or prayer</p>
                {selectedAction === 'extend' && (
                  <div className="mt-3 pt-3 border-t border-amber-500/20 flex gap-1.5">
                    {[3, 5, 10].map((mins) => (
                      <button
                        key={mins}
                        onClick={(e) => {
                          e.stopPropagation();
                          setExtendMinutes(mins);
                        }}
                        className={`px-2 py-1 rounded text-xs font-bold transition-all ${
                          extendMinutes === mins
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-amber-950/60 text-amber-300 hover:bg-amber-900'
                        }`}
                      >
                        +{mins}m
                      </button>
                    ))}
                  </div>
                )}
              </button>

              {/* Option 2: Shorten */}
              <button
                id="btn-action-shorten"
                onClick={() => setSelectedAction('shorten')}
                className={`p-4 rounded-xl border text-left transition-all relative ${
                  selectedAction === 'shorten'
                    ? 'bg-blue-950/40 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.25)]'
                    : 'bg-white/5 border-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-2 text-blue-400 font-bold text-sm mb-1">
                  <Clock className="w-4 h-4" />
                  <span>Shorten Segment</span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">Catch up schedule smoothly</p>
                {selectedAction === 'shorten' && (
                  <div className="mt-3 pt-3 border-t border-blue-500/20 flex gap-1.5">
                    {[2, 5].map((mins) => (
                      <button
                        key={mins}
                        onClick={(e) => {
                          e.stopPropagation();
                          setShortenMinutes(mins);
                        }}
                        className={`px-2 py-1 rounded text-xs font-bold transition-all ${
                          shortenMinutes === mins
                            ? 'bg-blue-500 text-slate-950'
                            : 'bg-blue-950/60 text-blue-300 hover:bg-blue-900'
                        }`}
                      >
                        -{mins}m
                      </button>
                    ))}
                  </div>
                )}
              </button>

              {/* Option 3: Skip */}
              <button
                id="btn-action-skip"
                onClick={() => setSelectedAction('skip')}
                className={`p-4 rounded-xl border text-left transition-all relative ${
                  selectedAction === 'skip'
                    ? 'bg-purple-950/40 border-purple-500 shadow-[0_0_15px_rgba(147,51,234,0.25)]'
                    : 'bg-white/5 border-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-2 text-purple-400 font-bold text-sm mb-1">
                  <SkipForward className="w-4 h-4" />
                  <span>Move to Next</span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">Transition immediately to next item</p>
              </button>
            </div>
          </div>

          {/* Prompt / Reason note */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
              Sync Broadcast Announcement (Optional Note)
            </label>
            <input
              type="text"
              id="input-holy-spirit-reason"
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-amber-500 transition-colors"
              placeholder="e.g. Extending worship: continue instrumental pad..."
            />
          </div>

          {/* Live Sync Preview */}
          <div className="bg-black/30 rounded-xl p-4 border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-gray-400 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Everyone Updates Instantly
              </span>
              <span className="text-[11px] text-green-400 font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping"></span>
                Instant zero-lag sync
              </span>
            </div>

            {/* Broadcast Toast Visual */}
            <div className="bg-green-950/40 border border-green-500/40 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-green-500/20 text-green-300 flex items-center justify-center">
                  🕊️
                </div>
                <div>
                  <h4 className="text-xs font-bold text-green-200">
                    {selectedAction === 'extend'
                      ? `Worship extended by ${extendMinutes} minutes`
                      : selectedAction === 'shorten'
                      ? `Segment reduced by ${shortenMinutes} minutes`
                      : 'Skip triggered to next segment'}
                  </h4>
                  <p className="text-[11px] text-green-400/80">Target timeline adjusted dynamically</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-green-300 bg-green-950/80 px-2 py-1 rounded border border-green-500/30">
                PROMPT DISPATCH
              </span>
            </div>

            {/* Role Dispatch Mapping */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs pt-1">
              <div className="bg-white/5 p-2.5 rounded-lg border border-white/5 flex items-center gap-2">
                <Mic2 className="w-4 h-4 text-purple-400 shrink-0" />
                <div>
                  <span className="font-bold text-gray-200 block text-[11px]">✝ Presenter</span>
                  <span className="text-gray-400 text-[10px]">Lesson timer delayed</span>
                </div>
              </div>

              <div className="bg-white/5 p-2.5 rounded-lg border border-white/5 flex items-center gap-2">
                <Radio className="w-4 h-4 text-green-400 shrink-0" />
                <div>
                  <span className="font-bold text-gray-200 block text-[11px]">👥 Comms Team</span>
                  <span className="text-gray-400 text-[10px]">Timeline recalculated</span>
                </div>
              </div>

              <div className="bg-white/5 p-2.5 rounded-lg border border-white/5 flex items-center gap-2">
                <Tv className="w-4 h-4 text-blue-400 shrink-0" />
                <div>
                  <span className="font-bold text-gray-200 block text-[11px]">🖥️ Tech Team</span>
                  <span className="text-gray-400 text-[10px]">Continue worship playlist</span>
                </div>
              </div>
            </div>
          </div>

          {/* Feedback message if just updated */}
          {justUpdated && lastDispatchedInfo && (
            <div className="p-3 bg-amber-500/20 border border-amber-500/50 rounded-xl text-amber-200 text-xs font-semibold flex items-center gap-2 animate-bounce">
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
              <span>Broadcast dispatched to all stage tablets and tech consoles!</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              id="btn-cancel-holy-spirit"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>

            <button
              id="btn-apply-holy-spirit-override"
              onClick={handleExecute}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.4)] active:scale-95 transition-all"
            >
              <Flame className="w-4 h-4 fill-slate-950" />
              <span>Broadcast Override Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
