import { Link } from 'react-router-dom';
import { Waves } from 'lucide-react';
import { StudioContent } from './StudioContent';
import { BUSINESS_INFO, getPhoneLink, getEmailLink } from '../config/business';

export function PublicHomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-teal-600 rounded-full flex items-center justify-center flex-shrink-0">
              <Waves className="w-6 h-6 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-xl font-light text-gray-800 truncate">{BUSINESS_INFO.name}</p>
              <p className="text-sm text-gray-600 hidden sm:block">Ormond Beach, Florida</p>
            </div>
          </div>
          <Link
            to="/login"
            className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
          >
            Sign In
          </Link>
        </div>
      </header>

      <section className="relative">
        <picture>
          <source srcSet="/outside.webp" type="image/webp" />
          <img
            src="/outside.png"
            alt="Pilates by the Sea studio on the Florida coast"
            className="w-full h-[420px] object-cover object-center"
          />
        </picture>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-6xl mx-auto px-4 pb-10 w-full text-white">
            <h1 className="text-3xl md:text-5xl font-light mb-3">
              Pilates by the Sea
            </h1>
            <p className="text-base md:text-lg text-white/90 max-w-2xl mb-6">
              Private classical Pilates with Noël Bethea — 700-hour comprehensive certification —
              in an intimate coastal studio in Ormond Beach. New clients are welcome by inquiry.
            </p>
            <a
              href={getPhoneLink(BUSINESS_INFO.phone)}
              className="inline-flex items-center px-5 py-2.5 bg-white text-teal-800 text-sm font-medium rounded-lg hover:bg-teal-50 transition-colors"
            >
              {BUSINESS_INFO.phone}
            </a>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <StudioContent showBooking={false} />
      </div>

      <footer className="border-t border-gray-200 bg-white mt-4">
        <div className="max-w-6xl mx-auto px-4 py-8 text-sm text-gray-600 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <p>
            {BUSINESS_INFO.name} · {BUSINESS_INFO.address.full}
          </p>
          <p>
            <a href={getPhoneLink(BUSINESS_INFO.phone)} className="hover:text-gray-900">{BUSINESS_INFO.phone}</a>
            {' · '}
            <a href={getEmailLink(BUSINESS_INFO.email)} className="hover:text-gray-900">{BUSINESS_INFO.email}</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
