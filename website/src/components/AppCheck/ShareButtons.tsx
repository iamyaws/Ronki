/**
 * Share-actions for a saved evaluation permalink.
 *
 * The share text is deliberately first-person ("meine Bewertung von...")
 * to make the legal framing — this is one parent's view, not a Ronki
 * verdict — visible in any forwarded message.
 */

import { useState } from 'react';

interface Props {
  appName: string;
  url: string;
}

export function ShareButtons({ appName, url }: Props) {
  const [copied, setCopied] = useState(false);

  const text = `Meine Bewertung von ${appName} mit dem Ronki-App-Check`;
  const fullText = `${text}: ${url}`;

  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(fullText)}`;
  const emailHref = `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(fullText)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select + warn
      window.prompt('Link kopieren', url);
    }
  };

  return (
    <div className="space-y-4">
      {/* Permalink */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          readOnly
          aria-label="Permalink dieser Bewertung"
          value={url}
          className="flex-1 rounded-lg border border-teal/20 bg-cream px-3 py-2 text-sm text-ink/75 font-mono focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:border-transparent"
          onFocus={(e) => e.currentTarget.select()}
        />
        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? 'Link wurde kopiert' : 'Permalink kopieren'}
          className="rounded-lg border border-teal/30 bg-cream px-3 py-2 text-sm text-ink font-medium hover:bg-teal-dark hover:text-cream focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-cream transition-colors"
        >
          {copied ? 'Kopiert!' : 'Kopieren'}
        </button>
      </div>
      {/* Live-region announcement so screen readers hear the copy
          confirmation even when the visible label flips silently. */}
      <span role="status" aria-live="polite" className="sr-only">
        {copied ? 'Permalink wurde in die Zwischenablage kopiert.' : ''}
      </span>

      {/* Share buttons */}
      <div className="flex flex-wrap gap-3">
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-teal/10 px-4 py-2 text-sm text-ink font-medium hover:bg-teal hover:text-cream focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-cream transition-colors"
        >
          WhatsApp
        </a>
        <a
          href={emailHref}
          className="inline-flex items-center gap-2 rounded-full bg-teal/10 px-4 py-2 text-sm text-ink font-medium hover:bg-teal hover:text-cream focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-cream transition-colors"
        >
          Email
        </a>
      </div>
    </div>
  );
}
