import React, { useState } from 'react';
import { Waves, Lock, LogIn } from 'lucide-react';

interface LandingPageProps {
  onPasscodeSuccess: () => void;
  hasUser?: boolean;
  onSkipToApp?: () => void;
}

export function LandingPage({ onPasscodeSuccess, hasUser, onSkipToApp }: LandingPageProps) {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const apiUrl = `${supabaseUrl}/functions/v1/verify-passcode`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: passcode }),
      });

      const data = await response.json();

      if (data.valid) {
        onPasscodeSuccess();
      } else {
        setError('Invalid passcode. Please try again.');
      }
    } catch (error) {
      console.error('Error verifying passcode:', error);
      setError('Unable to verify passcode. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url('https://images.pexels.com/photos/416978/pexels-photo-416978.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />
      
      <div className="relative max-w-md w-full bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-teal-600 rounded-full mb-4">
            <Waves className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-light text-gray-800 mb-2">
            Pilates by the Sea
          </h1>
          <p className="text-gray-600 text-sm leading-relaxed">
            Welcome to your wellness sanctuary by the ocean. 
            Enter your passcode to access exclusive member content.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="passcode" className="block text-sm font-medium text-gray-700 mb-2">
              Member Passcode
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                id="passcode"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter passcode"
                required
              />
            </div>
            {error && (
              <p className="text-red-500 text-sm mt-2 animate-pulse">{error}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-teal-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Verifying...
              </div>
            ) : (
              'Access Member Portal'
            )}
          </button>
        </form>

        {hasUser && onSkipToApp && (
          <div className="mt-6">
            <button
              onClick={onSkipToApp}
              className="w-full flex items-center justify-center gap-2 text-gray-600 py-3 px-4 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-all duration-200"
            >
              <LogIn className="w-5 h-5" />
              Continue as Existing Member
            </button>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-center text-xs text-gray-500">
            For assistance, please contact your instructor
          </p>
        </div>
      </div>
    </div>
  );
}