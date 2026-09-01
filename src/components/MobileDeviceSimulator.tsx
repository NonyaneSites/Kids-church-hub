import React, { useState } from 'react';
import { 
  Smartphone, 
  X, 
  Radio, 
  Tv, 
  Mic, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  Users, 
  Flame,
  Volume2
} from 'lucide-react';
import { ServiceSegment, Role } from '../types/hub';

interface MobileDeviceSimulatorProps {
  isOpen: boolean;
  onClose: () => void;
  currentSegment: ServiceSegment;
  nextSegment: ServiceSegment | null;
  localTimer: {
    remainingSeconds: number;
    formattedTime: string;
    isOvertime: boolean;
    overtimeSeconds: number;
    progressPercentage: number;
    targetEndTimeFormatted: string;
  };
  onSwitchRole: (role: Role) => void;
  onOpenHolySpiritModal: () => void;
}

export const MobileDeviceSimulator: React.FC<MobileDeviceSimulatorProps> = ({
  isOpen,
  onClose,
  currentSegment,
  nextSegment,
  localTimer,
  onSwitchRole,
  onOpenHolySpiritModal,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-6xl bg-[#161626] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-[0_0_15px_rgba(147,51,234,0.3)]">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-[0.2em] block mb-0.5">MULTI-DEVICE HUD</span>
              <h2 className="text-lg font-bold text-white tracking-tight">ROLES & MOBILE DASHBOARD PREVIEW</h2>
              <p className="text-xs text-gray-400">Different real-time responsive views tailored for each serving team member</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 Mobile Phones Side-by-Side Container */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* PHONE 1: Nomsa - Comms Dashboard */}
          <div className="mx-auto w-full max-w-[300px] rounded-[38px] p-3.5 bg-[#0b0b12] border-4 border-white/10 shadow-2xl flex flex-col justify-between aspect-[9/18.5] relative overflow-hidden">
            {/* Phone Speaker Notch */}
            <div className="w-24 h-4 bg-black rounded-full mx-auto mb-2 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-white/10"></div>
            </div>

            <div className="space-y-3">
              {/* User Header */}
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-green-500/20 text-green-300 font-bold text-xs flex items-center justify-center border border-green-500/40">
                  N
                </div>
                <div>
                  <p className="text-[11px] text-gray-400">Good morning,</p>
                  <h4 className="text-xs font-bold text-white">Nomsa</h4>
                </div>
              </div>

              <div className="text-[11px]">
                <span className="text-gray-400">You are serving in</span>
                <p className="font-extrabold text-green-400 uppercase tracking-tight">COMMUNICATIONS</p>
              </div>

              {/* Status Pill */}
              <button
                onClick={() => {
                  onSwitchRole('comms');
                  onClose();
                }}
                className="w-full py-2 rounded-xl bg-green-500/10 border border-green-500/40 text-green-300 text-xs font-bold flex items-center justify-center gap-1.5 shadow-[0_0_10px_rgba(34,197,94,0.2)]"
              >
                <span className="w-2 h-2 rounded-full bg-green-400 animate-ping"></span>
                <span>Live Service Mode</span>
              </button>

              {/* Next Up Card */}
              <div className="bg-[#161626] p-3 rounded-2xl border border-white/5 space-y-1">
                <span className="text-[10px] text-gray-400 uppercase font-bold">Next Up</span>
                <h5 className="text-xs font-bold text-white flex items-center justify-between">
                  <span>{currentSegment.title}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-purple-400" />
                </h5>
                <p className="text-[11px] text-gray-300">
                  {currentSegment.assignedLead} • <span className="text-green-400 font-mono">Live</span>
                </p>
              </div>

              {/* Service Progress Card */}
              <div className="bg-[#161626] p-3 rounded-2xl border border-white/5 space-y-1">
                <span className="text-[10px] text-gray-400 uppercase font-bold">Service Progress</span>
                <p className="text-xs font-bold text-white">3 of 8 completed</p>
                <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden mt-1 border border-white/5">
                  <div className="w-[37%] h-full bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                </div>
              </div>
            </div>

            {/* Bottom Nav Bar */}
            <div className="pt-2 border-t border-white/5 flex items-center justify-around text-[9px] text-gray-400">
              <span className="text-green-400 font-bold">Home</span>
              <span>Timeline</span>
              <span>Messages</span>
              <span>More</span>
            </div>
          </div>

          {/* PHONE 2: Thabo - Tech & Systems Dashboard */}
          <div className="mx-auto w-full max-w-[300px] rounded-[38px] p-3.5 bg-[#0b0b12] border-4 border-white/10 shadow-2xl flex flex-col justify-between aspect-[9/18.5] relative overflow-hidden">
            {/* Phone Speaker Notch */}
            <div className="w-24 h-4 bg-black rounded-full mx-auto mb-2 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-white/10"></div>
            </div>

            <div className="space-y-3">
              {/* User Header */}
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-300 font-bold text-xs flex items-center justify-center border border-blue-500/40">
                  T
                </div>
                <div>
                  <p className="text-[11px] text-gray-400">Good morning,</p>
                  <h4 className="text-xs font-bold text-white">Thabo</h4>
                </div>
              </div>

              <div className="text-[11px]">
                <span className="text-gray-400">You are serving in</span>
                <p className="font-extrabold text-blue-400 uppercase tracking-tight">TECH & SYSTEMS</p>
              </div>

              {/* Status Pill */}
              <button
                onClick={() => {
                  onSwitchRole('tech');
                  onClose();
                }}
                className="w-full py-2 rounded-xl bg-blue-500/10 border border-blue-500/40 text-blue-300 text-xs font-bold flex items-center justify-center gap-1.5 shadow-[0_0_10px_rgba(59,130,246,0.2)]"
              >
                <Tv className="w-3.5 h-3.5" />
                <span>Tech Console</span>
              </button>

              {/* Next Cue Card */}
              <div className="bg-[#161626] p-3 rounded-2xl border border-white/5 space-y-1">
                <span className="text-[10px] text-gray-400 uppercase font-bold">Next Cue</span>
                <h5 className="text-xs font-bold text-white flex items-center justify-between">
                  <span>Worship - Song 2</span>
                  <ChevronRight className="w-3.5 h-3.5 text-blue-400" />
                </h5>
                <p className="text-[11px] text-gray-300">
                  Way Maker <span className="text-blue-400 font-mono">Playing</span>
                </p>
              </div>

              {/* System Status Card */}
              <div className="bg-[#161626] p-3 rounded-2xl border border-white/5 space-y-1">
                <span className="text-[10px] text-gray-400 uppercase font-bold">System Status</span>
                <p className="text-xs font-bold text-green-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>All Systems Operational</span>
                </p>
              </div>
            </div>

            {/* Bottom Nav Bar */}
            <div className="pt-2 border-t border-white/5 flex items-center justify-around text-[9px] text-gray-400">
              <span className="text-blue-400 font-bold">Home</span>
              <span>Media</span>
              <span>Cues</span>
              <span>More</span>
            </div>
          </div>

          {/* PHONE 3: Lebo - Presenter Dashboard */}
          <div className="mx-auto w-full max-w-[300px] rounded-[38px] p-3.5 bg-[#0b0b12] border-4 border-white/10 shadow-2xl flex flex-col justify-between aspect-[9/18.5] relative overflow-hidden">
            {/* Phone Speaker Notch */}
            <div className="w-24 h-4 bg-black rounded-full mx-auto mb-2 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-white/10"></div>
            </div>

            <div className="space-y-3">
              {/* User Header */}
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-300 font-bold text-xs flex items-center justify-center border border-amber-500/40">
                  L
                </div>
                <div>
                  <p className="text-[11px] text-gray-400">Good morning,</p>
                  <h4 className="text-xs font-bold text-white">Lebo</h4>
                </div>
              </div>

              <div className="text-[11px]">
                <span className="text-gray-400">You are presenting</span>
                <p className="font-extrabold text-amber-400 uppercase tracking-tight">LESSON & VERSE</p>
              </div>

              {/* Status Pill */}
              <button
                onClick={() => {
                  onSwitchRole('presenter');
                  onClose();
                }}
                className="w-full py-2 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 shadow-[0_0_10px_rgba(245,158,11,0.2)]"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>My Countdown</span>
              </button>

              {/* Countdown Preview Card */}
              <div className="bg-[#161626] p-3 rounded-2xl border border-white/5 text-center space-y-0.5">
                <span className="text-[10px] text-gray-400 uppercase font-bold">You're in</span>
                <h5 className="text-2xl font-black font-timer text-amber-300 drop-shadow-[0_0_10px_rgba(245,158,11,0.4)]">
                  {localTimer.formattedTime}
                </h5>
                <p className="text-[11px] text-gray-400">{currentSegment.title}</p>
              </div>

              {/* Service Progress Card */}
              <div className="bg-[#161626] p-3 rounded-2xl border border-white/5 space-y-1">
                <span className="text-[10px] text-gray-400 uppercase font-bold">Service Progress</span>
                <p className="text-xs font-bold text-white">3 of 8 completed</p>
              </div>
            </div>

            {/* Bottom Nav Bar */}
            <div className="pt-2 border-t border-white/5 flex items-center justify-around text-[9px] text-gray-400">
              <span className="text-amber-400 font-bold">Home</span>
              <span>Scripture</span>
              <span>Cues</span>
              <span>More</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
