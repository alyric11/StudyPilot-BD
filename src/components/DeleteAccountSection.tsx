import { useEffect, useRef, useState } from 'react';
import { EmailAuthProvider, reauthenticateWithCredential, signOut, type User } from 'firebase/auth';
import { auth } from '../config/firebase';
import { accountError } from '../auth/messages';
import type { StudentCloud } from '../cloud/studentCloud';
import { deleteAccountBrowserData } from '../utils/deleteAccountBrowserData';
import './profileSettings.css';

export default function DeleteAccountSection({ user, cloud, disabled = false, onBusyChange }: {
  user: User; cloud?: StudentCloud; disabled?: boolean; onBusyChange?: (busy: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const passwordField = useRef<HTMLInputElement>(null);
  useEffect(() => { if (open) passwordField.current?.focus(); }, [open]);
  const openConfirmation = async () => {
    if (busy || disabled) return;
    setBusy(true); onBusyChange?.(true); setError('');
    try {
      if (auth.currentUser?.uid !== user.uid) throw new Error('Account changed');
      const token = await user.getIdToken();
      const response = await fetch('/api/account-deletion', {
        headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(15000),
      });
      const result = await response.json();
      if (!response.ok || !result.enabled) {
        setError(result.error || 'Account deletion has not been activated yet. Your account has not been changed.');
        return;
      }
      setOpen(true);
    } catch {
      setError('Could not check account deletion. Check your connection and try again. Your account has not been changed.');
    } finally { setBusy(false); onBusyChange?.(false); }
  };
  const removeAccount = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy || disabled || confirmation !== 'DELETE' || !password) return;
    setBusy(true); onBusyChange?.(true); setError('');
    let started = false;
    try {
      if (!user.email || auth.currentUser?.uid !== user.uid) throw new Error('Account changed');
      await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, password));
      const token = await user.getIdToken(true);
      const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
      const status = await fetch('/api/account-deletion', { headers, signal: AbortSignal.timeout(15000) });
      const available = await status.json();
      if (!status.ok || !available.enabled) {
        setError(available.error || 'Account deletion is being prepared. Please contact the project owner for help deleting your account.'); return;
      }
      if (auth.currentUser?.uid !== user.uid) throw new Error('Account changed');
      // Unmounts the editor and stops its queue before any destructive request.
      cloud?.suspendForDeletion(); started = true;
      const response = await fetch('/api/account-deletion', {
        method: 'DELETE', headers, body: JSON.stringify({ confirmation }), signal: AbortSignal.timeout(45000),
      });
      const result = await response.json();
      if (!response.ok || result.deleted !== true) throw new Error(result.error || 'Deletion could not be confirmed. Please retry.');
      try { deleteAccountBrowserData(localStorage, sessionStorage, user.uid, user.email); }
      finally { await signOut(auth); }
    } catch (failure) {
      const message = started
        ? failure instanceof Error && failure.name !== 'TimeoutError' && failure.name !== 'TypeError'
          ? failure.message : 'Deletion could not be confirmed. Please retry account deletion. Cloud saving stays paused.'
        : accountError(failure);
      if (started) cloud?.deletionFailed(message);
      setError(message);
    } finally { setBusy(false); onBusyChange?.(false); setPassword(''); }
  };
  return <section className="border-t border-slate-100 pt-4">
    <h3 className="text-sm font-semibold text-slate-700">Delete account</h3>
    <p className="mt-2 text-sm leading-relaxed text-slate-500">Permanently remove your account and personal study records. This cannot be undone.</p>
    {!open ? <>
      <button type="button" disabled={disabled || busy} className="profile-delete mt-3" onClick={() => void openConfirmation()}>{busy ? 'Checking availability…' : 'Delete account'}</button>
      {error && <p role="alert" className="mt-2 text-sm text-rose-700">{error}</p>}
    </> :
      <form onSubmit={event => void removeAccount(event)} className="mt-3 space-y-3 rounded-xl border border-rose-100 bg-rose-50/40 p-4">
        <p className="text-sm leading-relaxed text-slate-600">Your profile, routines, homework, notes, progress and personal video saves will be deleted. Shared chapter overviews and video libraries will stay available to everyone.</p>
        <label className="profile-field">Current password<input ref={passwordField} type="password" autoComplete="off" required value={password} onChange={event => setPassword(event.target.value)} disabled={busy} /></label>
        <label className="profile-field">Type DELETE to confirm<input type="text" autoComplete="off" autoCapitalize="off" spellCheck={false} required value={confirmation} onChange={event => setConfirmation(event.target.value)} disabled={busy} /></label>
        {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
        <div className="flex flex-wrap justify-end gap-2">
          <button type="button" className="profile-secondary" disabled={busy} onClick={() => { setOpen(false); setPassword(''); setConfirmation(''); setError(''); }}>Cancel</button>
          <button type="submit" className="profile-delete" disabled={busy || disabled || !password || confirmation !== 'DELETE'}>{busy ? 'Deleting…' : 'Permanently delete account'}</button>
        </div>
      </form>}
  </section>;
}
