import { BUSINESS_INFO } from '../config/business';

interface WordmarkProps {
  /** Small label after the name, e.g. "Admin". */
  tag?: string;
  /** Larger setting for the login page. */
  size?: 'default' | 'large';
  /** Use on dark or photographic backgrounds. */
  inverted?: boolean;
  className?: string;
}

/** The one studio name, set the one way, on every screen. */
export function Wordmark({ tag, size = 'default', inverted = false, className = '' }: WordmarkProps) {
  const color = inverted ? 'text-white' : 'text-ink';
  const tagColor = inverted ? 'text-white/70' : 'text-ink-3';
  const nameSize = size === 'large' ? 'text-4xl' : 'text-lg sm:text-xl';

  return (
    <span className={`inline-flex items-baseline gap-2 ${className}`}>
      <span className={`whitespace-nowrap font-display font-light tracking-tight ${nameSize} ${color}`}>
        {BUSINESS_INFO.name}
      </span>
      {tag && <span className={`eyebrow ${tagColor}`}>{tag}</span>}
    </span>
  );
}
