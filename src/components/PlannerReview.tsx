import React, { useState } from 'react';
import {
  Calendar,
  Star,
  QrCode,
  CheckCircle2,
  Clock,
  Plus,
  Heart,
  MessageSquare,
  Sparkles,
  ChevronRight,
  Send,
  X,
  Users
} from 'lucide-react';
import { ServiceReviewData, PrayerRequest } from '../types/hub';

interface PlannerReviewProps {
  reviewData: ServiceReviewData;
  updateReview: (review: Partial<ServiceReviewData>) => void;
  prayerRequests: PrayerRequest[];
  addPrayerRequest: (text: string, category: 'team' | 'kids' | 'service') => void;
}

export const PlannerReview: React.FC<PlannerReviewProps> = ({
  reviewData,
  updateReview,
  prayerRequests,
  addPrayerRequest,
}) => {
  const [selectedDay, setSelectedDay] = useState<number>(18);
  const [checkedInCount, setCheckedInCount] = useState<number>(14);
  const [showPrayerModal, setShowPrayerModal] = useState<boolean>(false);
  const [prayerText, setPrayerText] = useState<string>('');
  const [prayerCategory, setPrayerCategory] = useState<'team' | 'kids' | 'service'>('team');
  const [justCheckedIn, setJustCheckedIn] = useState<boolean>(false);

  const days = [
    { day: 16, name: 'Mon', theme: 'Unstoppable Faith' },
    { day: 17, name: 'Tue', theme: 'Courage & Power' },
    { day: 18, name: 'Wed', theme: 'Bigger Together' },
    { day: 19, name: 'Thu', theme: 'Light Up The World' },
    { day: 20, name: 'Fri', theme: 'Grand Celebration' },
  ];

  const schedule = [
    { time: '06:30 AM', title: 'Kids Church Service', location: 'Main Auditorium', active: true },
    { time: '11:00 AM', title: 'Workshops & Craft Masterclasses', location: 'Classrooms A & B', active: false },
    { time: '02:00 PM', title: 'Games & Outdoor Fun Fest', location: 'Courtyard Arena', active: false },
    { time: '05:00 PM', title: 'Evening Rally & Worship Session', location: 'Main Auditorium', active: false },
  ];

  const handleRatingChange = (key: keyof ServiceReviewData['ratings'], score: number) => {
    updateReview({
      ratings: {
        ...reviewData.ratings,
        [key]: score,
      },
    });
  };

  const handleManualCheckIn = () => {
    setCheckedInCount((prev) => prev + 1);
    setJustCheckedIn(true);
    setTimeout(() => setJustCheckedIn(false), 2000);
  };

  const handleCreatePrayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prayerText.trim()) return;
    addPrayerRequest(prayerText, prayerCategory);
    setPrayerText('');
    setShowPrayerModal(false);
  };

  const ratingCategories: { key: keyof ServiceReviewData['ratings']; label: string }[] = [
    { key: 'equipment', label: 'Equipment & Screens' },
    { key: 'timing', label: 'Timing & Flow' },
    { key: 'communication', label: 'Comms & Stage Pings' },
    { key: 'kidsEngagement', label: 'Kids Engagement' },
    { key: 'holySpiritFlow', label: 'Holy Spirit Flow' },
    { key: 'overall', label: 'Overall Service Impact' },
  ];

  return (
    <div className="space-y-6">
      {/* Module Title Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#161626] p-4 sm:p-5 rounded-2xl border border-white/5 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.3)]">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">5. DREAM WEEK PLANNER & 6. REVIEW</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-[10px] font-bold uppercase tracking-widest">
                CONFERENCE OPS
              </span>
            </div>
            <p className="text-xs text-gray-400">Plan the whole conference schedule, QR volunteer check-in & post-service review.</p>
          </div>
        </div>

        <button
          id="btn-add-prayer-top"
          onClick={() => setShowPrayerModal(true)}
          className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-[0_0_15px_rgba(147,51,234,0.4)] transition-all"
        >
          <Heart className="w-4 h-4 text-rose-300 fill-rose-300/30" />
          <span>+ Add Prayer Request</span>
        </button>
      </div>

      {/* Grid: Dream Week Planner on Left, Service Review on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column: 5. Dream Week Planner & QR Checkin (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Dream Week Days Calendar */}
          <div className="bg-[#161626] rounded-2xl border border-white/5 p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div>
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-[0.2em] block mb-0.5">SCHEDULE MATRIX</span>
                <h3 className="text-sm font-bold text-white">Dream Week Conference</h3>
              </div>
              <span className="text-xs font-mono font-bold text-purple-300 bg-black/40 px-2.5 py-1 rounded-lg border border-white/10">
                CRC Auditorium
              </span>
            </div>

            {/* Day Selector Pills */}
            <div className="grid grid-cols-5 gap-2">
              {days.map((item) => (
                <button
                  key={item.day}
                  onClick={() => setSelectedDay(item.day)}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    selectedDay === item.day
                      ? 'bg-purple-600 border-purple-400 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]'
                      : 'bg-white/5 border-white/5 text-gray-300 hover:border-white/20'
                  }`}
                >
                  <span className="text-base font-black block">{item.day}</span>
                  <span className="text-[10px] uppercase font-semibold text-purple-200 block">{item.name}</span>
                </button>
              ))}
            </div>

            {/* Selected Day Theme Banner */}
            <div className="bg-black/40 p-3.5 rounded-xl border border-purple-500/30 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider">Active Day Theme</span>
                <h4 className="text-sm font-bold text-white mt-0.5">
                  Day 3 - Wednesday: {days.find((d) => d.day === selectedDay)?.theme}
                </h4>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-lg bg-green-500/10 border border-green-500/30 text-green-300 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                In Session
              </span>
            </div>

            {/* Daily Schedule List */}
            <div className="space-y-2 pt-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Daily Schedule</span>
              {schedule.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
                    item.active
                      ? 'bg-purple-600/20 border-purple-500/50 text-white shadow-[0_0_15px_rgba(147,51,234,0.2)]'
                      : 'bg-white/5 border-white/5 text-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-purple-300 bg-black/40 px-2 py-1 rounded border border-white/10">
                      {item.time}
                    </span>
                    <div>
                      <h5 className="font-bold text-gray-100">{item.title}</h5>
                      <span className="text-[11px] text-gray-400">{item.location}</span>
                    </div>
                  </div>
                  {item.active && (
                    <span className="px-2 py-0.5 rounded bg-purple-600 text-[10px] font-black text-white shadow-[0_0_10px_rgba(147,51,234,0.5)]">
                      CURRENT
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Volunteer QR Check-In Widget */}
          <div className="bg-[#161626] rounded-2xl border border-white/5 p-5 shadow-xl flex flex-col sm:flex-row items-center gap-5">
            {/* High contrast SVG QR Code mockup */}
            <div className="p-3 bg-white rounded-2xl shadow-xl shrink-0 flex flex-col items-center">
              <svg className="w-28 h-28 text-slate-950" viewBox="0 0 100 100" fill="currentColor">
                <rect x="0" y="0" width="30" height="30" rx="4" />
                <rect x="6" y="6" width="18" height="18" fill="white" />
                <rect x="10" y="10" width="10" height="10" />
                
                <rect x="70" y="0" width="30" height="30" rx="4" />
                <rect x="76" y="6" width="18" height="18" fill="white" />
                <rect x="80" y="10" width="10" height="10" />

                <rect x="0" y="70" width="30" height="30" rx="4" />
                <rect x="6" y="76" width="18" height="18" fill="white" />
                <rect x="10" y="80" width="10" height="10" />

                <rect x="40" y="10" width="8" height="8" />
                <rect x="52" y="10" width="8" height="8" />
                <rect x="40" y="24" width="20" height="8" />
                <rect x="10" y="42" width="8" height="18" />
                <rect x="24" y="42" width="14" height="8" />
                <rect x="44" y="44" width="12" height="12" />
                <rect x="72" y="42" width="16" height="8" />
                <rect x="64" y="56" width="10" height="16" />
                <rect x="80" y="64" width="14" height="14" />
                <rect x="44" y="70" width="16" height="8" />
                <rect x="44" y="84" width="8" height="10" />
              </svg>
              <span className="text-[10px] font-extrabold text-slate-900 mt-1 uppercase tracking-tight">
                Kids Church Team
              </span>
            </div>

            <div className="space-y-3 flex-1 text-center sm:text-left">
              <div>
                <h4 className="text-sm font-bold text-white">Volunteer Check-In</h4>
                <p className="text-xs text-gray-400">
                  Scan badge QR code at entrance for automated attendance & security tag allocation.
                </p>
              </div>

              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <span className="text-xs font-bold text-green-400 bg-green-500/10 px-2.5 py-1 rounded-lg border border-green-500/30">
                  {checkedInCount} / 18 Volunteers Checked In
                </span>
              </div>

              <button
                id="btn-manual-checkin"
                onClick={handleManualCheckIn}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white/5 hover:bg-purple-600 hover:text-white border border-white/10 text-xs font-bold text-purple-300 transition-all active:scale-95 shadow-md"
              >
                {justCheckedIn ? '✓ Check-In Recorded!' : 'Manual Check-In +1'}
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: 6. After Service Review & Prayer Requests (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Service Review Star Ratings */}
          <div className="bg-[#161626] rounded-2xl border border-white/5 p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div>
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-[0.2em] block mb-0.5">FEEDBACK LOOP</span>
                <h3 className="text-sm font-bold text-white">6. Service Review</h3>
              </div>
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/30">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>4.8 / 5.0 Average</span>
              </span>
            </div>

            {/* 5-Star Ratings Grid */}
            <div className="space-y-2.5">
              {ratingCategories.map((cat) => {
                const currentScore = reviewData.ratings[cat.key] || 5;

                return (
                  <div key={cat.key} className="flex items-center justify-between text-xs py-1">
                    <span className="text-gray-300 font-medium">{cat.label}</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => handleRatingChange(cat.key, star)}
                          className="p-0.5 text-gray-600 hover:text-amber-400 transition-colors"
                        >
                          <Star
                            className={`w-4 h-4 ${
                              star <= currentScore
                                ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                                : 'text-gray-700'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* What Went Well Feedback Field */}
            <div className="pt-2 border-t border-white/5 space-y-1.5">
              <label className="block text-xs font-bold text-purple-400 uppercase">
                What went well?
              </label>
              <textarea
                value={reviewData.whatWentWell}
                onChange={(e) => updateReview({ whatWentWell: e.target.value })}
                rows={2}
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="Share wins, holy spirit moments, and kids engagement notes..."
              />
            </div>
          </div>

          {/* Prayer Requests Card */}
          <div className="bg-[#161626] rounded-2xl border border-white/5 p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div>
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-[0.2em] block mb-0.5">COMMUNITY INTERCESSION</span>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Heart className="w-4 h-4 text-rose-400 fill-rose-400/20" />
                  <span>Prayer Requests</span>
                </h3>
              </div>
              <button
                id="btn-add-prayer-inline"
                onClick={() => setShowPrayerModal(true)}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-bold text-purple-300 flex items-center gap-1 border border-white/10 transition-colors"
              >
                <Plus className="w-3 h-3" />
                <span>Add</span>
              </button>
            </div>

            <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
              {prayerRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">{req.author}</span>
                    <span className="text-[10px] text-gray-400 font-mono">{req.timestamp}</span>
                  </div>
                  <p className="text-xs text-gray-300">{req.text}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowPrayerModal(true)}
              className="w-full py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Request</span>
            </button>
          </div>

        </div>

      </div>

      {/* Add Prayer Request Modal */}
      {showPrayerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-[#161626] border border-white/10 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-400 fill-rose-400/20" />
                <span>Submit Prayer Request</span>
              </h3>
              <button onClick={() => setShowPrayerModal(false)} className="p-1.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePrayer} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-300 uppercase mb-1">
                  Prayer Focus / Need
                </label>
                <textarea
                  required
                  rows={3}
                  value={prayerText}
                  onChange={(e) => setPrayerText(e.target.value)}
                  placeholder="e.g. Wisdom for teaching staff, salvation for specific group children..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-300 uppercase mb-1">Category</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['team', 'kids', 'service'] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setPrayerCategory(cat)}
                      className={`py-2 rounded-xl font-bold uppercase transition-all ${
                        prayerCategory === cat
                          ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]'
                          : 'bg-white/5 text-gray-400 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPrayerModal(false)}
                  className="px-4 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-[0_0_15px_rgba(147,51,234,0.4)]"
                >
                  Submit Prayer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
