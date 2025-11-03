import React from 'react';
import { stripeProducts } from '../stripe-config';
import { ProductCard } from '../components/stripe/ProductCard';
import { SubscriptionStatus } from '../components/stripe/SubscriptionStatus';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';

export function ProductsPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Sign in Required
            </h1>
            <p className="text-gray-600 mb-6">
              Please sign in to view and book Pilates sessions.
            </p>
            <Link
              to="/login"
              className="block w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Pilates Sessions
          </h1>
          <p className="text-lg text-gray-600">
            Book your personalized Pilates sessions with our certified instructors
          </p>
        </div>

        <div className="mb-8">
          <SubscriptionStatus />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {stripeProducts.map((product) => (
            <ProductCard key={product.priceId} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}