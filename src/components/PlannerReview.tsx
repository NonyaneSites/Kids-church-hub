import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  Star,
  CheckCircle2,
  Clock,
  Plus,
  Heart,
  MessageSquare,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Send,
  X,
  Trash2,
  Check,
  Tag,
  Users,
  RotateCcw,
  AlertCircle
} from 'lucide-react';
import { ServiceReviewData, PrayerRequest, CalendarEvent, ClassId } from '../types/hub';

interface PlannerReviewProps {
  reviewData: ServiceReviewData;
  updateReview: (review: Partial<ServiceReviewData>) => void;
  resetReview?: () => void;
  prayerRequests: PrayerRequest[];
  addPrayerRequest: (text: string, category: 'team' | 'kids' | 'service' | 'general', author?: string) => void;
  togglePrayerAnswered?: (id: string) => void;
  deletePrayerRequest?: (id: string) => void;
  calendarEvents?: CalendarEvent[];
  addCalendarEvent?: (event: Omit<CalendarEvent, 'id'>) => void;
  deleteCalendarEvent?: (id: string) => void;
  isClassAdmin?: boolean;
  activeClassId?: ClassId;
}

export const PlannerReview: React.FC<PlannerReviewProps> = ({
  reviewData,
  updateReview,
  resetReview,
  prayerRequests,
  addPrayerRequest,
  togglePrayerAnswered,
  deletePrayerRequest,
  calendarEvents = [],
  addCalendarEvent,
  deleteCalendarEvent,
  isClassAdmin = true,
  activeClassId = 'kb',
}) => {
  // Calendar View State
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [showAddEventModal, setShowAddEventModal] = useState(false);

  // New Event Form State
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState(selectedDateStr);
  const [newEventTime, setNewEventTime] = useState('09:00 AM');
  const [newEventType, setNewEventType] = useState<'service' | 'rehearsal' | 'meeting' | 'special'>('service');
  const [newEventClassId, setNewEventClassId] = useState<ClassId | 'all'>('all');
  const [newEventTheme, setNewEventTheme] = useState('');
  const [newEventLead, setNewEventLead] = useState('');
  const [newEventNotes, setNewEventNotes] = useState('');

  // Prayer State
  const [showPrayerModal, setShowPrayerModal] = useState(false);
  const [prayerText, setPrayerText] = useState('');
  const [prayerAuthor, setPrayerAuthor] = useState('');
  const [prayerCategory, setPrayerCategory] = useState<'team' | 'kids' | 'service' | 'general'>('team');
  const [prayerFilter, setPrayerFilter] = useState<'all' | 'team' | 'kids' | 'service' | 'answered'>('all');

  // Check-In Widget State
  const [checkedInCount, setCheckedInCount] = useState<number>(0);
  const [justCheckedIn, setJustCheckedIn] = useState<boolean>(false);

  // Dynamic Rating Averaging Calculation
  const { calculatedAverage, ratedCount } = useMemo(() => {
    const ratings = reviewData.ratings || {};
    const keys: (keyof ServiceReviewData['ratings'])[] = [
      'equipment',
      'timing',
      'communication',
      'kidsEngagement',
      'holySpiritFlow',
      'overall',
    ];
    const nonZeroScores = keys
      .map((k) => ratings[k])
      .filter((score): score is number => typeof score === 'number' && score > 0);

    if (nonZeroScores.length === 0) {
      return { calculatedAverage: '0.0', ratedCount: 0 };
    }
    const sum = nonZeroScores.reduce((acc, val) => acc + val, 0);
    const avg = (sum / nonZeroScores.length).toFixed(1);
    return { calculatedAverage: avg, ratedCount: nonZeroScores.length };
  }, [reviewData.ratings]);

  const handleRatingChange = (key: keyof ServiceReviewData['ratings'], score: number) => {
    const current = reviewData.ratings?.[key] || 0;
    // Click same star again to clear
    const newScore = current === score ? 0 : score;
    updateReview({
      ratings: {
        ...reviewData.ratings,
        [key]: newScore,
      },
    });
  };

  // Calendar Math
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sunday

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleDaySelect = (dayNum: number) => {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(dayNum).padStart(2, '0');
    const dateStr = `${year}-${mm}-${dd}`;
    setSelectedDateStr(dateStr);
    setNewEventDate(dateStr);
  };

  // Filter events for selected date
  const eventsForSelectedDay = useMemo(() => {
    return calendarEvents.filter((evt) => {
      const matchesDate = evt.date === selectedDateStr;
      const matchesClass = evt.classId === 'all' || evt.classId === activeClassId;
      return matchesDate && matchesClass;
    });
  }, [calendarEvents, selectedDateStr, activeClassId]);

  // Set of dates with events in current month
  const datesWithEvents = useMemo(() => {
    const set = new Set<string>();
    calendarEvents.forEach((evt) => {
      set.add(evt.date);
    });
    return set;
  }, [calendarEvents]);

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim() || !addCalendarEvent) return;

    addCalendarEvent({
      title: newEventTitle.trim(),
      date: newEventDate,
      time: newEventTime.trim() || '09:00 AM',
      type: newEventType,
      classId: newEventClassId,
      theme: newEventTheme.trim() || undefined,
      leadLeader: newEventLead.trim() || undefined,
      notes: newEventNotes.trim() || undefined,
    });

    setNewEventTitle('');
    setNewEventTheme('');
    setNewEventLead('');
    setNewEventNotes('');
    setShowAddEventModal(false);
  };

  // Prayer Submission
  const handleCreatePrayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prayerText.trim()) return;
    addPrayerRequest(prayerText.trim(), prayerCategory, prayerAuthor.trim() || undefined);
    setPrayerText('');
    setPrayerAuthor('');
    setShowPrayerModal(false);
  };

  // Filtered prayers
  const filteredPrayers = useMemo(() => {
    if (prayerFilter === 'answered') {
      return prayerRequests.filter((p) => p.isAnswered);
    }
    if (prayerFilter !== 'all') {
      return prayerRequests.filter((p) => p.category === prayerFilter);
    }
    return prayerRequests;
  }, [prayerRequests, prayerFilter]);

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
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#161626] p-4 sm:p-5 rounded-2xl border border-white/5 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">SERVICE PLANNER & REVIEW</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-[10px] font-bold uppercase tracking-widest">
                CLASS ADMIN CONTROLLED
              </span>
            </div>
            <p className="text-xs text-gray-400">
              Interactive calendar scheduling, live-averaged service evaluation, and saved intercessory prayers.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isClassAdmin && addCalendarEvent && (
            <button
              id="btn-add-event-top"
              onClick={() => {
                setNewEventDate(selectedDateStr);
                setShowAddEventModal(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-[0_0_15px_rgba(99,102,241,0.4)] transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>+ Create Service Event</span>
            </button>
          )}

          <button
            id="btn-add-prayer-top"
            onClick={() => setShowPrayerModal(true)}
            className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all"
          >
            <Heart className="w-4 h-4 text-rose-300 fill-rose-300/30" />
            <span>+ Add Prayer Request</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Working Interactive Calendar on Left, Service Review & Prayers on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column: Interactive Calendar & Schedule (6 cols) */}
        <div className="lg:col-span-6 space-y-6">

          {/* Monthly Interactive Calendar */}
          <div className="bg-[#161626] rounded-2xl border border-white/5 p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div>
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-[0.2em] block mb-0.5">
                  SERVICE CALENDAR
                </span>
                <h3 className="text-sm font-bold text-white">
                  {monthNames[month]} {year}
                </h3>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={prevMonth}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                  title="Previous Month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={nextMonth}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                  title="Next Month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Days of week */}
            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-gray-400">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div key={d} className="py-1">{d}</div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Empty leading days */}
              {Array.from({ length: firstDayIndex }).map((_, idx) => (
                <div key={`empty-${idx}`} className="h-10 rounded-lg opacity-20 bg-black/20" />
              ))}

              {/* Days of Month */}
              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const dayNum = idx + 1;
                const mm = String(month + 1).padStart(2, '0');
                const dd = String(dayNum).padStart(2, '0');
                const dateKey = `${year}-${mm}-${dd}`;
                const isSelected = selectedDateStr === dateKey;
                const hasEvents = datesWithEvents.has(dateKey);
                const isToday = new Date().toISOString().split('T')[0] === dateKey;

                return (
                  <button
                    key={dayNum}
                    onClick={() => handleDaySelect(dayNum)}
                    className={`h-11 rounded-xl flex flex-col items-center justify-center relative transition-all text-xs font-semibold ${
                      isSelected
                        ? 'bg-purple-600 text-white font-bold shadow-[0_0_15px_rgba(168,85,247,0.5)] border border-purple-400'
                        : isToday
                        ? 'bg-purple-950/40 text-purple-200 border border-purple-500/40'
                        : 'bg-white/5 hover:bg-white/10 text-gray-300 border border-white/5'
                    }`}
                  >
                    <span>{dayNum}</span>
                    {hasEvents && (
                      <span className={`w-1.5 h-1.5 rounded-full mt-0.5 ${isSelected ? 'bg-white' : 'bg-purple-400'}`} />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Selected Date Header */}
            <div className="bg-black/40 p-3 rounded-xl border border-white/5 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider">
                  Selected Date
                </span>
                <div className="text-white font-bold">
                  {new Date(selectedDateStr + 'T00:00:00').toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </div>
              </div>
              {isClassAdmin && addCalendarEvent && (
                <button
                  onClick={() => {
                    setNewEventDate(selectedDateStr);
                    setShowAddEventModal(true);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white border border-purple-500/40 font-bold text-[11px] flex items-center gap-1 transition-all"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Event</span>
                </button>
              )}
            </div>

            {/* Events for Selected Date */}
            <div className="space-y-2 pt-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                Scheduled Services & Activities ({eventsForSelectedDay.length})
              </span>

              {eventsForSelectedDay.length === 0 ? (
                <div className="p-4 rounded-xl bg-white/5 border border-dashed border-white/10 text-center text-xs text-gray-400 space-y-2">
                  <CalendarIcon className="w-6 h-6 mx-auto text-gray-500 opacity-60" />
                  <p>No services or events scheduled for this day.</p>
                  {isClassAdmin && addCalendarEvent && (
                    <button
                      onClick={() => {
                        setNewEventDate(selectedDateStr);
                        setShowAddEventModal(true);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px] transition-all"
                    >
                      + Schedule a Service
                    </button>
                  )}
                </div>
              ) : (
                eventsForSelectedDay.map((evt) => (
                  <div
                    key={evt.id}
                    className="p-3 rounded-xl border border-white/5 bg-white/5 hover:border-purple-500/30 transition-all flex items-start justify-between text-xs gap-3"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-purple-300 bg-black/40 px-2 py-0.5 rounded border border-white/10 text-[11px]">
                          {evt.time}
                        </span>
                        <h5 className="font-bold text-white text-sm">{evt.title}</h5>
                        <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                          {evt.type}
                        </span>
                      </div>
                      {evt.theme && (
                        <p className="text-[11px] text-purple-300 font-medium">Theme: {evt.theme}</p>
                      )}
                      {evt.notes && <p className="text-gray-400 text-[11px]">{evt.notes}</p>}
                      {evt.leadLeader && (
                        <span className="text-[10px] text-gray-400 block">Lead: {evt.leadLeader}</span>
                      )}
                    </div>

                    {isClassAdmin && deleteCalendarEvent && (
                      <button
                        onClick={() => deleteCalendarEvent(evt.id)}
                        className="p-1.5 text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                        title="Delete Event"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Volunteer QR Check-In Widget */}
          <div className="bg-[#161626] rounded-2xl border border-white/5 p-5 shadow-xl flex flex-col sm:flex-row items-center gap-5">
            <div className="p-3 bg-white rounded-2xl shadow-xl shrink-0 flex flex-col items-center">
              <svg className="w-24 h-24 text-slate-950" viewBox="0 0 100 100" fill="currentColor">
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
                Team Check-In
              </span>
            </div>

            <div className="space-y-3 flex-1 text-center sm:text-left">
              <div>
                <h4 className="text-sm font-bold text-white">Volunteer & Leader Attendance</h4>
                <p className="text-xs text-gray-400">
                  Scan badge QR code at entrance for automated attendance & security tag allocation.
                </p>
              </div>

              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <span className="text-xs font-bold text-purple-300 bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/30">
                  {checkedInCount} Volunteers Checked In Today
                </span>
              </div>

              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <button
                  id="btn-manual-checkin"
                  onClick={() => {
                    setCheckedInCount((prev) => prev + 1);
                    setJustCheckedIn(true);
                    setTimeout(() => setJustCheckedIn(false), 2000);
                  }}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-purple-600 hover:text-white border border-white/10 text-xs font-bold text-purple-300 transition-all active:scale-95 shadow-md"
                >
                  {justCheckedIn ? '✓ Check-In Recorded!' : 'Manual Check-In +1'}
                </button>
                {checkedInCount > 0 && (
                  <button
                    onClick={() => setCheckedInCount(0)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-gray-400 hover:text-rose-300 border border-white/10 transition-colors"
                    title="Reset Attendance"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Service Review & Saved Prayer Requests (6 cols) */}
        <div className="lg:col-span-6 space-y-6">

          {/* Service Review with Dynamic Average Calculation */}
          <div className="bg-[#161626] rounded-2xl border border-white/5 p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div>
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-[0.2em] block mb-0.5">
                  SERVICE EVALUATION
                </span>
                <h3 className="text-sm font-bold text-white">Post-Service Review</h3>
              </div>

              {/* Dynamic Average Rating Badge */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/30">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{calculatedAverage} / 5.0 Average</span>
                  <span className="text-[10px] text-gray-400 font-normal">({ratedCount}/6 rated)</span>
                </span>

                {resetReview && (
                  <button
                    onClick={resetReview}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-gray-400 hover:text-rose-300 transition-colors"
                    title="Clear Review for New Week"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* 5-Star Ratings Grid */}
            <div className="space-y-2.5">
              {ratingCategories.map((cat) => {
                const currentScore = reviewData.ratings?.[cat.key] || 0;

                return (
                  <div key={cat.key} className="flex items-center justify-between text-xs py-1 border-b border-white/5 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-300 font-medium">{cat.label}</span>
                      {currentScore > 0 && (
                        <span className="text-[10px] font-bold text-amber-400 font-mono">
                          ({currentScore}/5)
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => handleRatingChange(cat.key, star)}
                          className="p-1 text-gray-600 hover:text-amber-400 transition-colors"
                          title={`Rate ${star} Stars`}
                        >
                          <Star
                            className={`w-4 h-4 transition-all ${
                              star <= currentScore
                                ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]'
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
                value={reviewData.whatWentWell || ''}
                onChange={(e) => updateReview({ whatWentWell: e.target.value })}
                rows={2}
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="Share wins, holy spirit moments, and kids engagement notes..."
              />
            </div>

            {/* Improvement Notes */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-purple-400 uppercase">
                Improvement Notes / Follow-ups
              </label>
              <textarea
                value={reviewData.notes || ''}
                onChange={(e) => updateReview({ notes: e.target.value })}
                rows={2}
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="Equipment issues to fix, lesson pacing adjustments, follow-up items..."
              />
            </div>
          </div>

          {/* Saved Prayer Requests (Permanent Persistence Across Mondays) */}
          <div className="bg-[#161626] rounded-2xl border border-white/5 p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div>
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-[0.2em] block mb-0.5">
                  COMMUNITY INTERCESSION (PERMANENT)
                </span>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Heart className="w-4 h-4 text-rose-400 fill-rose-400/20" />
                  <span>Saved Prayer Requests</span>
                </h3>
              </div>

              <button
                id="btn-add-prayer-inline"
                onClick={() => setShowPrayerModal(true)}
                className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-[11px] font-bold text-white flex items-center gap-1 transition-colors shadow-sm"
              >
                <Plus className="w-3 h-3" />
                <span>Add Request</span>
              </button>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-1.5 text-[10px] font-bold">
              {(['all', 'team', 'kids', 'service', 'answered'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setPrayerFilter(filter)}
                  className={`px-2.5 py-1 rounded-lg uppercase transition-all ${
                    prayerFilter === filter
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  {filter === 'answered' ? 'Praise Reports (Answered)' : filter}
                </button>
              ))}
            </div>

            {/* Prayer List */}
            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {filteredPrayers.length === 0 ? (
                <div className="p-4 rounded-xl bg-white/5 border border-dashed border-white/10 text-center text-xs text-gray-400 space-y-1.5">
                  <Heart className="w-5 h-5 mx-auto text-gray-500 opacity-60" />
                  <p>No prayer requests found for this filter.</p>
                  <p className="text-[11px] text-gray-500">Prayer requests persist permanently across sessions.</p>
                </div>
              ) : (
                filteredPrayers.map((req) => (
                  <div
                    key={req.id}
                    className={`p-3 rounded-xl border transition-all space-y-1.5 ${
                      req.isAnswered
                        ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                        : 'bg-white/5 border-white/5 text-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{req.author}</span>
                        <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-white/10 font-mono font-bold text-purple-300">
                          {req.category}
                        </span>
                        {req.isAnswered && (
                          <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                            ✓ Praise Report
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-gray-400 font-mono">{req.timestamp}</span>
                    </div>

                    <p className="text-xs text-gray-200 leading-relaxed">{req.text}</p>

                    <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[11px]">
                      {togglePrayerAnswered && (
                        <button
                          onClick={() => togglePrayerAnswered(req.id)}
                          className={`flex items-center gap-1 font-semibold transition-colors ${
                            req.isAnswered ? 'text-emerald-400 hover:text-emerald-300' : 'text-purple-300 hover:text-purple-200'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{req.isAnswered ? 'Answered / Praise Report' : 'Mark as Answered'}</span>
                        </button>
                      )}

                      {deletePrayerRequest && (
                        <button
                          onClick={() => deletePrayerRequest(req.id)}
                          className="p-1 text-gray-500 hover:text-rose-400 transition-colors"
                          title="Delete Request"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Add Calendar Event Modal (Admin Driven) */}
      {showAddEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-[#161626] border border-white/10 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-purple-400" />
                <span>Create Service / Event (Class Admin)</span>
              </h3>
              <button
                onClick={() => setShowAddEventModal(false)}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-300 uppercase mb-1">Event Title *</label>
                <input
                  required
                  type="text"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  placeholder="e.g. Kingdom Builders Sunday Service, Leader Huddle"
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-300 uppercase mb-1">Date *</label>
                  <input
                    required
                    type="date"
                    value={newEventDate}
                    onChange={(e) => setNewEventDate(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-300 uppercase mb-1">Time Range</label>
                  <input
                    type="text"
                    value={newEventTime}
                    onChange={(e) => setNewEventTime(e.target.value)}
                    placeholder="e.g. 09:00 AM - 10:30 AM"
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-300 uppercase mb-1">Event Type</label>
                  <select
                    value={newEventType}
                    onChange={(e) => setNewEventType(e.target.value as any)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="service">Sunday Service</option>
                    <option value="rehearsal">Tech / Band Rehearsal</option>
                    <option value="meeting">Leaders Huddle</option>
                    <option value="special">Special Conference / Event</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-300 uppercase mb-1">Target Class Hub</label>
                  <select
                    value={newEventClassId}
                    onChange={(e) => setNewEventClassId(e.target.value as any)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="all">All Classes (Global)</option>
                    <option value="kb">Kingdom Builders (Ages 7-9)</option>
                    <option value="tb">Truth Builders (Ages 10-12)</option>
                    <option value="jy">Junior Youth (Ages 13-14)</option>
                    <option value="la-orange">Little Arrows Orange (Ages 4-6)</option>
                    <option value="la-yellow">Little Arrows Yellow (Ages 2-3)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-300 uppercase mb-1">Theme (Optional)</label>
                  <input
                    type="text"
                    value={newEventTheme}
                    onChange={(e) => setNewEventTheme(e.target.value)}
                    placeholder="e.g. Unstoppable Faith"
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-300 uppercase mb-1">Lead Leader (Optional)</label>
                  <input
                    type="text"
                    value={newEventLead}
                    onChange={(e) => setNewEventLead(e.target.value)}
                    placeholder="e.g. Pastor Hope / Sister Lebo"
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-300 uppercase mb-1">Notes / Instructions</label>
                <textarea
                  rows={2}
                  value={newEventNotes}
                  onChange={(e) => setNewEventNotes(e.target.value)}
                  placeholder="Additional notes for volunteers and tech crew..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddEventModal(false)}
                  className="px-4 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                >
                  Save Service Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Prayer Request Modal (Permanently Persisted) */}
      {showPrayerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-[#161626] border border-white/10 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-400 fill-rose-400/20" />
                <span>Submit Saved Prayer Request</span>
              </h3>
              <button
                onClick={() => setShowPrayerModal(false)}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePrayer} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-300 uppercase mb-1">Author Name</label>
                <input
                  type="text"
                  value={prayerAuthor}
                  onChange={(e) => setPrayerAuthor(e.target.value)}
                  placeholder="e.g. Teacher Sarah / Class Admin"
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-300 uppercase mb-1">
                  Prayer Request / Focus *
                </label>
                <textarea
                  required
                  rows={3}
                  value={prayerText}
                  onChange={(e) => setPrayerText(e.target.value)}
                  placeholder="e.g. Wisdom for teaching staff, salvation for specific group children, healing for..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-300 uppercase mb-1">Category</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['team', 'kids', 'service', 'general'] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setPrayerCategory(cat)}
                      className={`py-2 rounded-xl font-bold uppercase transition-all text-[11px] ${
                        prayerCategory === cat
                          ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]'
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
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                >
                  Save Prayer Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
