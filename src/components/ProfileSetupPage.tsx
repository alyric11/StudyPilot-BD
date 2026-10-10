import type { ReactNode } from 'react';
import { LogOut } from 'lucide-react';
import ProfileSetup from './ProfileSetup';
import type { UserProfile } from '../types';

interface ProfileSetupPageProps {
  accountEmail: string;
  onSave: (profile: UserProfile) => void;
  onLogOut: () => void;
  feedback?: ReactNode;
}

export default function ProfileSetupPage({ accountEmail, onSave, onLogOut, feedback }: ProfileSetupPageProps) {
  return (
    <div className="profile-setup-page">
      <header className="profile-setup-header">
        <div className="profile-setup-brand">
          <span className="profile-setup-monogram" aria-hidden="true">SP</span>
          <span>StudyPilot BD</span>
        </div>
        <button type="button" className="profile-setup-logout" onClick={onLogOut}>
          <LogOut size={16} aria-hidden="true" /> Log out
        </button>
      </header>
      <main className="profile-setup-layout">
        <ProfileSetup initialProfile={null} accountEmail={accountEmail} onSave={onSave} feedback={feedback} />
      </main>
    </div>
  );
}
