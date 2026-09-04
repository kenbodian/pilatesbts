import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Eye, LogOut, Save } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { handleError, logError, isValidPhone, formatPhoneNumber } from '../utils/errorHandling';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from './Toast';
import { Wordmark } from './Wordmark';

interface WaiverFormProps {
  onComplete: () => void;
  userEmail: string;
  /**
   * Read-only preview for admins. Submitting would file the waiver under the
   * admin's own account, so saving is disabled in this mode.
   */
  previewMode?: boolean;
  /** Return to the admin dashboard (only supplied for admins). */
  onBackToAdmin?: () => void;
}

const STEPS = [
  { key: 'about', title: 'About you', blurb: 'How to reach you, and who you are.' },
  { key: 'emergency', title: 'Emergency contact', blurb: 'Someone to call if you need help during a session.' },
  { key: 'health', title: 'Your health', blurb: 'Noël uses this to adapt every exercise to you. Leave a field blank if it does not apply.' },
  { key: 'movement', title: 'Movement background', blurb: 'Where you are starting from and what you want from Pilates.' },
  { key: 'agreement', title: 'Preferences and agreement', blurb: 'A few optional details, then the liability waiver.' },
] as const;

const LAST_STEP = STEPS.length - 1;

export function WaiverForm({ onComplete, userEmail, previewMode = false, onBackToAdmin }: WaiverFormProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: userEmail,
    phone: '',
    dateOfBirth: '',
    occupation: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: '',
    medicalConditions: '',
    previousInjuries: '',
    currentPain: '',
    pregnancyStatus: '',
    fitnessLevel: '',
    exerciseHistory: '',
    pilatesExperience: '',
    fitnessGoals: '',
    preferredSchedule: '',
    howDidYouHear: '',
    additionalNotes: '',
    agreed: false,
  });
  const [loading, setLoading] = useState(false);
  const [existingForm, setExistingForm] = useState(false);
  const [step, setStep] = useState(0);
  const [furthestStep, setFurthestStep] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  const { toasts, removeToast, success, error: showError } = useToast();

  useEffect(() => {
    loadExistingForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const loadExistingForm = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('waivers')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data && !error) {
        setExistingForm(true);
        setFurthestStep(LAST_STEP);
        setFormData({
          fullName: data.full_name || '',
          email: data.email || userEmail,
          phone: data.phone || '',
          dateOfBirth: data.date_of_birth || '',
          occupation: data.occupation || '',
          emergencyContactName: data.emergency_contact_name || '',
          emergencyContactPhone: data.emergency_contact_phone || '',
          emergencyContactRelationship: data.emergency_contact_relationship || '',
          medicalConditions: data.medical_conditions || '',
          previousInjuries: data.previous_injuries || '',
          currentPain: data.current_pain || '',
          pregnancyStatus: data.pregnancy_status || '',
          fitnessLevel: data.fitness_level || '',
          exerciseHistory: data.exercise_history || '',
          pilatesExperience: data.pilates_experience || '',
          fitnessGoals: data.fitness_goals || '',
          preferredSchedule: data.preferred_schedule || '',
          howDidYouHear: data.how_did_you_hear || '',
          additionalNotes: data.additional_notes || '',
          agreed: true,
        });
      }
    } catch (error: unknown) {
      const appError = handleError(error);
      logError(appError, 'WaiverForm.loadExistingForm');
      showError('Failed to load existing waiver information');
    }
  };

  /** Native validation for the fields on screen, plus the phone rules the server expects. */
  const validateStep = (): boolean => {
    const form = formRef.current;
    if (form && !form.reportValidity()) return false;

    if (step === 0 && !isValidPhone(formData.phone)) {
      showError('Please enter a valid phone number (10 digits)');
      return false;
    }
    if (step === 1 && !isValidPhone(formData.emergencyContactPhone)) {
      showError('Please enter a valid emergency contact phone number (10 digits)');
      return false;
    }
    return true;
  };

  const goTo = (next: number) => {
    setStep(next);
    setFurthestStep(current => Math.max(current, next));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goNext = () => {
    if (!validateStep()) return;
    goTo(Math.min(step + 1, LAST_STEP));
  };

  const goBack = () => goTo(Math.max(step - 1, 0));

  const notifyStudio = async (event: 'submitted' | 'updated') => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const { data: { session } } = await supabase.auth.getSession();
      if (!supabaseUrl || !session) return;
      await fetch(`${supabaseUrl}/functions/v1/send-intake-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ event }),
      });
    } catch (notifyError) {
      console.warn('Intake notification could not be sent:', notifyError);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Enter on an earlier step advances instead of submitting
    if (step < LAST_STEP) {
      goNext();
      return;
    }

    // Admin preview: never write a client's form under the admin's account
    if (previewMode) return;
    if (!validateStep()) return;
    setLoading(true);

    try {
      // Validate phone numbers
      if (!isValidPhone(formData.phone)) {
        showError('Please enter a valid phone number (10 digits)');
        setLoading(false);
        return;
      }

      if (!isValidPhone(formData.emergencyContactPhone)) {
        showError('Please enter a valid emergency contact phone number (10 digits)');
        setLoading(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('You must be logged in to submit the waiver');
      }

      const formPayload = {
        user_id: user.id,
        full_name: formData.fullName,
        email: formData.email,
        phone: formatPhoneNumber(formData.phone),
        date_of_birth: formData.dateOfBirth,
        occupation: formData.occupation,
        emergency_contact_name: formData.emergencyContactName,
        emergency_contact_phone: formatPhoneNumber(formData.emergencyContactPhone),
        emergency_contact_relationship: formData.emergencyContactRelationship,
        medical_conditions: formData.medicalConditions || null,
        previous_injuries: formData.previousInjuries || null,
        current_pain: formData.currentPain || null,
        pregnancy_status: formData.pregnancyStatus || null,
        fitness_level: formData.fitnessLevel,
        exercise_history: formData.exerciseHistory || null,
        pilates_experience: formData.pilatesExperience || null,
        fitness_goals: formData.fitnessGoals,
        preferred_schedule: formData.preferredSchedule || null,
        how_did_you_hear: formData.howDidYouHear || null,
        additional_notes: formData.additionalNotes || null,
        signed_at: new Date().toISOString(),
      };

      if (existingForm) {
        const { error } = await supabase
          .from('waivers')
          .update(formPayload)
          .eq('user_id', user.id);

        if (error) throw error;

        success('Your information is updated');
      } else {
        const { error } = await supabase
          .from('waivers')
          .insert([formPayload]);

        if (error) throw error;

        success('Intake form saved. Welcome to the studio.');
      }

      // Let Noël know. The email is a courtesy, so a failure never blocks the client.
      notifyStudio(existingForm ? 'updated' : 'submitted');

      onComplete();
    } catch (error: unknown) {
      const appError = handleError(error);
      logError(appError, 'WaiverForm.handleSubmit');
      showError(appError.userMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const current = STEPS[step];

  return (
    <>
      <ToastContainer toasts={toasts} onClose={removeToast} />
      <div className="min-h-screen bg-foam">
        <header className="border-b border-line bg-white">
          <div className="mx-auto flex max-w-work items-center justify-between gap-3 px-4 py-3">
            <Wordmark tag="Intake form" />
            <div className="flex items-center gap-1">
              {onBackToAdmin && (
                <button type="button" onClick={onBackToAdmin} className="btn-quiet" aria-label="Back to admin">
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden sm:inline">Back to admin</span>
                </button>
              )}
              <button type="button" onClick={handleSignOut} className="btn-quiet text-ink-2 hover:text-ink" aria-label="Sign out">
                <LogOut className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-work px-4 py-8 lg:grid lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-10">
          {/* Step list. Numbered because the order is real: each step unlocks the next. */}
          <aside className="mb-6 lg:mb-0">
            <p className="eyebrow mb-3">
              {existingForm ? 'Update your information' : 'Before your first session'}
            </p>
            <ol className="hidden lg:block">
              {STEPS.map((s, i) => {
                const reachable = i <= furthestStep;
                const done = i < step || (existingForm && i !== step);
                return (
                  <li key={s.key}>
                    <button
                      type="button"
                      disabled={!reachable}
                      onClick={() => goTo(i)}
                      aria-current={i === step ? 'step' : undefined}
                      className={`flex w-full items-center gap-3 border-l-2 py-2 pl-3 text-left text-sm transition-colors ${
                        i === step
                          ? 'border-sea font-semibold text-ink'
                          : reachable
                            ? 'border-line text-ink-2 hover:text-ink'
                            : 'border-line text-ink-3'
                      }`}
                    >
                      <span
                        className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-xs ${
                          i === step ? 'bg-sea text-white' : done ? 'bg-sea-tint text-sea' : 'bg-sand text-ink-3'
                        }`}
                        aria-hidden="true"
                      >
                        {done && i !== step ? <Check className="h-3 w-3" /> : i + 1}
                      </span>
                      {s.title}
                    </button>
                  </li>
                );
              })}
            </ol>
            {/* Compact progress on small screens */}
            <div className="lg:hidden">
              <p className="text-sm text-ink-2">
                Step {step + 1} of {STEPS.length} · <span className="font-semibold text-ink">{current.title}</span>
              </p>
              <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-sand" aria-hidden="true">
                <div className="h-full bg-sea transition-[width]" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
              </div>
            </div>
          </aside>

          <main>
            {previewMode && (
              <div className="mb-6 flex items-start gap-3 rounded border border-amber-200 bg-amber-50 px-4 py-3">
                <Eye className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" aria-hidden="true" />
                <div className="text-sm text-amber-800">
                  <p className="font-semibold">Preview mode</p>
                  <p>
                    This is the form clients see when they sign up. Saving is disabled here,
                    because a submission would be filed under your admin account rather than
                    the client's.
                  </p>
                </div>
              </div>
            )}

            <form ref={formRef} onSubmit={handleSubmit} className="rounded-lg border border-line bg-white p-6 sm:p-8">
              <div className="mb-6 border-b border-line pb-4">
                <h1 className="text-2xl sm:text-3xl">{current.title}</h1>
                <p className="mt-1 max-w-read text-ink-2">{current.blurb}</p>
              </div>

              {step === 0 && (
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="fullName" className="label">Full name</label>
                    <input type="text" id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} className="field" autoComplete="name" required />
                  </div>
                  <div>
                    <label htmlFor="email" className="label">Email</label>
                    <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className="field" readOnly required />
                    <p className="hint">The email you signed in with.</p>
                  </div>
                  <div>
                    <label htmlFor="phone" className="label">Phone</label>
                    <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} className="field" autoComplete="tel" inputMode="tel" required />
                  </div>
                  <div>
                    <label htmlFor="dateOfBirth" className="label">Date of birth</label>
                    <input type="date" id="dateOfBirth" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className="field" autoComplete="bday" required />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="occupation" className="label">Occupation</label>
                    <input type="text" id="occupation" name="occupation" value={formData.occupation} onChange={handleChange} className="field" autoComplete="organization-title" required />
                    <p className="hint">Sitting all day and standing all day ask different things of the body.</p>
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="emergencyContactName" className="label">Contact name</label>
                    <input type="text" id="emergencyContactName" name="emergencyContactName" value={formData.emergencyContactName} onChange={handleChange} className="field" required />
                  </div>
                  <div>
                    <label htmlFor="emergencyContactPhone" className="label">Contact phone</label>
                    <input type="tel" id="emergencyContactPhone" name="emergencyContactPhone" value={formData.emergencyContactPhone} onChange={handleChange} className="field" inputMode="tel" required />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="emergencyContactRelationship" className="label">Relationship</label>
                    <input type="text" id="emergencyContactRelationship" name="emergencyContactRelationship" value={formData.emergencyContactRelationship} onChange={handleChange} placeholder="Spouse, parent, friend" className="field" required />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="grid gap-5">
                  <div>
                    <label htmlFor="medicalConditions" className="label">Medical conditions</label>
                    <textarea id="medicalConditions" name="medicalConditions" value={formData.medicalConditions} onChange={handleChange} rows={2} className="field" placeholder="Diabetes, heart disease, high blood pressure, osteoporosis" />
                  </div>
                  <div>
                    <label htmlFor="previousInjuries" className="label">Previous injuries or surgeries</label>
                    <textarea id="previousInjuries" name="previousInjuries" value={formData.previousInjuries} onChange={handleChange} rows={2} className="field" placeholder="Include the year if you remember it" />
                  </div>
                  <div>
                    <label htmlFor="currentPain" className="label">Current pain or discomfort</label>
                    <textarea id="currentPain" name="currentPain" value={formData.currentPain} onChange={handleChange} rows={2} className="field" placeholder="Where, and what makes it better or worse" />
                  </div>
                  <div>
                    <label htmlFor="pregnancyStatus" className="label">Pregnancy</label>
                    <input type="text" id="pregnancyStatus" name="pregnancyStatus" value={formData.pregnancyStatus} onChange={handleChange} placeholder="If it applies: pregnant (how far along) or postpartum" className="field" />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="grid gap-5">
                  <div>
                    <label htmlFor="fitnessLevel" className="label">Current activity level</label>
                    <select id="fitnessLevel" name="fitnessLevel" value={formData.fitnessLevel} onChange={handleChange} className="field" required>
                      <option value="">Choose one</option>
                      <option value="beginner">New to exercise, or returning after a long break</option>
                      <option value="intermediate">Regular exercise, two or three times a week</option>
                      <option value="advanced">Regular exercise, four or more times a week</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="exerciseHistory" className="label">Exercise history</label>
                    <textarea id="exerciseHistory" name="exerciseHistory" value={formData.exerciseHistory} onChange={handleChange} rows={2} className="field" placeholder="Walking, swimming, weights, yoga, dance" />
                  </div>
                  <div>
                    <label htmlFor="pilatesExperience" className="label">Pilates experience</label>
                    <textarea id="pilatesExperience" name="pilatesExperience" value={formData.pilatesExperience} onChange={handleChange} rows={2} className="field" placeholder="None is a fine answer" />
                  </div>
                  <div>
                    <label htmlFor="fitnessGoals" className="label">What do you want from Pilates?</label>
                    <textarea id="fitnessGoals" name="fitnessGoals" value={formData.fitnessGoals} onChange={handleChange} rows={3} className="field" placeholder="Less back pain, more strength, better balance, getting back to a sport" required />
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="grid gap-5">
                  <div>
                    <label htmlFor="preferredSchedule" className="label">Preferred times</label>
                    <input type="text" id="preferredSchedule" name="preferredSchedule" value={formData.preferredSchedule} onChange={handleChange} placeholder="Weekday mornings, weekend afternoons" className="field" />
                  </div>
                  <div>
                    <label htmlFor="howDidYouHear" className="label">How did you hear about the studio?</label>
                    <input type="text" id="howDidYouHear" name="howDidYouHear" value={formData.howDidYouHear} onChange={handleChange} placeholder="A friend, Instagram, a search" className="field" />
                  </div>
                  <div>
                    <label htmlFor="additionalNotes" className="label">Anything else</label>
                    <textarea id="additionalNotes" name="additionalNotes" value={formData.additionalNotes} onChange={handleChange} rows={3} className="field" />
                  </div>

                  <div className="rounded border border-sand-deep bg-sand p-5">
                    <h2 className="font-sans text-base font-semibold text-ink">Liability waiver</h2>
                    <p className="mt-2 max-w-read text-sm leading-relaxed text-ink-2">
                      I acknowledge that participation in Pilates classes and related activities involves inherent risks of injury.
                      I voluntarily assume all risks and release Pilates by the Sea, its instructors, and staff from any liability
                      for injuries or damages that may occur during participation. I confirm that I am physically fit to participate
                      and have consulted with a healthcare provider if necessary.
                    </p>
                    <label className="mt-4 flex items-start gap-3">
                      <input
                        type="checkbox"
                        name="agreed"
                        checked={formData.agreed}
                        onChange={handleChange}
                        className="mt-1 h-4 w-4 rounded border-line text-sea focus:ring-sea"
                        required
                      />
                      <span className="text-sm text-ink">
                        I have read and agree to this liability waiver and release.
                      </span>
                    </label>
                  </div>
                </div>
              )}

              <div className="mt-8 flex items-center justify-between gap-3 border-t border-line pt-5">
                <button type="button" onClick={goBack} disabled={step === 0} className="btn-secondary">
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  Back
                </button>

                {step < LAST_STEP ? (
                  <button type="button" onClick={goNext} className="btn-primary">
                    Continue
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading || !formData.agreed || previewMode}
                    className="btn-primary"
                  >
                    {loading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-b-2 border-white" aria-hidden="true" />
                        Saving
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" aria-hidden="true" />
                        {previewMode ? 'Saving disabled in preview' : existingForm ? 'Save changes' : 'Sign and continue'}
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          </main>
        </div>
      </div>
    </>
  );
}
