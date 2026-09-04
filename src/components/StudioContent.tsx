import { Calendar, MapPin, MessageCircle, Phone } from 'lucide-react';
import { BUSINESS_INFO, getPhoneLink, getEmailLink } from '../config/business';

interface StudioContentProps {
  /** Opens the in-app contact form. Without it, the message tile falls back to email. */
  onMessageClick?: () => void;
}

const SERVICES: Array<{ name: string; description: string }> = [
  {
    name: 'Classical Pilates',
    description: 'The traditional method: precise movement, alignment, and controlled breathing to build core strength and flexibility.',
  },
  {
    name: 'Tower sessions',
    description: 'Springs and bars that lengthen, strengthen, and restore. Good for core stability, posture, and ease of movement.',
  },
  {
    name: 'Mat work',
    description: 'Floor-based exercises using body weight and small props to strengthen the core and improve posture.',
  },
  {
    name: 'Reformer for healthy aging',
    description: 'Gentle reformer work for mature adults, to keep mobility, strength, and balance.',
  },
  {
    name: 'Therapeutic Pilates',
    description: 'Sessions built around injury recovery, chronic pain, and rehabilitation.',
  },
  {
    name: 'Pre- and postnatal',
    description: 'Safe, gentle work for expecting and new mothers: strength for pregnancy, support for recovery.',
  },
];

const BEFORE_YOU_ARRIVE: Array<{ term: string; detail: string }> = [
  {
    term: 'Sessions',
    detail: `Private, ${BUSINESS_INFO.pricing.privateLesson.duration} minutes, $${BUSINESS_INFO.pricing.privateLesson.price}. By appointment only.`,
  },
  {
    term: 'Cancellation',
    detail: '24 hours’ notice to cancel or reschedule. Late cancellations and no-shows are charged the full session fee.',
  },
  {
    term: 'Payment',
    detail: 'Due at booking or before the session.',
  },
  {
    term: 'Arrival',
    detail: 'Please arrive on time. Sessions cannot be extended for late arrivals.',
  },
  {
    term: 'What to wear',
    detail: 'Comfortable, form-fitting clothing without zippers. Grip socks are recommended.',
  },
  {
    term: 'Your health',
    detail: 'A completed intake form is required before your first session. Tell Noël about any change in health, injury, or surgery.',
  },
  {
    term: 'In the studio',
    detail: 'Phones silenced. Water bottles with lids only. Equipment is sanitized after every use.',
  },
];

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-6 border-b border-line pb-3">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-1 text-2xl sm:text-3xl">{title}</h2>
    </div>
  );
}

function Photo({
  base,
  alt,
  caption,
  ratio = 'aspect-[3/2]',
  position = 'object-center',
}: {
  base: string;
  alt: string;
  caption?: string;
  ratio?: string;
  position?: string;
}) {
  const ext = base.startsWith('noel') ? 'jpg' : 'png';
  return (
    <figure className="m-0">
      <picture>
        <source srcSet={`/${base}.webp`} type="image/webp" />
        <img
          src={`/${base}.${ext}`}
          alt={alt}
          loading="lazy"
          className={`${ratio} w-full rounded object-cover ${position}`}
        />
      </picture>
      {caption && <figcaption className="mt-2 text-sm text-ink-3">{caption}</figcaption>}
    </figure>
  );
}

export function StudioContent({ onMessageClick }: StudioContentProps) {
  const tileBase = 'flex items-start gap-3 rounded border p-4 text-left transition-colors';
  const tile = `${tileBase} border-line bg-white hover:border-sea`;
  const tilePrimary = `${tileBase} border-sea bg-sea text-white hover:border-sea-deep hover:bg-sea-deep`;
  const tileIcon = 'mt-0.5 h-5 w-5 flex-shrink-0';

  return (
    <div className="space-y-14">
      {/* 1. The three things a member comes here to do */}
      <section aria-label="Actions" className="grid gap-3 sm:grid-cols-3">
        <a
          href={BUSINESS_INFO.links.calendar}
          target="_blank"
          rel="noopener noreferrer"
          className={tilePrimary}
        >
          <Calendar className={`${tileIcon} text-white`} aria-hidden="true" />
          <span>
            <span className="block font-semibold">Book a session</span>
            <span className="block text-sm text-white/85">Opens the studio calendar</span>
          </span>
        </a>
        <a
          href={BUSINESS_INFO.links.googleMaps}
          target="_blank"
          rel="noopener noreferrer"
          className={tile}
        >
          <MapPin className={`${tileIcon} text-sea`} aria-hidden="true" />
          <span>
            <span className="block font-semibold text-ink">Find the studio</span>
            <span className="block text-sm text-ink-2">{BUSINESS_INFO.address.street}, {BUSINESS_INFO.address.city}</span>
          </span>
        </a>
        {onMessageClick ? (
          <button type="button" onClick={onMessageClick} className={tile}>
            <MessageCircle className={`${tileIcon} text-sea`} aria-hidden="true" />
            <span>
              <span className="block font-semibold text-ink">Message Noël</span>
              <span className="block text-sm text-ink-2">Replies within a day</span>
            </span>
          </button>
        ) : (
          <a href={getEmailLink(BUSINESS_INFO.email, 'Question about Pilates by the Sea')} className={tile}>
            <MessageCircle className={`${tileIcon} text-sea`} aria-hidden="true" />
            <span>
              <span className="block font-semibold text-ink">Email the studio</span>
              <span className="block text-sm text-ink-2">{BUSINESS_INFO.email}</span>
            </span>
          </a>
        )}
      </section>

      {/* 2. Policies, written the way the studio already writes them */}
      <section>
        <SectionHeading eyebrow="Good to know" title="Before you arrive" />
        <dl className="divide-y divide-line">
          {BEFORE_YOU_ARRIVE.map(({ term, detail }) => (
            <div key={term} className="grid gap-1 py-3 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-6">
              <dt className="font-semibold text-ink">{term}</dt>
              <dd className="m-0 max-w-read text-ink-2">{detail}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-sm text-ink-3">
          Questions? Call <a href={getPhoneLink(BUSINESS_INFO.phone)} className="text-sea hover:text-sea-deep">{BUSINESS_INFO.phone}</a>.
        </p>
      </section>

      {/* 3. What a session can be */}
      <section>
        <SectionHeading eyebrow="Private sessions" title="Ways to work" />
        <p className="mb-6 max-w-read text-ink-2">
          Every session is one-to-one and shaped around you. These are the directions a session can take;
          most clients move between them over time.
        </p>
        <ul className="grid gap-x-10 sm:grid-cols-2">
          {SERVICES.map(({ name, description }) => (
            <li key={name} className="border-t border-line py-4">
              <h3 className="font-sans text-base font-semibold text-ink">{name}</h3>
              <p className="mt-1 text-ink-2">{description}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* 4. The studio */}
      <section>
        <SectionHeading eyebrow="Ormond by the Sea" title="The studio" />
        <p className="mb-6 max-w-read text-ink-2">
          Pilates by the Sea is an instructor-owned studio in Ormond by the Sea, on the Florida coast.
          Sessions are private: one client and one instructor on the reformer, tower, or mat, with the ocean
          in view.
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          <Photo base="session-instruction" alt="Noël adjusting a client's arm position during a standing exercise" caption="Private instruction" />
          <Photo base="studio-tower" alt="The tower and reformer in the studio, with a full-length mirror" caption="Tower and reformer" position="object-[center_60%]" />
          <Photo base="session-reformer" alt="Noël guiding a client's arm along the reformer bar" caption="On the reformer" />
        </div>
      </section>

      {/* 5. The instructor */}
      <section>
        <SectionHeading eyebrow="Your instructor" title="Noël Bethea" />
        <div className="grid gap-6 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] sm:items-start">
          <Photo base="noel-portrait" alt="Noël Bethea in the studio" ratio="aspect-[4/5]" position="object-[center_25%]" />
          <div className="max-w-read space-y-4 text-ink-2">
            <p>
              Noël is comprehensively certified in classical Pilates, with 700 hours of training in the
              classical repertoire. Her background is in dance, and she holds a Master of Science in Education.
            </p>
            <p>
              She teaches tailored private sessions that focus on strength, alignment, and flow, and she brings
              both the artistry of dance and the patience of a teacher to every one of them.
            </p>
            <p className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
              <a href={getPhoneLink(BUSINESS_INFO.phone)} className="inline-flex items-center gap-1.5 text-sea hover:text-sea-deep">
                <Phone className="h-4 w-4" aria-hidden="true" />{BUSINESS_INFO.phone}
              </a>
              <a href={getEmailLink(BUSINESS_INFO.email)} className="inline-flex items-center gap-1.5 text-sea hover:text-sea-deep">
                <MessageCircle className="h-4 w-4" aria-hidden="true" />{BUSINESS_INFO.email}
              </a>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
