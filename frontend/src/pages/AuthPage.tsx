import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { BookOpen, Sparkles, Mail, User, ArrowRight, KeyRound, CheckCircle2, RefreshCw, ChevronLeft, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, sendOtp, verifyOtp, isLoading } = useAuth();

  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // If already authenticated with a valid non-guest session, immediately redirect to destination or dashboard
  useEffect(() => {
    if (user && !user.isGuest) {
      const destination = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(destination, { replace: true });
    }
  }, [user, navigate, location]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setErrorMsg('Please enter a valid student email address (e.g. name@college.edu).');
      return;
    }

    try {
      const msg = await sendOtp(cleanEmail, name.trim() || undefined);
      setInfoMsg(msg || `A 6-digit verification code has been dispatched to ${cleanEmail}`);
      setStep('otp');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to dispatch verification code via Brevo. Please check your email and network.');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    const cleanOtp = otp.trim();
    if (!cleanOtp || cleanOtp.length !== 6) {
      setErrorMsg('Please enter the full 6-digit verification code from your email.');
      return;
    }

    try {
      await verifyOtp(email.trim().toLowerCase(), cleanOtp, name.trim() || undefined);
      const destination = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(destination, { replace: true });
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid or expired verification code. Please request a new OTP.');
    }
  };

  const handleResend = async () => {
    setErrorMsg(null);
    setInfoMsg(null);
    try {
      const msg = await sendOtp(email.trim().toLowerCase(), name.trim() || undefined);
      setInfoMsg(msg || `New 6-digit code dispatched to ${email}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to resend code. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 gradient-mesh selection:bg-primary/30">
      {/* Brand Header */}
      <Link to="/" className="flex items-center gap-2.5 mb-8 group">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-secondary p-0.5 shadow-md">
          <div className="w-full h-full bg-[#080B18] rounded-[10px] flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-secondary" />
          </div>
        </div>
        <div>
          <span className="font-bold text-lg text-foreground tracking-tight">
            Snap2Learn<span className="text-secondary ml-1">AI</span>
          </span>
          <p className="text-[10px] text-foreground-muted">CSE-AIML Study Companion</p>
        </div>
      </Link>

      <div className="w-full max-w-md glass-card p-6 sm:p-8 border border-border">
        {/* Step Indicator Header */}
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary-light text-[11px] font-medium mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-secondary" />
            <span>Secure Email OTP Verification</span>
          </div>
          <h2 className="text-xl font-bold text-foreground">
            {step === 'email' ? 'Sign In or Register' : 'Check Your Inbox'}
          </h2>
          <p className="text-xs text-foreground-muted mt-1 leading-relaxed">
            {step === 'email'
              ? 'Enter your student email. We will send a secure 6-digit verification code directly to your inbox.'
              : `A one-time code was sent to ${email}. Valid for 10 minutes.`}
          </p>
        </div>

        {infoMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{infoMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            {errorMsg}
          </div>
        )}

        {step === 'email' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-foreground-muted mb-1.5">
                Full Name (For New Students)
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-foreground-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. Yashwanth Ch"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-surface border border-border text-foreground text-xs focus:outline-none focus:border-secondary"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground-muted mb-1.5">
                Student Email Address <span className="text-secondary">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-foreground-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="student@college.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-surface border border-border text-foreground text-xs focus:outline-none focus:border-secondary"
                />
              </div>
              <p className="text-[10px] text-foreground-muted mt-1">
                New accounts are created automatically upon OTP verification.
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-primary text-white text-xs font-semibold shadow-md glow-primary hover:bg-primary-hover transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Dispatching Code via Brevo...</span>
                </>
              ) : (
                <>
                  <span>Send Verification Code</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="flex items-center justify-between pt-2">
              <Link
                to="/reset-password"
                className="text-[11px] text-secondary hover:underline cursor-pointer font-medium"
              >
                Forgot Password?
              </Link>
              <Link
                to="/reset-password"
                className="text-[11px] text-foreground-muted hover:text-foreground cursor-pointer"
              >
                Reset via Email Link & OTP
              </Link>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-foreground-muted mb-1.5 text-center">
                Enter the 6-Digit Code
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-foreground-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-full pl-9 pr-3 py-3 rounded-xl bg-surface border border-border text-foreground text-center font-mono text-lg tracking-[6px] focus:outline-none focus:border-secondary"
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || otp.length < 6}
              className="w-full py-3 rounded-xl bg-primary text-white text-xs font-semibold shadow-md glow-primary hover:bg-primary-hover transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying Code...</span>
                </>
              ) : (
                <>
                  <span>Verify OTP & Enter Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  setStep('email');
                  setOtp('');
                  setErrorMsg(null);
                }}
                className="text-[11px] text-foreground-muted hover:text-foreground flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Change Email</span>
              </button>

              <button
                type="button"
                onClick={handleResend}
                disabled={isLoading}
                className="text-[11px] text-secondary hover:underline cursor-pointer disabled:opacity-50"
              >
                Resend Code
              </button>
            </div>
          </form>
        )}

        <div className="mt-6 pt-4 border-t border-border text-center">
          <p className="text-[11px] text-foreground-muted flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-secondary" />
            <span>Protected by Brevo Transactional Email & MongoDB Atlas</span>
          </p>
        </div>
      </div>

      <p className="text-xs text-foreground-muted mt-6">
        First-Year CSE-AIML College Study Suite
      </p>
    </div>
  );
};
