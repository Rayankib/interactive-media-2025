# FitPlanner – Design Notes

## Target Users
**Primary:** Non-tech-savvy parents (40–70 years old) who want to quickly enroll their children in local sports activities.  
**Secondary:** Tech-comfortable parents who value speed and ease.

The app must feel **calm, reassuring, and trustworthy** – not corporate, not flashy, not AI-generated.

---

## Design Philosophy

### 1. **Tone of Voice**
- **Warm and human.** We speak *to* parents, not *at* them.
- **Clear and forgiving.** Short sentences. Active voice. Avoid jargon.
- **Local, personal.** As if a friendly sports coordinator is guiding you through the process.

#### Copy changes made:
- ❌ "Een eenvoudige manier om je kind aan te melden voor lokale sportactiviteiten" 
- ✅ "Meld je kind aan bij sporten"  
- **Why:** Direct, warm, no corporate filler.

- ❌ "Plan sportweekjes, meld je kind aan namens hem/haar"  
- ✅ "Meld je kind aan voor trainingen, volg wie er allemaal meegaat"  
- **Why:** Action-first. Focuses on what parents actually do.

- ❌ "Mijn Trainingsschema" / "Alle aanmeldingen van je kind op één plek"  
- ✅ "Mijn inschrijvingen" / "Hier zie je waar je kind allemaal ingeschreven is"  
- **Why:** Simpler, more conversational, less institutional.

- ❌ Toast: "Aangemeld: Voetbal — Maandag 09:00–10:30"  
- ✅ Toast: "Klaar! Je kind staat ingeschreven voor Voetbal"  
- **Why:** Celebrates the action. Reassuring, celebratory, not robotic.

---

### 2. **UX Clarity for Parents**
We remove cognitive load by:
- **Making actions obvious.** Buttons are clear, never ambiguous.
- **Reducing choice fatigue.** Sport selection is first. Filters are simple.
- **Being reassuring.** Confirmations are warm. Errors are helpful, not scary.

#### Key decisions:
- **One-click sport selection.** Parents choose one sport and go straight to trainings. No "back" button needed.
- **Clear button labels.**
  - ❌ "Kies een sport om te bekijken" 
  - ✅ "Start met een sport"  
  - **Why:** "Start" is action-oriented and friendly. "Bekijken" (view) is passive.
  
- **Reassuring confirmations.**
  - ❌ "Keuze gewist"  
  - ✅ "Keuze verwijderd"  
  - **Why:** "Verwijderd" (removed) is clearer. Parents understand what happened.

- **Short, scannable text.**
  - ❌ "Klik op 'Deelnemen' om uw kind aan te melden. Je ziet direct een bevestiging."  
  - ✅ "Tik op 'Deelnemen' om je kind in te schrijven. Je krijgt meteen bevestiging."  
  - **Why:** "Tik" (tap) is mobile-first. Shorter. No archaic "uw" (formal you).

---

### 3. **Design Personality (Subtle, Not Overdesigned)**

#### The signature: **Left accent border**
We added a **3–4px left border in primary blue** to key elements:
- Slot cards (training sessions)
- Plan cards (enrolled trainings)
- Dashboard summary
- Hero section

**Why this detail matters:**
- It's **subtle but consistent.** A visual "anchor" that feels human and intentional.
- It **guides the eye** naturally to content.
- It's **calming,** not flashy. No animations, no pop-ups, just a solid line.
- It **works on mobile.** Doesn't waste space, adds no complexity.
- It feels like a **real designer made this**—small, thought-through, not AI-generated.

#### Other design moves:
- **Removed emoji clutter.** Filter title: ❌ "⚙️ Filters" → ✅ "Filter"  
  **Why:** Emojis can feel cheesy in a serious context. Trust the content.
- **Cleaned up filter headers.** "Actieve filters" → "Gefilterd op"  
  **Why:** More natural, less corporate.
- **Consistent affordance.** All interactive elements (buttons, cards) respond the same way. No surprises.

---

### 4. **Micro-interactions (Light and Calm)**

We added **two subtle feedback cues** to make actions feel responsive without being distracting:

#### 1. **Button focus rings**
```css
.primary:focus-visible { 
  outline: 2px solid var(--primary);
  outline-offset: 2px; 
}
```
- Appears only when using keyboard (tab).
- Calm, not aggressive.
- Improves accessibility without noise.

#### 2. **Existing flash animation (on enrollment)**
The slot card already flashes green when you enroll your child. We kept this because:
- It's **fast** (400ms, not slow).
- It's **warm** (green = success, not cold blue).
- It's **calming,** not playful. No bounce, no shake.

**Why we didn't add more:**
- Older parents find excessive motion confusing or frustrating.
- Each interaction should feel **predictable and reassuring.**
- We trust the app's clarity to reduce the need for hand-holding.

---

### 5. **Why Things Are Intentionally Simple**

#### No onboarding screens.
**Why:** Parents want to get in and out. Trust the UI to be obvious.

#### No empty states with illustrations.
**Why:** Feels over-designed. Parents see an empty list and know what to do.

#### No "explore" features or upsells.
**Why:** Trust. Parents respect apps that don't waste their time.

#### No animations on the home page.
**Why:** Fast load times. Older browsers. Respect for users' time.

#### One sport selector per page.
**Why:** Prevents confusion. "Which sport am I looking at?" is always obvious.

---

## Summary of Changes

| Element | Before | After | Why |
|---------|--------|-------|-----|
| Page title | "Sportactiviteiten voor Ouders" | "FitPlanner – Meld je kind aan voor sporten" | Personal, actionable |
| Hero headline | "Sportactiviteiten" | "Meld je kind aan bij sporten" | Direct. Action-first. |
| CTA button | "Kies een sport" | "Start met een sport" | "Start" feels friendlier and more active |
| Toast (enroll) | "Aangemeld: Voetbal — Maandag 09:00–10:30" | "Klaar! Je kind staat ingeschreven voor Voetbal" | Celebratory, warm, less data-dump |
| Filter label | "Actieve filters" | "Gefilterd op" | More natural, conversational |
| My plans page | "Mijn Trainingsschema" | "Mijn inschrijvingen" | Clearer term. Simpler. |
| Slot cards | Plain border | **Left blue accent border** | Signature visual detail. Guides eye. Feels intentional. |
| Focus states | None visible | Subtle outline on keyboard focus | Better accessibility, calm feedback |

---

## How This Design Supports Trust

1. **Predictability.** The app never surprises you. Actions always have the same feedback.
2. **Clarity.** Text is short, buttons are obvious, confirmations are warm.
3. **Respect.** No waste of time. No corporate speak. No dark patterns.
4. **Accessibility.** Works for older eyes, slower internet, keyboards, and touch.
5. **Ownership.** Every change was intentional. Nothing feels generated or filler.

---

## For Future Developers

- **Keep the accent borders.** They're the signature. Apply them to new cards/sections.
- **Keep copy warm.** Always ask: "Would a friendly sports coordinator say this?"
- **Avoid trendy.** No gradients, no 3D effects, no micro-animations. Simple > flashy.
- **Test on mobile first.** This is a parent app used on the couch with a phone.
- **Respect accessibility.** Keyboard navigation, focus states, and readable text are not optional.

---

**Design owned by:** A human designer who believes in simplicity, trust, and respect for the user's time.

---

## Applied updates (Jan 2026)

I implemented a small set of intentional UX changes to make FitPlanner feel more human, reassuring, and useful for parents. These changes follow the sports-platform principles listed above: focus on situations, reduce choice, show context, and prioritise the next action.

- **Make "Volgende training" the primary moment:** The dashboard's next-training card is now visible immediately on the "Mijn inschrijvingen" page and includes a short, calm helper line describing what to expect (arrive 10 minutes early, bring water, how to cancel). Why: parents most often want the answer to "When is the next training?"—presenting it first reduces friction and worry.

- **Filters are selection-based and visible:** The filter controls are shown (tap-based chips), so parents can quickly limit what they see without typing. Why: reduces cognitive load and supports quick situational decisions.

- **Calm, human microcopy:** Removed emoji from the filter reset control and added friendly helper text near the next training card. Why: keeps tone warm and trustworthy without looking 'gimmicky'.

- **Left accent border as a visual anchor:** Added a subtle left accent to training cards and the next-training card to guide the eye and give the interface a consistent, human-made signature. Why: small consistent details add perceived craftsmanship and calm.

How this supports parents
- Quick answers: parents get the next training first, and can act fast (remove or review registration).
- Low cognitive load: filters are taps, not typing; labels use everyday language and short sentences.
- Safe and reversible: helper text explains they can remove an inscription from "Mijn inschrijvingen", making actions feel safe.

Notes for future developers
- Keep the left accent border on new cards for consistency.
- Keep microcopy warm and brief; when adding strings, prefer conversational Dutch ("Klaar! Je kind staat ingeschreven voor Voetbal").
- Avoid over-animation. Keep focus-ring and short flashes only as confirmation cues.

