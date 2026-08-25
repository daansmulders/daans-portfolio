# Feature Specification: Sliminject Dashboard

**Feature Branch**: `001-sliminject-dashboard`
**Created**: 2026-03-14
**Status**: Draft
**Input**: User description: "Sliminject dashboard - a web app for doctors and patients on GLP-1 drugs. Patients can track progress, read and watch videos about normal feelings at different stages, see future dosage increases, and signal if something is wrong. Doctors can view patient progress, personalise medication schedules and advice, and schedule appointments."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Patient Progress Tracking (Priority: P1)

A patient on a GLP-1 drug opens the app to log their weight, note how they're feeling, and see their progress over time as a visual chart. This is the core loop that brings patients back to the app regularly.

**Why this priority**: Without progress tracking, the app has no persistent value for patients. This is the foundational loop everything else builds on.

**Independent Test**: A patient can register, log a measurement, and see a chart of their progress without any other features being present.

**Acceptance Scenarios**:

1. **Given** a logged-in patient, **When** they log a weight or symptom entry, **Then** the entry is saved and reflected in their progress chart immediately.
2. **Given** a patient with multiple entries, **When** they view their dashboard, **Then** they see a timeline chart showing their progression since starting the medication.
3. **Given** a patient who has not yet logged anything, **When** they open the dashboard, **Then** they see a clear prompt to make their first entry.

---

### User Story 2 - Doctor Patient Overview (Priority: P1)

A doctor opens the app and sees a list of all their patients with at-a-glance status: last check-in date, flagged concerns, current dosage stage, and trend (improving / stable / declining).

**Why this priority**: The doctor view is the other half of the product. Without it, the patient features have no clinical loop. This and P1 patient tracking must ship together.

**Independent Test**: A doctor can log in and see a patient list with meaningful status indicators without needing to click into individual profiles.

**Acceptance Scenarios**:

1. **Given** a logged-in doctor, **When** they open the dashboard, **Then** they see all their patients with last activity date and any open concerns flagged.
2. **Given** a patient has submitted a concern, **When** the doctor views the patient list, **Then** that patient is visually prioritised or badged.
3. **Given** no patients are assigned, **When** the doctor opens the dashboard, **Then** they see an empty state with instructions for onboarding patients.

---

### User Story 3 - Symptom & Concern Signalling (Priority: P2)

A patient experiences nausea or another side effect and wants to flag it to their doctor. They tap a "something feels off" button, describe the issue, and their doctor is notified.

**Why this priority**: Patient safety. The ability to signal problems is the most medically important feature after basic tracking, and gives the doctor visibility into issues between appointments.

**Independent Test**: A patient can submit a concern and a doctor viewing that patient's profile sees the alert, with no other features needed.

**Acceptance Scenarios**:

1. **Given** a logged-in patient, **When** they submit a concern with a description, **Then** the concern is logged and flagged as pending review on the doctor's side.
2. **Given** a concern has been submitted, **When** the doctor reviews and responds, **Then** the patient sees the doctor's response in the app.
3. **Given** a patient submits an urgent concern, **When** reviewed by the doctor, **Then** the concern is visually distinguished from routine check-ins.

---

### User Story 4 - Personalise Medication & Advice (Priority: P2)

A doctor reviews a patient's progress and decides to adjust their dosage schedule or add a personal note/advice visible to the patient.

**Why this priority**: Personalisation is what elevates the tool from generic to clinically useful. Without it, doctors can observe but not act through the app.

**Independent Test**: A doctor can update a patient's schedule and add a note, and the patient sees the updated information without needing any other feature.

**Acceptance Scenarios**:

1. **Given** a doctor is on a patient's profile, **When** they update the dosage schedule, **Then** the patient's medication timeline reflects the change immediately.
2. **Given** a doctor writes a personal advice note, **When** the patient opens their dashboard, **Then** the note is visible in a dedicated section.

---

### User Story 5 - Educational Content Triggered by Progress Events (Priority: P3)

A patient logs nausea for the first time and the app automatically surfaces a short video about managing nausea on GLP-1 medication. Later, when their first dosage increase is scheduled, they receive content explaining what to expect. Content appears at the right moment in their journey — not as a static library to browse.

**Why this priority**: Reduces anxiety and unnecessary doctor contact by setting expectations at the exact moment they're relevant. High value for patient confidence, but not blocking for the core product.

**Independent Test**: A patient who triggers a known progress event sees the linked content surfaced without any doctor action required.

**Acceptance Scenarios**:

1. **Given** a patient logs a symptom (e.g. nausea) for the first time, **When** the entry is saved, **Then** the app surfaces relevant educational content linked to that symptom.
2. **Given** a patient reaches a dosage increase in their schedule, **When** the increase date arrives, **Then** the app surfaces content about what to expect from the higher dose.
3. **Given** a patient hits a weight milestone or plateau, **When** the system detects it from their progress entries, **Then** relevant content is surfaced.
4. **Given** a patient has already viewed a piece of content, **When** the same trigger occurs again, **Then** the content is not surfaced as new a second time.
5. **Given** a patient reaches a set number of weeks into treatment, **When** the threshold is crossed, **Then** stage-appropriate content is surfaced automatically.

---

### User Story 6 - Dosage Schedule & Future Increases (Priority: P3)

A patient wants to know when their next dosage increase is coming and what to expect. They open their medication timeline and see a clear schedule of past and upcoming doses.

**Why this priority**: Patients frequently ask about this at appointments. Self-service visibility reduces doctor workload and builds patient confidence.

**Independent Test**: A patient with a personalised schedule can view their full medication timeline independently of any other features.

**Acceptance Scenarios**:

1. **Given** a doctor has set a dosage schedule for a patient, **When** the patient opens their medication view, **Then** they see current dose, past doses, and upcoming increases with dates.
2. **Given** a dosage increase is coming within 7 days, **When** the patient opens the app, **Then** they see a notification or visual callout.

---

### User Story 7 - Appointment Scheduling (Priority: P3)

A doctor wants to schedule a follow-up appointment with a patient directly from the app, and the patient receives a confirmation.

**Why this priority**: Useful but not core to the safety and tracking loop. Can be added once the foundational features are stable.

**Independent Test**: A doctor can create an appointment and a patient sees it in their app without any other scheduling system required.

**Acceptance Scenarios**:

1. **Given** a doctor selects a patient, **When** they schedule an appointment, **Then** the appointment appears in both the doctor's and patient's view.
2. **Given** an appointment is upcoming within 48 hours, **When** the patient opens the app, **Then** they see a reminder.

---

### Edge Cases

- What happens when a patient stops logging for an extended period — does the doctor get notified of inactivity?
- How does the system handle a patient submitting multiple urgent concerns in rapid succession?
- What if a doctor has many patients — how does the overview remain scannable?
- What happens to a patient's data if they are transferred to a different doctor?
- Can a patient view educational content for stages they haven't reached yet, and is that clinically appropriate?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST support two distinct roles: Patient and Doctor, each with a separate view and access scope.
- **FR-002**: Patients MUST be able to log progress entries (at minimum: date, weight, general wellbeing rating).
- **FR-003**: Patients MUST be able to view their logged entries as a visual progress chart over time.
- **FR-004**: Patients MUST be able to submit a concern or symptom signal to their assigned doctor.
- **FR-005**: The system MUST automatically surface educational articles and videos when a patient reaches a defined progress event.
- **FR-005a**: Initial progress events that trigger content are: logging a specific symptom for the first time, a dosage increase occurring, reaching a weight milestone or plateau, and crossing a treatment duration threshold (weeks into treatment).
- **FR-005b**: The system MUST support adding new progress event types in the future without restructuring existing content or patient data.
- **FR-005c**: Content that has already been viewed MUST NOT be re-surfaced as new when the same trigger occurs again.
- **FR-005d**: Doctors MAY override or supplement automatically surfaced content for individual patients (P3 — not required for initial release).
- **FR-006**: Patients MUST be able to view their current and upcoming dosage schedule.
- **FR-007**: Doctors MUST be able to view a list of all their assigned patients with status indicators.
- **FR-008**: Doctors MUST be able to view an individual patient's full progress history and submitted concerns.
- **FR-009**: Doctors MUST be able to update a patient's dosage schedule.
- **FR-010**: Doctors MUST be able to write personalised advice notes visible to the patient.
- **FR-011**: Doctors MUST be able to respond to patient-submitted concerns.
- **FR-012**: Doctors MUST be able to schedule appointments with patients.
- **FR-013**: The system MUST notify patients of upcoming dosage increases and appointments.
- **FR-014**: The system MUST visually flag patients with open unreviewed concerns on the doctor's overview.
- **FR-015**: The system MUST ensure a patient cannot access another patient's data or a doctor's management tools.
- **FR-016**: The app MUST meet WCAG 2.1 AA accessibility standards throughout all patient and doctor interfaces.
- **FR-017**: Patients MUST be able to log progress entries while offline. Entries MUST sync automatically when connectivity is restored.
- **FR-018**: The app MUST be available in Dutch only. All interface text, labels, error messages, and content MUST be in Dutch.

### Key Entities

- **Patient**: A person on a GLP-1 medication programme. Has a treatment stage, a dosage schedule, progress entries, submitted concerns, and a link to an assigned doctor.
- **Doctor**: A medical professional managing one or more patients. Can personalise schedules, write advice, respond to concerns, and schedule appointments.
- **Progress Entry**: A dated log item from a patient containing at minimum wellbeing indicators (e.g. weight, general feeling score).
- **Concern**: A patient-submitted signal that something is wrong. Has a severity level, description, status (open/reviewed), and optionally a doctor's response.
- **Dosage Schedule**: A sequence of dosage levels with dates, personalised per patient by their doctor.
- **Educational Content**: Articles and videos linked to one or more progress event types. Surfaced automatically when a patient triggers a matching event. Tracks viewed state per patient.
- **Progress Event**: A defined moment in a patient's journey that can trigger content (e.g., first symptom log of a type, dosage increase, weight milestone, treatment duration threshold). Extensible — new event types can be added over time.
- **Appointment**: A scheduled meeting between a doctor and patient with a date, time, and optional notes.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Patients can log a progress entry in under 60 seconds from opening the app.
- **SC-002**: Doctors can assess a patient's status (last activity, open concerns, current stage) without navigating away from the patient overview.
- **SC-003**: A concern submitted by a patient is visible to the doctor without any additional action required by the patient.
- **SC-004**: Patients can find educational content relevant to their current stage in under 2 taps/clicks from the home screen.
- **SC-005**: Dosage schedule changes made by a doctor are reflected in the patient's view without requiring the patient to refresh or re-login.
- **SC-006**: The app is fully usable on mobile-sized screens — patients are assumed to primarily use a phone.

## Security *(mandatory)*

This app handles sensitive personal health data. Security is non-negotiable and must be considered at every layer.

- **SEC-001**: All patient data MUST be accessible only to the patient themselves and their assigned doctor. No cross-patient data exposure is acceptable under any circumstance.
- **SEC-002**: All data transmission MUST be encrypted in transit.
- **SEC-003**: All stored patient data MUST be encrypted at rest.
- **SEC-004**: Authentication MUST be required to access any part of the app. There are no public or guest views.
- **SEC-005**: Sessions MUST expire after a period of inactivity and require re-authentication.
- **SEC-006**: The system MUST log all access to patient records (who accessed what and when).
- **SEC-007**: Doctors MUST only be able to access data for patients explicitly assigned to them.
- **SEC-008**: The app MUST NOT expose patient identifiers or health data in URLs, browser history, or client-side logs.

## Constraints

- **Accessibility**: All interfaces MUST conform to WCAG 2.1 AA — colour contrast, keyboard navigability, screen reader compatibility, and touch target sizes.
- **Offline support**: Progress logging MUST work without an internet connection. Entries sync automatically when connectivity is restored. Other features (doctor communication, content) may require connectivity.
- **Language**: Dutch only. All interface text, labels, error messages, and content must be in Dutch. No internationalisation in scope.
- **Platform**: Mobile-first. The patient experience is designed for phone-sized screens; the doctor overview may assume a larger screen.

## Assumptions

- Each patient is assigned to exactly one doctor. Many-to-many doctor-patient relationships are out of scope for this prototype.
- Authentication is email/password for prototype simplicity; SSO or clinic system integration is deferred.
- Educational content is managed outside the app (e.g., static files or a simple CMS) — a content authoring UI is out of scope.
- Treatment stage is either manually set by the doctor or derived from the treatment start date and dosage schedule.
- This is a prototype — no real patient data will be used; all data is fictional/demo.
