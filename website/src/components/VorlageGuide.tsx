import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { FAQPageSchema } from './JsonLd';

/**
 * Screen-only guide below a template preview: a picture of the real PDF,
 * a few short sections on how to use the sheet, and a small FAQ.
 *
 * The FAQ answers are plain strings on purpose. The same strings go into
 * the FAQPage JSON-LD, so what Google reads matches what the parent sees.
 */

export interface GuideSection {
  heading: string;
  body: ReactNode;
}

export interface GuideFaq {
  question: string;
  answer: string;
}

interface Props {
  /** Rendered page 1 of the PDF, e.g. "/vorlagen/previews/morgenroutine.png". */
  previewSrc: string;
  previewAlt: string;
  previewCaption: string;
  /** Intrinsic pixel size of the preview image. */
  previewWidth?: number;
  previewHeight?: number;
  sections?: GuideSection[];
  faq: GuideFaq[];
}

export function VorlageGuide({
  previewSrc,
  previewAlt,
  previewCaption,
  previewWidth = 662,
  previewHeight = 936,
  sections = [],
  faq,
}: Props) {
  return (
    <div className="max-w-3xl mx-auto px-6 pb-20">
      <div className="flex flex-col gap-10 sm:flex-row sm:items-start">
        <figure className="mx-auto w-full max-w-[15rem] shrink-0 sm:order-2 sm:mx-0 sm:w-56 sm:sticky sm:top-6">
          <img
            src={previewSrc}
            alt={previewAlt}
            width={previewWidth}
            height={previewHeight}
            loading="lazy"
            decoding="async"
            className="w-full h-auto rounded-lg border border-teal/10 bg-white"
            style={{ boxShadow: '0 14px 36px -18px rgba(45,90,94,0.35)' }}
          />
          <figcaption className="mt-3 text-center text-xs text-ink/55 leading-relaxed">
            {previewCaption}
          </figcaption>
        </figure>

        <div className="min-w-0 flex-1">
          {sections.map((section) => (
            <section key={section.heading} className="mb-10">
              <h2 className="font-display font-bold text-2xl text-teal-dark leading-tight mb-4">
                {section.heading}
              </h2>
              <div className="flex flex-col gap-4 text-base text-ink/75 leading-relaxed">
                {section.body}
              </div>
            </section>
          ))}

          <section aria-labelledby="vorlage-faq">
            <h2
              id="vorlage-faq"
              className="font-display font-bold text-2xl text-teal-dark leading-tight mb-5"
            >
              Häufige Fragen
            </h2>
            <div className="flex flex-col gap-6">
              {faq.map((item) => (
                <div key={item.question}>
                  <h3 className="font-display font-semibold text-lg text-teal-dark leading-snug">
                    {item.question}
                  </h3>
                  <p className="mt-2 text-base text-ink/75 leading-relaxed">{item.answer}</p>
                </div>
              ))}
            </div>
            <FAQPageSchema items={faq} />
          </section>
        </div>
      </div>
    </div>
  );
}

/** Inline link in guide copy, same look as the links in the download box. */
export function GuideLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="underline decoration-mustard underline-offset-4 hover:text-teal-dark"
    >
      {children}
    </Link>
  );
}
