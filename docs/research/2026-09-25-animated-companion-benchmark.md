# Animated companion benchmark: the Seedance video vs Ronki

25 Sep 2026. Based on 25 web lookups plus the Higgsfield MCP model catalog. "Unverified" means not confirmed in this pass.

## 1. Summary

The video's process fits Ronki if we keep its layering and drop the Finch clone parts: a room loop as a plain muted MP4, Ronki on top as a transparent loop, sky as a still image. Safari 27 still ignores WebM transparency, so a transparent Ronki needs two files: HEVC with alpha for Apple, WebM VP9 with alpha for Chrome and Fire. Seedance 2.5 on Higgsfield takes a start and an end image, runs 4 to 30 seconds and can switch audio off, so loops work. The safe method is two half clips that meet on one shared frame. For celebrations, skip Lottie: SVG stars plus a 2 to 5 KB motion layer are lighter and match the crayon look. Skip the paywall, streak pledge and "struggling" questions. Rive only pays off if Ronki later needs many reactive states, and it cannot reuse AI video.

## 2. The video's process mapped to Ronki

| Step | What the video does | What Ronki should do | Call and why |
|---|---|---|---|
| 1 | Pinterest mascot image, screen recording of every Finch screen | Ronki's Bilderbuch sheet is the only visual reference; Finch only for timing and flow. | Adapt. We own the character. |
| 2 | Pastes App Store link, asks for features, reviews and a plan first | Same plan-first habit, fed with our PRD. | Keep |
| 3 | Higgsfield isolates the character, makes a matching backdrop, matches app colours; Claude Design mockup | Isolate Ronki, generate his room by day and night. Mock up in our polish HTML files. | Keep, minus colour matching: our palette is fixed. |
| 4 | 17 to 18 onboarding pages: egg colour, crack the egg, gender, name, struggle questions, paywall, streak commitment | 4 to 6 screens: child taps the egg, it wobbles and hatches, Ronki says hello by voice, parent sets the name. | Adapt. Keep the hatch, skip the rest. |
| 5 | Seedance idle, scripted walk, animated backdrop, clouds kept still | Separate layers: room loop, Ronki loop, still sky. Short idles, no long walks. | Keep |
| 6 | Recoloured LottieFiles confetti on goal complete | SVG stars in our palette, under 1.5 seconds, soft or no sound. | Adapt |
| 7 | React Native with Expo EAS; Loom voice notes for fixes | Stay a PWA. Test on real iPad, iPhone, Android and Fire devices. Voice-note feedback is good. | Skip RN, keep Loom |

## 3. Answers

### A. Finch in 2026

- Onboarding: egg colour, pronouns, name, personality traits, then question screens with a progress bar. The first part has no progress bar, which a critique calls confusing (Pratt IXD, 17 Feb 2026).
- Loop: self-care actions give energy, energy sends the bird on adventures, rewards unlock items and places. Finch Plus makes adventures faster (review blogs, 2026).
- Home: dense for new users (autonomous.ai, 12 Jun 2025).
- Pet animation tech and 2025 to 2026 changes: could not verify. No engineering post found; the fan wiki update log refused our fetch.
- Complaints that matter for kids: marking a task takes many taps, messages and animations, which feels slow; trials that convert to paid; crashes around seasonal events; iOS vs Android price gap; too many options per screen (review blogs 2026; Pratt IXD 2026).

### B. Animated character tech for a PWA

- Safari (iOS, iPadOS, macOS) plays WebM VP9 but ignores its alpha. It supports HEVC with alpha since iOS 13; list that source first. HEVC alpha encodes natively on macOS; Windows needs extra tools (Rotato, updated 19 Aug 2026).
- Rotato expects WebM transparency in Safari 27, but the Safari 27.0 feature post (WebKit, 17 Sep 2026) does not mention it. Treat it as not shipped.
- Installed iOS PWAs use the same WebKit rules (our understanding, unverified).
- Silk is Chromium (AWS Silk docs). Fire OS 8 is based on Android 11 (Wikipedia, Jul 2025 update). WebM alpha should work: untested.
- iOS Low Power Mode blocks autoplay even when muted. `play()` rejects with NotAllowedError. Catch it and keep the poster (lesniakrafal.com, date not shown).
- Pattern: `<video autoplay muted loop playsinline preload="metadata" poster="...">`, then call `play()` and handle rejection.
- Animated WebP decodes in software and may hold all frames in memory; video uses hardware decode. Full-size animated WebP can keep a core busy on older Android (2webp.com, date not shown).
- Rive's web runtime is about 200 KB gzipped, lottie-web about 60 KB. dotLottie added state machines in late 2025 (pkgpulse, 2026, unverified).
- Reduced motion: check `prefers-reduced-motion: reduce` in CSS and `matchMedia`; show stills and swap poses.

Recommendation (1), home loop behind UI: H.264 MP4, portrait 720p, 6 to 8 seconds, no audio track, first frame as WebP poster. Do not bake Ronki in: he must react to every state.

Recommendation (2), transparent Ronki on top: HEVC alpha MP4 for Apple plus WebM VP9 alpha for Chrome and Silk, about 512 px square, 3 to 6 seconds, still PNG fallback. Animated WebP only for tiny moments like the egg wobble.

### C. Seedance 2.5 on Higgsfield

- Catalog (Higgsfield MCP, read 25 Sep 2026): text-to-video, omni reference, video edit and video extension modes; 4 to 30 seconds; up to 1080p; audio can be off; accepts start image, end image, image and video references.
- Price: 10 s at 720p is 70 credits (about $3.50) (Higgsfield blog, 6 Aug 2026).
- Identity: up to 50 references per pass. The guide wants labelled sections, "positive locks", numeric positions and a "locked-off tripod" camera (Higgsfield prompting guide, date not shown). Its examples are all photoreal.
- Start frame = end frame: many models then barely move (ffmpeg.party, Apr 2026). Fix: clip A from still S, clip B from A's last frame back to S, then join on the shared frame.
- Failure modes (partly our read): size drift (numeric position, reject drifting clips), horns and wings morphing (references plus lock list), crayon grain "boiling", clouds jumping at the seam (keep sky as a still layer).
- Background removal: the MCP remove_background tool accepts video. Higgsfield says it exports WebM or MOV with alpha and clean edges (vendor page, date not shown). Untested on ink and crayon edges. Generate Ronki on flat pale grey to help it.

### D. How top kids' apps animate and celebrate

- Duolingo: Rive state machines. 8 head and 8 body idles combine into 64+ variations so idle never looks looped; 20+ mouth shapes; success and fail reactions follow app state (Rive blog and dev.to posts, dates unverified). Duolingo ABC: not verified.
- Khan Academy Kids: Kodi Bear and friends invite the child into each task; rewards are character clothes and badges; free, no ads (Khan Academy blog and help centre, dates not shown).
- Pok Pok: no levels, no winning or losing, hand-drawn visuals, calm sounds, "toys, not games" (playpokpok.com FAQ; TechCrunch, 18 Jun 2024).
- Lingokids: confetti plus a visual payoff, like a traced line turning green and filling in (Tech Savvy Mama, Dec 2025).
- Endless Alphabet: a funny animation when a word is complete (Stuff, 2025).
- Toca Boca World: open role play (App Store listing, not dated).

Guardrails for 5 to 8 (our rules): one celebration per task, under 1.5 seconds, bigger only when the routine is done; no flashing above three times a second (WCAG 2.3.1); soft sound, off by default; every line spoken; Ronki never looks sad at a skipped task; a quiet idle, so the real toothbrush wins.

### E. LottieFiles and the alternative

- Free LottieFiles animations use the Lottie Simple License: commercial use allowed, no attribution required. Edits count as derivative works under the same terms; no compiling files into a competing service (LottieFiles help centre, date not shown; the licence page blocked our fetch).
- Risk: rights rest on whoever uploaded the file.
- Substitute: yes. Motion's `useAnimate` mini is 2.3 KB and runs on the hardware-accelerated Web Animations API; `m` plus LazyMotion is 4.6 KB (motion.dev docs, date not shown). A dozen SVG stars with CSS keyframes cost less than lottie-web.

## 4. Recommended stack

Layers, back to front: still sky, room loop (H.264 MP4), Ronki loop (HEVC or WebM alpha, still PNG fallback), UI, SVG celebration layer (CSS or Motion mini). Play one video at a time on Fire tablets (our guess; measure). Pause loops when the page is hidden or after 60 idle seconds. Start video only if `play()` resolves.

| Option | iOS Safari and installed PWA | Android Chrome | Fire (Silk) | Alpha | CPU on low-end | From an AI clip |
|---|---|---|---|---|---|---|
| H.264 MP4 | Yes; blocked in Low Power Mode | Yes | Yes | No | Low, hardware | Direct |
| HEVC alpha | Yes | No | No | Yes | Low | Matte plus Mac or special encoder |
| WebM VP9 alpha | Plays, alpha ignored | Yes | Expected, untested | Yes | Medium | Matte plus ffmpeg |
| Animated WebP | Yes (Safari 14+, not re-checked) | Yes | Yes | Yes | High if big or long | Easy |
| Rive | Yes, about 200 KB runtime | Yes | Expected | Yes | Low to medium | No; redraw and rig |
| Lottie / dotLottie | Yes, about 60 KB runtime | Yes | Expected | Yes | Medium to high | No |
| CSS sprite sheet | Yes | Yes | Yes | Yes | Low if small | Extract and pack frames |
| SVG plus Motion or CSS | Yes | Yes | Yes | Yes | Low | Hand-drawn only |

"Expected" cells are working knowledge: test on a real Fire HD.

## 5. Ten Seedance 2.5 prompt patterns

Settings: omni_reference mode, 3 to 5 Ronki references, audio off, 720p, high bitrate.

Shared block, first in every prompt: "GLOBAL STYLE: children's picture-book illustration, bold ink outlines, visible crayon grain, flat cobalt blue, red-orange, sun yellow, sky blue and night blue. Not 3D, not glossy, no text. CHARACTER: Ronki, the small red-orange dragon exactly as in the references; same size, proportions, horns and wings in every frame. CAMERA: locked-off tripod, static, no zoom, no pan, no cuts. AUDIO: none."

| # | Loop | Motion prompt (after the shared block) | Length | How it loops |
|---|---|---|---|---|
| 1 | Home idle, Ronki layer | "Ronki stands centred on flat pale grey, feet at 85% of frame height, body 45% tall. Slow breath, one blink, looks left, back to camera, ends in the exact start pose." | 6 s | Two halves: A = still S to look-left, B = A's last frame to S. Then remove background. |
| 2 | Room only, day | "Ronki's cosy room in morning light, no characters. Only the curtain sways and dust drifts in a sunbeam." | 8 s | Start = end image; if motion is too small, crossfade the last 0.5 s into the first. |
| 3 | Idle variation | "Ronki sits, tail curls and uncurls once, small wing flutter, returns to the start pose." | 5 s | Two halves; rotate with #1 at random. |
| 4 | Egg wobble | "A cobalt-spotted egg on flat pale grey, centred. Rocks left, right, left, settles upright exactly as at the start. No cracks." | 4 s | Start = end image; fallback: forward then reversed. |
| 5 | Egg hatch (one shot) | "The egg cracks along a zigzag, the top lifts off, Ronki pops up, blinks, ends in the idle start pose." | 6 s | No loop. End image = #1 start frame, so idle takes over cleanly. |
| 6 | Happy jump, task done | "Ronki crouches, jumps straight up with arms raised, lands on the same spot, smiles, back to start pose. Never moves sideways or grows." | 4 s | Start = end image; plays once, hands back to idle. |
| 7 | Twirl, routine done | "Ronki spins once on the spot, wings open, ends in the start pose." | 5 s | Start = end image. Sparkles in SVG, not video. |
| 8 | Sleeping breath | "Night. Ronki curled asleep on a round cushion, eyes closed. Belly rises slowly in one breath. Nothing else moves." | 4 s | Ping-pong: forward then reversed, 8 s cycle. Breathing is symmetric, so the reverse is invisible. |
| 9 | Room only, night | "Ronki's room at night, moonlight through the window, a small lamp glows and pulses gently. No characters." | 8 s | Crossfade seam; sky outside as a still layer. |
| 10 | Breathing with a cloud | "Ronki stands beside a small white cloud. He breathes in slowly; the cloud grows round and full. No other motion." | 4 s | Ping-pong: forward = in, reverse = out, 8 s cycle for a 4-in, 4-out exercise. |

QA per clip (our rule): overlay first and last frame at 50% opacity and reject visible shifts; reject if Ronki's height drifts more than 3%.

## 6. Sources

- Pratt IXD, Finch critique, 17 Feb 2026: https://ixd.prattsi.org/2026/02/design-critique-finch-self-care-pet-ios-app/
- autonomous.ai, Finch review, 12 Jun 2025: https://www.autonomous.ai/ourblog/finch-self-care-app-review-full-breakdown
- Finch complaint round-ups, 2026, dates not checked: https://www.aidorable.ai/blog/finch-app-reviews, https://habitbox.app/blog/finch-app-review
- Rotato, transparent video, updated 19 Aug 2026: https://rotato.app/blog/transparent-videos-for-the-web
- WebKit, Safari 27.0 features, 17 Sep 2026: https://webkit.org/blog/18325/webkit-features-for-safari-27-0/
- Low Power Mode autoplay, date not shown: https://lesniakrafal.com/en/article/how-to-enable-autoplay-videos-in-low-power-mode-on-ios-and-macos/
- Animated WebP vs MP4, date not shown: https://2webp.com/guides/animated-webp-vs-mp4
- Rive vs Lottie, 2026: https://www.pkgpulse.com/guides/lottie-vs-rive-vs-css-animations-web-animation-formats-2026
- AWS, What is Amazon Silk, date not shown: https://docs.aws.amazon.com/silk/latest/developerguide/what-is-silk.html
- Wikipedia, Fire OS, read 25 Sep 2026: https://en.wikipedia.org/wiki/Fire_OS
- Higgsfield MCP model catalog (seedance_2_5, remove_background), read 25 Sep 2026
- Higgsfield, Seedance 2.5 on Higgsfield, 6 Aug 2026: https://higgsfield.ai/blog/seedance-2-5-on-higgsfield-2026
- Higgsfield, Seedance 2.5 prompting guide, date not shown: https://higgsfield.ai/blog/seedance-2-5-prompting-guide
- Higgsfield, video background changer, date not shown: https://higgsfield.ai/ai-video-background-changer
- ffmpeg.party, seamless AI video loops, Apr 2026: https://ffmpeg.party/guides/ai-video-loop/
- Duolingo x Rive, dates unverified: https://rive.app/blog/duolingo-s-ai-powered-video-call-brings-lily-to-life, https://dev.to/uianimation/how-duolingo-uses-rive-for-their-character-animation-and-how-you-can-build-a-similar-rive-mascot-5d19
- Khan Academy Kids, dates not shown: https://blog.khanacademy.org/best-early-learning-apps-for-kids/, https://khankids.zendesk.com/hc/en-us/articles/360049358751-Learn-more-about-the-characters-inside-Khan-Academy-Kids
- Pok Pok FAQ, date not shown: https://playpokpok.com/faqs/; TechCrunch, 18 Jun 2024: https://techcrunch.com/2024/06/18/now-a-series-a-startup-kids-app-and-digital-toy-pok-pok-is-coming-to-android
- Tech Savvy Mama, Lingokids, Dec 2025: https://techsavvymama.com/2025/12/lingokids-review-effective-playlearning-app.html
- Stuff, best kids' apps, 2025: https://www.stuff.tv/features/the-best-apps-and-games-kids-all-ages/
- Toca Boca World, App Store, not dated: https://apps.apple.com/us/app/toca-boca-world-game-play/id1208138685
- LottieFiles, commercial use, date not shown: https://help.lottiefiles.com/hc/en-us/articles/45243303062681-Commercial-Use-Attribution
- Motion, bundle size, date not shown: https://motion.dev/docs/react-reduce-bundle-size
