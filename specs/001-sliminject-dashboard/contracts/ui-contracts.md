# UI Contracts: Sliminject Dashboard

**Date**: 2026-03-14

These contracts define what each screen must provide and accept, independent of visual design. All text is in Dutch.

---

## Patient Screens

### P-01: Inloggen (Login)
**Route**: `/`
**Access**: Unauthenticated only. Redirect to dashboard if already logged in.

**Must display**:
- Email field
- Password field
- Submit button
- Error message on failed login

**On success**: Redirect to `/patient/dashboard`

---

### P-02: Dashboard (Progress Overview)
**Route**: `/patient/dashboard`
**Access**: Authenticated patients only.

**Must display**:
- Progress chart (weight over time, if logged)
- Wellbeing trend
- CTA to log a new entry
- Notification/badge if new content has been triggered
- Notification/badge if doctor has responded to a concern
- Upcoming dosage increase alert (if within 7 days)
- Upcoming appointment reminder (if within 48 hours)

**Empty state**: Prompt to log first entry.

---

### P-03: Voortgang Invoeren (Log Entry)
**Route**: `/patient/log`
**Access**: Authenticated patients only. Must work offline.

**Must accept**:
- Weight (kg, optional)
- Wellbeing score (1–5, required)
- Symptom tags (multi-select from predefined list, optional)
- Free text notes (optional)

**On submit (online)**: Save to Supabase, evaluate content triggers, return to dashboard.
**On submit (offline)**: Save to Dexie, queue for sync, show offline indicator, return to dashboard.

---

### P-04: Medicatieschema (Dosage Schedule)
**Route**: `/patient/medication`
**Access**: Authenticated patients only.

**Must display**:
- Current dose (mg)
- List of past doses with dates
- List of upcoming dose increases with dates
- Upcoming increase highlighted if within 7 days

---

### P-05: Iets Melden (Submit Concern)
**Route**: `/patient/concerns/new`
**Access**: Authenticated patients only.

**Must accept**:
- Severity selection (routine / urgent)
- Description (required, text area)
- Submit button

**Must display**:
- List of previously submitted concerns with status (open / beantwoord)
- Doctor's response per concern (when available)

---

### P-06: Educatieve Inhoud (Educational Content)
**Route**: `/patient/content`
**Access**: Authenticated patients only.

**Must display**:
- List of content items triggered for this patient, newest first
- Each item: title, type (artikel / video), viewed indicator
- On open: full article text or embedded video

**Empty state**: Message that content will appear as their journey progresses.

---

## Doctor Screens

### D-01: Patiëntenoverzicht (Patient Overview)
**Route**: `/doctor/overview`
**Access**: Authenticated doctors only.

**Must display**:
- List of all assigned patients
- Per patient: name, last check-in date, current dosage, open concern badge (if any)
- Patients with open concerns visually prioritised (sorted first or badged)

**Empty state**: Instructions to onboard patients.

---

### D-02: Patiëntprofiel (Patient Profile)
**Route**: `/doctor/patient/:id`
**Access**: Authenticated doctors — only for their own assigned patients.

**Must display**:
- Patient's progress chart (same as patient view)
- Full list of progress entries
- All submitted concerns with doctor response form
- Current dosage schedule
- Active advice note (editable inline)
- Upcoming appointment (if any)

---

### D-03: Schema Bewerken (Edit Dosage Schedule)
**Route**: `/doctor/patient/:id/schedule`
**Access**: Authenticated doctors — assigned patients only.

**Must accept**:
- Add/edit/remove dosage steps (dose mg + start date + optional note)
- Save

**On save**: Patient's medication view updates immediately.

---

### D-04: Afspraak Plannen (Schedule Appointment)
**Route**: `/doctor/patient/:id/appointments/new`
**Access**: Authenticated doctors — assigned patients only.

**Must accept**:
- Date + time
- Optional notes
- Submit

**On submit**: Appointment visible to both doctor and patient.

---

## Shared

### Navigatie
- Patient navigation: Dashboard, Medicatie, Melden, Inhoud
- Doctor navigation: Patiënten
- Both: Logout

### Toegangsbeheer (Access Control)
- Patients navigating to `/doctor/*` routes are redirected to `/patient/dashboard`
- Doctors navigating to `/patient/*` routes are redirected to `/doctor/overview`
- Unauthenticated users navigating to any protected route are redirected to `/`

### Offline Indicator
- Visible in patient app when device has no connectivity
- Log entry form remains functional; other features show a "niet beschikbaar offline" (not available offline) message
