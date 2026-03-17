I started by thinking through the full product scope as a designer — both patient and doctor sides — and used **SpecKit** to formalise it into a spec, a technical plan, and an ordered task list before writing a line of code.

SpecKit is a structured workflow that runs inside Claude Code. It forced me to define each feature as an independently testable user story, think through data models and API contracts upfront, and only then move to implementation. The discipline was deliberate: I wanted to see whether AI-assisted development could produce something coherent and considered, not just fast.

The initial build covered auth, the full patient loop (logging, medication, concerns, content), and the full doctor side (patient overview, profile, schedule editor, prescriptions, appointments) — all offline-capable via a Dexie.js write queue.

**Stack:** React 19, TypeScript, Vite, Tailwind CSS 4, Radix UI, Supabase, Dexie.js.
