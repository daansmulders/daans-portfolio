# Database Contract: Sliminject Dashboard

**Backend**: Supabase (PostgreSQL + RLS)
**Date**: 2026-03-14

---

## Row Level Security Policies

These are the authorisation rules enforced at the database level. Application-layer checks are secondary to these.

### profiles
- `SELECT`: User can read their own profile. Doctors can read profiles of their assigned patients.
- `UPDATE`: User can update their own profile only.

### patients
- `SELECT`: Patient reads their own row. Doctor reads rows where `doctor_id = auth.uid()`.
- `UPDATE`: Doctor only (to reassign or update treatment info).

### progress_entries
- `SELECT`: Patient reads own entries. Doctor reads entries where patient is assigned to them.
- `INSERT`: Patient only, into their own `patient_id`.
- `UPDATE/DELETE`: Patient only, for their own entries.

### concerns
- `SELECT`: Patient reads own concerns. Doctor reads concerns of assigned patients.
- `INSERT`: Patient only.
- `UPDATE`: Doctor only (to add `doctor_response` and set `status = reviewed`).

### dosage_schedule_entries
- `SELECT`: Patient and their assigned doctor.
- `INSERT/UPDATE/DELETE`: Assigned doctor only.

### advice
- `SELECT`: Patient and their assigned doctor.
- `INSERT/UPDATE`: Assigned doctor only.

### appointments
- `SELECT`: Patient and their assigned doctor.
- `INSERT/UPDATE`: Doctor only.

### educational_content
- `SELECT`: All authenticated users.
- `INSERT/UPDATE/DELETE`: Service role only (managed externally, not via app UI).

### content_triggers
- `SELECT`: All authenticated users.
- `INSERT/UPDATE/DELETE`: Service role only.

### patient_content_view
- `SELECT/INSERT`: Patient only, own rows.

---

## Security Notes

- All queries MUST use the Supabase client with the authenticated user's JWT — never the service role key in the client.
- The service role key is used only in migrations and seeding scripts, never exposed to the browser.
- `patient_id` in all INSERT operations MUST be derived from `auth.uid()` server-side via RLS, not accepted from the client payload.
