import React, { useState } from 'react';
import { X, Send, Mail } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { handleError, logError } from '../utils/errorHandling';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  userName: string;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export function ContactModal({
  isOpen,
  onClose,
  userEmail,
  userName,
  onSuccess,
  onError,
}: ContactModalProps) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!subject.trim() || !message.trim()) {
        onError('Please fill in all fields');
        setLoading(false);
        return;
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Configuration error. Please try again later.');
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/send-contact-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          userEmail,
          userName,
          subject: subject.trim(),
          message: message.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to send message');
      }

      onSuccess('Message sent successfully! We\'ll get back to you soon.');
      setSubject('');
      setMessage('');
      onClose();
    } catch (error: unknown) {
      const appError = handleError(error);
      logError(appError, 'ContactModal.handleSubmit');
      onError(appError.userMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setSubject('');
      setMessage('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-teal-600 p-6 rounded-t-2xl relative">
          <button
            onClick={handleClose}
            disabled={loading}
            className="absolute top-4 right-4 text-white hover:bg-white/20 p-2 rounded-full transition-colors disabled:opacity-50"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-light text-white">Contact Us</h2>
              <p className="text-blue-100 text-sm">We'd love to hear from you</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="contact-subject" className="block text-sm font-medium text-gray-700 mb-1">
              Subject *
            </label>
            <input
              type="text"
              id="contact-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="What can we help you with?"
              required
              disabled={loading}
              maxLength={100}
            />
            <p className="text-xs text-gray-500 mt-1">{subject.length}/100</p>
          </div>

          <div>
            <label htmlFor="contact-message" className="block text-sm font-medium text-gray-700 mb-1">
              Message *
            </label>
            <textarea
              id="contact-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              placeholder="Tell us what's on your mind..."
              required
              disabled={loading}
              maxLength={1000}
            />
            <p className="text-xs text-gray-500 mt-1">{message.length}/1000</p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>From:</strong> {userName} ({userEmail})
            </p>
            <p className="text-xs text-blue-600 mt-1">
              We'll send a confirmation to this email and respond within 24 hours.
            </p>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !subject.trim() || !message.trim()}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-lg hover:from-blue-700 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Send Message</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
