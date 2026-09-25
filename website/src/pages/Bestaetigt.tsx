import { PainterlyShell } from '../components/PainterlyShell';
import { PageMeta } from '../components/PageMeta';
import { StickerLabel } from '../components/primitives/StickerLabel';
import { PillButton } from '../components/bausteine';

/**
 * Landing page after a parent clicks the link in the double opt-in mail
 * (Brevo sends it, see supabase/migrations/*_leads_brevo_doi.sql).
 * Out of search on purpose: noindex, not in the sitemap, not in the nav.
 */
export default function Bestaetigt() {
  return (
    <PainterlyShell>
      <PageMeta
        title="Bestätigt: Ronki"
        description="Deine Anmeldung für Neues von Ronki ist bestätigt."
        canonicalPath="/bestaetigt"
        noindex={true}
      />
      <section className="px-6 pt-36 pb-24 sm:pt-44">
        <div className="max-w-2xl mx-auto">
          <StickerLabel tone="sun" rotate={-3}>
            Bestätigt
          </StickerLabel>
          <h1 className="mt-6 font-display font-bold text-4xl sm:text-5xl leading-tight text-ink">
            Danke, du bist dabei.
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-ink/80">
            Wir schreiben dir nur, wenn es etwas Neues gibt: neue Vorlagen und was wir
            gerade an Ronki bauen. Höchstens einmal im Monat.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-ink/80">
            Du kannst dich in jeder Mail mit einem Klick abmelden.
          </p>
          <div className="mt-10">
            <PillButton href="/vorlagen">Zu den Vorlagen</PillButton>
          </div>
        </div>
      </section>
    </PainterlyShell>
  );
}
