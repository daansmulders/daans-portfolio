# Data Model: Sliminject Dashboard

**Feature**: 001-sliminject-dashboard
**Date**: 2026-03-14

---

## Entities

### User
Managed by Supabase Auth. Extended with a `profiles` table.

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | Primary key (matches Supabase auth.users.id) |
| role | enum(patient, doctor) | Determines which view the user sees |
| full_name | text | Display name |
| created_at | timestamp | |

---

### Patient
One-to-one with a User of role `patient`.

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | PK, FK → profiles.id |
| doctor_id | uuid | FK → doctors.id |
| treatment_start_date | date | Used to calculate weeks-in-treatment |
| current_dosage_mg | numeric | Current active dose |

**RLS**: Patient row readable only by the patient themselves and their assigned doctor.

---

### Doctor
One-to-one with a User of role `doctor`.

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | PK, FK → profiles.id |

**RLS**: Doctor can read their own record. Patients cannot read doctor records beyond their assigned doctor's name.

---

### ProgressEntry
Logged by patients. Offline-queued via Dexie, synced to Supabase.

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | PK |
| patient_id | uuid | FK → patients.id |
| logged_at | timestamp | When the entry was made (client time) |
| weight_kg | numeric | nullable |
| wellbeing_score | int (1–5) | Required |
| symptoms | text[] | Array of reported symptom tags (e.g. ["nausea", "fatigue"]) |
| notes | text | Optional free text |
| synced | boolean | False while offline (Dexie only); true once in Supabase |

**RLS**: Readable and writable only by the patient. Readable by the patient's assigned doctor.

**State transitions**: `synced: false` (Dexie, offline) → `synced: true` (Supabase, on reconnect)

---

### Concern
Submitted by a patient when something feels wrong.

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | PK |
| patient_id | uuid | FK → patients.id |
| submitted_at | timestamp | |
| severity | enum(routine, urgent) | Patient-selected |
| description | text | |
| status | enum(open, reviewed) | Open until doctor responds |
| doctor_response | text | nullable |
| responded_at | timestamp | nullable |

**RLS**: Patient can create and read their own concerns. Doctor can read and respond to concerns from their assigned patients.

---

### DosageScheduleEntry
Each row is one dosage event in a patient's personalised schedule.

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | PK |
| patient_id | uuid | FK → patients.id |
| dose_mg | numeric | |
| start_date | date | When this dose begins |
| notes | text | Optional doctor note for this dose step |
| created_by_doctor_id | uuid | FK → doctors.id |

**RLS**: Readable by patient and their doctor. Writable only by the assigned doctor.

---

### Advice
A personalised note from a doctor, visible to a specific patient.

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | PK |
| patient_id | uuid | FK → patients.id |
| doctor_id | uuid | FK → doctors.id |
| body | text | The advice content |
| created_at | timestamp | |
| updated_at | timestamp | |

**RLS**: Readable by patient and their doctor. Writable only by the assigned doctor.

---

### Appointment

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | PK |
| patient_id | uuid | FK → patients.id |
| doctor_id | uuid | FK → doctors.id |
| scheduled_at | timestamp | |
| notes | text | Optional |

**RLS**: Readable and writable by patient and their assigned doctor.

---

### EducationalContent

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | PK |
| title | text | Dutch |
| body_markdown | text | nullable — for articles |
| video_url | text | nullable — for videos |
| content_type | enum(article, video) | |

---

### ContentTrigger
Maps content items to progress events that should surface them.

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | PK |
| content_id | uuid | FK → educational_content.id |
| event_type | enum(SYMPTOM_FIRST_LOG, DOSAGE_INCREASE, WEIGHT_MILESTONE, WEIGHT_PLATEAU, TREATMENT_WEEK) | |
| event_parameter | text | nullable — e.g. symptom name for SYMPTOM_FIRST_LOG, week number for TREATMENT_WEEK |

---

### PatientContentView
Tracks which content a patient has already seen, to prevent re-surfacing.

| Field | Type | Notes |
|-------|------|-------|
| patient_id | uuid | FK → patients.id |
| content_id | uuid | FK → educational_content.id |
| first_viewed_at | timestamp | |

**Primary key**: (patient_id, content_id)
**RLS**: Readable and writable only by the patient.

---

## Key Relationships

```text
Doctor ──< Patient ──< ProgressEntry
                  ──< Concern
                  ──< DosageScheduleEntry
                  ──< Advice
                  ──< Appointment
                  ──< PatientContentView ──> EducationalContent
                                               ↑
                                         ContentTrigger
```

---

## Offline Sync (Dexie schema)

Local IndexedDB tables mirror server-side tables for offline-capable data only:

```text
OfflineProgressEntry: id, patient_id, logged_at, weight_kg, wellbeing_score, symptoms, notes, synced
```

On reconnect: unsynced entries are POSTed to Supabase in chronological order, then marked synced locally.
