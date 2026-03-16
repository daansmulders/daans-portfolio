import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL en anon key zijn vereist. Kopieer .env.example naar .env en vul de waarden in.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; role: 'patient' | 'doctor'; full_name: string; created_at: string }
        Insert: { id: string; role: 'patient' | 'doctor'; full_name: string }
        Update: { full_name?: string }
      }
      patients: {
        Row: { id: string; doctor_id: string; treatment_start_date: string; current_dosage_mg: number }
        Insert: { id: string; doctor_id: string; treatment_start_date: string; current_dosage_mg: number }
        Update: { doctor_id?: string; treatment_start_date?: string; current_dosage_mg?: number }
      }
      doctors: {
        Row: { id: string }
        Insert: { id: string }
        Update: Record<string, never>
      }
      progress_entries: {
        Row: { id: string; patient_id: string; logged_at: string; weight_kg: number | null; wellbeing_score: number; symptoms: string[]; notes: string | null }
        Insert: { patient_id: string; logged_at: string; weight_kg?: number | null; wellbeing_score: number; symptoms?: string[]; notes?: string | null }
        Update: never
      }
      concerns: {
        Row: { id: string; patient_id: string; submitted_at: string; severity: 'routine' | 'urgent'; description: string; status: 'open' | 'reviewed'; doctor_response: string | null; responded_at: string | null }
        Insert: { patient_id: string; severity: 'routine' | 'urgent'; description: string }
        Update: { status?: 'reviewed'; doctor_response?: string; responded_at?: string }
      }
      dosage_schedule_entries: {
        Row: { id: string; patient_id: string; dose_mg: number; start_date: string; notes: string | null; created_by_doctor_id: string }
        Insert: { patient_id: string; dose_mg: number; start_date: string; notes?: string | null; created_by_doctor_id: string }
        Update: { dose_mg?: number; start_date?: string; notes?: string | null }
      }
      advice: {
        Row: { id: string; patient_id: string; doctor_id: string; body: string; created_at: string; updated_at: string }
        Insert: { patient_id: string; doctor_id: string; body: string }
        Update: { body?: string; updated_at?: string }
      }
      appointments: {
        Row: { id: string; patient_id: string; doctor_id: string; scheduled_at: string; notes: string | null }
        Insert: { patient_id: string; doctor_id: string; scheduled_at: string; notes?: string | null }
        Update: { scheduled_at?: string; notes?: string | null }
      }
    }
  }
}
