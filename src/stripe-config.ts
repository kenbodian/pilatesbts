export interface StripeProduct {
  priceId: string;
  name: string;
  description: string;
  mode: 'payment' | 'subscription';
}

export const stripeProducts: StripeProduct[] = [
  {
    priceId: 'price_1SPPbVQ9ktMY5jFpHLGXkYEd',
    name: 'Pilates Session',
    description: 'A 50-minute individual pilates session.',
    mode: 'payment',
  },
];