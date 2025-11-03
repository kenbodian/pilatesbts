import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, ClipboardList, Shield, CreditCard, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { SubscriptionStatus } from '../components/stripe/SubscriptionStatus';

export function HomePage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-xl font-semibold text-gray-900">Pilates by the Sea</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user?.email}</span>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Pilates by the Sea
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your comprehensive platform for waivers, assessments, and studio management.
          </p>
        </div>

        {/* Subscription Status */}
        <div className="max-w-md mx-auto mb-8">
          <SubscriptionStatus />
        </div>

        <div className="max-w-4xl mx-auto grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Waiver Card */}
          <Link
            to="/waiver"
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 border border-gray-200"
          >
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Digital Waiver</h3>
            <p className="text-gray-600">
              Complete your liability waiver quickly and securely before your session.
            </p>
          </Link>

          {/* Assessment Card */}
          <Link
            to="/assessment"
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 border border-gray-200"
          >
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4">
              <ClipboardList className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Health Assessment</h3>
            <p className="text-gray-600">
              Complete your health and fitness assessment to help us personalize your experience.
            </p>
          </Link>

          {/* Products Card */}
          <Link
            to="/products"
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 border border-gray-200"
          >
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4">
              <CreditCard className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Book Sessions</h3>
            <p className="text-gray-600">
              Browse and book your Pilates sessions with our certified instructors.
            </p>
          </Link>

          {/* Admin Card */}
          <Link
            to="/admin"
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 border border-gray-200"
          >
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-lg mb-4">
              <Shield className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Admin Panel</h3>
            <p className="text-gray-600">
              Manage waivers, assessments, and studio operations.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}