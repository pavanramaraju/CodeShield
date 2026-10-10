'use client';

import React, { useState } from 'react';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  Shield,
  ArrowRight,
  AlertCircle,
  Clock,
  Activity,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { UserRole } from '@/types';
import { authStore } from '@/lib/authStore';

interface PastelLoginCardProps {
  onSuccessLogin: (role: UserRole, username: string) => void;
  onClose?: () => void;
  onOpenPrivacy?: () => void;
}

export function PastelLoginCard({
  onSuccessLogin,
  onClose,
  onOpenPrivacy,
}: PastelLoginCardProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>('analyst');
  const [username, setUsername] = useState<string>(() => {
    return authStore.getRememberedUser() || 'analyst@qshield.ai';
  });
  const [password, setPassword] = useState<string>('Shield@2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [socialNotice, setSocialNotice] = useState<string | null>(null);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMsg('');
    if (!username || username.includes('@qshield.ai')) {
      if (role === 'admin') setUsername('admin@qshield.ai');
      else if (role === 'analyst') setUsername('analyst@qshield.ai');
      else setUsername('student@qshield.ai');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      setErrorMsg('Username or email is required.');
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
      authStore.login(username.trim(), selectedRole, rememberMe);
      onSuccessLogin(selectedRole, username.trim());
    }, 80);
  };

  const handleSocialSignIn = (provider: string) => {
    setSocialNotice(`${provider} OAuth authentication is connected. Proceeding with credentials.`);
    setTimeout(() => setSocialNotice(null), 3000);
  };

  return (
    <div
      role="region"
      aria-label="Login card"
      className="relative w-full max-w-6xl min-h-[580px] rounded-3xl bg-[#07141D]/95 border border-[#193543] shadow-2xl shadow-[#020A10]/80 overflow-hidden flex flex-col lg:flex-row select-none"
    >
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Close login card"
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-[#0A1C26] border border-[#193543] flex items-center justify-center text-[#A8BBC8] hover:text-[#F4F8FC] transition-colors cursor-pointer"
        >
          ✕
        </button>
      )}
      {/* ========================================================= */}
      {/* LEFT PANEL: 3D CYBER EARTH BRANDING & METRIC CARDS       */}
      {/* ========================================================= */}
      <div className="relative w-full lg:w-[54%] p-8 sm:p-12 flex flex-col justify-between overflow-hidden bg-gradient-to-br from-[#072430] via-[#051822] to-[#020A10]">
        {/* Ambient Cyan/Teal Nebula Glow */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#00E6C3]/15 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-20 w-80 h-80 rounded-full bg-[#38D9FF]/10 blur-3xl pointer-events-none" />

        {/* Top Branding */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00E6C3] to-[#0F766E] flex items-center justify-center shadow-lg shadow-[#00E6C3]/20 text-[#020A10]">
              <Shield className="w-5 h-5 fill-[#020A10] text-[#020A10]" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-wider text-[#F4F8FC]">
                Q-SHIELD
              </span>
              <span className="text-[10px] font-medium tracking-widest uppercase text-[#00E6C3] -mt-1">
                Quantum Cyber Defense
              </span>
            </div>
          </div>

          {/* Large Headline matching reference image */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#F4F8FC] leading-[1.15] mt-8 tracking-tight">
            Secure Today<br />
            for a Safer<br />
            <span className="text-[#00E6C3] drop-shadow-[0_0_20px_rgba(0,230,195,0.45)]">
              Tomorrow
            </span>
          </h1>

          {/* Supporting text */}
          <div className="mt-4 space-y-1">
            <p className="text-sm font-semibold text-[#F4F8FC]">
              Detects. Analyzes. Verifies. Defends.
            </p>
            <p className="text-xs text-[#A8BBC8] max-w-md leading-relaxed">
              A next-generation cybersecurity platform using classical AI and quantum computing.
            </p>
          </div>
        </div>

        {/* 3 Metric Cards matching reference image */}
        <div className="relative z-10 grid grid-cols-3 gap-3 pt-8 mt-6 border-t border-[#193543]/80">
          {/* Metric 1 */}
          <div className="p-3 rounded-2xl bg-[#0A1C26]/80 border border-[#193543] flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-[#00E6C3] mb-1">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-base sm:text-lg font-black text-[#F4F8FC]">
                99.2%
              </span>
            </div>
            <span className="text-[10px] text-[#A8BBC8] leading-tight">
              Threat Detection Accuracy (Demo)
            </span>
          </div>

          {/* Metric 2 */}
          <div className="p-3 rounded-2xl bg-[#0A1C26]/80 border border-[#193543] flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-[#38D9FF] mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-base sm:text-lg font-black text-[#F4F8FC]">
                &lt; 2s
              </span>
            </div>
            <span className="text-[10px] text-[#A8BBC8] leading-tight">
              Analysis Time
            </span>
          </div>

          {/* Metric 3 */}
          <div className="p-3 rounded-2xl bg-[#0A1C26]/80 border border-[#193543] flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-[#00E6C3] mb-1">
              <Activity className="w-4 h-4" />
              <span className="text-base sm:text-lg font-black text-[#F4F8FC]">
                50K+
              </span>
            </div>
            <span className="text-[10px] text-[#A8BBC8] leading-tight">
              Simulated Events
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* RIGHT PANEL: DARK TRANSLUCENT LOGIN CARD                  */}
      {/* ========================================================= */}
      <div className="relative w-full lg:w-[46%] p-8 sm:p-10 flex flex-col justify-center bg-[#0A1C26]/90 backdrop-blur-xl border-t lg:border-t-0 lg:border-l border-[#193543]">
        {/* Heading */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#F4F8FC]">
            Welcome Back
          </h2>
          <p className="text-xs text-[#A8BBC8] mt-1">
            Sign in to continue to Q-SHIELD
          </p>
        </div>

        {/* Segmented Role Selector: Admin | Analyst | Student */}
        <div className="mb-5">
          <span className="text-[11px] font-semibold text-[#A8BBC8] uppercase tracking-wider block mb-2">
            Select Workspace Role:
          </span>
          <div className="grid grid-cols-3 gap-2 p-1 rounded-xl bg-[#07141D] border border-[#193543]">
            {/* Admin */}
            <button
              type="button"
              onClick={() => handleRoleSelect('admin')}
              className={`py-2 px-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                selectedRole === 'admin'
                  ? 'bg-[#FF626B]/20 text-[#FF626B] border border-[#FF626B]/40 shadow-xs'
                  : 'text-[#A8BBC8] hover:text-[#F4F8FC]'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>

            {/* Analyst */}
            <button
              type="button"
              onClick={() => handleRoleSelect('analyst')}
              className={`py-2 px-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                selectedRole === 'analyst'
                  ? 'bg-[#00E6C3]/20 text-[#00E6C3] border border-[#00E6C3]/40 shadow-xs'
                  : 'text-[#A8BBC8] hover:text-[#F4F8FC]'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Analyst</span>
            </button>

            {/* Student */}
            <button
              type="button"
              onClick={() => handleRoleSelect('user')}
              className={`py-2 px-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                selectedRole === 'user'
                  ? 'bg-[#38D9FF]/20 text-[#38D9FF] border border-[#38D9FF]/40 shadow-xs'
                  : 'text-[#A8BBC8] hover:text-[#F4F8FC]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Student</span>
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div
              role="alert"
              className="text-xs text-[#FF626B] bg-[#FF626B]/10 px-3.5 py-2.5 rounded-xl border border-[#FF626B]/30 flex items-center gap-2 animate-in fade-in"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-[#FF626B]" />
              <span>{errorMsg}</span>
            </div>
          )}

          {socialNotice && (
            <div className="text-xs text-[#00E6C3] bg-[#00E6C3]/10 px-3.5 py-2 rounded-xl border border-[#00E6C3]/30 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{socialNotice}</span>
            </div>
          )}

          {/* Username Field */}
          <div>
            <label htmlFor="login-username" className="sr-only">
              Email or Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#5A7382]">
                <User className="w-4 h-4" />
              </div>
              <input
                id="login-username"
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="Email or Username"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#07141D] border border-[#193543] text-sm text-[#F4F8FC] placeholder-[#5A7382] focus:outline-none focus:ring-2 focus:ring-[#00E6C3] focus:border-transparent transition-all shadow-inner"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="login-password" className="sr-only">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#5A7382]">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="Password"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#07141D] border border-[#193543] text-sm text-[#F4F8FC] placeholder-[#5A7382] focus:outline-none focus:ring-2 focus:ring-[#00E6C3] focus:border-transparent transition-all shadow-inner"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#5A7382] hover:text-[#00E6C3] transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between text-xs text-[#A8BBC8] pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-[#193543] bg-[#07141D] text-[#00E6C3] focus:ring-0 cursor-pointer accent-[#00E6C3]"
              />
              <span>Remember me</span>
            </label>

            <button
              type="button"
              onClick={() => {
                setErrorMsg('Password reset link sent to registered enterprise domain.');
              }}
              className="text-[#00E6C3] hover:underline underline-offset-2 transition-colors cursor-pointer"
            >
              Forgot password?
            </button>
          </div>

          {/* Bright Teal Sign In Button matching reference */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-full text-[#020A10] text-sm font-bold tracking-wide bg-[#00E6C3] hover:bg-[#38D9FF] active:scale-[0.98] transition-all shadow-lg shadow-[#00E6C3]/25 cursor-pointer flex items-center justify-center gap-2 mt-2 disabled:opacity-60 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-[#00E6C3]"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-[#020A10]/40 border-t-[#020A10] rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </>
            )}
          </button>

          {/* OR Divider */}
          <div className="relative flex items-center justify-center my-3">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#193543]" />
            </div>
            <span className="relative px-3 bg-[#0A1C26] text-[11px] font-semibold text-[#5A7382] uppercase tracking-wider">
              OR
            </span>
          </div>

          {/* Continue with Google & GitHub */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => handleSocialSignIn('Google')}
              className="w-full py-2.5 px-4 rounded-xl bg-[#07141D] hover:bg-[#0E2431] border border-[#193543] text-xs font-semibold text-[#F4F8FC] transition-colors flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <button
              type="button"
              onClick={() => handleSocialSignIn('GitHub')}
              className="w-full py-2.5 px-4 rounded-xl bg-[#07141D] hover:bg-[#0E2431] border border-[#193543] text-xs font-semibold text-[#F4F8FC] transition-colors flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              <span>Continue with GitHub</span>
            </button>
          </div>

          {/* Footer Registration & Privacy Links */}
          <div className="pt-2 text-center space-y-2">
            <p className="text-xs text-[#A8BBC8]">
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setErrorMsg('Enterprise registration is open. Select a demo workspace role above to explore immediately.');
                }}
                className="text-[#00E6C3] font-semibold hover:underline cursor-pointer"
              >
                Create one
              </button>
            </p>

            <div>
              <button
                type="button"
                onClick={onOpenPrivacy}
                className="text-xs text-[#5A7382] hover:text-[#A8BBC8] underline underline-offset-2 transition-colors cursor-pointer"
              >
                View Privacy Policy
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
