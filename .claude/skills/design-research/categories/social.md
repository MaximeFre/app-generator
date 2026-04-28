# Social vertical scaffold

For chat / feed / messaging / community apps. **Warning**: indie social is extremely hard — only proceed if the user is committed to network effects.

## Reference apps

1. **iMessage / Messages** — chat baseline, bubble shapes, reactions.
2. **WhatsApp** — group chat at scale, simple list, status pattern.
3. **Discord** — server / channel tree (rare on mobile, complex).
4. **BeReal** — minimal feed, single post per day, reverse-chrono.
5. **Marco Polo** — async video, chat-list-of-videos UX.
6. **Geneva / Slowly / Telepath** — niche social, low-noise.
7. **Beli / Locket / Poparazzi** — micro-network friend-only patterns.

## Vertical questions

### Identity / onboarding
- Phone number vs email vs username?
- Profile photo required?
- Handle / display name?
- Friend invite at onboarding (contacts permission)?

### Feed pattern
- Reverse-chrono vs algorithmic vs friend-only?
- Single column vs grid?
- Pull-to-refresh vs auto-refresh?
- "Top of feed" indicator?

### Chat / message
- Thread vs single chat?
- Reactions (long-press emoji palette)?
- Read receipts (privacy: opt-in or required)?
- Typing indicator?

### Notifications
- Push permission ask: at signup or at first message received?
- Granular per-conversation mute?
- Quiet hours global?

### Privacy / blocking
- Block / report from any user surface
- Hide read receipts (often premium)
- Disappearing messages

## Customization knobs

1. Notification grouping (per-chat / global)
2. Read receipt visibility
3. Last seen visibility
4. Online status visibility
5. Allow tags / mentions from non-friends

## Anti-patterns

- ❌ Empty social app at launch — seed with content / sample friends.
- ❌ Forcing contacts upload on first launch (hostile)
- ❌ Public-by-default profiles (should be opt-in)
- ❌ Multiple notifications per message
- ❌ Designing for the 100k-user case before reaching 100 users

## Visual signals

- Lean palettes — single accent, lots of neutral grays.
- Avatar shapes: circle (chat), square (feed-grid), rounded square (Discord-style).
- Bubbles use accent for "me", neutral for "them".
- Very fast feed scrolling — minimize per-row work.
- Empty states are critical: "Invite a friend to get started".
