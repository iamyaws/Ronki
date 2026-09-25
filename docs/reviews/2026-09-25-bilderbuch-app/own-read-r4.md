# Own read before the reviews of the name chips (25 Sep 2026, late)

Diff `09e622d..e089cfd`. Written before opening Astra (`astra-code-r4.txt`) or the Claude review workflow.

1. **Old saves keep the wrong child name.** Every family that onboarded before this fix has the dragon's name in `familyConfig.childName` and in `state.heroName`. The fix stops new damage; it does not repair existing profiles, and the app cannot tell a real child name from a dragon name. A parent can correct it in the parent area (if that field exists there: to check). SHOULD: at least say so in the handoff.
2. **`state.heroName` is still read in places** (RoomHub greeting fallback `childName || heroName`, ParentalDashboard print name `heroName || childName`). For old saves the dragon name still leaks there; for new saves `heroName` stays unset. The print card preferring `heroName` over `childName` looks like the same bug on paper. SHOULD.
3. **Cloud sync.** `companionName` rides in the saved state blob like `companionVariant`; if the profile RPC or the website card seed whitelists fields, it could be dropped. To check.
4. **Voice on mute.** `VoiceAudio.play` returns early when muted; then a pre-reader hears nothing and has only text. Acceptable (mute is a parent choice), but the chips then need to read as pictures: the speaker doodle signals sound that does not come. COULD.
5. **Language.** English mode plays the German name take on purpose; the chip labels are names. The close line text is German only (`closeLine`), while `LINES` has no English path either. Pre-existing, fine.
6. **Chip ring vs typing.** Typing clears the chip; tapping a chip after typing wins and hides the keyboard. Covered by tests.
