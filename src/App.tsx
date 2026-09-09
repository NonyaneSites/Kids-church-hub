import React, { useState, useEffect } from 'react';
import { Role, QuickMessageType, ServiceTemplate, ClassId } from './types/hub';
import { useServiceSync } from './hooks/useServiceSync';
import { Navbar } from './components/Navbar';
import { AllClassesOverview } from './components/AllClassesOverview';
import { CommsDashboard } from './components/CommsDashboard';
import { TechConsole } from './components/TechConsole';
import { PresenterMode } from './components/PresenterMode';
import { HolySpiritModal } from './components/HolySpiritModal';
import { TeamResources } from './components/TeamResources';
import { PlannerReview } from './components/PlannerReview';
import { MobileDeviceSimulator } from './components/MobileDeviceSimulator';
import { AuthModal } from './components/AuthModal';
import { SignInGate } from './components/SignInGate';
import { IncidentRealtimeToast } from './components/IncidentRealtimeToast';
import { ServiceTemplateEditor } from './components/ServiceTemplateEditor';
import { DirectorAnnouncementPopup, DirectorComposeModal } from './components/DirectorAnnouncementPopup';
import { 
  ShieldAlert, 
  Sparkles, 
  Radio, 
  Tv, 
  Clock, 
  Flame, 
  CheckCircle2, 
  X,
  Volume2,
  Globe,
  Megaphone,
  Smartphone
} from 'lucide-react';

export default function App() {
  const [activeRole, setActiveRole] = useState<Role>('comms');
  const [activeTab, setActiveTab] = useState<string>('comms');
  const [isHolySpiritModalOpen, setIsHolySpiritModalOpen] = useState<boolean>(false);
  const [isMobileSimulatorOpen, setIsMobileSimulatorOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalInitialTab, setAuthModalInitialTab] = useState<'quick_switch' | 'login' | 'register' | 'manage' | 'permissions'>('quick_switch');
  const [isDirectorComposeOpen, setIsDirectorComposeOpen] = useState<boolean>(false);

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
    acknowledgeCopyCue,
    holySpiritOverride,
    triggerEmergency,
    clearEmergency,
    setSlideIndex,
    toggleChecklistItem,
    markAllChecksDone,
    addChecklistItem,
    deleteChecklistItem,
    addSegment,
    deleteSegment,
    calendarEvents,
    addCalendarEvent,
    deleteCalendarEvent,
    quickStagePresets,
    addQuickStagePreset,
    deleteQuickStagePreset,
    commsEmergencyAlerts,
    sendCommsEmergency,
    acknowledgeCommsEmergency,
    setWorshipSong,
    startSegment,
    completeSegment,
    addIncident,
    resolveIncident,
    sendNotification,
    addPrayerRequest,
    togglePrayerAnswered,
    deletePrayerRequest,
    updateReview,
    resetReview,
    resetWeeklyServiceState,
    selectedClassId,
    switchClassHub,
    activeClassInfo,
    allClassesConfig,
    allClassHubs,
    registeredAccounts,
    isSyncingAccounts,
    accountsSyncError,
    accountsSyncDiagnostics,
    accountsFetchAttempted,
    addNewAccount,
    deleteUserAccount,
    clearAllDefaultAccounts,
    resetDefaultAccounts,
    syncAccountsWithCloud,
    promoteToClassAdmin,
    revokeClassAdmin,
    removeTeamMember,
    activeDirectorAnnouncement,
    sendDirectorAnnouncement,
    dismissDirectorAnnouncement,
    broadcastCueToAllClasses,
    sendCueToClass,
  } = useServiceSync(activeRole);

  const isDirector = authUser?.role === 'director' || (authUser?.role === 'admin' && authUser?.assignedClassId === 'all');
  const isClassAdmin = Boolean(authUser?.isClassAdmin) || (authUser?.role === 'admin') || (authUser?.role as string) === 'class-admin' || isDirector;
  const isTechOnly = authUser?.role === 'tech';
  const isPresenterOnly = authUser?.role === 'presenter';
  const isCommsOnly = authUser?.role === 'comms';

  // Strict role and class isolation enforcement
  useEffect(() => {
    if (!authUser || !authUser.isAuthenticated) return;

    if (isTechOnly && activeTab !== 'tech') {
      setActiveTab('tech');
    } else if (isPresenterOnly && activeTab !== 'presenter') {
      setActiveTab('presenter');
    } else if (isCommsOnly && activeTab !== 'comms') {
      setActiveTab('comms');
    } else if (!isDirector && (activeTab === 'all-classes' || activeTab === 'templates')) {
      setActiveTab('comms');
    }

    // Force non-directors to their assigned class hub
    if (!isDirector && authUser.assignedClassId && authUser.assignedClassId !== 'all' && selectedClassId !== authUser.assignedClassId) {
      switchClassHub(authUser.assignedClassId);
    }
  }, [authUser, isTechOnly, isPresenterOnly, isCommsOnly, isDirector, activeTab, selectedClassId, switchClassHub]);

  const handleRoleChange = (newRole: Role) => {
    setActiveRole(newRole);
    if (newRole === 'comms') setActiveTab('comms');
    else if (newRole === 'tech') setActiveTab('tech');
    else if (newRole === 'presenter') setActiveTab('presenter');
    else if (newRole === 'admin') setActiveTab('templates');
  };

  const handleOpenAuthModal = (tab?: 'quick_switch' | 'login' | 'register' | 'manage' | 'permissions') => {
    setAuthModalInitialTab(tab || 'quick_switch');
    setIsAuthModalOpen(true);
  };

  // Sign In Gate: Require authentication before accessing the application
  if (!authUser || !authUser.isAuthenticated) {
    return (
      <SignInGate
        onSignIn={(user) => {
          switchAuthUser(user);
          setActiveRole(user.role);
          if (user.role === 'tech') setActiveTab('tech');
          else if (user.role === 'presenter') setActiveTab('presenter');
          else if (user.role === 'comms') setActiveTab('comms');
          else if (user.role === 'director' || user.assignedClassId === 'all') setActiveTab('all-classes');
          else setActiveTab('comms');
        }}
        registeredAccounts={registeredAccounts}
        onAddNewAccount={addNewAccount}
        isSyncing={isSyncingAccounts}
        syncError={accountsSyncError}
        syncDiagnostics={accountsSyncDiagnostics}
        onRefreshAccounts={syncAccountsWithCloud}
        fetchAttempted={accountsFetchAttempted}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0b12] text-slate-100 flex flex-col selection:bg-purple-600 selection:text-white">
      {/* Real-Time Supabase Incident Notification Toast */}
      <IncidentRealtimeToast
        incident={activeIncidentAlert}
        onDismiss={dismissIncidentAlert}
        onResolve={resolveIncident}
      />

      {/* Top Main Navigation Bar with Interactive Class Switcher */}
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
        onOpenAuthModal={handleOpenAuthModal}
        onLogout={logoutUser}
        selectedClassId={selectedClassId}
        onSelectClass={switchClassHub}
        allClasses={allClassesConfig}
        onOpenDirectorAnnouncement={() => setIsDirectorComposeOpen(true)}
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

      {/* Active Class Ribbon (when on an individual class hub) */}
      {selectedClassId !== 'all' && activeTab !== 'all-classes' && activeClassInfo && (
        <div className="bg-[#121222] border-b border-white/5 px-4 py-2">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2.5">
              <span className={`w-3 h-3 rounded-full ${
                selectedClassId === 'jy' ? 'bg-blue-400' :
                selectedClassId === 'tb' ? 'bg-pink-400' :
                selectedClassId === 'kb' ? 'bg-red-400' :
                selectedClassId === 'la-orange' ? 'bg-orange-400' : 'bg-yellow-400'
              }`}></span>
              <span className="font-extrabold text-white text-sm">
                {activeClassInfo.name} Hub
              </span>
              <span className="text-gray-400">({activeClassInfo.colorName} Class • {activeClassInfo.grade})</span>
            </div>

            <div className="flex items-center gap-3 text-gray-400 text-[11px]">
              <span>Lead: <strong className="text-white">{activeClassInfo.defaultLead}</strong></span>
              <span>•</span>
              <span>Capacity: <strong className="text-white">{activeClassInfo.capacity} kids</strong></span>
              {isDirector && (
                <button
                  onClick={() => {
                    switchClassHub('all');
                    setActiveTab('all-classes');
                  }}
                  className="text-purple-400 hover:text-purple-300 font-bold underline ml-1"
                >
                  Switch to All Classes View &rarr;
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* TAB 0: Master All-Classes Command Center (DIRECTORS ONLY) */}
        {isDirector && activeTab === 'all-classes' && (
          <AllClassesOverview
            allClassHubs={allClassHubs}
            hubsData={allClassHubs}
            classes={allClassesConfig}
            selectedClassId={selectedClassId}
            onSelectClass={(classId: ClassId) => {
              switchClassHub(classId);
            }}
            onOpenClassTab={(classId: ClassId, tab: 'comms' | 'tech' | 'presenter') => {
              switchClassHub(classId);
              setActiveTab(tab);
            }}
            onBroadcastGlobalCue={broadcastCueToAllClasses}
            onBroadcastAll={broadcastCueToAllClasses}
            onSendClassCue={sendCueToClass}
            onSendCueToClass={sendCueToClass}
            currentUser={authUser}
            onOpenAuthModal={() => handleOpenAuthModal('register')}
            onOpenDirectorAnnouncement={() => setIsDirectorComposeOpen(true)}
          />
        )}

        {/* TAB 1: Comms Dashboard for Selected Class Hub */}
        {(isCommsOnly || isDirector || (!isTechOnly && !isPresenterOnly)) && activeTab === 'comms' && (
          <CommsDashboard
            segments={segments}
            currentSegment={currentSegment}
            nextSegment={nextSegment}
            localTimer={localTimer}
            sendStageCue={sendStageCue}
            sendCommsEmergency={sendCommsEmergency}
            quickPresets={quickStagePresets}
            addQuickPreset={addQuickStagePreset}
            deleteQuickPreset={deleteQuickStagePreset}
            addSegment={addSegment}
            deleteSegment={deleteSegment}
            sendNotification={sendNotification}
            notifications={notifications}
            startSegment={startSegment}
            completeSegment={completeSegment}
            onOpenHolySpiritModal={() => setIsHolySpiritModalOpen(true)}
            onSwitchToPresenter={() => setActiveTab('presenter')}
            isClassAdmin={isClassAdmin}
            activeCues={activeCues}
            dismissCue={dismissCue}
            onCopyCue={acknowledgeCopyCue}
            currentUserId={authUser?.id}
          />
        )}

        {/* TAB 2: Tech Console for Selected Class Hub (Tech Leads ONLY see this!) */}
        {(isTechOnly || isDirector || (!isPresenterOnly && !isCommsOnly)) && activeTab === 'tech' && (
          <TechConsole
            checklist={checklist}
            toggleChecklistItem={toggleChecklistItem}
            markAllChecksDone={markAllChecksDone}
            addChecklistItem={addChecklistItem}
            deleteChecklistItem={deleteChecklistItem}
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
            activeCues={activeCues}
            commsEmergencyAlerts={commsEmergencyAlerts}
            onAcknowledgeEmergency={acknowledgeCommsEmergency}
            incidents={incidents}
            onAddIncident={addIncident}
            onResolveIncident={resolveIncident}
            isClassAdmin={isClassAdmin}
            onCopyCue={acknowledgeCopyCue}
            currentUserId={authUser?.id}
          />
        )}

        {/* TAB 3: Presenter HUD for Selected Class Hub (Presenters ONLY see this!) */}
        {(isPresenterOnly || isDirector || (!isTechOnly && !isCommsOnly)) && activeTab === 'presenter' && (
          <PresenterMode
            currentSegment={currentSegment}
            nextSegment={nextSegment}
            localTimer={localTimer}
            activeCues={activeCues}
            dismissCue={dismissCue}
            lessonNotes={lessonNotes}
            onOpenHolySpiritModal={() => setIsHolySpiritModalOpen(true)}
            onCopyCue={acknowledgeCopyCue}
            currentUserId={authUser?.id}
          />
        )}

        {/* TAB 4: Team & Resources (with account registration & class roster) */}
        {!isTechOnly && !isPresenterOnly && !isCommsOnly && activeTab === 'team' && (
          <TeamResources
            currentUser={authUser}
            teamMembers={teamMembers}
            lessonNotes={lessonNotes}
            incidents={incidents}
            onAddIncident={addIncident}
            onResolveIncident={resolveIncident}
            selectedClassId={selectedClassId}
            activeClassInfo={activeClassInfo}
            registeredAccounts={registeredAccounts}
            onOpenAuthModal={handleOpenAuthModal}
            onRemoveTeamMember={removeTeamMember}
            onDeleteAccount={deleteUserAccount}
            onPromoteToClassAdmin={promoteToClassAdmin}
            onRevokeClassAdmin={revokeClassAdmin}
          />
        )}

        {/* TAB 5: Planner & Review */}
        {!isTechOnly && !isPresenterOnly && !isCommsOnly && activeTab === 'planner' && (
          <PlannerReview
            reviewData={reviewData}
            updateReview={updateReview}
            resetReview={resetReview}
            prayerRequests={prayerRequests}
            addPrayerRequest={addPrayerRequest}
            togglePrayerAnswered={togglePrayerAnswered}
            deletePrayerRequest={deletePrayerRequest}
            calendarEvents={calendarEvents}
            addCalendarEvent={addCalendarEvent}
            deleteCalendarEvent={deleteCalendarEvent}
            isClassAdmin={isClassAdmin}
            activeClassId={selectedClassId}
          />
        )}

        {/* TAB 6: Service Templates Editor (DIRECTORS ONLY) */}
        {isDirector && activeTab === 'templates' && (
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
            onOpenAuthModal={() => handleOpenAuthModal('permissions')}
          />
        )}
      </main>

          {/* Footer Status Bar */}
          <footer className="h-11 bg-black/60 px-4 sm:px-6 border-t border-white/5 flex flex-wrap items-center justify-between text-[11px] text-gray-400">
            <div className="flex items-center gap-4 py-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-[10px] font-bold tracking-widest uppercase opacity-80 text-white">5-Class Network Active</span>
              </div>
              <span className="hidden sm:inline text-white/20">|</span>
              <div className="hidden sm:flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                <span className="text-[10px] font-mono uppercase opacity-60">
                  Active: {selectedClassId === 'all' ? 'All Classes' : activeClassInfo?.name}
                </span>
              </div>
              <span className="hidden md:inline text-white/20">|</span>
              <div className="hidden md:flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span className="text-[10px] font-mono uppercase opacity-60">
                  User: {authUser?.name} ({authUser?.assignedClassId === 'all' ? 'Director' : authUser?.assignedClassId?.toUpperCase()})
                </span>
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

      {/* Multi-Account & Class Assignment Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={authUser}
        onLogin={loginUser}
        onSwitchUser={switchAuthUser}
        onLogout={logoutUser}
        registeredAccounts={registeredAccounts}
        onAddNewAccount={addNewAccount}
        onDeleteAccount={deleteUserAccount}
        onClearDefaultAccounts={clearAllDefaultAccounts}
        onResetDefaultAccounts={resetDefaultAccounts}
        onPromoteToClassAdmin={promoteToClassAdmin}
        onRevokeClassAdmin={revokeClassAdmin}
        onSyncAccounts={syncAccountsWithCloud}
        initialTab={authModalInitialTab}
      />

      {/* Director Global Broadcast Announcement Popup Alert (shown across classes) */}
      <DirectorAnnouncementPopup
        announcement={activeDirectorAnnouncement}
        onDismiss={dismissDirectorAnnouncement}
      />

      {/* Director Compose Global Announcement Modal */}
      <DirectorComposeModal
        isOpen={isDirectorComposeOpen}
        onClose={() => setIsDirectorComposeOpen(false)}
        onSendAnnouncement={(title, msg, targetClassId, severity) => {
          sendDirectorAnnouncement(title, msg, targetClassId, severity);
          setIsDirectorComposeOpen(false);
        }}
        defaultClassId={selectedClassId}
        currentUserName={authUser?.name || 'Ministry Director'}
      />
    </div>
  );
}
