import React, { useState } from 'react';
import { Role, QuickMessageType, ServiceTemplate } from './types/hub';
import { useServiceSync } from './hooks/useServiceSync';
import { Navbar } from './components/Navbar';
import { CommsDashboard } from './components/CommsDashboard';
import { TechConsole } from './components/TechConsole';
import { PresenterMode } from './components/PresenterMode';
import { HolySpiritModal } from './components/HolySpiritModal';
import { TeamResources } from './components/TeamResources';
import { PlannerReview } from './components/PlannerReview';
import { MobileDeviceSimulator } from './components/MobileDeviceSimulator';
import { AuthModal } from './components/AuthModal';
import { IncidentRealtimeToast } from './components/IncidentRealtimeToast';
import { ServiceTemplateEditor } from './components/ServiceTemplateEditor';
import { 
  ShieldAlert, 
  Sparkles, 
  Radio, 
  Tv, 
  Clock, 
  Flame, 
  CheckCircle2, 
  X,
  Volume2
} from 'lucide-react';

export default function App() {
  const [activeRole, setActiveRole] = useState<Role>('comms');
  const [activeTab, setActiveTab] = useState<string>('comms');
  const [isHolySpiritModalOpen, setIsHolySpiritModalOpen] = useState<boolean>(false);
  const [isMobileSimulatorOpen, setIsMobileSimulatorOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  const {
    authUser,
    loginUser,
    switchAuthUser,
    logoutUser,
    serviceTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    resetTemplatesToDefault,
    applyTemplateToLiveService,
    activeIncidentAlert,
    dismissIncidentAlert,
    serviceState,
    segments,
    checklist,
    worshipQueue,
    activeCues,
    incidents,
    teamMembers,
    lessonNotes,
    reviewData,
    prayerRequests,
    notifications,
    currentSegment,
    nextSegment,
    localTimer,
    sendStageCue,
    dismissCue,
    holySpiritOverride,
    triggerEmergency,
    clearEmergency,
    setSlideIndex,
    toggleChecklistItem,
    markAllChecksDone,
    setWorshipSong,
    startSegment,
    completeSegment,
    addIncident,
    resolveIncident,
    sendNotification,
    addPrayerRequest,
    updateReview,
  } = useServiceSync(activeRole);

  const handleRoleChange = (newRole: Role) => {
    setActiveRole(newRole);
    if (newRole === 'comms') setActiveTab('comms');
    else if (newRole === 'tech') setActiveTab('tech');
    else if (newRole === 'presenter') setActiveTab('presenter');
    else if (newRole === 'admin') setActiveTab('templates');
  };

  const handleApplyTemplate = (template: ServiceTemplate) => {
    applyTemplateToLiveService(template);
    setActiveTab('comms');
  };

  return (
    <div className="min-h-screen bg-[#0b0b12] text-slate-100 flex flex-col selection:bg-purple-600 selection:text-white">
      {/* Real-Time Supabase Incident Notification Toast */}
      <IncidentRealtimeToast
        incident={activeIncidentAlert}
        onDismiss={dismissIncidentAlert}
        onResolve={resolveIncident}
      />

      {/* Top Main Navigation Bar */}
      <Navbar
        activeRole={activeRole}
        setActiveRole={handleRoleChange}
        onOpenHolySpiritModal={() => setIsHolySpiritModalOpen(true)}
        onOpenMobileSimulator={() => setIsMobileSimulatorOpen(true)}
        onToggleEmergency={() => {
          if (serviceState.isEmergencyActive) {
            clearEmergency();
          } else {
            triggerEmergency('blank_screen', 'Emergency Screen Blanking Activated');
          }
        }}
        isEmergencyActive={serviceState.isEmergencyActive}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentSegment={currentSegment}
        currentUser={authUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Emergency Active Warning Banner */}
      {serviceState.isEmergencyActive && (
        <div className="bg-red-600/95 border-b border-red-400 px-4 py-2.5 flex items-center justify-between text-white shadow-xl animate-pulse">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-extrabold max-w-4xl mx-auto w-full">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <span>
              EMERGENCY OVERRIDE ENGAGED: {serviceState.activeEmergencyType?.replace('_', ' ').toUpperCase()}
            </span>
          </div>
          <button
            onClick={clearEmergency}
            className="px-3 py-1 bg-black/40 hover:bg-black/60 rounded-lg text-xs font-bold transition-colors"
          >
            Clear Override
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'comms' && (
          <CommsDashboard
            segments={segments}
            currentSegment={currentSegment}
            nextSegment={nextSegment}
            localTimer={localTimer}
            sendStageCue={sendStageCue}
            sendNotification={sendNotification}
            notifications={notifications}
            startSegment={startSegment}
            completeSegment={completeSegment}
            onOpenHolySpiritModal={() => setIsHolySpiritModalOpen(true)}
            onSwitchToPresenter={() => setActiveTab('presenter')}
          />
        )}

        {activeTab === 'tech' && (
          <TechConsole
            checklist={checklist}
            toggleChecklistItem={toggleChecklistItem}
            markAllChecksDone={markAllChecksDone}
            worshipQueue={worshipQueue}
            setWorshipSong={setWorshipSong}
            currentSlideIndex={serviceState.currentSlideIndex}
            totalSlides={serviceState.totalSlides}
            setSlideIndex={setSlideIndex}
            triggerEmergency={triggerEmergency}
            clearEmergency={clearEmergency}
            isEmergencyActive={serviceState.isEmergencyActive}
            activeEmergencyType={serviceState.activeEmergencyType}
            lessonNotes={lessonNotes}
            onOpenHolySpiritModal={() => setIsHolySpiritModalOpen(true)}
            onSendStageCue={sendStageCue}
            incidents={incidents}
            onAddIncident={addIncident}
            onResolveIncident={resolveIncident}
          />
        )}

        {activeTab === 'presenter' && (
          <PresenterMode
            currentSegment={currentSegment}
            nextSegment={nextSegment}
            localTimer={localTimer}
            activeCues={activeCues}
            dismissCue={dismissCue}
            lessonNotes={lessonNotes}
            onOpenHolySpiritModal={() => setIsHolySpiritModalOpen(true)}
          />
        )}

        {activeTab === 'team' && (
          <TeamResources
            teamMembers={teamMembers}
            lessonNotes={lessonNotes}
            incidents={incidents}
            onAddIncident={addIncident}
            onResolveIncident={resolveIncident}
          />
        )}

        {activeTab === 'planner' && (
          <PlannerReview
            reviewData={reviewData}
            updateReview={updateReview}
            prayerRequests={prayerRequests}
            addPrayerRequest={addPrayerRequest}
          />
        )}

        {activeTab === 'templates' && (
          <ServiceTemplateEditor
            currentUser={authUser}
            templates={serviceTemplates}
            onCreateTemplate={createTemplate}
            onUpdateTemplate={updateTemplate}
            onDeleteTemplate={deleteTemplate}
            onResetTemplates={resetTemplatesToDefault}
            onApplyTemplateToLive={(tmplId: string) => {
              applyTemplateToLiveService(tmplId);
              setActiveTab('comms');
            }}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
          />
        )}
      </main>

      {/* Global Modals */}
      <HolySpiritModal
        isOpen={isHolySpiritModalOpen}
        onClose={() => setIsHolySpiritModalOpen(false)}
        currentSegment={currentSegment}
        onApplyOverride={holySpiritOverride}
        targetEndTimeFormatted={localTimer.targetEndTimeFormatted}
      />

      <MobileDeviceSimulator
        isOpen={isMobileSimulatorOpen}
        onClose={() => setIsMobileSimulatorOpen(false)}
        currentSegment={currentSegment}
        nextSegment={nextSegment}
        localTimer={localTimer}
        onSwitchRole={handleRoleChange}
        onOpenHolySpiritModal={() => setIsHolySpiritModalOpen(true)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={authUser}
        onLogin={loginUser}
        onSwitchUser={switchAuthUser}
        onLogout={logoutUser}
      />

      {/* Footer Status Bar */}
      <footer className="h-11 bg-black/60 px-4 sm:px-6 border-t border-white/5 flex flex-wrap items-center justify-between text-[11px] text-gray-400">
        <div className="flex items-center gap-4 py-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-[10px] font-bold tracking-widest uppercase opacity-80 text-white">Live Service Sync Active</span>
          </div>
          <span className="hidden sm:inline text-white/20">|</span>
          <div className="hidden sm:flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            <span className="text-[10px] font-mono uppercase opacity-60">Main Stage Mic: Hot</span>
          </div>
          <span className="hidden md:inline text-white/20">|</span>
          <div className="hidden md:flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span className="text-[10px] font-mono uppercase opacity-60">Battery: Lapel A (78%)</span>
          </div>
        </div>

        <div className="flex items-center gap-4 py-1 font-mono text-[10px]">
          <span className="text-purple-400/80">LATENCY: 12ms</span>
          <span className="hidden sm:inline text-white/20">|</span>
          <span className="text-gray-400">ZERO-STREAMING MESH</span>
          <span className="hidden sm:inline text-white/20">|</span>
          <span className="text-emerald-400/80">BROADCAST NODE #1</span>
        </div>
      </footer>
    </div>
  );
}
