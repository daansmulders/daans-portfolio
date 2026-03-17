The doctor side needed better navigation and faster access to what matters.

The patient profile went from a single scrolling page to four tabs — Overzicht, Medicatie, Meldingen, Afspraken. The Meldingen tab carries a badge when open concerns exist. The schedule editor gained a live SVG titration curve that updates as entries are added. An urgent concern badge in the navigation is powered by a Supabase Realtime subscription — no refresh needed.

Each of these was a separate user story in the SpecKit backlog. Specifying them that way — with a clear actor, goal, and test — meant implementation was straightforward. The doctor-side work took roughly one session to complete in full.
