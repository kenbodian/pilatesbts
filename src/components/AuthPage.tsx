import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { handleError, logError, validatePassword } from '../utils/errorHandling';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from './Toast';
import { Wordmark } from './Wordmark';
import { BUSINESS_INFO, getPhoneLink } from '../config/business';

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { toasts, removeToast, success, error: showError } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate password strength on signup
      if (!isLogin) {
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
          setError(passwordValidation.errors[0]);
          setLoading(false);
          return;
        }

        if (!fullName.trim()) {
          setError('Please enter your full name');
          setLoading(false);
          return;
        }
      }

      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        success('Signed in');
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });
        if (error) throw error;

        if (data.user && data.session) {
          success('Account created. Next, complete your intake form.');

          // Send welcome email using the user's session token
          // This runs asynchronously and won't block the signup flow
          try {
            const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

            if (supabaseUrl) {
              await fetch(`${supabaseUrl}/functions/v1/send-signup-emails`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${data.session.access_token}`,
                },
                body: JSON.stringify({
                  userEmail: email,
                  userName: fullName,
                }),
              });
            }
          } catch (emailError) {
            // Email sending is optional - don't block signup if it fails
            console.warn('Welcome email could not be sent:', emailError);
          }
        }
      }
    } catch (error: unknown) {
      const appError = handleError(error);
      logError(appError, 'AuthPage.handleSubmit');
      setError(appError.userMessage);
      showError(appError.userMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ToastContainer toasts={toasts} onClose={removeToast} />
      <div className="min-h-screen bg-foam lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        {/* Photograph panel */}
        <aside className="relative hidden lg:block">
          <picture>
            <source srcSet="/ocean.webp" type="image/webp" />
            <img
              src="/ocean.png"
              alt="Morning light on the beach near the studio in Ormond by the Sea"
              className="absolute inset-0 h-full w-full object-cover object-[center_40%]"
            />
          </picture>
          <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-10 text-white">
            <Wordmark size="large" inverted />
            <p className="mt-3 max-w-sm text-white/85">
              Private classical Pilates in Ormond by the Sea. One client, one instructor, one session at a time.
            </p>
          </div>
        </aside>

        {/* Form panel */}
        <main className="flex min-h-screen items-center justify-center px-6 py-12 lg:min-h-0">
          <div className="w-full max-w-sm">
            <div className="mb-8 lg:hidden">
              <Wordmark size="large" />
            </div>

            <h1 className="text-3xl">{isLogin ? 'Sign in' : 'Create your account'}</h1>
            <p className="mt-2 text-ink-2">
              {isLogin
                ? 'Your member area: booking, studio details, and your intake form.'
                : 'New clients complete a short intake form after signing up.'}
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              {!isLogin && (
                <div>
                  <label htmlFor="fullName" className="label">Full name</label>
                  <input
                    type="text"
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="field"
                    autoComplete="name"
                    required
                  />
                </div>
              )}

              <div>
                <label htmlFor="email" className="label">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="field"
                  autoComplete="email"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="label">Password</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="field"
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  required
                  minLength={6}
                />
                {!isLogin && (
                  <p className="hint">At least 8 characters, with a number and a special character.</p>
                )}
              </div>

              {error && (
                <p className="text-sm text-red-700" role="alert">{error}</p>
              )}

              <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-b-2 border-white" aria-hidden="true" />
                    {isLogin ? 'Signing in' : 'Creating account'}
                  </>
                ) : (
                  isLogin ? 'Sign in' : 'Create account'
                )}
              </button>
            </form>

            <div className="mt-6 flex items-center justify-between gap-4 text-sm">
              <button
                type="button"
                onClick={() => { setIsLogin(!isLogin); setError(''); }}
                className="font-medium text-sea hover:text-sea-deep"
              >
                {isLogin ? 'New here? Create an account' : 'Already a member? Sign in'}
              </button>
              <a href={getPhoneLink(BUSINESS_INFO.phone)} className="whitespace-nowrap text-ink-3 hover:text-ink">
                {BUSINESS_INFO.phone}
              </a>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
