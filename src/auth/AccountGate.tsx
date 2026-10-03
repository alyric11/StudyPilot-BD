import { useEffect, useMemo, useState, type FormEvent } from "react";
import { createUserWithEmailAndPassword, onIdTokenChanged, reload, sendEmailVerification,
  sendPasswordResetEmail, signInWithEmailAndPassword, signOut, type User } from "firebase/auth";
import { auth } from "../config/firebase";
import CloudSession from "../cloud/CloudSession";
import { accountError } from "./messages";
import { canImportLegacy, createAccountStorage, importLegacy } from "../utils/accountStorage";

const field = "mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500";
const primary = "w-full rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50";
const secondary = "rounded-lg px-2 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-50 disabled:opacity-50";

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
  return <CloudSession user={user} />;
}

export default function AccountGate() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"login" | "signup" | "reset">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [resendAfter, setResendAfter] = useState(0);
  const [now, setNow] = useState(Date.now());
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
    await sendEmailVerification(target, { url: window.location.origin });
    setResendAfter(Date.now() + 60000); setNow(Date.now());
    setNotice("Verification email sent. Check your inbox and spam folder, then return here.");
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (mode === "signup" && password !== confirmation) { setError("Passwords do not match."); return; }
    void run(async () => {
      const address = email.trim();
      if (mode === "reset") {
        await sendPasswordResetEmail(auth, address, { url: window.location.origin });
        setNotice("If an account uses this email, a password reset link will arrive. Check your inbox and spam folder.");
      } else if (mode === "signup") {
        const result = await createUserWithEmailAndPassword(auth, address, password);
        await sendVerification(result.user);
      } else {
        await signInWithEmailAndPassword(auth, address, password);
      }
    });
  };
  const switchMode = (next: typeof mode) => {
    setMode(next); setError(""); setNotice(""); setPassword(""); setConfirmation("");
  };
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50" role="status">Checking your account…</div>;
  if (user?.emailVerified) return <StudentSession key={user.uid} user={user} />;
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-10">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-5">
        <p className="text-sm font-bold text-indigo-600">StudyPilot BD</p>
        <h1 className="text-2xl font-bold text-slate-800">{user ? "Verify your email" : mode === "signup" ? "Create your student account" : mode === "reset" ? "Reset your password" : "Welcome back"}</h1>
        {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {notice && <p role="status" className="rounded-xl bg-indigo-50 p-3 text-sm text-indigo-800">{notice}</p>}
        {user ? <>
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
          <form onSubmit={submit} className="space-y-4">
            <label className="block text-sm font-semibold text-slate-700" htmlFor="account-email">Email address
              <input id="account-email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={e => setEmail(e.target.value)} className={field} disabled={busy} />
            </label>
            {mode !== "reset" && <label className="block text-sm font-semibold text-slate-700" htmlFor="account-password">Password
              <input id="account-password" type="password" autoComplete={mode === "signup" ? "new-password" : "current-password"} minLength={mode === "signup" ? 8 : undefined} required value={password} onChange={e => setPassword(e.target.value)} className={field} disabled={busy} />
              {mode === "signup" && <span className="mt-1 block text-xs font-normal text-slate-500">Use at least 8 characters.</span>}
            </label>}
            {mode === "signup" && <label className="block text-sm font-semibold text-slate-700" htmlFor="account-confirmation">Confirm password
              <input id="account-confirmation" type="password" autoComplete="new-password" required value={confirmation} onChange={e => setConfirmation(e.target.value)} className={field} disabled={busy} />
            </label>}
            <button disabled={busy} className={primary} type="submit">{busy ? "Please wait…" : mode === "signup" ? "Create account" : mode === "reset" ? "Send reset link" : "Log in"}</button>
          </form>
          <div className="flex flex-wrap justify-between gap-2">
            <button disabled={busy} className={secondary} onClick={() => switchMode(mode === "login" ? "signup" : "login")}>{mode === "login" ? "Create an account" : "Back to login"}</button>
            {mode === "login" && <button disabled={busy} className={secondary} onClick={() => switchMode("reset")}>Forgot password?</button>}
          </div>
        </>}
        <p className="text-xs leading-relaxed text-slate-500">Sign in to access your study records across devices. Your email must be verified before opening your study space.</p>
      </section>
    </main>
  );
}
