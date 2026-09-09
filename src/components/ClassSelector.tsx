import React from 'react';
import { MapPin, CheckCircle2, ChevronRight, Sparkles } from 'lucide-react';
import { ClassId, ClassInfo } from '../types/hub';
import { CLASSES_CONFIG } from '../data/classHubsData';

interface ClassSelectorProps {
  selectedClassId: ClassId | 'all';
  onSelectClass: (classId: ClassId | 'all') => void;
  allowAllClasses?: boolean;
  className?: string;
  variant?: 'compact' | 'modal' | 'banner';
  onClose?: () => void;
}

export const ClassSelector: React.FC<ClassSelectorProps> = ({
  selectedClassId,
  onSelectClass,
  allowAllClasses = false,
  className = '',
  variant = 'compact',
  onClose,
}) => {
  const handleSelect = (id: ClassId | 'all') => {
    onSelectClass(id);
    if (onClose) {
      onClose();
    }
  };

  if (variant === 'modal') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
        <div className="w-full max-w-lg bg-[#161626] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">Select Physical Room / Class</h3>
                <p className="text-xs text-gray-400">Isolate stage cues, walkie & timers to this room</p>
              </div>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5"
              >
                ✕
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
            {allowAllClasses && (
              <button
                onClick={() => handleSelect('all')}
                className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  selectedClassId === 'all'
                    ? 'bg-purple-600/20 border-purple-500 text-white shadow-lg'
                    : 'bg-white/5 border-white/5 text-gray-300 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-purple-400"></div>
                  <div>
                    <div className="text-xs font-bold text-white">All Rooms (Director View)</div>
                    <div className="text-[11px] text-gray-400">Master overview of all rooms simultaneously</div>
                  </div>
                </div>
                {selectedClassId === 'all' && <CheckCircle2 className="w-4 h-4 text-purple-400" />}
              </button>
            )}

            {CLASSES_CONFIG.map((c) => {
              const isSelected = selectedClassId === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => handleSelect(c.id)}
                  className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                    isSelected
                      ? 'bg-white/10 border-white/30 text-white shadow-lg'
                      : 'bg-white/5 border-white/5 text-gray-300 hover:bg-white/10'
                  }`}
                  style={{
                    borderColor: isSelected ? c.colorHex : undefined,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: c.colorHex }}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white tracking-tight">{c.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/40 text-gray-300 border border-white/10">
                          {c.shortCode}
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-2">
                        <span>{c.room}</span>
                        <span>•</span>
                        <span>{c.grade} ({c.ageGroup})</span>
                      </div>
                    </div>
                  </div>
                  {isSelected ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-500 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Compact bar
  return (
    <div className={`flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none ${className}`}>
      {CLASSES_CONFIG.map((c) => {
        const isSelected = selectedClassId === c.id;
        return (
          <button
            key={c.id}
            onClick={() => handleSelect(c.id)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
              isSelected
                ? 'bg-white/15 text-white border-white/30 shadow-md'
                : 'bg-black/30 text-gray-400 border-white/5 hover:bg-white/5 hover:text-gray-200'
            }`}
            style={{
              borderColor: isSelected ? c.colorHex : undefined,
              boxShadow: isSelected ? `0 0 12px ${c.colorHex}40` : undefined,
            }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: c.colorHex }}
            />
            <span>{c.name}</span>
          </button>
        );
      })}
    </div>
  );
};
