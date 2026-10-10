import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, LogOut, Settings, X, LockKeyhole } from 'lucide-react';
import { EmailAuthProvider, reauthenticateWithCredential, sendPasswordResetEmail, updatePassword } from 'firebase/auth';
import { auth } from '../config/firebase';
import { useAccount } from '../auth/AccountContext';
import { accountError } from '../auth/messages';
import type { UserProfile } from '../types';
import { profileClasses, type ProfileSettings } from '../utils/profileSettings';
import { profileAvatarChoices } from '../utils/profileAvatars';
import { localDateKey } from '../utils/routineTasks';
import useDialogFocus from '../hooks/useDialogFocus';
import { useInstruction } from './InstructionLanguage';
import './profileSettings.css';
import DeleteAccountSection from './DeleteAccountSection';

export default function ProfileMenu({ profile, onSave, onLogOut }: {
  profile: UserProfile; onSave: (draft: ProfileSettings) => void; onLogOut: () => void;
}) {
  const [menu, setMenu] = useState(false);
  const [settings, setSettings] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!menu) return;
    const outside = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setMenu(false); };
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') { setMenu(false); trigger.current?.focus(); } };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape); };
  }, [menu]);
  return <div ref={root} className="relative flex min-w-0 items-center gap-1 border-l border-slate-200/70 pl-3"
    onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget) && !settings) setMenu(false); }}>
    <img src={profile.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(profile.name)}`}
      alt="" className="hidden h-9 w-9 shrink-0 rounded-full border border-slate-200/70 bg-white sm:block" />
    <div className="min-w-0"><button ref={trigger} type="button" aria-expanded={menu} aria-controls="profile-menu" onClick={() => setMenu(!menu)}
      className="profile-name-button" aria-label={`Account menu for ${profile.name}`}>
      <span className="block max-w-[105px] truncate text-xs font-bold sm:max-w-[160px]">{profile.name}</span>
      <ChevronDown size={14} className={`profile-chevron ${menu ? 'profile-chevron-open' : ''}`} />
    </button></div>
    {menu && <div id="profile-menu" className="profile-dropdown" aria-label="Account options">
      <button type="button" onClick={() => { setMenu(false); trigger.current?.focus(); setSettings(true); }}><Settings size={16} />Profile settings</button>
      <div className="my-1 border-t border-slate-100" />
      <button type="button" onClick={() => { setMenu(false); onLogOut(); }}><LogOut size={16} />Log out</button>
    </div>}
    {settings && createPortal(<ProfileSettingsDialog profile={profile} onSave={onSave} onClose={() => {
      setSettings(false); requestAnimationFrame(() => trigger.current?.focus({ preventScroll: true }));
    }} />, document.body)}
  </div>;
}

export function ProfileSettingsDialog({ profile, onSave, onClose }: {
  profile: UserProfile; onSave: (draft: ProfileSettings) => void; onClose: () => void;
}) {
  const { user, cloud } = useAccount();
  const [cloudState, setCloudState] = useState(() => cloud?.getState());
  useEffect(() => cloud?.watch(setCloudState), [cloud]);
  const t = useInstruction();
  const initial = () => ({ name: profile.name, username: profile.username || '', birthdate: profile.birthdate || '', classLevel: profile.classLevel, instructionLanguage: 'en', avatarUrl: profile.avatarUrl } as ProfileSettings);
  const [draft, setDraft] = useState(initial);
  const [baseline, setBaseline] = useState(initial);
  const [discard, setDiscard] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [avatarPage, setAvatarPage] = useState(0);
  const [currentPasswordEditable, setCurrentPasswordEditable] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [busy, setBusy] = useState(false);
  const dialog = useRef<HTMLDivElement>(null);
  const dirty = JSON.stringify(draft) !== JSON.stringify(baseline);
  const close = () => { if (busy) return; if (dirty) setDiscard(true); else onClose(); };
  useDialogFocus(true, dialog, close);
  useEffect(() => {
    if (discard) dialog.current?.querySelector<HTMLButtonElement>('[data-keep-editing]')?.focus();
  }, [discard]);
  useEffect(() => {
    const previous = document.body.style.overflow;
    const appRoot = document.getElementById('root');
    const wasInert = appRoot?.inert ?? false;
    if (appRoot) appRoot.inert = true;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; if (appRoot) appRoot.inert = wasInert; };
  }, []);
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);
  const change = (key: keyof ProfileSettings, value: string) => { setDraft(previous => ({ ...previous, [key]: value })); setMessage(''); setError(''); };
  const save = (event: React.FormEvent) => {
    event.preventDefault(); if (busy) return; setError(''); setMessage('');
    try {
      const saved = { ...draft, name: draft.name.trim(), username: draft.username?.trim() || '', birthdate: draft.birthdate || '' };
      onSave(saved); setDraft(saved); setBaseline({ ...saved });
      setMessage('Changes saved');
    } catch (failure) { setError(t(failure instanceof Error ? failure.message : 'Could not complete this action. Please try again.')); }
  };
  const passwordAction = async (recovery = false) => {
    if (busy) return;
    setPasswordError(''); setPasswordMessage('');
    if (!recovery && (newPassword.length < 8 || newPassword !== confirmPassword)) {
      setPasswordError(t('Use at least 8 characters and make both new passwords match.', 'অন্তত ৮ অক্ষর ব্যবহার করো এবং নতুন পাসওয়ার্ড দুটি একই দাও।')); return;
    }
    setBusy(true);
    try {
      if (!user.email || auth.currentUser?.uid !== user.uid) throw new Error('Account changed');
      if (recovery) {
        await sendPasswordResetEmail(auth, user.email);
        setPasswordMessage(t('Password recovery email sent. Check your inbox and spam folder.', 'পাসওয়ার্ড পরিবর্তনের ইমেইল পাঠানো হয়েছে। Inbox ও Spam দেখো।'));
      } else {
        await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, currentPassword));
        if (auth.currentUser?.uid !== user.uid) throw new Error('Account changed');
        await updatePassword(user, newPassword);
        setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
        setPasswordMessage(t('Your password has been changed.', 'তোমার পাসওয়ার্ড পরিবর্তন হয়েছে।'));
      }
    } catch (failure) { setPasswordError(t(accountError(failure))); }
    finally { setBusy(false); }
  };
  return <div className="profile-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) close(); }}>
    <div ref={dialog} role="dialog" aria-modal="true" aria-labelledby="profile-settings-title" tabIndex={-1} className="profile-settings-dialog">
      <header className="flex items-start justify-between gap-3 border-b border-indigo-100/60 bg-indigo-50/40 p-5 sm:p-6">
        <div><h2 id="profile-settings-title" className="font-display text-xl font-bold text-slate-800">Profile settings</h2>
          <p className="mt-1 text-sm text-slate-500">{t('Make this space feel like yours. Optional details can stay empty.', 'নিজের মতো করে সাজাও। ঐচ্ছিক তথ্য খালি রাখতে পারো।')}</p></div>
        <button type="button" aria-label="Close profile settings" className="profile-icon-button" disabled={busy} onClick={close}><X size={20} /></button>
      </header>
      {discard ? <div className="space-y-4 p-6"><p role="alert">{t('Discard your unsaved changes?', 'সংরক্ষণ না করা পরিবর্তনগুলো বাদ দেবে?')}</p>
        <div className="flex flex-wrap justify-end gap-2"><button data-keep-editing className="profile-secondary" onClick={() => { setDiscard(false); requestAnimationFrame(() => dialog.current?.querySelector<HTMLButtonElement>('[aria-label="Close profile settings"]')?.focus()); }}>Keep editing</button><button className="profile-primary" onClick={onClose}>Discard changes</button></div></div> :
      <div className="space-y-6 p-5 sm:p-6">
        <form onSubmit={save} className="space-y-4">
          <fieldset className="profile-avatar-picker">
            <legend className="text-sm font-semibold">Your avatar</legend>
            <div className="profile-avatar-heading">
              <img className="profile-avatar-preview" src={draft.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(profile.name)}`} alt="Selected avatar" />
              <p className="profile-help">Choose a character that feels like you.</p>
            </div>
            <div className="profile-avatar-grid">
              {profileAvatarChoices.slice(avatarPage * 12, avatarPage * 12 + 12).map((url, index) => <button
                key={url} type="button" className="profile-avatar-choice" aria-label={`Choose avatar ${avatarPage * 12 + index + 1}`}
                aria-pressed={draft.avatarUrl === url} onClick={() => change('avatarUrl', url)}>
                <img src={url} alt="" loading="lazy" />
              </button>)}
            </div>
            <div className="profile-avatar-footer">
              <a href="https://www.dicebear.com/styles/adventurer/" target="_blank" rel="noreferrer">Avatars by Lisa Wischofsky · DiceBear · CC BY 4.0</a>
              <button type="button" className="profile-secondary" onClick={() => setAvatarPage(page => (page + 1) % 5)}>More choices</button>
            </div>
          </fieldset>
          <div className="profile-fields">
            <label>Name<input value={draft.name} onChange={e => change('name', e.target.value)} required maxLength={80} autoComplete="name" /></label>
            <label>Username <span className="profile-optional">(optional)</span><input value={draft.username} onChange={e => change('username', e.target.value)} maxLength={40} autoComplete="off" /></label>
            <label>Birthdate <span className="profile-optional">(optional)</span><input type="date" min="1900-01-01" max={localDateKey(new Date())} value={draft.birthdate} onChange={e => change('birthdate', e.target.value)} autoComplete="bday" /></label>
            <label>Class<select value={draft.classLevel} onChange={e => change('classLevel', e.target.value)}>{profileClasses(profile.classLevel).map(level => <option key={level}>{level}</option>)}</select></label>
          </div>
          <p className="profile-help">{t('Username is a profile detail, not a login name. Birthdate is private; clear either field to remove it.', 'Username শুধু প্রোফাইলের তথ্য; লগইনের জন্য নয়। জন্মতারিখ ব্যক্তিগত। মুছতে চাইলে ঘর খালি করো।')}</p>
          {draft.classLevel !== profile.classLevel && <p className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3 text-sm text-indigo-800">{t('Your class syllabus will be displayed after saving. Existing homework, routines and progress stay saved; chapters outside that syllabus may not be shown.', 'Save করার পরে নির্বাচিত ক্লাসের সিলেবাস দেখাবে। Homework, রুটিন ও অগ্রগতি সংরক্ষিত থাকবে; এই সিলেবাসের বাইরের অধ্যায় নাও দেখাতে পারে।')}</p>}
          <label className="profile-field">Instruction language<select value={draft.instructionLanguage} onChange={e => change('instructionLanguage', e.target.value)}><option value="en">English</option><option value="bn" disabled>Bangla — Coming soon</option></select></label>
          <p className="profile-help">Bangla guidance is being prepared. Instructions are currently available in English.</p>
          {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
          {message && <p role="status" className={`text-sm ${cloudState?.error ? 'text-amber-700' : 'text-emerald-700'}`}>
            {cloudState ? cloudState.error ? 'Saved on this device · Online save pending' : cloudState.status : 'Saved on this device'}
          </p>}
          <div className="flex justify-end"><button className="profile-primary" type="submit" disabled={busy || JSON.stringify(draft) === JSON.stringify(baseline)}>Save changes</button></div>
        </form>
        <section className="border-t border-slate-100 pt-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold"><LockKeyhole size={16} />Change password</h3>
            <form id="profile-password" autoComplete="off" className="space-y-3 pt-4" onSubmit={event => { event.preventDefault(); void passwordAction(); }}>
              <p className="profile-help">{t('Verify your current password before choosing a new one.', 'নতুন পাসওয়ার্ড দেওয়ার আগে বর্তমান পাসওয়ার্ড যাচাই করো।')}</p>
              <label className="profile-field">Current password<input type="password" name="profile-current-password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} autoComplete="off" readOnly={!currentPasswordEditable} onFocus={() => { if (!currentPasswordEditable) { setCurrentPassword(''); setCurrentPasswordEditable(true); } }} placeholder="Enter your current password" required disabled={busy} data-lpignore="true" data-1p-ignore="true" /></label>
              <label className="profile-field">New password<input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} autoComplete="new-password" minLength={8} required disabled={busy} /></label>
              <label className="profile-field">Confirm new password<input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} autoComplete="new-password" minLength={8} required disabled={busy} /></label>
              {passwordError && <p role="alert" className="text-sm text-rose-700">{passwordError}</p>}
              {passwordMessage && <p role="status" className="text-sm text-emerald-700">{passwordMessage}</p>}
              <div className="flex flex-wrap items-center justify-between gap-3"><button type="button" className="text-sm font-semibold text-indigo-600 disabled:opacity-50" disabled={busy} onClick={() => void passwordAction(true)}>Forgot password?</button><button className="profile-primary" type="submit" disabled={busy}>{busy ? 'Please wait…' : 'Update password'}</button></div>
            </form>
        </section>
        <DeleteAccountSection user={user} cloud={cloud} disabled={busy} onBusyChange={setBusy} />
      </div>}
    </div>
  </div>;
}
