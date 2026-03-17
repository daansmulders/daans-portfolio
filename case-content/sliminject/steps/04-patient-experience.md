The patient side is built around one daily habit: logging. Every design decision either supports that habit or gets out of the way.

The dashboard leads with a full-width log CTA — suppressed once logged, replaced by a quiet confirmation. Onboarding ends with a first log entry, so the habit starts before the patient even reaches the dashboard.

Smaller details that came out of the review: labelled anchors on the hunger scale, a prioritised symptom checklist (three primary options visible, rest behind a toggle), and a response time shown after submitting a concern. Each change was specified as a user story with a clear test criterion, then implemented in one session.

One non-obvious fix: the weekly milestone toast was firing for any log near a 7-day boundary. The correct behaviour — only the first log of each treatment week triggers it — required a deliberate definition of what a "weekly log" actually means.
