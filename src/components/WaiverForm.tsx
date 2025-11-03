import React, { useState, useEffect } from 'react';
import { FileText, Save, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface WaiverFormProps {
  onComplete: () => void;
  userEmail: string;
}

export function WaiverForm({ onComplete, userEmail }: WaiverFormProps) {
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

  useEffect(() => {
    loadExistingForm();
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
    } catch (error) {
      console.error('Error loading existing form:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const formPayload = {
        user_id: user.id,
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        date_of_birth: formData.dateOfBirth,
        occupation: formData.occupation,
        emergency_contact_name: formData.emergencyContactName,
        emergency_contact_phone: formData.emergencyContactPhone,
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
      } else {
        const { error } = await supabase
          .from('waivers')
          .insert([formPayload]);

        if (error) throw error;
      }

      onComplete();
    } catch (error) {
      console.error('Error saving waiver:', error);
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

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="relative">
            <button
              onClick={handleSignOut}
              className="absolute top-0 right-0 p-2 text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-2 text-sm"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>

            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <h1 className="text-2xl font-light text-gray-800 mb-2">
                {existingForm ? 'Update Client Information & Waiver' : 'Client Information & Liability Waiver'}
              </h1>
              <p className="text-gray-600 text-sm">
                {existingForm ? 'Update your information below' : 'Please complete this form before accessing your member dashboard'}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                    required
                    readOnly
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="occupation" className="block text-sm font-medium text-gray-700 mb-1">
                    Occupation *
                  </label>
                  <input
                    type="text"
                    id="occupation"
                    name="occupation"
                    value={formData.occupation}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Emergency Contact</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="emergencyContactName" className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Name *
                  </label>
                  <input
                    type="text"
                    id="emergencyContactName"
                    name="emergencyContactName"
                    value={formData.emergencyContactName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="emergencyContactPhone" className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Phone *
                  </label>
                  <input
                    type="tel"
                    id="emergencyContactPhone"
                    name="emergencyContactPhone"
                    value={formData.emergencyContactPhone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="emergencyContactRelationship" className="block text-sm font-medium text-gray-700 mb-1">
                    Relationship *
                  </label>
                  <input
                    type="text"
                    id="emergencyContactRelationship"
                    name="emergencyContactRelationship"
                    value={formData.emergencyContactRelationship}
                    onChange={handleChange}
                    placeholder="e.g., Spouse, Parent, Friend"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Medical Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Medical Information</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="medicalConditions" className="block text-sm font-medium text-gray-700 mb-1">
                    Medical Conditions
                  </label>
                  <textarea
                    id="medicalConditions"
                    name="medicalConditions"
                    value={formData.medicalConditions}
                    onChange={handleChange}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Diabetes, heart disease, high blood pressure, etc..."
                  />
                </div>
                <div>
                  <label htmlFor="previousInjuries" className="block text-sm font-medium text-gray-700 mb-1">
                    Previous Injuries or Surgeries
                  </label>
                  <textarea
                    id="previousInjuries"
                    name="previousInjuries"
                    value={formData.previousInjuries}
                    onChange={handleChange}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Any past injuries or surgeries we should know about..."
                  />
                </div>
                <div>
                  <label htmlFor="currentPain" className="block text-sm font-medium text-gray-700 mb-1">
                    Current Pain or Discomfort
                  </label>
                  <textarea
                    id="currentPain"
                    name="currentPain"
                    value={formData.currentPain}
                    onChange={handleChange}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Any areas of pain or discomfort..."
                  />
                </div>
                <div>
                  <label htmlFor="pregnancyStatus" className="block text-sm font-medium text-gray-700 mb-1">
                    Pregnancy Status
                  </label>
                  <input
                    type="text"
                    id="pregnancyStatus"
                    name="pregnancyStatus"
                    value={formData.pregnancyStatus}
                    onChange={handleChange}
                    placeholder="If applicable, are you pregnant or postpartum?"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Fitness Background */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Fitness Background</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="fitnessLevel" className="block text-sm font-medium text-gray-700 mb-1">
                    Current Fitness Level *
                  </label>
                  <select
                    id="fitnessLevel"
                    name="fitnessLevel"
                    value={formData.fitnessLevel}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select fitness level...</option>
                    <option value="beginner">Beginner - New to exercise</option>
                    <option value="intermediate">Intermediate - Regular exercise 2-3x/week</option>
                    <option value="advanced">Advanced - Regular exercise 4+ times/week</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="exerciseHistory" className="block text-sm font-medium text-gray-700 mb-1">
                    Exercise History
                  </label>
                  <textarea
                    id="exerciseHistory"
                    name="exerciseHistory"
                    value={formData.exerciseHistory}
                    onChange={handleChange}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="What types of exercise have you done in the past?"
                  />
                </div>
                <div>
                  <label htmlFor="pilatesExperience" className="block text-sm font-medium text-gray-700 mb-1">
                    Pilates Experience
                  </label>
                  <textarea
                    id="pilatesExperience"
                    name="pilatesExperience"
                    value={formData.pilatesExperience}
                    onChange={handleChange}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Any previous Pilates experience?"
                  />
                </div>
                <div>
                  <label htmlFor="fitnessGoals" className="block text-sm font-medium text-gray-700 mb-1">
                    Fitness Goals *
                  </label>
                  <textarea
                    id="fitnessGoals"
                    name="fitnessGoals"
                    value={formData.fitnessGoals}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="What do you hope to achieve through Pilates?"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Additional Information</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="preferredSchedule" className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Schedule
                  </label>
                  <input
                    type="text"
                    id="preferredSchedule"
                    name="preferredSchedule"
                    value={formData.preferredSchedule}
                    onChange={handleChange}
                    placeholder="e.g., Mornings on weekdays, Weekend afternoons"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="howDidYouHear" className="block text-sm font-medium text-gray-700 mb-1">
                    How Did You Hear About Us?
                  </label>
                  <input
                    type="text"
                    id="howDidYouHear"
                    name="howDidYouHear"
                    value={formData.howDidYouHear}
                    onChange={handleChange}
                    placeholder="Social media, friend referral, etc."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="additionalNotes" className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Notes
                  </label>
                  <textarea
                    id="additionalNotes"
                    name="additionalNotes"
                    value={formData.additionalNotes}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Anything else you'd like us to know?"
                  />
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-gray-800 mb-3">Liability Waiver</h3>
              <p className="text-sm text-gray-700 leading-relaxed mb-4">
                I acknowledge that participation in Pilates classes and related activities involves inherent risks of injury. 
                I voluntarily assume all risks and release Pilates by the Sea, its instructors, and staff from any liability 
                for injuries or damages that may occur during participation. I confirm that I am physically fit to participate 
                and have consulted with a healthcare provider if necessary.
              </p>
              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  name="agreed"
                  checked={formData.agreed}
                  onChange={handleChange}
                  className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  required
                />
                <span className="text-sm text-gray-700">
                  I have read, understood, and agree to the terms of this liability waiver and release *
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || !formData.agreed}
              className="w-full bg-gradient-to-r from-blue-600 to-teal-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Saving Waiver...
                </div>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Complete Waiver & Continue
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}