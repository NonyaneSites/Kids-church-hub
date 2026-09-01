import React, { useEffect } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  X, 
  Radio, 
  Tv, 
  ArrowRight 
} from 'lucide-react';
import { IncidentLog } from '../types/hub';

interface IncidentRealtimeToastProps {
  incident: IncidentLog | null;
  onDismiss: () => void;
  onResolve: (id: string) => void;
  onNavigateToTech?: () => void;
}

export const IncidentRealtimeToast: React.FC<IncidentRealtimeToastProps> = ({
  incident,
  onDismiss,
  onResolve,
  onNavigateToTech,
}) => {
  // Auto-dismiss low/medium severity after 12 seconds
  useEffect(() => {
    if (!incident) return;
    if (incident.severity === 'low') {
      const timer = setTimeout(() => {
        onDismiss();
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [incident, onDismiss]);

  if (!incident) return null;

  const isCritical = incident.severity === 'critical';
  const isMedium = incident.severity === 'medium';

  return (
    <div className="fixed bottom-6 right-4 sm:right-6 z-50 max-w-md w-[calc(100vw-2rem)] animate-slideUp">
      <div
        className={`rounded-2xl p-4 shadow-2xl backdrop-blur-xl border flex flex-col gap-3 transition-all ${
          isCritical
            ? 'bg-[#1e0a12]/95 border-red-500/60 shadow-[0_0_30px_rgba(239,68,68,0.4)]'
            : isMedium
            ? 'bg-[#1e1509]/95 border-amber-500/60 shadow-[0_0_30px_rgba(245,158,11,0.35)]'
            : 'bg-[#101026]/95 border-blue-500/50 shadow-[0_0_25px_rgba(59,130,246,0.3)]'
        }`}
      >
        {/* Header Bar */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                isCritical
                  ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse'
                  : isMedium
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  : 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
              }`}
            >
              {isCritical ? (
                <ShieldAlert className="w-5 h-5" />
              ) : (
                <AlertTriangle className="w-5 h-5" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider ${
                    isCritical
                      ? 'bg-red-500 text-white animate-pulse'
                      : isMedium
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                  }`}
                >
                  {isCritical ? 'CRITICAL INCIDENT' : `${incident.severity.toUpperCase()} INCIDENT ALERT`}
                </span>
                <span className="text-[11px] font-mono text-gray-400">{incident.time}</span>
              </div>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Reported by: <span className="text-gray-200 font-semibold">{incident.reportedBy}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onDismiss}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Incident Description */}
        <div className="bg-black/40 rounded-xl p-3 border border-white/5">
          <p className="text-xs font-semibold text-white leading-relaxed">
            {incident.description}
          </p>
        </div>

        {/* Realtime Telemetry Broadcast Badge */}
        <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 border-t border-white/5 pt-2">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <Radio className="w-3 h-3 animate-ping" />
            <span>Supabase Realtime Broadcast Active</span>
          </div>

          <div className="flex items-center gap-2">
            {onNavigateToTech && (
              <button
                onClick={() => {
                  onNavigateToTech();
                  onDismiss();
                }}
                className="text-purple-300 hover:text-white font-bold flex items-center gap-1 hover:underline"
              >
                <span>Open Tech</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}

            <button
              onClick={() => onResolve(incident.id)}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold flex items-center gap-1 shadow-sm transition-all text-[11px]"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Resolve</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
