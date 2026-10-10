import { lazy, Suspense, useEffect, useMemo, useState, type FormEvent } from "react";
import { createUserWithEmailAndPassword, onIdTokenChanged, reload, sendEmailVerification,
  sendPasswordResetEmail, signInWithEmailAndPassword, signOut, type User } from "firebase/auth";
import { auth } from "../config/firebase";
import { SSC_CLASSES_ENABLED } from '../config/classAvailability';
import { accountError } from "./messages";
import { canImportLegacy, createAccountStorage, importLegacy } from "../utils/accountStorage";
import WelcomePage from '../components/WelcomePage';
import AccountDialog from '../components/AccountDialog';
import { Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react';
import { accountDestination, publicPageFromPath, publicPaths, type PublicPage } from '../utils/publicNavigation';

const CloudSession = lazy(() => import('../cloud/CloudSession'));

const field = "account-field";
const primary = "welcome-button account-primary";
const secondary = "account-secondary";

function StudentSession({ user }: { user: User }) {
  const account = useMemo(() => ({ user, storage: createAccountStorage(localStorage, user.uid) }), [user]);
  const [ready, setReady] = useState(false);
  const [offerImport, setOfferImport] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    try {
      setOfferImport(!account.storage.getItem("sp_profile") && !localStorage.getItem(`studypilot:user:${user.uid}:__cloud_ready`) && canImportLegacy(localStorage, user.email || ""));
      setReady(true);
    } catch { setError("Browser storage is unavailable. Enable site storage and reload to protect your study records."); }
  }, [account]);
  if (!ready || offerImport) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <section className="w-full max-w-md rounded-2xl bg-white p-6 shadow-sm space-y-4">
        <h1 className="text-xl font-bold text-slate-800">Your study records</h1>
        {error && <p role="alert" className="text-red-700">{error}</p>}
        {offerImport && <>
          <p className="text-slate-600">An existing student profile on this browser uses your verified email. Would you like to copy its study records into this account? The original records will be kept.</p>
          <button className={primary} onClick={() => {
            try { importLegacy(localStorage, user.uid, user.email || ""); setOfferImport(false); }
            catch { setError("Could not import your records. The original records are still safe. Please retry or start fresh."); }
          }}>Import my existing records</button>
          <button className={secondary} onClick={() => setOfferImport(false)}>Start fresh for this account</button>
        </>}
        <button className={secondary} onClick={() => void signOut(auth).catch(e => setError(accountError(e)))}>Log out</button>
      </section>
    </div>
  );
  return <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50" role="status">Opening your study space…</div>}><CloudSession user={user} /></Suspense>;
}

export default function AccountGate() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState<PublicPage>(() => publicPageFromPath(window.location.pathname));
  const mode = page === 'signup' ? 'signup' : page === 'reset' ? 'reset' : 'login';
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [resendAfter, setResendAfter] = useState(0);
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const onBack = () => {
      setPage(publicPageFromPath(window.location.pathname));
      setError(''); setNotice(''); setPassword(''); setConfirmation(''); setShowPassword(false);
    };
    window.addEventListener('popstate', onBack);
    return () => window.removeEventListener('popstate', onBack);
  }, []);
  useEffect(() => {
    if (loading) return;
    const destination = accountDestination(page, !!user?.emailVerified, !!user);
    if (destination !== page) {
      window.history.replaceState(null, '', publicPaths[destination]);
      setPage(destination);
    }
  }, [loading, page, user?.uid, user?.emailVerified]);
  useEffect(() => {
    document.title = page === 'welcome' ? 'StudyPilot BD — Your study companion' : page === 'app' ? 'StudyPilot BD' : `${page === 'verify' ? 'Verify your email' : mode === 'signup' ? 'Sign up' : mode === 'reset' ? 'Reset password' : 'Sign in'} · StudyPilot BD`;
  }, [page, mode]);
  useEffect(() => onIdTokenChanged(auth, next => {
    setUser(next); setLoading(false); setPassword(""); setConfirmation("");
  }, e => { setError(accountError(e)); setLoading(false); }), []);
  useEffect(() => {
    if (resendAfter <= Date.now()) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [resendAfter]);
  const run = async (action: () => Promise<void>) => {
    if (busy) return;
    setBusy(true); setError(""); setNotice("");
    try { await action(); } catch (e) { setError(accountError(e)); }
    finally { setBusy(false); }
  };
  const sendVerification = async (target: User) => {
    await sendEmailVerification(target, { url: `${window.location.origin}/app` });
    setResendAfter(Date.now() + 60000); setNow(Date.now());
    setNotice("Verification email sent. Check your inbox and spam folder, then return here.");
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (mode === "signup" && password !== confirmation) { setError("Passwords do not match."); return; }
    void run(async () => {
      const address = email.trim();
      if (mode === "reset") {
        await sendPasswordResetEmail(auth, address, { url: `${window.location.origin}/signin` });
        setNotice("If an account uses this email, a password reset link will arrive. Check your inbox and spam folder.");
      } else if (mode === "signup") {
        const result = await createUserWithEmailAndPassword(auth, address, password);
        setUser(result.user);
        navigate('verify');
        await sendVerification(result.user);
      } else {
        const result = await signInWithEmailAndPassword(auth, address, password);
        setUser(result.user);
        navigate(result.user.emailVerified ? 'app' : 'verify');
      }
    });
  };
  const navigate = (next: PublicPage, replace = false) => {
    if (next !== page) window.history[replace ? 'replaceState' : 'pushState'](null, '', publicPaths[next]);
    setPage(next); setError(""); setNotice(""); setPassword(""); setConfirmation(""); setShowPassword(false);
  };
  const switchMode = (next: typeof mode) => navigate(next);
  if (loading && page !== 'welcome') return <div className="min-h-screen flex items-center justify-center bg-slate-50" role="status">Checking your account…</div>;
  if (user?.emailVerified && page === 'app') return <StudentSession key={user.uid} user={user} />;
  if (!loading && accountDestination(page, !!user?.emailVerified, !!user) !== page) return <div className="min-h-screen flex items-center justify-center bg-slate-50" role="status">Checking your account…</div>;
  const title = page === 'verify' ? 'Verify your email' : mode === 'signup' ? 'Sign up' : mode === 'reset' ? 'Reset your password' : 'Sign in';
  return (
    <>
      <WelcomePage onNavigate={navigate} />
      {!loading && page !== 'welcome' && <AccountDialog title={title} busy={busy} onClose={() => navigate('welcome', true)}>
      <div className="account-dialog-body">
        {!SSC_CLASSES_ENABLED && page !== 'verify' && mode !== 'reset' && <p className="text-sm leading-relaxed text-slate-500">The current student trial is for Classes 11–12.</p>}
        {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {notice && <p role="status" className="rounded-xl bg-indigo-50 p-3 text-sm text-indigo-800">{notice}</p>}
        {page === 'verify' && user ? <>
          <p className="text-sm text-slate-600">Verify <strong className="break-all">{user.email}</strong> using the link in your email before opening your study space.</p>
          <button disabled={busy} className={primary} onClick={() => void run(async () => {
            await reload(user);
            if (user.emailVerified) { await user.getIdToken(true); setUser(auth.currentUser); }
            else setNotice("Your email is not verified yet. Open the email link first, then try again.");
          })}>{busy ? "Please wait…" : "I've verified my email"}</button>
          <button disabled={busy || now < resendAfter} className={secondary} onClick={() => void run(() => sendVerification(user))}>
            {now < resendAfter ? "Wait a moment before resending" : "Resend verification email"}
          </button>
          <button disabled={busy} className={secondary} onClick={() => void run(async () => { await signOut(auth); switchMode("login"); })}>Use another account</button>
        </> : <>
          {user && mode === 'login' && <div className="rounded-xl bg-violet-50 p-3 text-sm leading-relaxed text-slate-600">
            <p>This browser is signed in as <strong className="break-all">{user.email}</strong>.</p>
            <button type="button" disabled={busy} className={secondary} onClick={() => navigate('app')}>Open my account</button>
          </div>}
          <form onSubmit={submit} className="account-form">
            <div>
              <label htmlFor="account-email">Email address</label>
              <div className="account-input-wrap"><Mail size={18} aria-hidden="true" />
                <input autoFocus id="account-email" placeholder="Enter your email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={e => setEmail(e.target.value)} className={field} disabled={busy} />
              </div>
            </div>
            {mode !== "reset" && <div>
              <label htmlFor="account-password">Password</label>
              <div className="account-input-wrap account-password-wrap"><LockKeyhole size={18} aria-hidden="true" />
                <input id="account-password" placeholder="Enter your password" type={showPassword ? 'text' : 'password'} autoComplete={mode === "signup" ? "new-password" : "current-password"} aria-describedby={mode === 'signup' ? 'account-password-hint' : undefined} minLength={mode === "signup" ? 8 : undefined} required value={password} onChange={e => setPassword(e.target.value)} className={field} disabled={busy} />
                <button type="button" className="account-password-toggle" aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} disabled={busy} onClick={() => setShowPassword(value => !value)}>{showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}</button>
              </div>
              {mode === "signup" && <p id="account-password-hint" className="account-field-hint">Use at least 8 characters.</p>}
            </div>}
            {mode === "signup" && <div>
              <label htmlFor="account-confirmation">Confirm password</label>
              <div className="account-input-wrap"><LockKeyhole size={18} aria-hidden="true" />
                <input id="account-confirmation" placeholder="Enter your password again" type={showPassword ? 'text' : 'password'} autoComplete="new-password" required value={confirmation} onChange={e => setConfirmation(e.target.value)} className={field} disabled={busy} />
              </div>
            </div>}
            {mode === 'login' && <div className="account-forgot"><button type="button" disabled={busy} className={secondary} onClick={() => switchMode('reset')}>Forgot password?</button></div>}
            <button disabled={busy} className={primary} type="submit">{busy ? "Please wait…" : mode === "signup" ? "Create account" : mode === "reset" ? "Send reset link" : "Sign in"}</button>
          </form>
        </>}
      </div>
      {page !== 'verify' && <footer className="account-dialog-footer">
        {mode === 'login' ? <><span>Don't have an account?</span><button disabled={busy} className={secondary} onClick={() => switchMode('signup')}>Sign up</button></> : <><span>{mode === 'signup' ? 'Already have an account?' : 'Remember your password?'}</span><button disabled={busy} className={secondary} onClick={() => switchMode('login')}>Sign in</button></>}
      </footer>}
      </AccountDialog>}
    </>
  );
}
