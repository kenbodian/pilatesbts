import React, { useState, useEffect } from 'react';
import { X, Smartphone } from 'lucide-react';

// Shows a one-time "Add to Home Screen" nudge on Safari/iOS
export function InstallBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Only show on iOS Safari, and only if not already installed
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isStandalone = ('standalone' in navigator) && (navigator as any).standalone;
    const dismissed = localStorage.getItem('pwa-banner-dismissed');

    if (isIOS && !isStandalone && !dismissed) {
      // Small delay so it doesn't flash immediately on load
      const t = setTimeout(() => setShow(true), 3000);
      return () => clearTimeout(t);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem('pwa-banner-dismissed', '1');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-gray-900 text-white rounded-2xl shadow-xl p-4 z-50 flex items-start space-x-3">
      <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
        <Smartphone className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1">
        <p className="font-semibold text-sm">Add to Home Screen</p>
        <p className="text-xs text-gray-400 mt-0.5">
          Tap <span className="text-white">Share</span> then <span className="text-white">"Add to Home Screen"</span> to use this app offline on your iPad.
        </p>
      </div>
      <button onClick={dismiss} className="text-gray-400 hover:text-white flex-shrink-0 mt-0.5">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
