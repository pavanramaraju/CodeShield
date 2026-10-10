'use client';

import React, { useState } from 'react';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
  User,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  X,
} from 'lucide-react';
import { UserRole } from '@/types';
import { authStore } from '@/lib/authStore';

interface QuantumLoginCardProps {
  onSuccessLogin: (role: UserRole, username: string) => void;
  onClose?: () => void;
  onOpenPrivacy?: () => void;
}

export function QuantumLoginCard({
  onSuccessLogin,
  onClose,
  onOpenPrivacy,
}: QuantumLoginCardProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>('analyst');
  const [email, setEmail] = useState<string>(() => {
    return authStore.getRememberedUser() || 'analyst@qshield.ai';
  });
  const [password, setPassword] = useState<string>('Shield@2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [socialNotice, setSocialNotice] = useState<string | null>(null);

  // Modals for Forgot Password & Registration
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regSuccess, setRegSuccess] = useState(false);

  // Role quick-selector
  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMsg('');
    if (!email || email.includes('@qshield.ai')) {
      if (role === 'admin') setEmail('admin@qshield.ai');
      else if (role === 'analyst') setEmail('analyst@qshield.ai');
      else setEmail('student@qshield.ai');
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!email.trim()) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    // Basic email format check
    if (!email.includes('@') || !email.includes('.')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setErrorMsg('');
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      // Persist session via authStore
      authStore.login(email.trim(), selectedRole, rememberMe);
      onSuccessLogin(selectedRole, email.trim());
    }, 180);
  };

  const handleSocialSignIn = (provider: string) => {
    setSocialNotice(`${provider} authentication linked. Establishing quantum secure session...`);
    setTimeout(() => setSocialNotice(null), 3500);
  };

  return (
    <div
      role="region"
      aria-label="Quantum login card"
      className="relative w-full max-w-[420px] rounded-[32px] bg-[#020B35]/75 border border-[#0055FF]/45 shadow-[0_0_50px_rgba(0,85,255,0.35),0_25px_60px_rgba(0,0,0,0.9)] backdrop-blur-2xl p-7 sm:p-9 select-none overflow-hidden transition-all duration-300"
    >
      {/* ========================================================= */}
      {/* 1. BRIGHT CYAN LIGHT ILLUMINATING TOP EDGE                */}
      {/* ========================================================= */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#00D9FF] to-transparent shadow-[0_0_16px_#00D9FF]" />
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-24 bg-[#00D9FF]/20 blur-2xl pointer-events-none rounded-full" />

      {/* Close button */}
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Close login card"
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-[#030E3D]/80 border border-[#142A68] flex items-center justify-center text-[#8BA3D4] hover:text-[#FFFFFF] hover:border-[#00D9FF]/50 transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* ========================================================= */}
      {/* 2. CARD HEADER: WELCOME BACK                              */}
      {/* ========================================================= */}
      <div className="text-center pt-2 pb-6">
        {/* Quantum Shield Emblem */}
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0055FF] to-[#00D9FF] p-0.5 shadow-[0_0_20px_rgba(0,217,255,0.4)] mb-4">
          <div className="w-full h-full rounded-[14px] bg-[#010826] flex items-center justify-center">
            <Shield className="w-6 h-6 text-[#00D9FF]" />
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Welcome Back
        </h1>
        <p className="text-xs sm:text-sm text-[#8BA3D4] mt-1 font-medium">
          Sign in to your account
        </p>

        {/* Compact Workspace Role Switcher */}
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-full bg-[#010826]/90 border border-[#12245C] mt-4">
          <button
            type="button"
            onClick={() => handleRoleSelect('admin')}
            className={`py-1.5 rounded-full text-[11px] font-semibold transition-all cursor-pointer flex items-center justify-center gap-1 ${
              selectedRole === 'admin'
                ? 'bg-[#0055FF] text-white shadow-[0_0_12px_rgba(0,85,255,0.6)]'
                : 'text-[#8BA3D4] hover:text-white'
            }`}
          >
            <Shield className="w-3 h-3" />
            <span>Admin</span>
          </button>
          <button
            type="button"
            onClick={() => handleRoleSelect('analyst')}
            className={`py-1.5 rounded-full text-[11px] font-semibold transition-all cursor-pointer flex items-center justify-center gap-1 ${
              selectedRole === 'analyst'
                ? 'bg-[#00D9FF] text-[#010826] font-bold shadow-[0_0_12px_rgba(0,217,255,0.6)]'
                : 'text-[#8BA3D4] hover:text-white'
            }`}
          >
            <User className="w-3 h-3" />
            <span>Analyst</span>
          </button>
          <button
            type="button"
            onClick={() => handleRoleSelect('user')}
            className={`py-1.5 rounded-full text-[11px] font-semibold transition-all cursor-pointer flex items-center justify-center gap-1 ${
              selectedRole === 'user'
                ? 'bg-[#0055FF] text-white shadow-[0_0_12px_rgba(0,85,255,0.6)]'
                : 'text-[#8BA3D4] hover:text-white'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>Student</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. LOGIN FORM WITH PILL-SHAPED INPUT FIELDS               */}
      {/* ========================================================= */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Error notification */}
        {errorMsg && (
          <div
            role="alert"
            className="flex items-center gap-2 p-3 rounded-2xl bg-[#FF3366]/15 border border-[#FF3366]/40 text-[#FF6B8B] text-xs animate-in fade-in"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Social Notice Toast */}
        {socialNotice && (
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-[#00D9FF]/15 border border-[#00D9FF]/40 text-[#5CE1E6] text-xs animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{socialNotice}</span>
          </div>
        )}

        {/* A. Pill-Shaped Email Field */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Mail className="w-4 h-4 text-[#00D9FF]" />
          </div>
          <input
            id="email-input"
            type="text"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errorMsg) setErrorMsg('');
            }}
            placeholder="Enter your email"
            autoComplete="email"
            className="w-full pl-11 pr-4 py-3.5 rounded-full bg-[#010824]/85 border border-[#142A68] text-white text-xs sm:text-sm placeholder-[#5A73A8] focus:outline-none focus:border-[#00D9FF] focus:ring-2 focus:ring-[#00D9FF]/25 shadow-inner transition-all"
          />
        </div>

        {/* B. Pill-Shaped Password Field */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Lock className="w-4 h-4 text-[#00D9FF]" />
          </div>
          <input
            id="password-input"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errorMsg) setErrorMsg('');
            }}
            placeholder="Enter your password"
            autoComplete="current-password"
            className="w-full pl-11 pr-11 py-3.5 rounded-full bg-[#010824]/85 border border-[#142A68] text-white text-xs sm:text-sm placeholder-[#5A73A8] focus:outline-none focus:border-[#00D9FF] focus:ring-2 focus:ring-[#00D9FF]/25 shadow-inner transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#5A73A8] hover:text-[#00D9FF] transition-colors cursor-pointer"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {/* "Forgot Password?" Link */}
        <div className="flex items-center justify-between px-1 text-xs">
          <label className="flex items-center gap-2 text-[#8BA3D4] cursor-pointer hover:text-white transition-colors">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-3.5 h-3.5 rounded bg-[#010824] border-[#142A68] text-[#00D9FF] focus:ring-0 focus:ring-offset-0"
            />
            <span>Remember me</span>
          </label>

          <button
            type="button"
            onClick={() => setShowForgotModal(true)}
            className="text-[#00D9FF] hover:text-white transition-colors font-medium cursor-pointer"
          >
            Forgot Password?
          </button>
        </div>

        {/* ========================================================= */}
        {/* 4. FUTURISTIC CIRCULAR CYAN-BLUE LOGIN BUTTON             */}
        {/* ========================================================= */}
        <div className="pt-2 flex items-center justify-between gap-4">
          <span className="text-sm font-semibold text-white tracking-wide">
            Sign In to Q-SHIELD
          </span>

          {/* Circular Cyan-Blue Arrow Button matching Reference */}
          <button
            type="submit"
            disabled={isLoading}
            aria-label="Submit login"
            className="group relative w-14 h-14 rounded-full bg-gradient-to-br from-[#00D9FF] via-[#0099FF] to-[#0055FF] p-0.5 shadow-[0_0_24px_rgba(0,217,255,0.65)] hover:shadow-[0_0_35px_rgba(0,217,255,0.95)] hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer flex items-center justify-center shrink-0"
          >
            {/* Outer pulsating ring */}
            <span className="absolute inset-0 rounded-full border-2 border-[#00D9FF]/50 animate-ping opacity-60" />

            {/* Inner Center Circle with Dark Arrow */}
            <div className="w-full h-full rounded-full bg-[#00D9FF] flex items-center justify-center group-hover:bg-[#5CE1E6] transition-colors">
              {isLoading ? (
                <div className="w-5 h-5 rounded-full border-2 border-[#010826] border-t-transparent animate-spin" />
              ) : (
                <ArrowRight className="w-6 h-6 text-[#010826] stroke-[2.5] group-hover:translate-x-0.5 transition-transform" />
              )}
            </div>
          </button>
        </div>
      </form>

      {/* ========================================================= */}
      {/* 5. SOCIAL AUTHENTICATION DIVIDER & BUTTONS                */}
      {/* ========================================================= */}
      <div className="mt-6">
        <div className="relative flex items-center justify-center">
          <div className="w-full border-t border-[#12245C]" />
          <span className="absolute bg-[#020B35] px-3 text-[11px] font-semibold text-[#6B85B8] uppercase tracking-wider">
            Or
          </span>
        </div>

        {/* 3 Rounded Social Login Buttons: Google | Apple | GitHub */}
        <div className="grid grid-cols-3 gap-3 mt-5">
          {/* Google */}
          <button
            type="button"
            onClick={() => handleSocialSignIn('Google')}
            aria-label="Sign in with Google"
            className="flex items-center justify-center py-2.5 rounded-2xl bg-[#010826]/90 border border-[#142A68] hover:border-[#00D9FF]/60 hover:shadow-[0_0_16px_rgba(0,217,255,0.3)] transition-all cursor-pointer group"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5c1.57 0 2.98.54 4.1 1.6l3.07-3.07C17.32 1.8 14.85 1 12 1 7.48 1 3.66 3.6 1.83 7.39l3.71 2.88C6.42 7.37 8.98 5 12 5z"
              />
              <path
                fill="#4285F4"
                d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58l3.71 2.88c2.16-1.99 3.71-4.93 3.71-8.7z"
              />
              <path
                fill="#FBBC05"
                d="M5.54 14.73c-.24-.73-.38-1.5-.38-2.31s.14-1.58.38-2.31L1.83 7.23C1.07 8.74.63 10.43.63 12.22s.44 3.48 1.2 4.99l3.71-2.48z"
              />
              <path
                fill="#34A853"
                d="M12 23.44c3.24 0 5.95-1.08 7.93-2.91l-3.71-2.88c-1.07.72-2.45 1.16-4.22 1.16-3.02 0-5.58-2.37-6.46-5.27L1.83 16.42C3.66 20.21 7.48 22.81 12 22.81z"
              />
            </svg>
          </button>

          {/* Apple */}
          <button
            type="button"
            onClick={() => handleSocialSignIn('Apple')}
            aria-label="Sign in with Apple"
            className="flex items-center justify-center py-2.5 rounded-2xl bg-[#010826]/90 border border-[#142A68] hover:border-[#00D9FF]/60 hover:shadow-[0_0_16px_rgba(0,217,255,0.3)] transition-all cursor-pointer group"
          >
            <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.93-2.85-.9.04-1.99.6-2.63 1.35-.56.65-1.05 1.71-.92 2.73 1.01.08 2.02-.48 2.62-1.23z" />
            </svg>
          </button>

          {/* GitHub */}
          <button
            type="button"
            onClick={() => handleSocialSignIn('GitHub')}
            aria-label="Sign in with GitHub"
            className="flex items-center justify-center py-2.5 rounded-2xl bg-[#010826]/90 border border-[#142A68] hover:border-[#00D9FF]/60 hover:shadow-[0_0_16px_rgba(0,217,255,0.3)] transition-all cursor-pointer group"
          >
            <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 6. REGISTRATION & FOOTER LINKS                            */}
      {/* ========================================================= */}
      <div className="mt-6 text-center text-xs text-[#8BA3D4]">
        <span>Don&apos;t have an account? </span>
        <button
          type="button"
          onClick={() => setShowRegisterModal(true)}
          className="text-[#00D9FF] hover:text-white font-semibold transition-colors cursor-pointer"
        >
          Create one
        </button>
      </div>

      {onOpenPrivacy && (
        <div className="mt-2 text-center">
          <button
            type="button"
            onClick={onOpenPrivacy}
            className="text-[10px] text-[#5A73A8] hover:text-[#00D9FF] transition-colors cursor-pointer"
          >
            View Privacy Policy
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* 7. MODAL: FORGOT PASSWORD FLOW                            */}
      {/* ========================================================= */}
      {showForgotModal && (
        <div className="absolute inset-0 z-50 bg-[#010824]/95 backdrop-blur-xl p-6 flex flex-col justify-between rounded-[32px] animate-in fade-in">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">Reset Quantum Key</h3>
              <button
                type="button"
                onClick={() => {
                  setShowForgotModal(false);
                  setForgotSent(false);
                }}
                className="text-[#8BA3D4] hover:text-white"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-[#8BA3D4] mb-4">
              Enter your authorized email to receive quantum recovery verification instructions.
            </p>
            {!forgotSent ? (
              <div className="space-y-3">
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="name@qshield.ai"
                  className="w-full px-4 py-2.5 rounded-full bg-[#020B35] border border-[#142A68] text-white text-xs placeholder-[#5A73A8] focus:outline-none focus:border-[#00D9FF]"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (forgotEmail.includes('@')) setForgotSent(true);
                  }}
                  className="w-full py-2.5 rounded-full bg-gradient-to-r from-[#0055FF] to-[#00D9FF] text-xs font-bold text-[#010826] hover:shadow-lg transition-all cursor-pointer"
                >
                  Send Recovery Link
                </button>
              </div>
            ) : (
              <div className="p-3 rounded-2xl bg-[#00D9FF]/15 border border-[#00D9FF]/40 text-[#5CE1E6] text-xs">
                Verification link dispatched to {forgotEmail}. Please check your inbox.
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              setShowForgotModal(false);
              setForgotSent(false);
            }}
            className="w-full py-2 text-xs text-[#8BA3D4] hover:text-white"
          >
            ← Back to Login
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* 8. MODAL: REGISTRATION FLOW                               */}
      {/* ========================================================= */}
      {showRegisterModal && (
        <div className="absolute inset-0 z-50 bg-[#010824]/95 backdrop-blur-xl p-6 flex flex-col justify-between rounded-[32px] animate-in fade-in">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-white">Create Q-SHIELD Account</h3>
              <button
                type="button"
                onClick={() => {
                  setShowRegisterModal(false);
                  setRegSuccess(false);
                }}
                className="text-[#8BA3D4] hover:text-white"
              >
                ✕
              </button>
            </div>
            {!regSuccess ? (
              <div className="space-y-2.5">
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full px-4 py-2 rounded-full bg-[#020B35] border border-[#142A68] text-white text-xs placeholder-[#5A73A8] focus:outline-none focus:border-[#00D9FF]"
                />
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="Email Address"
                  className="w-full px-4 py-2 rounded-full bg-[#020B35] border border-[#142A68] text-white text-xs placeholder-[#5A73A8] focus:outline-none focus:border-[#00D9FF]"
                />
                <input
                  type="password"
                  value={regPass}
                  onChange={(e) => setRegPass(e.target.value)}
                  placeholder="Security Password (min 6 chars)"
                  className="w-full px-4 py-2 rounded-full bg-[#020B35] border border-[#142A68] text-white text-xs placeholder-[#5A73A8] focus:outline-none focus:border-[#00D9FF]"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (regEmail.includes('@') && regPass.length >= 6) {
                      setRegSuccess(true);
                      setTimeout(() => {
                        setEmail(regEmail);
                        setShowRegisterModal(false);
                        setRegSuccess(false);
                      }, 1200);
                    }
                  }}
                  className="w-full py-2.5 rounded-full bg-gradient-to-r from-[#0055FF] to-[#00D9FF] text-xs font-bold text-[#010826] hover:shadow-lg transition-all cursor-pointer mt-1"
                >
                  Register Account
                </button>
              </div>
            ) : (
              <div className="p-3 rounded-2xl bg-[#00D9FF]/15 border border-[#00D9FF]/40 text-[#5CE1E6] text-xs">
                Registration successful! Preparing authentication...
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => setShowRegisterModal(false)}
            className="w-full py-2 text-xs text-[#8BA3D4] hover:text-white"
          >
            ← Back to Login
          </button>
        </div>
      )}
    </div>
  );
}

export default QuantumLoginCard;
