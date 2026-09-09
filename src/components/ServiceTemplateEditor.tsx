import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  Clock,
  CheckCircle2,
  Sparkles,
  Save,
  BookOpen,
  User,
  Music,
  Tv,
  Radio,
  Flame,
  FileSpreadsheet,
  RotateCcw,
  Check,
  AlertCircle,
  HelpCircle,
  ListOrdered,
  Tag
} from 'lucide-react';
import { 
  Role, 
  AuthUser, 
  ClassId,
  ServiceTemplate, 
  ServiceTemplateSegment 
} from '../types/hub';
import { CLASSES_CONFIG } from '../data/classHubsData';
import { AccessDeniedCard } from './AccessDeniedCard';

interface ServiceTemplateEditorProps {
  currentUser: AuthUser;
  templates: ServiceTemplate[];
  selectedClassId?: ClassId;
  onCreateTemplate: (template: Omit<ServiceTemplate, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateTemplate: (id: string, updates: Partial<ServiceTemplate>) => void;
  onDeleteTemplate: (id: string) => void;
  onResetTemplates: () => void;
  onApplyTemplateToLive: (templateId: string, targetClassId?: ClassId | 'all') => void;
  onOpenAuthModal: () => void;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  welcome: { bg: 'bg-blue-500/10', text: 'text-blue-300', border: 'border-blue-500/30' },
  worship: { bg: 'bg-purple-500/10', text: 'text-purple-300', border: 'border-purple-500/30' },
  scripture: { bg: 'bg-amber-500/10', text: 'text-amber-300', border: 'border-amber-500/30' },
  offering: { bg: 'bg-emerald-500/10', text: 'text-emerald-300', border: 'border-emerald-500/30' },
  lesson: { bg: 'bg-indigo-500/10', text: 'text-indigo-300', border: 'border-indigo-500/30' },
  game: { bg: 'bg-pink-500/10', text: 'text-pink-300', border: 'border-pink-500/30' },
  groups: { bg: 'bg-cyan-500/10', text: 'text-cyan-300', border: 'border-cyan-500/30' },
  ministry: { bg: 'bg-rose-500/10', text: 'text-rose-300', border: 'border-rose-500/30' },
  announcements: { bg: 'bg-orange-500/10', text: 'text-orange-300', border: 'border-orange-500/30' },
  dismissal: { bg: 'bg-gray-500/10', text: 'text-gray-300', border: 'border-gray-500/30' },
};

const AVAILABLE_SEGMENT_CATEGORIES = [
  'welcome',
  'worship',
  'scripture',
  'offering',
  'lesson',
  'game',
  'groups',
  'ministry',
  'announcements',
  'dismissal',
];

const ROLES_LIST = ['Admin', 'Tech & Worship', 'Presenter', 'Host', 'Small Groups', 'All'];

export const ServiceTemplateEditor: React.FC<ServiceTemplateEditorProps> = ({
  currentUser,
  templates,
  selectedClassId,
  onCreateTemplate,
  onUpdateTemplate,
  onDeleteTemplate,
  onResetTemplates,
  onApplyTemplateToLive,
  onOpenAuthModal,
}) => {
  const isDirector = currentUser?.role === 'director' || (currentUser?.role === 'admin' && currentUser?.assignedClassId === 'all') || Boolean(currentUser?.isOverallAdmin);
  const isClassAdmin = isDirector || Boolean(currentUser?.isClassAdmin) || currentUser?.role === 'admin' || (currentUser?.role as string) === 'class-admin';

  // If user is neither director nor class admin, show Role Access Gate
  if (!isDirector && !isClassAdmin) {
    return (
      <AccessDeniedCard
        requiredRole="Director or Class Admin"
        currentUser={currentUser || {
          id: 'usr-guest',
          email: 'guest@crc.church',
          name: 'Guest User',
          role: 'comms',
          roleTitle: 'Guest Member',
          avatarColor: 'from-gray-500 to-slate-600',
          isAuthenticated: false,
        }}
        onOpenAuthModal={onOpenAuthModal}
      />
    );
  }

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    templates[0]?.id || ''
  );
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [isConfirmApplyModalOpen, setIsConfirmApplyModalOpen] = useState(false);
  const [applyTargetClassId, setApplyTargetClassId] = useState<ClassId | 'all'>('all');
  const [successNotice, setSuccessNotice] = useState<string>('');

  // New Template Form State
  const [newTmplName, setNewTmplName] = useState('');
  const [newTmplDesc, setNewTmplDesc] = useState('');
  const [newTmplCategory, setNewTmplCategory] = useState<'sunday_regular' | 'conference' | 'family_service' | 'outreach' | 'custom'>('sunday_regular');
  const [newTmplDuration, setNewTmplDuration] = useState(75);
  const [newTmplClassId, setNewTmplClassId] = useState<ClassId | 'all'>('all');

  const activeTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0];

  const filteredTemplates = templates.filter((t) => {
    if (filterCategory === 'all') return true;
    return t.category === filterCategory;
  });

  const totalCalculatedMinutes = activeTemplate
    ? activeTemplate.segments.reduce((acc, seg) => acc + seg.defaultDurationMinutes, 0)
    : 0;

  const showToast = (msg: string) => {
    setSuccessNotice(msg);
    setTimeout(() => {
      setSuccessNotice('');
    }, 4000);
  };

  const handleCreateNewTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTmplName.trim()) return;

    const initialSegments: ServiceTemplateSegment[] = [
      {
        id: `ts_${Date.now()}_1`,
        order: 1,
        title: 'Welcome & Icebreaker',
        defaultDurationMinutes: 10,
        assignedRole: 'Admin',
        assignedLead: currentUser.name || 'Pastor Hope',
        category: 'welcome',
        notes: 'High energy music and welcome intro',
      },
      {
        id: `ts_${Date.now()}_2`,
        order: 2,
        title: 'Praise & Worship',
        defaultDurationMinutes: 20,
        assignedRole: 'Tech & Worship',
        assignedLead: 'Sarah',
        category: 'worship',
        notes: '2 action songs + 1 worship song',
      },
      {
        id: `ts_${Date.now()}_3`,
        order: 3,
        title: 'Main Lesson / Story',
        defaultDurationMinutes: 25,
        assignedRole: 'Presenter',
        assignedLead: 'Lebo',
        category: 'lesson',
        notes: 'Key Bible passage illustration and prop demo',
      },
      {
        id: `ts_${Date.now()}_4`,
        order: 4,
        title: 'Small Groups / Reflection',
        defaultDurationMinutes: 15,
        assignedRole: 'Small Groups',
        assignedLead: 'Group Leaders',
        category: 'groups',
        notes: 'Activity sheets & prayer circles',
      },
      {
        id: `ts_${Date.now()}_5`,
        order: 5,
        title: 'Closing & Parent Dismissal',
        defaultDurationMinutes: 5,
        assignedRole: 'Admin',
        assignedLead: currentUser.name || 'Pastor Hope',
        category: 'dismissal',
        notes: 'Dismissal check-in system',
      },
    ];

    onCreateTemplate({
      name: newTmplName,
      description: newTmplDesc || 'Custom Kids Church service outline template.',
      category: newTmplCategory,
      targetDurationMinutes: newTmplDuration,
      isDefault: false,
      createdBy: currentUser.name || 'Admin',
      targetClassId: newTmplClassId,
      segments: initialSegments,
    });

    setIsCreatingNew(false);
    setNewTmplName('');
    setNewTmplDesc('');
    setNewTmplClassId('all');
    showToast(`Template "${newTmplName}" created in Postgres table!`);
  };

  const handleDuplicateTemplate = (tmpl: ServiceTemplate) => {
    onCreateTemplate({
      name: `${tmpl.name} (Copy)`,
      description: tmpl.description,
      category: tmpl.category,
      targetDurationMinutes: tmpl.targetDurationMinutes,
      isDefault: false,
      createdBy: currentUser.name || 'Admin',
      segments: tmpl.segments.map((s, idx) => ({
        ...s,
        id: `ts_${Date.now()}_${idx}`,
      })),
    });
    showToast(`Duplicated "${tmpl.name}"`);
  };

  // Segment operations within current template
  const handleUpdateSegment = (segId: string, updates: Partial<ServiceTemplateSegment>) => {
    if (!activeTemplate) return;
    const updatedSegments = activeTemplate.segments.map((seg) =>
      seg.id === segId ? { ...seg, ...updates } : seg
    );
    onUpdateTemplate(activeTemplate.id, { segments: updatedSegments });
  };

  const handleAddSegment = () => {
    if (!activeTemplate) return;
    const newSeg: ServiceTemplateSegment = {
      id: `ts_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      order: activeTemplate.segments.length + 1,
      title: 'New Service Segment',
      defaultDurationMinutes: 10,
      assignedRole: 'Presenter',
      assignedLead: 'Team Member',
      category: 'lesson',
      notes: 'Custom notes and instructions for segment lead.',
    };
    const updatedSegments = [...activeTemplate.segments, newSeg];
    onUpdateTemplate(activeTemplate.id, { segments: updatedSegments });
    showToast('New segment added to template');
  };

  const handleDeleteSegment = (segId: string) => {
    if (!activeTemplate || activeTemplate.segments.length <= 1) return;
    const updatedSegments = activeTemplate.segments
      .filter((seg) => seg.id !== segId)
      .map((seg, idx) => ({ ...seg, order: idx + 1 }));
    onUpdateTemplate(activeTemplate.id, { segments: updatedSegments });
    showToast('Segment removed');
  };

  const handleMoveSegment = (index: number, direction: 'up' | 'down') => {
    if (!activeTemplate) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= activeTemplate.segments.length) return;

    const list = [...activeTemplate.segments];
    const item = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = item;

    const reordered = list.map((seg, idx) => ({ ...seg, order: idx + 1 }));
    onUpdateTemplate(activeTemplate.id, { segments: reordered });
  };

  const handleDuplicateSegment = (index: number) => {
    if (!activeTemplate) return;
    const segToCopy = activeTemplate.segments[index];
    const newSeg: ServiceTemplateSegment = {
      ...segToCopy,
      id: `ts_${Date.now()}_dup`,
      title: `${segToCopy.title} (Part 2)`,
    };
    const list = [...activeTemplate.segments];
    list.splice(index + 1, 0, newSeg);
    const reordered = list.map((seg, idx) => ({ ...seg, order: idx + 1 }));
    onUpdateTemplate(activeTemplate.id, { segments: reordered });
    showToast('Segment duplicated');
  };

  const handleOpenApplyModal = () => {
    if (!activeTemplate) return;
    const initialTarget = activeTemplate.targetClassId || 
      (selectedClassId && selectedClassId !== 'all' ? selectedClassId : 
      (currentUser.assignedClassId && currentUser.assignedClassId !== 'all' ? currentUser.assignedClassId : 'all'));
    setApplyTargetClassId(initialTarget);
    setIsConfirmApplyModalOpen(true);
  };

  const handleConfirmApplyLive = () => {
    if (!activeTemplate) return;
    onApplyTemplateToLive(activeTemplate.id, applyTargetClassId);
    setIsConfirmApplyModalOpen(false);
    const targetName = applyTargetClassId === 'all' 
      ? 'ALL 5 Classroom Hubs' 
      : (CLASSES_CONFIG.find(c => c.id === applyTargetClassId)?.name || applyTargetClassId.toUpperCase());
    showToast(`🚀 Live Service created & applied to ${targetName}!`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Notification */}
      {successNotice && (
        <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-xs font-bold text-emerald-300 flex items-center justify-between shadow-[0_0_20px_rgba(16,185,129,0.25)] animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{successNotice}</span>
          </div>
          <span className="text-[10px] font-mono uppercase bg-emerald-500/30 px-2 py-0.5 rounded">Synced to Hub</span>
        </div>
      )}

      {/* Main Header & Actions Bar */}
      <div className="bg-[#161626] border border-white/10 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              POSTGRES `service_templates` TABLE
            </span>
            <span className="text-[10px] font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
              ADMIN ONLY
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-purple-400" />
            <span>Service Template Editor</span>
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Define, customize, and apply standardized multi-segment service schedules across the production system.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center flex-wrap gap-2.5 w-full md:w-auto">
          <button
            onClick={onResetTemplates}
            title="Reset default CRC templates"
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsCreatingNew(true)}
            className="py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(147,51,234,0.4)] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Template</span>
          </button>

          {activeTemplate && (
            <button
              onClick={handleOpenApplyModal}
              className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all"
            >
              <Sparkles className="w-4 h-4 animate-spin text-amber-300" />
              <span>Apply to Live Service</span>
            </button>
          )}
        </div>
      </div>

      {/* CREATE NEW TEMPLATE MODAL */}
      {isCreatingNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#161626] border border-white/15 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-purple-400" />
                <span>Create Service Template</span>
              </h3>
              <button
                onClick={() => setIsCreatingNew(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNewTemplate} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-1">
                  Template Name
                </label>
                <input
                  type="text"
                  value={newTmplName}
                  onChange={(e) => setNewTmplName(e.target.value)}
                  placeholder="e.g. Super Sunday Praise Rally (75 min)"
                  required
                  className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-1">
                  Description / Service Concept
                </label>
                <textarea
                  value={newTmplDesc}
                  onChange={(e) => setNewTmplDesc(e.target.value)}
                  rows={3}
                  placeholder="Brief summary of service objectives, audience, and key elements..."
                  className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={newTmplCategory}
                    onChange={(e) => setNewTmplCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="sunday_regular">Sunday Regular</option>
                    <option value="conference">Conference Session</option>
                    <option value="family_service">Family Combined</option>
                    <option value="outreach">Outreach & Rally</option>
                    <option value="custom">Custom Format</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-1">
                    Target Duration (Mins)
                  </label>
                  <input
                    type="number"
                    min={15}
                    max={180}
                    value={newTmplDuration}
                    onChange={(e) => setNewTmplDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-1">
                  Target Classroom Hub
                </label>
                <select
                  value={newTmplClassId}
                  onChange={(e) => setNewTmplClassId(e.target.value as any)}
                  className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 font-semibold"
                >
                  <option value="all">🌟 All Classes (Global Multi-Room Template)</option>
                  <option value="jy">🔵 Junior Youth (Ages 13-14) - Blue Class</option>
                  <option value="tb">🌸 Truth Builders (Ages 10-12) - Pink Class</option>
                  <option value="kb">🔴 Kingdom Builders (Ages 7-9) - Red Class</option>
                  <option value="la-orange">🟠 Little Arrows Orange (Ages 4-6)</option>
                  <option value="la-yellow">🟡 Little Arrows Yellow (Ages 2-3)</option>
                </select>
              </div>

              <div className="flex gap-2 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-[0_0_15px_rgba(147,51,234,0.4)] transition-all"
                >
                  Save to Postgres Table
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* APPLY TEMPLATE TO LIVE SERVICE MODAL */}
      {isConfirmApplyModalOpen && activeTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#161626] border border-white/15 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Apply Template to Classroom Hub</span>
              </h3>
              <button
                onClick={() => setIsConfirmApplyModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">{activeTemplate.name}</span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                  {totalCalculatedMinutes} Mins • {activeTemplate.segments.length} Segments
                </span>
              </div>
              <p className="text-[11px] text-gray-400">{activeTemplate.description}</p>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-gray-200 uppercase tracking-wider">
                Select Target Classroom Hub *
              </label>
              <select
                value={applyTargetClassId}
                onChange={(e) => setApplyTargetClassId(e.target.value as any)}
                className="w-full px-4 py-3 bg-black/60 border border-purple-500/40 rounded-xl text-sm text-white focus:outline-none focus:border-purple-400 font-bold shadow-inner"
              >
                <option value="all">🌟 All 5 Classes (Simultaneous Multi-Room Launch)</option>
                <option value="jy">🔵 Junior Youth (Ages 13-14) - Blue Class</option>
                <option value="tb">🌸 Truth Builders (Ages 10-12) - Pink Class</option>
                <option value="kb">🔴 Kingdom Builders (Ages 7-9) - Red Class</option>
                <option value="la-orange">🟠 Little Arrows Orange (Ages 4-6)</option>
                <option value="la-yellow">🟡 Little Arrows Yellow (Ages 2-3)</option>
              </select>
              <p className="text-[11px] text-gray-400">
                The service timeline and all {activeTemplate.segments.length} segments will be immediately initialized for the selected class hub.
              </p>
            </div>

            <div className="flex gap-2 pt-3 border-t border-white/5">
              <button
                type="button"
                onClick={() => setIsConfirmApplyModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmApplyLive}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Launch Service</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Template Selector Left / Segment Customizer Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Template Repository List (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {['all', 'conference', 'sunday_regular', 'family_service'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1 rounded-lg font-bold capitalize whitespace-nowrap transition-all text-[11px] ${
                  filterCategory === cat
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-[#161626] border border-white/5 text-gray-400 hover:text-white'
                }`}
              >
                {cat.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Templates Cards List */}
          <div className="space-y-3">
            {filteredTemplates.map((tmpl) => {
              const isSelected = tmpl.id === selectedTemplateId;
              const totalMins = tmpl.segments.reduce((a, b) => a + b.defaultDurationMinutes, 0);

              return (
                <div
                  key={tmpl.id}
                  onClick={() => setSelectedTemplateId(tmpl.id)}
                  className={`p-4 rounded-2xl border text-left cursor-pointer transition-all relative overflow-hidden group ${
                    isSelected
                      ? 'bg-[#1a1a32] border-purple-500 shadow-[0_0_25px_rgba(147,51,234,0.25)]'
                      : 'bg-[#161626] border-white/5 hover:border-purple-500/30 hover:bg-white/5'
                  }`}
                >
                  {/* Selected Indicator bar */}
                  {isSelected && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500"></div>
                  )}

                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-1">
                          {tmpl.name}
                        </h4>
                        {tmpl.isDefault && (
                          <span className="text-[9px] font-black uppercase bg-purple-500/20 text-purple-300 border border-purple-500/40 px-1.5 py-0.2 rounded">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">
                        {tmpl.description}
                      </p>
                    </div>
                  </div>

                  {/* Metadata Tags */}
                  <div className="flex items-center justify-between text-[10px] text-gray-400 mt-3 pt-2.5 border-t border-white/5 font-mono">
                    <span className="flex items-center gap-1 text-purple-300">
                      <Clock className="w-3 h-3" />
                      {totalMins} min ({tmpl.segments.length} segments)
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDuplicateTemplate(tmpl);
                        }}
                        title="Duplicate template"
                        className="p-1 text-gray-400 hover:text-white rounded hover:bg-white/10"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      {templates.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Delete template "${tmpl.name}"?`)) {
                              onDeleteTemplate(tmpl.id);
                              if (selectedTemplateId === tmpl.id) {
                                setSelectedTemplateId(templates.find((t) => t.id !== tmpl.id)?.id || '');
                              }
                            }
                          }}
                          title="Delete template"
                          className="p-1 text-gray-400 hover:text-red-400 rounded hover:bg-white/10"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Active Template Segment Builder (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {activeTemplate ? (
            <div className="bg-[#161626] border border-white/10 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6">
              
              {/* Template Header & Target Duration Summary */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-white/5">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      TEMPLATE TITLE:
                    </span>
                  </div>
                  <input
                    type="text"
                    value={activeTemplate.name}
                    onChange={(e) => onUpdateTemplate(activeTemplate.id, { name: e.target.value })}
                    className="text-lg font-bold text-white bg-transparent border-b border-transparent hover:border-white/20 focus:border-purple-500 focus:outline-none w-full py-0.5 transition-colors"
                  />
                  <input
                    type="text"
                    value={activeTemplate.description}
                    onChange={(e) => onUpdateTemplate(activeTemplate.id, { description: e.target.value })}
                    placeholder="Add brief template description..."
                    className="text-xs text-gray-400 bg-transparent border-b border-transparent hover:border-white/20 focus:border-purple-500 focus:outline-none w-full py-0.5"
                  />
                </div>

                {/* Duration Tracker Pill */}
                <div className="flex items-center gap-3 bg-black/40 p-3 rounded-2xl border border-white/5 shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-gray-400 uppercase block">Total Duration</span>
                    <span className="text-base font-mono font-bold text-emerald-400">
                      {totalCalculatedMinutes} mins
                    </span>
                  </div>
                  <div className="h-8 w-px bg-white/10"></div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase block">Segments</span>
                    <span className="text-base font-mono font-bold text-purple-300">
                      {activeTemplate.segments.length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Visual Breakdown Duration Timeline Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-gray-400">
                  <span className="font-bold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-purple-400" />
                    <span>Segment Proportion Map</span>
                  </span>
                  <span className="font-mono text-[10px] text-gray-500">100% of planned time</span>
                </div>

                <div className="w-full h-3.5 bg-black/40 rounded-full overflow-hidden flex border border-white/10 p-0.5 gap-0.5">
                  {activeTemplate.segments.map((seg, idx) => {
                    const pct = totalCalculatedMinutes > 0 ? (seg.defaultDurationMinutes / totalCalculatedMinutes) * 100 : 10;
                    const catStyle = CATEGORY_COLORS[seg.category || 'lesson'] || CATEGORY_COLORS.lesson;
                    return (
                      <div
                        key={seg.id}
                        style={{ width: `${pct}%` }}
                        title={`${seg.title}: ${seg.defaultDurationMinutes} mins`}
                        className={`h-full rounded-sm transition-all hover:brightness-125 cursor-pointer ${
                          seg.category === 'welcome' ? 'bg-blue-500' :
                          seg.category === 'worship' ? 'bg-purple-500' :
                          seg.category === 'scripture' ? 'bg-amber-500' :
                          seg.category === 'offering' ? 'bg-emerald-500' :
                          seg.category === 'lesson' ? 'bg-indigo-500' :
                          seg.category === 'game' ? 'bg-pink-500' :
                          seg.category === 'groups' ? 'bg-cyan-500' : 'bg-rose-500'
                        }`}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Segments List Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase text-gray-300 tracking-wider flex items-center gap-1.5">
                    <ListOrdered className="w-4 h-4 text-purple-400" />
                    <span>Service Flow Segments ({activeTemplate.segments.length})</span>
                  </h3>

                  <button
                    onClick={handleAddSegment}
                    className="py-1.5 px-3 rounded-xl bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 text-[11px] font-bold flex items-center gap-1 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Segment</span>
                  </button>
                </div>

                {/* Draggable/Reorderable Segment Cards */}
                <div className="space-y-2.5">
                  {activeTemplate.segments.map((seg, index) => {
                    const catStyle = CATEGORY_COLORS[seg.category || 'lesson'] || CATEGORY_COLORS.lesson;

                    return (
                      <div
                        key={seg.id}
                        className="bg-black/30 border border-white/5 hover:border-white/15 rounded-2xl p-3.5 sm:p-4 space-y-3 transition-all"
                      >
                        {/* Segment Main Row */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          
                          {/* Order Number & Title */}
                          <div className="flex items-center gap-2.5 flex-1">
                            <span className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 text-[11px] font-mono font-bold text-gray-400 flex items-center justify-center shrink-0">
                              {seg.order || index + 1}
                            </span>

                            <input
                              type="text"
                              value={seg.title}
                              onChange={(e) => handleUpdateSegment(seg.id, { title: e.target.value })}
                              className="text-xs font-bold text-white bg-transparent border-b border-transparent hover:border-white/20 focus:border-purple-500 focus:outline-none flex-1 py-1 transition-colors"
                              placeholder="Segment Title"
                            />
                          </div>

                          {/* Duration & Category Select */}
                          <div className="flex items-center gap-2 shrink-0">
                            {/* Duration Stepper */}
                            <div className="flex items-center gap-1 bg-black/40 px-2 py-1 rounded-xl border border-white/10 text-xs">
                              <Clock className="w-3.5 h-3.5 text-gray-400" />
                              <input
                                type="number"
                                min={1}
                                max={120}
                                value={seg.defaultDurationMinutes}
                                onChange={(e) =>
                                  handleUpdateSegment(seg.id, { defaultDurationMinutes: Number(e.target.value) || 5 })
                                }
                                className="w-10 bg-transparent text-center font-mono font-bold text-purple-300 focus:outline-none text-xs"
                              />
                              <span className="text-[10px] text-gray-500">m</span>
                            </div>

                            {/* Category Dropdown */}
                            <select
                              value={seg.category || 'lesson'}
                              onChange={(e) => handleUpdateSegment(seg.id, { category: e.target.value })}
                              className={`text-[10px] font-extrabold uppercase px-2 py-1 rounded-xl border focus:outline-none bg-black/50 ${catStyle.text} ${catStyle.border}`}
                            >
                              {AVAILABLE_SEGMENT_CATEGORIES.map((cat) => (
                                <option key={cat} value={cat} className="bg-[#161626] text-white">
                                  {cat}
                                </option>
                              ))}
                            </select>

                            {/* Reorder Up/Down & Action Buttons */}
                            <div className="flex items-center gap-1 border-l border-white/10 pl-2">
                              <button
                                onClick={() => handleMoveSegment(index, 'up')}
                                disabled={index === 0}
                                title="Move up"
                                className="p-1 text-gray-400 hover:text-white disabled:opacity-20 rounded hover:bg-white/5"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleMoveSegment(index, 'down')}
                                disabled={index === activeTemplate.segments.length - 1}
                                title="Move down"
                                className="p-1 text-gray-400 hover:text-white disabled:opacity-20 rounded hover:bg-white/5"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDuplicateSegment(index)}
                                title="Duplicate segment"
                                className="p-1 text-gray-400 hover:text-white rounded hover:bg-white/5"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              {activeTemplate.segments.length > 1 && (
                                <button
                                  onClick={() => handleDeleteSegment(seg.id)}
                                  title="Delete segment"
                                  className="p-1 text-gray-400 hover:text-red-400 rounded hover:bg-white/5"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Segment Role & Lead Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-white/5 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-gray-500 font-bold uppercase w-16">Role:</span>
                            <select
                              value={seg.assignedRole || 'Presenter'}
                              onChange={(e) => handleUpdateSegment(seg.id, { assignedRole: e.target.value })}
                              className="bg-black/30 border border-white/5 rounded-lg px-2 py-1 text-[11px] text-gray-300 focus:outline-none flex-1"
                            >
                              {ROLES_LIST.map((r) => (
                                <option key={r} value={r} className="bg-[#161626] text-white">
                                  {r}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-gray-500 font-bold uppercase w-16">Lead:</span>
                            <input
                              type="text"
                              value={seg.assignedLead || ''}
                              onChange={(e) => handleUpdateSegment(seg.id, { assignedLead: e.target.value })}
                              placeholder="e.g. Lebo / Pastor Hope"
                              className="bg-black/30 border border-white/5 rounded-lg px-2 py-1 text-[11px] text-gray-300 focus:outline-none flex-1"
                            />
                          </div>
                        </div>

                        {/* Notes / Scripture details */}
                        <div className="pt-1">
                          <input
                            type="text"
                            value={seg.notes || ''}
                            onChange={(e) => handleUpdateSegment(seg.id, { notes: e.target.value })}
                            placeholder="Segment cue instructions, visual props, key scriptures..."
                            className="w-full bg-black/20 border border-white/5 rounded-lg px-2.5 py-1 text-[11px] text-gray-400 focus:outline-none focus:text-white"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Bottom Add Segment CTA */}
                <button
                  onClick={handleAddSegment}
                  className="w-full py-3 rounded-2xl border border-dashed border-white/15 hover:border-purple-500/50 bg-black/20 hover:bg-purple-600/10 text-gray-400 hover:text-purple-300 text-xs font-bold flex items-center justify-center gap-2 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Another Service Segment</span>
                </button>
              </div>

              {/* Bottom Apply Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-white/5 text-xs">
                <div className="text-gray-400 flex items-center gap-2">
                  <Save className="w-4 h-4 text-purple-400" />
                  <span>Changes auto-persisted to `service_templates` Postgres table</span>
                </div>

                <button
                  onClick={handleOpenApplyModal}
                  className="w-full sm:w-auto py-2.5 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Deploy Template to Active Sunday Service</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-[#161626] border border-white/10 rounded-3xl p-12 text-center text-gray-400">
              <Layers className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p>No template selected. Create a new template to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
