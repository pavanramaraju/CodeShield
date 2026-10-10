'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { TopNav, BottomRightSparkle } from '@/components/navigation/TopNav';
import { LandingIntroOverlay } from '@/components/globe/LandingIntroOverlay';
import { QuantumLoginCard } from '@/components/auth/QuantumLoginCard';
import { QuantumRibbonsBackground } from '@/components/auth/QuantumRibbonsBackground';
import { ExecutiveDashboard } from '@/components/dashboard/ExecutiveDashboard';
import { FeaturesModal } from '@/components/modals/FeaturesModal';
import { AboutModal } from '@/components/modals/AboutModal';
import { PrivacyModal } from '@/components/modals/PrivacyModal';
import { QuickSearchModal } from '@/components/modals/QuickSearchModal';
import { EventForensicModal } from '@/components/dashboard/EventForensicModal';
import { QuantumAnalysisModal } from '@/components/dashboard/QuantumAnalysisModal';
import { UserRole, SecurityEventItem } from '@/types';
import { authStore } from '@/lib/authStore';

// Dynamic import for 3D Q-SHIELD Globe with SSR disabled
const QShieldGlobe = dynamic(
  () =>
    import('@/components/globe/QShieldGlobe').then(
      (mod) => mod.QShieldGlobe
    ),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-24 h-24 rounded-full border-4 border-[#00E6C3]/20 border-t-[#00E6C3] animate-spin" />
      </div>
    ),
  }
);

type Scene = 'globe' | 'login' | 'dashboard';

const emptySubscribe = () => () => {};

export default function Home() {
  const mounted = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const [currentScene, setCurrentScene] = useState<Scene>('globe');
  const [currentRole, setCurrentRole] = useState<UserRole>('analyst');
  const [username, setUsername] = useState<string>('analyst@qshield.ai');

  // Modals state
  const [showFeatures, setShowFeatures] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [selectedSearchEvent, setSelectedSearchEvent] = useState<SecurityEventItem | null>(null);
  const [showGlobalQuantum, setShowGlobalQuantum] = useState(false);

  // Sync state cleanly on mount to prevent any SSR hydration mismatch
  useEffect(() => {
    const syncRoute = () => {
      const hash = window.location.hash.replace('#', '');
      const session = authStore.getSession();

      if (session.isAuthenticated) {
        setCurrentRole(session.role);
        setUsername(session.username);
      }

      if (hash === 'dashboard' || hash.startsWith('dashboard')) {
        if (session.isAuthenticated) {
          setCurrentScene('dashboard');
        } else {
          // Route protection: redirect unauthenticated users to login
          window.location.hash = 'login';
          setCurrentScene('login');
        }
      } else if (hash === 'login') {
        setCurrentScene('login');
      } else if (hash === 'globe') {
        setCurrentScene('globe');
      } else {
        // Empty hash or root URL:
        if (session.isAuthenticated) {
          // Keep authenticated user on the dashboard
          window.location.hash = 'dashboard';
          setCurrentScene('dashboard');
        } else {
          setCurrentScene('globe');
        }
      }
    };

    syncRoute();

    const handleHashChange = () => {
      syncRoute();
    };

    const handleAuthChange = () => {
      const session = authStore.getSession();
      if (session.isAuthenticated) {
        setCurrentRole(session.role);
        setUsername(session.username);
        if (window.location.hash !== '#dashboard') {
          window.location.hash = 'dashboard';
        }
        setCurrentScene('dashboard');
      } else {
        if (window.location.hash !== '#login') {
          window.location.hash = 'login';
        }
        setCurrentScene('login');
      }
    };

    const handleGlobalKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch((prev) => !prev);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('qshield_auth_change', handleAuthChange);
    window.addEventListener('keydown', handleGlobalKey);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('qshield_auth_change', handleAuthChange);
      window.removeEventListener('keydown', handleGlobalKey);
    };
  }, []);

  // Scene navigation handlers with URL hash updates
  const navigateTo = (scene: Scene) => {
    window.location.hash = scene;
    setCurrentScene(scene);
  };

  const handleStartLogin = () => {
    navigateTo('login');
  };

  const handleSuccessLogin = (role: UserRole, user: string) => {
    setCurrentRole(role);
    setUsername(user);
    navigateTo('dashboard');
  };

  const handleReturnToGlobe = () => {
    navigateTo('globe');
  };

  const handleLogout = () => {
    authStore.logout();
    navigateTo('login');
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden select-none font-sans bg-[#020A10]">
      {/* ========================================================= */}
      {/* PERSISTENT 3D GLOBE LAYER                                  */}
      {/* ========================================================= */}
      <div
        className={`absolute inset-0 w-full h-full transition-all duration-700 ${
          currentScene === 'globe'
            ? 'opacity-100 scale-100 pointer-events-auto'
            : currentScene === 'login'
            ? 'opacity-30 scale-95 blur-xs pointer-events-none'
            : 'opacity-0 scale-90 pointer-events-none'
        }`}
        style={{
          background:
            'radial-gradient(ellipse at 50% 50%, #061B26 0%, #04131C 50%, #020A10 100%)',
        }}
      >
        {/* Top Navigation Bar */}
        <TopNav
          onLoginClick={handleStartLogin}
          onGetStartedClick={handleStartLogin}
          activeNav="home"
          onNavClick={(nav) => {
            if (nav === 'threat-intelligence') {
              const session = authStore.getSession();
              if (session.isAuthenticated) navigateTo('dashboard');
              else navigateTo('login');
            }
          }}
          onOpenSearch={() => setShowSearch(true)}
          onOpenFeatures={() => setShowFeatures(true)}
          onOpenAbout={() => setShowAbout(true)}
        />

        {/* 3D Cyber Globe WebGL Canvas */}
        <div className="absolute inset-0 w-full h-full flex items-center justify-center">
          <QShieldGlobe />
        </div>

        {/* Scene 1 Intro Callouts & Progress Bar Overlay */}
        <LandingIntroOverlay
          onEnterLogin={handleStartLogin}
          onEnterDashboard={() => {
            const session = authStore.getSession();
            if (session.isAuthenticated) navigateTo('dashboard');
            else navigateTo('login');
          }}
        />

        {/* Subtle Atmospheric Floor Glow */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#020A10] to-transparent pointer-events-none" />

        {/* Bottom-right sparkle element */}
        <BottomRightSparkle />
      </div>

      {/* ========================================================= */}
      {/* SCENE 2: QUANTUM-INSPIRED CYBER LOGIN INTERFACE           */}
      {/* ========================================================= */}
      <AnimatePresence>
        {mounted && currentScene === 'login' && (
          <motion.div
            key="login-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 w-full h-full z-50 overflow-y-auto"
          >
            <QuantumRibbonsBackground>
              {/* Back to Globe Floating Pill */}
              <button
                onClick={handleReturnToGlobe}
                className="absolute top-6 left-6 sm:left-8 z-30 px-4 py-2 rounded-full bg-[#020B35]/85 hover:bg-[#00247D]/80 text-xs font-semibold text-[#8BA3D4] hover:text-white border border-[#0055FF]/40 shadow-[0_0_15px_rgba(0,85,255,0.25)] hover:border-[#00D9FF]/70 transition-all cursor-pointer backdrop-blur-md flex items-center gap-1.5"
              >
                ← Back to 3D Globe
              </button>

              {/* Centered Narrow Glassmorphism Login Card */}
              <QuantumLoginCard
                onSuccessLogin={handleSuccessLogin}
                onClose={handleReturnToGlobe}
                onOpenPrivacy={() => setShowPrivacy(true)}
              />
            </QuantumRibbonsBackground>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* SCENE 3: Q-SHIELD CYBERSECURITY DASHBOARD                 */}
      {/* ========================================================= */}
      <AnimatePresence>
        {mounted && currentScene === 'dashboard' && (
          <motion.div
            key="dashboard-view"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="absolute inset-0 w-full h-full overflow-y-auto z-40 bg-[#020A10]"
          >
            <ExecutiveDashboard
              currentRole={currentRole}
              username={username}
              onRoleSwitch={(newRole) => {
                authStore.switchRole(newRole);
                setCurrentRole(newRole);
              }}
              onLogout={handleLogout}
              onReturnToGlobe={handleReturnToGlobe}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* GLOBAL MODALS                                             */}
      {/* ========================================================= */}
      <FeaturesModal
        isOpen={showFeatures}
        onClose={() => setShowFeatures(false)}
        onExploreDashboard={() => {
          const session = authStore.getSession();
          if (session.isAuthenticated) navigateTo('dashboard');
          else navigateTo('login');
        }}
      />

      <AboutModal
        isOpen={showAbout}
        onClose={() => setShowAbout(false)}
      />

      <PrivacyModal
        isOpen={showPrivacy}
        onClose={() => setShowPrivacy(false)}
      />

      <QuickSearchModal
        isOpen={showSearch}
        onClose={() => setShowSearch(false)}
        onSelectEvent={(evt) => {
          setSelectedSearchEvent(evt);
        }}
        onOpenQuantum={() => {
          setShowGlobalQuantum(true);
        }}
      />

      {/* Search result event deep-dive modal */}
      <EventForensicModal
        event={selectedSearchEvent}
        isOpen={Boolean(selectedSearchEvent)}
        onClose={() => setSelectedSearchEvent(null)}
        onTriggerQuantumVerification={() => {
          setSelectedSearchEvent(null);
          setShowGlobalQuantum(true);
        }}
      />

      {/* Search result quantum modal */}
      <QuantumAnalysisModal
        isOpen={showGlobalQuantum}
        onClose={() => setShowGlobalQuantum(false)}
      />
    </main>
  );
}
