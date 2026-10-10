import type { MouseEvent } from 'react';
import { ArrowRight, BookOpen, CalendarDays, CirclePlay, ListChecks } from 'lucide-react';
import { SSC_CLASSES_ENABLED } from '../config/classAvailability';
import './welcome.css';

interface WelcomePageProps {
  onNavigate: (page: 'login' | 'signup' | 'app') => void;
}

export default function WelcomePage({ onNavigate }: WelcomePageProps) {
  const open = (page: 'login' | 'signup' | 'app') => (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault(); onNavigate(page);
  };
  const startLink = (className: string, label = 'Sign up') =>
    <a className={className} href="/signup" onClick={open('signup')}>{label}<ArrowRight size={17} aria-hidden="true" /></a>;

  return (
    <div className="welcome-page">
      <a className="welcome-skip" href="#welcome-main">Skip to content</a>
      <header className="welcome-header welcome-width">
        <a href="/" className="welcome-brand" aria-label="StudyPilot BD home"><span aria-hidden="true">SP</span>StudyPilot BD</a>
        <nav aria-label="Main navigation" className="welcome-nav">
          <a className="welcome-section-link" href="#features">What you can do</a>
          <a className="welcome-section-link" href="#how-it-works">How it works</a>
          <a className="welcome-signin" href="/signin" onClick={open('login')}>Sign in</a>
          {startLink('welcome-button welcome-button-small')}
        </nav>
      </header>

      <main id="welcome-main">
        <section className="welcome-hero welcome-width" aria-labelledby="welcome-heading">
          <div className="welcome-hero-mark" aria-hidden="true"><BookOpen size={42} strokeWidth={1.5} /><span>SP</span></div>
          <div className="welcome-hero-copy">
            <h1 id="welcome-heading">Welcome to <em>StudyPilot BD</em></h1>
            <p className="welcome-tagline">A calmer way to plan, learn and make progress.</p>
            <p className="welcome-description">Bring your subjects, chapter videos and homework together.<br className="welcome-desktop-break" /> Build your study routine at a pace that works for you.</p>
            <div className="welcome-actions">
              {startLink('welcome-button', 'Get started')}
              <a className="welcome-learn-more" href="#features">Learn more</a>
            </div>
            {!SSC_CLASSES_ENABLED && <p className="welcome-trial">Currently welcoming Class 11–12 students.</p>}
          </div>

        </section>

        <section id="features" className="welcome-features welcome-width" aria-labelledby="welcome-features-heading">
          <div className="welcome-section-heading"><p className="welcome-eyebrow">Made for your everyday study</p><h2 id="welcome-features-heading">Less to keep track of.<br />More space to understand.</h2><p>A few useful tools, brought together around your subjects and chapters.</p></div>
          <div className="welcome-feature-grid">
            <article className="welcome-feature welcome-feature-video"><span className="welcome-feature-icon"><CirclePlay size={25} /></span><span className="welcome-feature-kicker">Watch & understand</span><h3>Find lessons for<br />your chapter</h3><p>Explore selected video lessons, discover more from the chapter library and save your own useful links.</p><span className="welcome-feature-detail">Your lessons. Your favourites. Your pace.</span></article>
            <article className="welcome-feature welcome-feature-planner"><span className="welcome-feature-icon"><CalendarDays size={25} /></span><span className="welcome-feature-kicker">Plan & practise</span><h3>Keep your study<br />day organized</h3><p>Bring scheduled sessions and homework together in the Daily Planner, with a clear view of what is next.</p></article>
            <article className="welcome-feature welcome-feature-chapter"><span className="welcome-feature-icon"><ListChecks size={25} /></span><span className="welcome-feature-kicker">Explore & reflect</span><h3>Make each<br />chapter your own</h3><p>Use available chapter overviews, note difficult points and track your progress with a flexible study checklist.</p></article>
          </div>
        </section>

        <section id="how-it-works" className="welcome-how welcome-width" aria-labelledby="welcome-how-heading">
          <div className="welcome-section-heading"><p className="welcome-eyebrow">A simple beginning</p><h2 id="welcome-how-heading">Settle in. Start where you are.</h2></div>
          <ol className="welcome-steps">
            <li><span>01</span><h3>Create your account</h3><p>Sign up with your email and verify it to get started.</p></li>
            <li><span>02</span><h3>Set up your academic profile</h3><p>Choose your class and academic group to find your subjects.</p></li>
            <li><span>03</span><h3>Start studying</h3><p>Explore a chapter, find a lesson or plan your next study session.</p></li>
          </ol>
          <div className="welcome-start"><div><h2>Your next study day starts here.</h2><p>A calmer place to bring it all together.</p></div>{startLink('welcome-button')}</div>
        </section>
      </main>
      <footer className="welcome-footer welcome-width"><div><a className="welcome-brand" href="/"><span aria-hidden="true">SP</span>StudyPilot BD</a><p>A nonprofit project supporting students in Bangladesh.</p></div><span>Made for learning, at your own pace.</span></footer>
    </div>
  );
}
