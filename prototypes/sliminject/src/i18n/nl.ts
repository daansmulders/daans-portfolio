// Alle Nederlandse UI-teksten voor Sliminject
export const nl = {
  // Algemeen
  app_name: 'Sliminject',
  laden: 'Laden...',
  opslaan: 'Opslaan',
  annuleren: 'Annuleren',
  bevestigen: 'Bevestigen',
  terug: 'Terug',
  niet_beschikbaar_offline: 'Niet beschikbaar zonder internetverbinding',
  offline_indicator: 'Je bent offline',
  offline_opgeslagen: 'Opgeslagen — wordt gesynchroniseerd zodra je weer online bent',

  // Auth
  inloggen: 'Inloggen',
  uitloggen: 'Uitloggen',
  email: 'E-mailadres',
  wachtwoord: 'Wachtwoord',
  inloggen_mislukt: 'Inloggen mislukt. Controleer je e-mailadres en wachtwoord.',

  // Navigatie patiënt
  nav_dashboard: 'Dashboard',
  nav_medicatie: 'Medicatie',
  nav_melden: 'Iets melden',
  nav_inhoud: 'Informatie',

  // Navigatie dokter
  nav_patienten: 'Patiënten',

  // Dashboard patiënt (P-02)
  dashboard_titel: 'Mijn voortgang',
  dashboard_geen_gegevens: 'Nog geen gegevens. Voeg je eerste meting toe!',
  dashboard_voeg_toe: 'Meting toevoegen',
  dashboard_nieuwe_inhoud: 'Nieuwe informatie voor jou',
  dashboard_dokter_reactie: 'Je dokter heeft gereageerd',
  dashboard_dosering_toename: 'Over {dagen} dagen wordt je dosering verhoogd',
  dashboard_afspraak: 'Afspraak op {datum}',
  dashboard_recente_metingen: 'Recente metingen',
  grafiek_welzijn: 'Welzijn',
  grafiek_gewicht: 'Gewicht',

  // Voortgang invoeren (P-03)
  log_titel: 'Meting toevoegen',
  log_gewicht: 'Gewicht (kg)',
  log_welzijn: 'Hoe voel je je vandaag?',
  log_welzijn_1: 'Heel slecht',
  log_welzijn_2: 'Slecht',
  log_welzijn_3: 'Oké',
  log_welzijn_4: 'Goed',
  log_welzijn_5: 'Heel goed',
  log_symptomen: 'Klachten (optioneel)',
  log_notities: 'Notities (optioneel)',
  log_opslaan: 'Meting opslaan',
  log_succes: 'Meting opgeslagen!',
  symptoom_misselijkheid: 'Misselijkheid',
  symptoom_vermoeidheid: 'Vermoeidheid',
  symptoom_hoofdpijn: 'Hoofdpijn',
  symptoom_maagklachten: 'Maagklachten',
  symptoom_droge_mond: 'Droge mond',
  symptoom_duizeligheid: 'Duizeligheid',
  symptoom_constipatie: 'Obstipatie',

  // Medicatieschema (P-04)
  medicatie_titel: 'Mijn medicatieschema',
  medicatie_huidige_dosis: 'Huidige dosering',
  medicatie_volgende_verhoging: 'Volgende verhoging',
  medicatie_verleden: 'Vorige doseringen',
  medicatie_gepland: 'Geplande verhogingen',
  medicatie_over_dagen: 'over {dagen} dagen',
  medicatie_geen_dosis: 'Nog geen dosering ingesteld door je dokter.',
  medicatie_geen_schema: 'Je dokter heeft nog geen medicatieschema ingesteld.',

  // Melding (P-05)
  melding_titel: 'Iets melden',
  melding_ernst_routine: 'Niet urgent',
  melding_ernst_urgent: 'Urgent',
  melding_omschrijving: 'Wat wil je melden?',
  melding_omschrijving_placeholder: 'Beschrijf wat je ervaart...',
  melding_versturen: 'Melden',
  melding_succes: 'Je melding is verstuurd naar je dokter.',
  melding_status_open: 'In behandeling',
  melding_status_beantwoord: 'Beantwoord',
  melding_reactie_dokter: 'Reactie van je dokter',
  melding_geschiedenis: 'Eerdere meldingen',
  melding_geen: 'Je hebt nog geen meldingen gedaan.',

  // Educatieve inhoud (P-06)
  inhoud_titel: 'Informatie voor jou',
  inhoud_leeg: 'Hier verschijnt informatie die bij jouw behandeling past. Houd je voortgang bij om relevante artikelen en video\'s te zien.',
  inhoud_artikel: 'Artikel',
  inhoud_video: 'Video',
  inhoud_bekeken: 'Bekeken',

  // Dokter: overzicht (D-01)
  dokter_overzicht_titel: 'Mijn patiënten',
  dokter_overzicht_leeg: 'Nog geen patiënten gekoppeld.',
  dokter_laatste_check: 'Laatste check-in',
  dokter_open_melding: 'Openstaande melding',
  dokter_open_meldingen: 'Openstaande meldingen',
  dokter_nog_niet_ingecheckt: 'Nog niet ingecheckt',

  // Dokter: patiëntprofiel (D-02)
  dokter_profiel_voortgang: 'Voortgang',
  dokter_profiel_meldingen: 'Meldingen',
  dokter_profiel_schema: 'Medicatieschema',
  dokter_profiel_advies: 'Persoonlijk advies',
  dokter_profiel_afspraken: 'Afspraken',
  dokter_advies_placeholder: 'Schrijf hier persoonlijk advies voor deze patiënt...',
  dokter_reageer: 'Reageer op melding',
  dokter_reactie_placeholder: 'Jouw reactie...',
  dokter_reactie_versturen: 'Reactie versturen',
  dokter_profiel_geen_metingen: 'Nog geen metingen.',
  dokter_profiel_geen_schema: 'Nog geen schema ingesteld.',
  dokter_profiel_bewerken: 'Bewerken',
  dokter_profiel_afspraken_gepland: 'Geplande afspraken',
  opgeslagen: 'Opgeslagen',

  // Dokter: schema bewerken (D-03)
  schema_titel: 'Medicatieschema bewerken',
  schema_toevoegen: 'Dosering toevoegen',
  schema_dosis: 'Dosering (mg)',
  schema_startdatum: 'Startdatum',
  schema_notitie: 'Notitie (optioneel)',
  schema_verwijderen: 'Verwijder',
  schema_opslaan: 'Schema opslaan',

  // Dokter: afspraak plannen (D-04)
  afspraak_titel: 'Afspraak plannen',
  afspraak_datum_tijd: 'Datum en tijd',
  afspraak_notities: 'Notities (optioneel)',
  afspraak_plannen: 'Afspraak plannen',
  afspraak_succes: 'Afspraak gepland.',
}

export type NlKeys = keyof typeof nl
