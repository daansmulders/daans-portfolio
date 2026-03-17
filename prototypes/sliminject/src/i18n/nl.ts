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
  dashboard_geen_gegevens: 'Log wanneer je wilt — dagelijks of gewoon als je eraan denkt.',
  dashboard_voeg_toe: 'Bijhouden',
  dashboard_nieuwe_inhoud: 'Nieuwe informatie voor jou',
  dashboard_dokter_reactie: 'Je arts heeft gereageerd',
  dashboard_dosering_toename: 'Over {dagen} dagen wordt je dosering verhoogd',
  dashboard_afspraak: 'Afspraak op {datum}',
  dashboard_recente_metingen: 'Recente metingen',
  dashboard_wekelijkse_checkin: 'Tijd voor je wekelijkse check-in',
  dashboard_wekelijkse_checkin_body: 'Je hebt deze week nog niet ingecheckt. Hoe gaat het na je injectie?',
  dashboard_wekelijkse_checkin_cta: 'Check-in doen →',
  grafiek_welzijn: 'Welzijn',
  grafiek_honger: 'Honger',
  grafiek_gewicht: 'Gewicht',

  // Voortgang invoeren (P-03)
  log_titel: 'Hoe gaat het?',
  log_gewicht: 'Gewicht (kg)',
  log_welzijn: 'Hoe voel je je vandaag?',
  log_welzijn_1: 'Heel slecht',
  log_welzijn_2: 'Slecht',
  log_welzijn_3: 'Oké',
  log_welzijn_4: 'Goed',
  log_welzijn_5: 'Heel goed',
  log_honger: 'Hoe sterk voel je honger?',
  log_honger_1: 'Bijna geen honger',
  log_honger_2: 'Weinig honger',
  log_honger_3: 'Matig honger',
  log_honger_4: 'Best veel honger',
  log_honger_5: 'Veel honger',
  log_symptomen: 'Klachten (optioneel)',
  log_notities: 'Notities (optioneel)',
  log_opslaan: 'Opslaan',
  log_succes: 'Opgeslagen!',
  log_grafiek_wacht: 'Nog even — je grafiek verschijnt zodra je een paar metingen hebt.',
  log_mijlpaal: 'Week {n} bereikt! 🎉',
  log_mijlpaal_subtitel: 'Je bouwt een mooi overzicht op.',
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
  medicatie_geen_dosis: 'Nog geen dosering ingesteld door je arts.',
  medicatie_geen_schema: 'Je arts heeft nog geen medicatieschema ingesteld.',
  medicatie_huidig: 'Huidig',
  medicatie_gepland_label: 'Gepland',
  medicatie_tijdlijn: 'Tijdlijn',

  // Melding (P-05)
  melding_titel: 'Iets melden',
  melding_ernst_routine: 'Niet urgent',
  melding_ernst_urgent: 'Urgent',
  melding_omschrijving: 'Wat wil je melden?',
  melding_omschrijving_placeholder: 'Beschrijf wat je ervaart...',
  melding_versturen: 'Melden',
  melding_succes: 'Je melding is verstuurd naar je arts.',
  melding_status_open: 'In behandeling',
  melding_status_beantwoord: 'Beantwoord',
  melding_reactie_dokter: 'Reactie van je arts',
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
  dokter_bucket_aandacht: 'Aandacht nodig',
  dokter_bucket_op_schema: 'Op schema',
  dokter_inactief_dagen: '{dagen} dagen geen check-in',

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
  dokter_profiel_telefoon: 'Telefoon',
  dokter_profiel_geen_telefoon: 'Geen telefoonnummer bekend',
  opgeslagen: 'Opgeslagen',
  dashboard_dokter_reactie_bekijken: 'Alle meldingen bekijken →',

  // Dokter: receptenoverzicht (O)
  prescriptie_titel: 'Recepten',
  prescriptie_wacht: 'Wacht op goedkeuring',
  prescriptie_geen_wacht: 'Geen openstaande recepten.',
  prescriptie_goedkeuren: 'Goedkeuren',
  prescriptie_ingangsdatum: 'Ingangsdatum',
  prescriptie_actief: 'Actieve recepten',
  prescriptie_bevestig_titel: 'Controleer en bevestig',
  prescriptie_bevestig_patient: 'Patiënt',
  prescriptie_bevestig_medicijn: 'Medicijn',
  prescriptie_bevestig_dosis: 'Dosering',
  prescriptie_bevestig_apotheek: 'Apotheek',
  prescriptie_bevestig_versturen: 'Bevestigen & versturen naar apotheek',
  prescriptie_geen_apotheek: 'Geen apotheek gekoppeld',
  prescriptie_patienten: 'patiënten',
  prescriptie_patient: 'patiënt',
  prescriptie_leeg: 'Nog geen medicatieschema\'s ingesteld.',
  prescriptie_onbekend_medicijn: 'Onbekend medicijn',
  prescriptie_sinds: 'vanaf',
  medicatie_in_behandeling: 'Wacht op goedkeuring arts',

  // Dokter: schema bewerken (D-03)
  schema_titel: 'Medicatieschema bewerken',
  schema_toevoegen: 'Dosering toevoegen',
  schema_dosis: 'Dosering (mg)',
  schema_startdatum: 'Startdatum',
  schema_medicijn: 'Medicijn',
  schema_medicijn_kies: 'Kies medicijn...',
  schema_notitie: 'Notitie (optioneel)',
  schema_verwijderen: 'Verwijder',
  schema_opslaan: 'Schema opslaan',

  // Onboarding patiënt (B)
  onboarding_welkom_titel: 'Welkom bij Sliminject',
  onboarding_welkom_body: 'Sliminject helpt jou en je arts om je behandeling goed bij te houden. Hier is wat je kunt verwachten:',
  onboarding_feature_1: 'Log wekelijks je gewicht en hongergevoelens',
  onboarding_feature_2: 'Bekijk je medicatieschema en volgende dosering',
  onboarding_feature_3: 'Stuur direct een bericht naar je arts als je iets wilt melden',
  onboarding_medicatie_titel: 'Jouw medicatieschema',
  onboarding_medicatie_body: 'Je arts heeft een startschema voor je klaargezet. Je kunt dit altijd bekijken via het tabblad Medicatie.',
  onboarding_medicatie_leeg: 'Je arts stelt binnenkort een schema voor je in.',
  onboarding_meting_titel: 'Bijhouden wanneer jij wilt',
  onboarding_meting_body: 'Log zo vaak als je wilt — een keer per dag of gewoon als je eraan denkt. Elke week krijg je een mijlpaal.',
  onboarding_meting_tip_1: '• Log ook tussendoor als je iets opmerkt, zoals een bijwerking of een goed gevoel.',
  onboarding_meting_tip_2: '• Vul ook je hongerscore in — dit geeft inzicht in hoe de medicatie werkt.',
  onboarding_volgende: 'Volgende',
  onboarding_begin: 'Eerste check-in doen →',
  onboarding_later: 'Ik doe dit later',

  // Dokter: patiënt uitnodigen (A)
  intake_titel: 'Patiënt uitnodigen',
  intake_nieuw: 'Patiënt uitnodigen',
  intake_naam: 'Naam patiënt',
  intake_email: 'E-mailadres patiënt',
  intake_email_uitleg: 'De patiënt logt in met dit e-mailadres.',
  intake_startdatum: 'Startdatum behandeling',
  intake_startgewicht: 'Startgewicht (kg)',
  intake_versturen: 'Uitnodiging aanmaken',
  intake_fout: 'Er ging iets mis. Probeer het opnieuw.',
  intake_uitnodigingen_open: 'Wacht op activatie',
  intake_status_wacht: 'Nog niet ingelogd',

  // Dokter: afspraak plannen (D-04)
  afspraak_titel: 'Afspraak plannen',
  afspraak_datum_tijd: 'Datum en tijd',
  afspraak_notities: 'Notities (optioneel)',
  afspraak_plannen: 'Afspraak plannen',
  afspraak_succes: 'Afspraak gepland.',

  // UX Verbeteringen (002)

  // Log CTA
  log_cta_vandaag: 'Log vandaag',
  log_cta_gedaan: 'Vandaag gelogd ✓',

  // Streak
  streak_label: '{n} dagen op rij! 🔥',
  streak_reset: 'Begin opnieuw — elke dag telt',
  streak_voortgang: '{n} van 7 dagen',

  // Honger-ankerlabels
  honger_min: 'Geen honger',
  honger_max: 'Heel veel honger',

  // Symptomenlijst
  symptomen_meer: 'Meer symptomen',
  symptomen_minder: 'Minder weergeven',

  // Melding: verwachte responstijd
  melding_verwacht_routine: 'Verwacht antwoord binnen 1 werkdag.',
  melding_verwacht_urgent: 'Je melding is als urgent gemarkeerd. We nemen zo snel mogelijk contact op.',

  // Advies zichtbaarheid
  advies_zichtbaar: 'Zichtbaar voor patiënt',
  advies_van_arts: 'Van je arts',

  // Onboarding stap 4
  onboarding_eerste_titel: 'Doe je eerste meting',
  onboarding_sla_over: 'Sla over',

  // Educatieve inhoud — groepen
  inhoud_groep_start: 'Start hier',
  inhoud_groep_bijwerkingen: 'Bijwerkingen',
  inhoud_groep_leefstijl: 'Voeding & leefstijl',
  inhoud_groep_overig: 'Overig',
  inhoud_alles_bekeken: 'Alles bekeken ✓',

  // Tabs patiëntprofiel
  tabs_overzicht: 'Overzicht',
  tabs_meldingen: 'Meldingen',
  tabs_afspraken: 'Afspraken',

  // Lege states
  empty_dashboard_heading: 'Nog geen metingen',
  empty_dashboard_body: 'Start met je eerste meting om je voortgang bij te houden.',
  empty_meldingen_heading: 'Geen meldingen',
  empty_meldingen_body: 'Heb je een vraag of klacht over je behandeling? Je arts staat voor je klaar.',
  empty_inhoud_heading: 'Informatie volgt binnenkort',
  empty_inhoud_body: 'Hier verschijnen artikelen en video\'s die bij jouw behandeling passen.',
  empty_patienten_heading: 'Nog geen patiënten',
  empty_patienten_body: 'Nodig je eerste patiënt uit om aan de slag te gaan.',
  empty_patienten_cta: 'Patiënt uitnodigen',

  // Toast meldingen
  toast_schema_bijgewerkt: 'Schema bijgewerkt',
  toast_intake_succes: 'Patiënt uitgenodigd',
  toast_reactie_verstuurd: 'Reactie verstuurd',
  toast_fout: 'Er ging iets mis. Probeer het opnieuw.',

  // Titratieschema
  schema_titratie_curve: 'Titratieschema',

  // Dagelijkse herinneringen
  herinnering_titel: 'Dagelijkse herinnering',
  herinnering_inschakelen: 'Herinnering inschakelen',
  herinnering_tijd: 'Meldingstijdstip',
  herinnering_notificatie: 'Vergeet je meting niet vandaag!',
}

export type NlKeys = keyof typeof nl
