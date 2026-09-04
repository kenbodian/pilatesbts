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

      if (!supabaseUrl) {
        throw new Error('Configuration error. Please try again later.');
      }

      // Get the user's session token for authentication
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('You must be logged in to send a message.');
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/send-contact-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          userEmail,
          userName,
          subject: subject.trim(),
          message: message.trim(),
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) {
        // Provide more specific error message
        let errorMsg = data.error || 'Failed to send message';

        if (response.status === 500) {
          errorMsg = 'Server error. Please check that environment variables (RESEND_API_KEY, ADMIN_EMAIL) are set in Supabase.';
        } else if (response.status === 404) {
          errorMsg = 'Contact service not found. Please ensure the Edge Function is deployed.';
        }

        throw new Error(errorMsg);
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
        className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-sea p-6 rounded-t-lg relative">
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
              <h2 className="text-2xl text-white">Message the studio</h2>
              <p className="text-white/80 text-sm">Noël replies within a day</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="contact-subject" className="block text-sm font-medium text-ink-2 mb-1">
              Subject *
            </label>
            <input
              type="text"
              id="contact-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="field"
              placeholder="Scheduling, a question about sessions, anything else"
              required
              disabled={loading}
              maxLength={100}
            />
            <p className="text-xs text-ink-3 mt-1">{subject.length}/100</p>
          </div>

          <div>
            <label htmlFor="contact-message" className="block text-sm font-medium text-ink-2 mb-1">
              Message *
            </label>
            <textarea
              id="contact-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              className="field resize-none"
              placeholder=""
              required
              disabled={loading}
              maxLength={1000}
            />
            <p className="text-xs text-ink-3 mt-1">{message.length}/1000</p>
          </div>

          <div className="bg-sea-tint p-4 rounded border border-line">
            <p className="text-sm text-sea-deep">
              <strong>From:</strong> {userName} ({userEmail})
            </p>
            <p className="text-xs text-sea mt-1">
              We'll send a confirmation to this email and respond within 24 hours.
            </p>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !subject.trim() || !message.trim()}
              className="btn-primary flex-1"
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
