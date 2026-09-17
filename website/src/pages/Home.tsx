import { PageMeta } from '../components/PageMeta';
import { OrganizationSchema, SoftwareApplicationSchema, FAQPageSchema } from '../components/JsonLd';
import { PainterlyShell } from '../components/PainterlyShell';
import { HeroVariantF } from '../components/HeroVariantF';
import { BeforeAfter } from '../components/BeforeAfter';
import { UeberMich } from '../components/UeberMich';
import { ArcStoryboard } from '../components/ArcStoryboard';
import { RonkisWelt } from '../components/RonkisWelt';
import { AntiFeatures } from '../components/AntiFeatures';
import { FeaturedRatgeber } from '../components/FeaturedRatgeber';
import { FAQ } from '../components/FAQ';
import { Footer } from '../components/Footer';

export default function Home() {
  return (
    <PainterlyShell>
      <PageMeta
        title="Ronki: Der Drachen-Gefährte für Kinder-Routinen"
        description="Ronki trägt die Routine mit. Ein Drachen-Gefährte, der Kinder durch den Alltag begleitet. Ohne Streaks, ohne Werbung, ohne Dark Patterns."
        canonicalPath="/"
        locale="de"
        alternates={{ de: '/', en: '/en' }}
      />
      <OrganizationSchema />
      <SoftwareApplicationSchema />
      <HeroVariantF />
      <BeforeAfter />
      <UeberMich />
      <ArcStoryboard />
      <RonkisWelt />
      <AntiFeatures />
      <FeaturedRatgeber />
      <FAQPageSchema
        items={[
          {
            question: 'Ist Ronki eine App?',
            answer:
              'Ronki ist eine Web-App, die du direkt über den Browser auf deinem Startbildschirm installierst. Kein App Store, kein Download, keine Cookies.',
          },
          {
            question: 'Ab welchem Alter ist Ronki geeignet?',
            answer:
              'Ronki ist für Kinder zwischen 5 und 8 Jahren gedacht. In dieser Phase lernen Kinder, eigene Gefühle zu benennen und mit ihnen umzugehen. Ronki begleitet genau das.',
          },
          {
            question: 'Was kostet Ronki?',
            answer:
              'Ronki ist kostenlos. Die Public\u2011Alpha läuft direkt im Browser, ohne Anmeldung, App Store oder Download. Probiert es aus und schreibt uns an hallo@ronki.de, wenn etwas klemmt.',
          },
          {
            question: 'Wie schützt ihr die Daten meines Kindes?',
            answer:
              'Datenschutz ist kein Feature, sondern Grundlage. Ronki speichert keine persönlichen Daten auf externen Servern, nutzt keine Tracking-Pixel und zeigt keine Werbung. Alles bleibt auf eurem Gerät.',
          },
          {
            question: 'Braucht mein Kind ein eigenes Gerät?',
            answer:
              'Nein. Ronki funktioniert auf dem Familien-Tablet oder einem geteilten Gerät. Jedes Kind hat ein eigenes Profil, geschützt und getrennt.',
          },
        ]}
      />
      <FAQ />
      <Footer install />
    </PainterlyShell>
  );
}
