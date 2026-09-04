import { useState } from 'react';
import { LogOut, MessageCircle, Shield, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ContactModal } from './ContactModal';
import { StudioContent } from './StudioContent';
import { Wordmark } from './Wordmark';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from './Toast';
import { BUSINESS_INFO } from '../config/business';
import type { User } from '@supabase/supabase-js';

interface DashboardProps {
  user: User | null;
  /** True when the signed-in user has the admin role. */
  isAdmin?: boolean;
  /** Return to the admin dashboard (only supplied for admins). */
  onBackToAdmin?: () => void;
}

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function Dashboard({ user, isAdmin = false, onBackToAdmin }: DashboardProps) {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const { toasts, removeToast, success, error } = useToast();

  const fullName: string = user?.user_metadata?.full_name || '';
  const firstName = fullName.split(' ')[0] || user?.email?.split('@')[0] || 'there';

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <>
      <ToastContainer toasts={toasts} onClose={removeToast} />
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        userEmail={user?.email || ''}
        userName={fullName || user?.email?.split('@')[0] || 'User'}
        onSuccess={success}
        onError={error}
      />

      <div className="min-h-screen bg-foam">
        <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur-sm">
          <div className="mx-auto flex max-w-work items-center justify-between gap-3 px-4 py-3">
            <Wordmark />
            <nav className="flex items-center gap-1" aria-label="Member">
              {isAdmin && onBackToAdmin && (
                <button onClick={onBackToAdmin} className="btn-quiet" aria-label="Back to admin">
                  <Shield className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden sm:inline">Admin</span>
                </button>
              )}
              <button onClick={() => setIsContactModalOpen(true)} className="btn-quiet" aria-label="Send a message">
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Message</span>
              </button>
              <a
                href={BUSINESS_INFO.links.calendar}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary py-2"
                aria-label="Book a session"
              >
                <Calendar className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Book</span>
              </a>
              <button onClick={handleSignOut} className="btn-quiet text-ink-2 hover:text-ink" aria-label="Sign out">
                <LogOut className="h-4 w-4" aria-hidden="true" />
                <span className="hidden md:inline">Sign out</span>
              </button>
            </nav>
          </div>
        </header>

        {/* Hero: one photograph, the greeting, and the two facts a member needs most */}
        <section className="relative h-[300px] sm:h-[380px]">
          <picture>
            <source srcSet="/hero-reformer.webp" type="image/webp" />
            <img
              src="/hero-reformer.png"
              alt="Noël Bethea guiding a client through footwork on the reformer"
              className="absolute inset-0 h-full w-full object-cover object-[center_30%]"
            />
          </picture>
          <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0">
            <div className="mx-auto max-w-work px-4 pb-7 text-white">
              <h1 className="font-display text-3xl font-light text-white sm:text-4xl">
                {greeting()}, {firstName}
              </h1>
              <p className="mt-2 max-w-xl text-white/85">
                Sessions are private and by appointment, {BUSINESS_INFO.pricing.privateLesson.duration} minutes each,
                at {BUSINESS_INFO.address.street} in {BUSINESS_INFO.address.city}.
              </p>
            </div>
          </div>
        </section>

        <main className="mx-auto max-w-work px-4 py-8">
          <StudioContent onMessageClick={() => setIsContactModalOpen(true)} />
        </main>

        <footer className="border-t border-line">
          <div className="mx-auto flex max-w-work flex-col gap-2 px-4 py-6 text-sm text-ink-3 sm:flex-row sm:items-center sm:justify-between">
            <span>{BUSINESS_INFO.name} · {BUSINESS_INFO.address.full}</span>
            <span>{BUSINESS_INFO.phone} · {BUSINESS_INFO.email}</span>
          </div>
        </footer>
      </div>
    </>
  );
}
