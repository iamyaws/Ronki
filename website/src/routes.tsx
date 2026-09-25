import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

// Home loads eagerly, it's the landing page
import Home from './pages/Home';

// Everything else lazy-loaded
const HowItWorks = lazy(() => import('./pages/HowItWorks'));
const Science = lazy(() => import('./pages/Science'));
const FuerEltern = lazy(() => import('./pages/FuerEltern'));
const FAQ_Page = lazy(() => import('./pages/FAQ_Page'));
const Vorlagen = lazy(() => import('./pages/Vorlagen'));
const DrachenSammelkarten = lazy(() => import('./pages/DrachenSammelkarten'));
const MitMachen = lazy(() => import('./pages/MitMachen'));
const VorlageMorgen = lazy(() => import('./pages/VorlageMorgen'));
const VorlageAbend = lazy(() => import('./pages/VorlageAbend'));
const VorlageKleineGeschwister = lazy(() => import('./pages/VorlageKleineGeschwister'));
const VorlageAdhs = lazy(() => import('./pages/VorlageAdhs'));
const HomeEN = lazy(() => import('./pages/HomeEN'));
const Installieren = lazy(() => import('./pages/Installieren'));
const ProfilErstellen = lazy(() => import('./pages/ProfilErstellen'));
// Double opt-in landing (Brevo); noindex, not in the sitemap.
const Bestaetigt = lazy(() => import('./pages/Bestaetigt'));
const Ratgeber = lazy(() => import('./pages/Ratgeber'));
const ToolsHub = lazy(() => import('./pages/tools/ToolsHub'));
const AppCheck = lazy(() => import('./pages/tools/AppCheck'));
const AppCheckResult = lazy(() => import('./pages/tools/AppCheckResult'));
const SchlafensRechner = lazy(() => import('./pages/tools/SchlafensRechner'));
const FamilienCharter = lazy(() => import('./pages/tools/FamilienCharter'));
const KonsolenCheck = lazy(() => import('./pages/tools/KonsolenCheck'));
// The block library. Internal reference page: noindex, not linked from
// the navigation or the footer, not in the sitemap, not prerendered.
const Styleguide = lazy(() => import('./pages/Styleguide'));
// Private print-only utility pages; not in footer, not in sitemap, not in robots.
const PrintA6Flyer = lazy(() => import('./pages/PrintA6Flyer'));
const PrintA6FlyerKids = lazy(() => import('./pages/PrintA6FlyerKids'));
const PrintA6FlyerKidsHatchling = lazy(() => import('./pages/PrintA6FlyerKidsHatchling'));
const PrintA6FlyerKidsCard = lazy(() => import('./pages/PrintA6FlyerKidsCard'));
const PrintA6FlyerKidsPass = lazy(() => import('./pages/PrintA6FlyerKidsPass'));
const PrintSheetA4KidsCard = lazy(() => import('./pages/PrintSheetA4KidsCard'));
const PrintSheetA4ElternFlyer = lazy(() => import('./pages/PrintSheetA4ElternFlyer'));
const PrintGemeindeblattFoto = lazy(() => import('./pages/PrintGemeindeblattFoto'));
const PrintGemeindeblattFotoEn = lazy(() => import('./pages/PrintGemeindeblattFotoEn'));
const PrintA4Poster = lazy(() => import('./pages/PrintA4Poster'));
const PrintA4PosterHort = lazy(() => import('./pages/PrintA4PosterHort'));
const PrintA4PosterBaeckerei = lazy(() => import('./pages/PrintA4PosterBaeckerei'));
const PrintA4PosterKinderarzt = lazy(() => import('./pages/PrintA4PosterKinderarzt'));
const PrintA4PosterZaehne = lazy(() => import('./pages/PrintA4PosterZaehne'));
const PrintA4PosterAntiEngagement = lazy(() => import('./pages/PrintA4PosterAntiEngagement'));
const VorlagePrintMorgen = lazy(() => import('./pages/print/VorlagePrintMorgen'));
const VorlagePrintAbend = lazy(() => import('./pages/print/VorlagePrintAbend'));
const VorlagePrintKleineGeschwister = lazy(() => import('./pages/print/VorlagePrintKleineGeschwister'));
const VorlagePrintAdhs = lazy(() => import('./pages/print/VorlagePrintAdhs'));
const RatgeberWasKinderAppsMachen = lazy(() => import('./pages/ratgeber/WasKinderAppsMachen'));
const RatgeberMorgenTroedeln = lazy(() => import('./pages/ratgeber/MorgenTroedeln'));
const RatgeberStickerChartAlternative = lazy(() => import('./pages/ratgeber/StickerChartAlternative'));
const RatgeberDarkPatternsKinderApps = lazy(() => import('./pages/ratgeber/DarkPatternsKinderApps'));
const RatgeberAbendroutineGrundschulkind = lazy(() => import('./pages/ratgeber/AbendroutineGrundschulkind'));
const RatgeberZaehneputzenOhneStreit = lazy(() => import('./pages/ratgeber/ZaehneputzenOhneStreit'));
const RatgeberEinschulungSelbststaendigkeit = lazy(() => import('./pages/ratgeber/EinschulungSelbststaendigkeit'));
const RatgeberMorgenroutineGrundschulkind = lazy(() => import('./pages/ratgeber/MorgenroutineGrundschulkind'));
const RatgeberElternBereich = lazy(() => import('./pages/ratgeber/ElternBereich'));
const RatgeberMorgenroutineAdhs = lazy(() => import('./pages/ratgeber/MorgenroutineAdhs'));
const RatgeberZeitumstellungKinder = lazy(() => import('./pages/ratgeber/ZeitumstellungKinder'));
const Impressum = lazy(() => import('./pages/Impressum'));
const Datenschutz = lazy(() => import('./pages/Datenschutz'));
const AGB = lazy(() => import('./pages/AGB'));
const NotFound = lazy(() => import('./pages/NotFound'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-6 h-6 rounded-full border-2 border-teal/20 border-t-teal animate-spin" />
    </div>
  );
}

export function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/wie-es-funktioniert" element={<HowItWorks />} />
        <Route path="/wissenschaft" element={<Science />} />
        <Route path="/fuer-eltern" element={<FuerEltern />} />
        <Route path="/faq" element={<FAQ_Page />} />
        <Route path="/vorlagen" element={<Vorlagen />} />
        <Route path="/drachen-sammelkarten" element={<DrachenSammelkarten />} />
        <Route path="/mitmachen" element={<MitMachen />} />
        <Route path="/vorlagen/morgenroutine" element={<VorlageMorgen />} />
        <Route path="/vorlagen/abendroutine" element={<VorlageAbend />} />
        <Route path="/vorlagen/kleine-geschwister" element={<VorlageKleineGeschwister />} />
        <Route path="/vorlagen/adhs" element={<VorlageAdhs />} />
        <Route path="/installieren" element={<Installieren />} />
        <Route path="/profil-erstellen" element={<ProfilErstellen />} />
        <Route path="/bestaetigt" element={<Bestaetigt />} />
        <Route path="/styleguide" element={<Styleguide />} />
        <Route path="/print/a6-flyer" element={<PrintA6Flyer />} />
        <Route path="/print/a6-flyer-kids" element={<PrintA6FlyerKids />} />
        <Route path="/print/a6-flyer-kids-hatchling" element={<PrintA6FlyerKidsHatchling />} />
        <Route path="/print/a6-flyer-kids-card" element={<PrintA6FlyerKidsCard />} />
        <Route path="/print/a6-flyer-kids-pass" element={<PrintA6FlyerKidsPass />} />
        <Route path="/print/sheet-a4-kids-card" element={<PrintSheetA4KidsCard />} />
        <Route path="/print/sheet-a4-eltern-flyer" element={<PrintSheetA4ElternFlyer />} />
        <Route path="/print/gemeindeblatt-foto" element={<PrintGemeindeblattFoto />} />
        <Route path="/print/gemeindeblatt-foto-en" element={<PrintGemeindeblattFotoEn />} />
        <Route path="/print/a4-poster" element={<PrintA4Poster />} />
        <Route path="/print/a4-poster-hort" element={<PrintA4PosterHort />} />
        <Route path="/print/a4-poster-baeckerei" element={<PrintA4PosterBaeckerei />} />
        <Route path="/print/a4-poster-kinderarzt" element={<PrintA4PosterKinderarzt />} />
        <Route path="/print/a4-poster-zaehne" element={<PrintA4PosterZaehne />} />
        <Route path="/print/a4-poster-anti-engagement" element={<PrintA4PosterAntiEngagement />} />
        <Route path="/print/vorlage-morgen" element={<VorlagePrintMorgen />} />
        <Route path="/print/vorlage-abend" element={<VorlagePrintAbend />} />
        <Route path="/print/vorlage-kleine-geschwister" element={<VorlagePrintKleineGeschwister />} />
        <Route path="/print/vorlage-adhs" element={<VorlagePrintAdhs />} />
        <Route path="/tools" element={<ToolsHub />} />
        <Route path="/tools/app-check" element={<AppCheck />} />
        <Route path="/tools/app-check/r/:id" element={<AppCheckResult />} />
        <Route path="/tools/schlafens-rechner" element={<SchlafensRechner />} />
        <Route path="/tools/familien-charter" element={<FamilienCharter />} />
        <Route path="/tools/konsolen-check" element={<KonsolenCheck />} />
        <Route path="/ratgeber" element={<Ratgeber />} />
        <Route path="/ratgeber/was-kinder-apps-machen" element={<RatgeberWasKinderAppsMachen />} />
        <Route path="/ratgeber/morgen-troedeln" element={<RatgeberMorgenTroedeln />} />
        <Route path="/ratgeber/sticker-chart-alternative" element={<RatgeberStickerChartAlternative />} />
        <Route path="/ratgeber/dark-patterns-kinder-apps" element={<RatgeberDarkPatternsKinderApps />} />
        <Route path="/ratgeber/abendroutine-grundschulkind" element={<RatgeberAbendroutineGrundschulkind />} />
        <Route path="/ratgeber/zaehneputzen-ohne-streit" element={<RatgeberZaehneputzenOhneStreit />} />
        <Route path="/ratgeber/einschulung-selbststaendigkeit" element={<RatgeberEinschulungSelbststaendigkeit />} />
        <Route path="/ratgeber/morgenroutine-grundschulkind" element={<RatgeberMorgenroutineGrundschulkind />} />
        <Route path="/ratgeber/eltern-bereich" element={<RatgeberElternBereich />} />
        <Route path="/ratgeber/morgenroutine-adhs" element={<RatgeberMorgenroutineAdhs />} />
        <Route path="/ratgeber/zeitumstellung-kinder" element={<RatgeberZeitumstellungKinder />} />
        <Route path="/en" element={<HomeEN />} />
        <Route path="/impressum" element={<Impressum />} />
        <Route path="/datenschutz" element={<Datenschutz />} />
        <Route path="/agb" element={<AGB />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
