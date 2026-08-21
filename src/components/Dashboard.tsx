import React, { useState } from 'react';
import { LogOut, Waves, MessageCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ContactModal } from './ContactModal';
import { StudioContent } from './StudioContent';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from './Toast';
import { BUSINESS_INFO } from '../config/business';
import type { User } from '@supabase/supabase-js';

interface DashboardProps {
  user: User | null;
}

export function Dashboard({ user }: DashboardProps) {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const { toasts, removeToast, success, error } = useToast();

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
        userName={user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
        onSuccess={success}
        onError={error}
      />
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-teal-600 rounded-full flex items-center justify-center">
                <Waves className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-light text-gray-800">{BUSINESS_INFO.name}</h1>
                <p className="text-sm text-gray-600">
                  Welcome, {user?.user_metadata?.full_name || user?.email}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsContactModalOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 text-teal-600 hover:text-teal-800 hover:bg-teal-50 rounded-lg transition-colors"
                title="Contact Us"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">Contact</span>
              </button>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-4 py-8">
          <StudioContent
            heading="Welcome to Your Pilates Journey"
            subheading="Experience the harmony of mind, body, and ocean breeze in our coastal studio"
            onMessageClick={() => setIsContactModalOpen(true)}
          />
        </div>
      </div>
    </>
  );
}
