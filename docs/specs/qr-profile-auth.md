# QR profile auth — design sketch (27 April 2026)

**Source:** BeyArena ships QR-card auth for Beyblade-tracking kids.
The pattern: kid scans a printed QR card, the app reads it, profile
loads. No email, no password, no typing. Marc 27 Apr 2026: "feels
more natural" — and for Ronki's 5-8 year old audience, anything
beyond a tap is too much.

This doc adapts the BeyArena pattern for Ronki. Defer implementation
until after the soft-launch decision (Week 6 in the strategic plan);
it's the right step when going from "Marc's testing" → "5 families
testing" because each family needs an isolated profile and password
flows fail at this age.

> **Status update — 3 May 2026:** Phase 1, Phase 2, Phase 2.5, and the
> website-driven setup northstar all shipped on the same day.
> - **Phase 1** (token generation, URL detection, dashboard share link,
>   save persistence fix) — landed week of 27 April
> - **Phase 2** (Supabase profiles table + RLS, token-keyed cloud sync,
>   NoProfileLanding screen, dashboard QR canvas, A6 print stylesheet)
>   — landed 3 May AM
> - **Phase 2.5** (camera scan via jsQR, lazy-loaded ~130KB chunk)
>   — landed 3 May PM after Marc flagged that BeyArena's pattern is
>   scan-primary, not type-primary
> - **Setup migration to website** (Marc 3 May 2026): "the one-time
>   setup could be handled via the website for parents to generate a
>   code for their kids and print it out." NoProfileLanding became
>   single-CTA scanner + Eltern-callout to ronki.de. The new
>   `/profil-erstellen` page on the marketing site:
>   - one-form parent setup (child name + optional PIN)
>   - generates token, seeds Supabase profiles row with
>     `parentOnboardingDone: true` AND `parentHandoffBackSeen: true`
>     pre-flipped (kid skips both phases on first scan)
>   - renders printable A6 QR card with the same print stylesheet as
>     the in-app dashboard QR
>   - parents land here from `/installieren` or external CTAs
> - **In-app `CombinedParentSetup` retained** as orphan-token fallback
>   (rare: token in localStorage but the cloud row was deleted/never
>   created). Not reachable through the normal flow anymore.

---

## The pattern

```
[Parent setup completes]
   ↓
ParentalDashboard generates a profile token (32-char hex).
Stored in state.profileToken + cloud-keyed to that profile.
   ↓
Dashboard renders a QR section with:
   · A QR code encoding the link  https://app.ronki.de/?p=<token>
   · A printable A6 PDF ("Ronkis Profil — Druck mich aus")
   · A plain-text fallback code (8 chars, easy to read aloud)
   · A copy-link button for digital sharing (kid's tablet, parents'
     phones, grandparents)
   ↓
Parent prints + sticks on kid's tablet, OR shares the link directly.
   ↓
[App load with ?p=<token>]
   ↓
AuthGate sees the token in URL.
   ↓ Reads cloud profile by token → loads.
   ↓ Saves token to localStorage so future loads (no URL param) still
     resolve to that profile.
   ↓ Replaces window.location with clean URL (no token in history).
   ↓
Kid lands directly in the Hub. No login, no onboarding repeat.
```

## Why this is right for Ronki

Three properties make it fit the audience + the NORTHSTAR:

1. **Zero typing**: 6yo first-grader can't reliably type an 8-char
   alphanumeric code, can't read an email, can't choose a password.
   QR scan or shared link = the kid never sees auth at all.

2. **Multi-device by default**: The same token works on the kid's
   tablet, the parent's phone, grandparents' iPad. The token IS the
   identity; no device pairing flow needed.

3. **Multi-child households**: Each child gets their own QR card.
   One iPad with two cards = two distinct Ronki profiles. The kid
   identifies themselves by scanning their own card.

And one strategic property:

4. **No email harvest, no password recovery story**: Privacy story
   stays simple — we don't have to email parents, run a recovery
   flow, store a hashed password, or comply with email-related
   regulations. The QR card IS the recovery: lost it? Parent
   regenerates from the dashboard.

## Token shape

```
profileToken = 32 hex chars (128 bits of entropy)
e.g. "a3f7c2e1b9d5408f2761c8e4ab90f3d6"
```

URL form: `https://app.ronki.de/?p=<token>`

Plain-text fallback code: first 8 chars of the token, displayed in
groups of 4 with a hyphen — `a3f7-c2e1`. Lowercase only, no I/O/0/1
ambiguity (token uses hex, so 0/1 are present but printed plainly).
The full 32-char token is the actual auth; the 8-char preview is
just a memory hook for parents.

## Storage / cloud

- `state.profileToken` — set at parent-setup-complete.
- Supabase `profiles` table:
  - `token` (unique, indexed)
  - `created_at`, `last_active_at`
  - `state` (the cloud-saved game state, JSON column)
  - No `email` column. No PII.
- Anonymous Supabase row — Marc's existing `cloudSave(userId, state)`
  pattern adapted to use `cloudSave(token, state)` with the token
  as the row key.

## App-side flow

### URL detection at boot

```ts
// src/lib/profileToken.ts
const TOKEN_KEY = 'ronki_profile_token';

export function readTokenFromUrl(): string | null {
  if (typeof window === 'undefined') return null;
  const p = new URLSearchParams(window.location.search).get('p');
  if (!p || !/^[a-f0-9]{32}$/.test(p)) return null;
  return p;
}

export function getActiveToken(): string | null {
  // Order: URL param > localStorage > null
  const fromUrl = readTokenFromUrl();
  if (fromUrl) {
    try { localStorage.setItem(TOKEN_KEY, fromUrl); } catch {}
    // Strip from URL so refresh doesn't re-process / share doesn't leak
    const url = new URL(window.location.href);
    url.searchParams.delete('p');
    history.replaceState(null, '', url.toString());
    return fromUrl;
  }
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function generateToken(): string {
  // 32 hex chars = 128 bits
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}

export function clearToken(): void {
  try { localStorage.removeItem(TOKEN_KEY); } catch {}
}
```

### AuthGate integration

Replace the LoginScreen-bypass currently in AuthGate with token-based
loading:

```ts
function AuthGate() {
  const token = getActiveToken();

  if (!token) {
    // No token = first-time visitor. Render the QR-scan / parent-setup
    // entry that hands the user into CombinedParentSetup, which then
    // generates a token at completion.
    return <NoProfileLanding />;
  }

  // Token exists — load that profile and render the app.
  return (
    <TaskProvider profileToken={token}>
      <CelebrationQueueProvider>
        <QuestEaterProvider>
          <OnboardingGate />
        </QuestEaterProvider>
      </CelebrationQueueProvider>
    </TaskProvider>
  );
}
```

### TaskContext integration

```ts
async function loadInitialState(token: string | null) {
  if (!token) return null;
  // Try cloud first — that's the source of truth across devices.
  const cloud = await storage.cloudLoadByToken(token);
  if (cloud) return cloud;
  // No cloud row yet (first session after token generated). Fall
  // back to local IndexedDB for this device.
  const local = await storage.load();
  return local;
}
```

## Dashboard QR section

New card in ParentalDashboard, "Profil & Geräte":

```
┌────────────────────────────────────────────────┐
│ Profil & Geräte                                │
│                                                │
│   [QR code, 200×200]                           │
│                                                │
│   Code:  a3f7-c2e1                             │
│                                                │
│   [Drucken (PDF)]    [Teilen (Link)]           │
│                                                │
│   Auf neuem Gerät? Scannt das QR oder öffnet   │
│   den Link. Ronki begrüßt euch wieder mit      │
│   denselben Sternen.                           │
│                                                │
│   ─────                                        │
│                                                │
│   [Profil zurücksetzen]                        │
└────────────────────────────────────────────────┘
```

Behavior:
- **Drucken (PDF)** — generates an A6 PDF with the QR centered, the
  hero name, and the 8-char code. "Stickyback paper" friendly so
  parents can stick it on the back of the kid's tablet.
- **Teilen (Link)** — opens the device share sheet with the URL,
  pre-titled "Ronki — [HeroName]'s Profil".
- **Profil zurücksetzen** — destructive, PIN-gated. Generates a new
  token (old QR card stops working), wipes cloud state for the old
  token. Use case: card lost, wants to start fresh.

## NoProfileLanding (first-time visitor)

Three paths from this screen:

1. **"Neues Profil anlegen"** → CombinedParentSetup → at completion,
   generate a fresh token, save to cloud + localStorage, redirect to
   onboarding chain.
2. **"QR-Code scannen"** → opens the device camera (`<input type="file"
   accept="image/*" capture="environment">` on iOS, Web NFC + ZXing
   library on Android), reads QR, sets token, reloads.
3. **"Code eingeben"** → fallback for parents who only have the
   8-char code from a printed card. Form field, normalize to lowercase
   hex, validate 8-char prefix matches a known token (cloud lookup),
   if found prompt for the remaining 24 chars OR send a recovery
   email (deferred — most parents will use option 1 or 2).

For the soft-launch (5 families): only option 1 + 2 ship. Option 3
is a v1.5 feature when hand-typed codes become a real failure mode.

## Migration from current state

Current Marc-only state: anonymous, no token, lives in local IDB
on whatever browser he's on.

Migration:
- On first load post-deploy, if `getActiveToken()` returns null AND
  `state.onboardingDone === true` (loaded from local IDB), generate
  a token + adopt the existing local state under that token + push
  to cloud. The kid keeps everything they had; the device transitions
  to the new auth model silently.

```ts
// In TaskContext init:
let token = getActiveToken();
const localState = await storage.load();
if (!token && localState?.onboardingDone) {
  token = generateToken();
  try { localStorage.setItem(TOKEN_KEY, token); } catch {}
  await storage.cloudSaveByToken(token, localState);
}
```

That migration runs once per device per existing user. New devices
go through the QR / link route from day one.

## What this DOESN'T solve

- **Lost QR + no parent backup**: family deletes the printed card,
  doesn't have the link saved anywhere, the kid's tablet got wiped
  → profile is unrecoverable. The dashboard's "Profil zurücksetzen"
  is the answer (generate a new one, lose old state). For users who
  CARE, the cloud sync via the token ensures any device that ever
  saw the QR still works.
- **Card-stealing**: a sibling could scan the other kid's QR and
  see their profile. For 5-8 year olds in a single household, the
  threat model is "an annoyed sibling," not actual identity theft.
  Acceptable.
- **Sharing the QR publicly**: if a parent posts the QR online,
  anyone with the link gets full access to that kid's profile.
  Mitigation: the dashboard's "Profil zurücksetzen" rotates the
  token. Document this in the parental docs.

## Build estimate

| Piece | Lines | Time |
|---|---|---|
| `src/lib/profileToken.ts` | ~50 | 30m |
| Supabase `profiles` table + cloudLoadByToken/cloudSaveByToken | ~80 | 1h |
| AuthGate refactor | ~40 | 30m |
| TaskContext profileToken integration | ~60 | 45m |
| Dashboard "Profil & Geräte" card | ~150 | 1h |
| QR generation (canvas-based, no library) | ~80 | 30m |
| PDF generation (jsPDF or just print stylesheet) | ~60 | 30m |
| NoProfileLanding screen | ~120 | 45m |
| Camera scan flow | ~100 | 1h |
| Migration logic | ~30 | 15m |
| Smoke testing | — | 1h |

**Total**: ~770 LOC, ~7 hours. About a full day if Marc is doing it
in one go.

## When to build it

Defer until **Week 4 of the strategic-synthesis ship plan** — the
soft launch to 5 named families. Each family needs their own
profile; that's the moment QR auth becomes useful, not before.

For the first 4 weeks (single-tester continued use, voice tuning,
launch prep), the existing local-IDB single-profile flow is fine.

The save-fix this same commit ships solves the "Louis re-onboards
every session" bug. That bug is what made Marc bring up BeyArena
in the first place — once that's fixed, this becomes a v1.5
strategic move, not an emergency.

---

_Saved at `docs/specs/qr-profile-auth.md`. Last revised: 27 April 2026._
