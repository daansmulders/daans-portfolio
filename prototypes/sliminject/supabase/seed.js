// Demo-data seed voor Sliminject
// Gebruik: npm run seed
// Vereist: VITE_SUPABASE_URL en SUPABASE_SERVICE_ROLE_KEY in .env

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Ontbrekende omgevingsvariabelen: VITE_SUPABASE_URL en SUPABASE_SERVICE_ROLE_KEY zijn vereist.')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

function daysAgo(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}

function daysFromNow(n) {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d
}

function dateStr(d) {
  return d.toISOString().split('T')[0]
}

async function createUser(email, password, role, fullName) {
  const { data: list } = await supabase.auth.admin.listUsers()
  const existing = list?.users?.find(u => u.email === email)

  if (existing) {
    // Bijwerken in plaats van verwijderen — voorkomt email-reserveringsproblemen
    const { error } = await supabase.auth.admin.updateUserById(existing.id, {
      password,
      email_confirm: true,
      user_metadata: { role, full_name: fullName },
    })
    if (error) throw new Error(`Bijwerken ${email} mislukt: ${error.message}`)
    console.log(`  ✓ ${email}  →  ${fullName} (bijgewerkt)`)
    return existing.id
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role, full_name: fullName },
  })
  if (error) throw new Error(`Aanmaken ${email} mislukt: ${error.message}`)
  console.log(`  ✓ ${email}  →  ${fullName}`)
  return data.user.id
}

async function upsertPharmacies() {
  const pharmacies = [
    { name: 'Apotheek De Linde', address: 'Hoofdstraat 12', city: 'Amsterdam', phone: '020-1234567' },
    { name: 'Pharma Utrecht Centrum', address: 'Lange Viestraat 8', city: 'Utrecht', phone: '030-7654321' },
    { name: 'Apotheek Zeeburg', address: 'Insulindeweg 45', city: 'Amsterdam', phone: '020-9876543' },
  ]
  const result = []
  for (const p of pharmacies) {
    const { data: existing } = await supabase
      .from('pharmacies').select('id, name').eq('name', p.name).maybeSingle()
    if (existing) {
      console.log(`  ✓ ${existing.name} (bestaand)`)
      result.push(existing)
    } else {
      const { data, error } = await supabase
        .from('pharmacies').insert(p).select('id, name').single()
      if (error) throw new Error(`Apotheek ${p.name}: ${error.message}`)
      console.log(`  ✓ ${data.name}`)
      result.push(data)
    }
  }
  return result
}

async function run() {
  console.log('Sliminject demo-data laden...\n')

  // ── Apotheken ────────────────────────────────────────────────────────────
  console.log('Apotheken aanmaken:')
  const [lindePharma, utrechtPharma, zeeburgPharma] = await upsertPharmacies()
  console.log()

  // ── Gebruikers ──────────────────────────────────────────────────────────
  console.log('Gebruikers aanmaken:')
  const dokterId  = await createUser('dokter@demo.nl',   'demo1234', 'doctor',  'Dr. Fatima el-Amin')
  const larsId    = await createUser('patient@demo.nl',  'demo1234', 'patient', 'Lars Veenstra')
  const anoukId   = await createUser('patient2@demo.nl', 'demo1234', 'patient', 'Anouk de Boer')
  const mohamedId = await createUser('patient3@demo.nl', 'demo1234', 'patient', 'Mohamed Bouazza')
  const nieuwId   = await createUser('nieuw@demo.nl',    'demo1234', 'patient', 'Sara Dijkstra')

  // Telefoonnummers instellen
  await supabase.from('profiles').update({ phone: '06-12345678' }).eq('id', larsId)
  await supabase.from('profiles').update({ phone: '06-23456789' }).eq('id', anoukId)
  await supabase.from('profiles').update({ phone: '06-34567890' }).eq('id', mohamedId)
  await supabase.from('profiles').update({ phone: '06-45678901' }).eq('id', nieuwId)

  // ── Dokterrecord ─────────────────────────────────────────────────────────
  const { error: eDokter } = await supabase.from('doctors').upsert({ id: dokterId })
  if (eDokter) throw new Error(`Dokterrecord: ${eDokter.message}`)

  // ── Patiëntrecords ───────────────────────────────────────────────────────
  const { error: ePatienten } = await supabase.from('patients').upsert([
    { id: larsId,    doctor_id: dokterId, treatment_start_date: dateStr(daysAgo(56)), current_dosage_mg: 0.5,  pharmacy_id: lindePharma.id },
    { id: anoukId,   doctor_id: dokterId, treatment_start_date: dateStr(daysAgo(28)), current_dosage_mg: 0.25, pharmacy_id: utrechtPharma.id },
    { id: mohamedId, doctor_id: dokterId, treatment_start_date: dateStr(daysAgo(14)), current_dosage_mg: 0.25, pharmacy_id: zeeburgPharma.id },
    { id: nieuwId,   doctor_id: dokterId, treatment_start_date: dateStr(new Date()),  current_dosage_mg: 0.25, pharmacy_id: lindePharma.id },
  ])
  if (ePatienten) throw new Error(`Patiëntrecords: ${ePatienten.message}`)
  console.log('\n✓ Dokter- en patiëntrecords aangemaakt')

  // ── Bestaande data opruimen (idempotent) ─────────────────────────────────
  const allIds = [larsId, anoukId, mohamedId, nieuwId]
  await supabase.from('weekly_wellbeing_checkins').delete().in('patient_id', allIds)
  await supabase.from('injection_adherence').delete().in('patient_id', allIds)
  await supabase.from('progress_entries').delete().in('patient_id', allIds)
  await supabase.from('dosage_schedule_entries').delete().in('patient_id', allIds)
  await supabase.from('advice').delete().in('patient_id', allIds)
  await supabase.from('concerns').delete().in('patient_id', allIds)
  await supabase.from('appointments').delete().in('patient_id', allIds)

  // ── Voortgangsmetingen ───────────────────────────────────────────────────
  // food_noise_score: hoog vroeg in behandeling (4–5), daalt naar 1–2 recent.
  // Dit triggert de voedselruis-mijlpaal voor Lars.
  const { error: eLars } = await supabase.from('progress_entries').insert([
    { patient_id: larsId, logged_at: daysAgo(56).toISOString(), weight_kg: 98.2, hunger_score: 4, food_noise_score: 5, symptoms: ['Misselijkheid', 'Vermoeidheid'], notes: 'Eerste week, nogal zwaar.' },
    { patient_id: larsId, logged_at: daysAgo(49).toISOString(), weight_kg: 97.5, hunger_score: 4, food_noise_score: 4, symptoms: ['Misselijkheid'], notes: null },
    { patient_id: larsId, logged_at: daysAgo(42).toISOString(), weight_kg: 97.0, hunger_score: 3, food_noise_score: 4, symptoms: ['Vermoeidheid'], notes: null },
    { patient_id: larsId, logged_at: daysAgo(35).toISOString(), weight_kg: 96.3, hunger_score: 3, food_noise_score: 3, symptoms: [], notes: 'Misselijkheid bijna weg.' },
    { patient_id: larsId, logged_at: daysAgo(28).toISOString(), weight_kg: 95.8, hunger_score: 2, food_noise_score: 2, symptoms: [], notes: null },
    { patient_id: larsId, logged_at: daysAgo(21).toISOString(), weight_kg: 95.1, hunger_score: 2, food_noise_score: 2, symptoms: [], notes: 'Dosering verhoogd naar 0,5 mg.' },
    { patient_id: larsId, logged_at: daysAgo(14).toISOString(), weight_kg: 94.6, hunger_score: 3, food_noise_score: 1, symptoms: ['Misselijkheid'], notes: null },
    { patient_id: larsId, logged_at: daysAgo(7).toISOString(),  weight_kg: 94.0, hunger_score: 2, food_noise_score: 2, symptoms: [], notes: null },
  ])
  if (eLars) throw new Error(`Metingen Lars: ${eLars.message}`)

  const { error: eAnouk } = await supabase.from('progress_entries').insert([
    { patient_id: anoukId, logged_at: daysAgo(28).toISOString(), weight_kg: 82.0, hunger_score: 4, food_noise_score: 4, symptoms: ['Misselijkheid', 'Hoofdpijn'], notes: null },
    { patient_id: anoukId, logged_at: daysAgo(21).toISOString(), weight_kg: 81.4, hunger_score: 3, food_noise_score: 3, symptoms: ['Misselijkheid'], notes: null },
    { patient_id: anoukId, logged_at: daysAgo(14).toISOString(), weight_kg: 81.0, hunger_score: 3, food_noise_score: 2, symptoms: [], notes: null },
    { patient_id: anoukId, logged_at: daysAgo(7).toISOString(),  weight_kg: 80.5, hunger_score: 2, food_noise_score: 1, symptoms: [], notes: null },
  ])
  if (eAnouk) throw new Error(`Metingen Anouk: ${eAnouk.message}`)

  const { error: eMohamed } = await supabase.from('progress_entries').insert([
    { patient_id: mohamedId, logged_at: daysAgo(14).toISOString(), weight_kg: 104.0, hunger_score: 3, symptoms: ['Vermoeidheid'], notes: null },
    { patient_id: mohamedId, logged_at: daysAgo(7).toISOString(),  weight_kg: 103.5, hunger_score: 3, symptoms: [], notes: null },
  ])
  if (eMohamed) throw new Error(`Metingen Mohamed: ${eMohamed.message}`)

  // Sara: 2 eerdere metingen zodat ze het onboarding-scherm overslaat en de injectiedag-kaart ziet
  const { error: eSara } = await supabase.from('progress_entries').insert([
    { patient_id: nieuwId, logged_at: daysAgo(14).toISOString(), weight_kg: 78.5, hunger_score: 4, food_noise_score: 4, symptoms: ['Misselijkheid'], notes: 'Eerste meting, wat onwennig.' },
    { patient_id: nieuwId, logged_at: daysAgo(7).toISOString(),  weight_kg: 77.9, hunger_score: 3, food_noise_score: 3, symptoms: [], notes: null },
  ])
  if (eSara) throw new Error(`Metingen Sara: ${eSara.message}`)
  console.log('✓ Voortgangsmetingen aangemaakt (Lars: 8, Anouk: 4, Mohamed: 2, Sara: 2, met food_noise_score)')

  // ── Wekelijkse welzijn check-ins ─────────────────────────────────────────
  // Lars: check-in van 35 dagen geleden (laag) + check-in van 8 dagen geleden (hoog).
  // → isDue = true (8 dagen ≥ 7): check-in kaart zichtbaar op dashboard.
  // → +2 verbetering per dimensie: alle drie mijlpalen getriggerd.
  // Anouk: één check-in van 8 dagen geleden → check-in kaart zichtbaar.
  const { error: eCheckins } = await supabase.from('weekly_wellbeing_checkins').insert([
    {
      patient_id: larsId,
      submitted_at: daysAgo(35).toISOString(),
      energy_score: 2, mood_score: 2, confidence_score: 2,
      note: 'Nog erg moe van de bijwerkingen.',
    },
    {
      patient_id: larsId,
      submitted_at: daysAgo(8).toISOString(),
      energy_score: 4, mood_score: 4, confidence_score: 4,
      note: 'Voel me echt beter de laatste weken.',
    },
    {
      patient_id: anoukId,
      submitted_at: daysAgo(8).toISOString(),
      energy_score: 3, mood_score: 3, confidence_score: null,
      note: null,
    },
  ])
  if (eCheckins) throw new Error(`Welzijn check-ins: ${eCheckins.message}`)
  console.log('✓ Welzijn check-ins aangemaakt (Lars: 2, Anouk: 1 — check-in kaart zichtbaar voor beide)')

  // ── Medicatieschema ──────────────────────────────────────────────────────
  const { error: eSchema } = await supabase.from('dosage_schedule_entries').insert([
    { patient_id: larsId, dose_mg: 0.25, start_date: dateStr(daysAgo(56)), created_by_doctor_id: dokterId, drug_type_id: 'ozempic', notes: 'Startdosering', status: 'approved' },
    { patient_id: larsId, dose_mg: 0.5,  start_date: dateStr(daysAgo(28)), created_by_doctor_id: dokterId, drug_type_id: 'ozempic', notes: null, status: 'approved' },
    { patient_id: larsId, dose_mg: 1.0,  start_date: dateStr(daysFromNow(5)), created_by_doctor_id: dokterId, drug_type_id: 'ozempic', notes: 'Verhoging na goed herstel', status: 'approved' },
    { patient_id: anoukId,   dose_mg: 0.25, start_date: dateStr(daysAgo(28)), created_by_doctor_id: dokterId, drug_type_id: 'wegovy',   notes: null, status: 'approved' },
    { patient_id: mohamedId, dose_mg: 0.25, start_date: dateStr(daysAgo(14)), created_by_doctor_id: dokterId, drug_type_id: 'mounjaro', notes: null, status: 'approved' },
    { patient_id: nieuwId,   dose_mg: 0.25, start_date: dateStr(new Date()),  created_by_doctor_id: dokterId, drug_type_id: 'ozempic',  notes: 'Startdosering', status: 'approved' },
    { patient_id: nieuwId,   dose_mg: 0.5,  start_date: dateStr(daysFromNow(28)), created_by_doctor_id: dokterId, drug_type_id: 'ozempic', notes: null, status: 'draft' },
  ])
  if (eSchema) throw new Error(`Medicatieschema: ${eSchema.message}`)
  console.log('✓ Medicatieschema aangemaakt')

  // ── Advies ───────────────────────────────────────────────────────────────
  const { error: eAdvies } = await supabase.from('advice').insert({
    patient_id: larsId,
    doctor_id: dokterId,
    body: 'Lars, je doet het goed. Probeer je maaltijden klein te houden rondom de dosisverhoging volgende maand. Neem contact op als de misselijkheid terugkomt.',
  })
  if (eAdvies) throw new Error(`Advies: ${eAdvies.message}`)
  console.log('✓ Persoonlijk advies aangemaakt')

  // ── Meldingen ────────────────────────────────────────────────────────────
  const { error: eMeldingen } = await supabase.from('concerns').insert([
    {
      patient_id: larsId,
      submitted_at: daysAgo(10).toISOString(),
      severity: 'routine',
      description: 'Ik merk dat ik de laatste dagen meer misselijkheid voel na het eten, ook bij kleine porties.',
      status: 'reviewed',
      doctor_response: 'Dit is normaal na de dosisverhoging. Probeer vloeibaar voedsel de eerste week. Als het na 10 dagen niet verbetert, neem dan contact op.',
      responded_at: daysAgo(9).toISOString(),
    },
    {
      patient_id: anoukId,
      submitted_at: daysAgo(3).toISOString(),
      severity: 'urgent',
      description: 'Ik heb de afgelopen 2 dagen erge hoofdpijn die niet overgaat met paracetamol.',
      status: 'open',
    },
  ])
  if (eMeldingen) throw new Error(`Meldingen: ${eMeldingen.message}`)
  console.log('✓ Meldingen aangemaakt (1 beantwoord, 1 open)')

  // ── Afspraak ─────────────────────────────────────────────────────────────
  const { error: eAfspraak } = await supabase.from('appointments').insert({
    patient_id: larsId,
    doctor_id: dokterId,
    scheduled_at: daysFromNow(12).toISOString(),
    notes: 'Controle voor dosisverhoging naar 1,0 mg',
  })
  if (eAfspraak) throw new Error(`Afspraak: ${eAfspraak.message}`)
  console.log('✓ Afspraak aangemaakt (Lars, over 12 dagen)')

  // ── Klaar ────────────────────────────────────────────────────────────────
  console.log('\n✅ Demo-data geladen!\n')
  console.log('Demo-accounts:')
  console.log('  dokter@demo.nl    /  demo1234  →  Dr. Fatima el-Amin (dokter)')
  console.log('  patient@demo.nl   /  demo1234  →  Lars Veenstra       (patiënt, check-in kaart zichtbaar, voedselruis + welzijn mijlpalen)')
  console.log('  patient2@demo.nl  /  demo1234  →  Anouk de Boer       (patiënt, open melding, check-in kaart zichtbaar)')
  console.log('  patient3@demo.nl  /  demo1234  →  Mohamed Bouazza     (patiënt)')
  console.log('  nieuw@demo.nl     /  demo1234  →  Sara Dijkstra        (patiënt, injectiedag vandaag → injectiedag-kaart zichtbaar op dashboard)')
}

run().catch(err => {
  console.error('\n❌ Seed mislukt:', err.message)
  process.exit(1)
})
