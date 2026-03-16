create table public.educational_content (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body_markdown text,
  video_url text,
  content_type text not null check (content_type in ('article', 'video'))
);

alter table public.educational_content enable row level security;

create policy "Iedereen leest inhoud"
  on public.educational_content for select
  to authenticated
  using (true);

create table public.content_triggers (
  id uuid primary key default gen_random_uuid(),
  content_id uuid not null references public.educational_content(id) on delete cascade,
  event_type text not null check (event_type in (
    'SYMPTOM_FIRST_LOG', 'DOSAGE_INCREASE', 'WEIGHT_MILESTONE', 'WEIGHT_PLATEAU', 'TREATMENT_WEEK'
  )),
  event_parameter text
);

alter table public.content_triggers enable row level security;

create policy "Iedereen leest triggers"
  on public.content_triggers for select
  to authenticated
  using (true);

create table public.patient_content_view (
  patient_id uuid not null references public.patients(id) on delete cascade,
  content_id uuid not null references public.educational_content(id) on delete cascade,
  first_viewed_at timestamptz not null default now(),
  primary key (patient_id, content_id)
);

alter table public.patient_content_view enable row level security;

create policy "Patiënt beheert eigen bekeken inhoud"
  on public.patient_content_view for all
  using (patient_id = auth.uid())
  with check (patient_id = auth.uid());

-- Demo inhoud
insert into public.educational_content (title, body_markdown, content_type) values
  ('Misselijkheid bij GLP-1: wat is normaal?', '## Misselijkheid is normaal

Misselijkheid is een van de meest voorkomende bijwerkingen bij het starten met een GLP-1 medicijn. Dit is een teken dat het medicijn werkt.

**Tips:**
- Eet kleine porties
- Vermijd vette of gekruide maaltijden
- Drink voldoende water
- Neem je injectie op een vast moment

De klachten nemen meestal af na 2–4 weken.', 'article'),
  ('Vermoeidheid in de eerste weken', '## Vermoeidheid is tijdelijk

Het is normaal om je de eerste weken vermoeider te voelen. Je lichaam past zich aan.

**Wat helpt:**
- Ga eerder naar bed
- Beweeg licht, zoals wandelen
- Vermijd zware inspanning

Meld het aan je dokter als de vermoeidheid aanhoudt.', 'article'),
  ('Wat te verwachten bij een hogere dosering', '## Nieuwe dosering

Bij een verhoging van je dosering kunnen bijwerkingen tijdelijk terugkomen. Dit is normaal.

**Wat je kunt verwachten:**
- Lichte misselijkheid de eerste week
- Minder eetlust
- Mogelijk meer vermoeidheid

Dit trekt meestal binnen 1–2 weken weg. Neem contact op met je dokter als de klachten ernstig zijn.', 'article'),
  ('4 weken op weg: wat verandert er?', '## Na 4 weken

Na vier weken beginnen de meeste mensen de effecten te merken:
- Minder honger gedurende de dag
- Stabieler gewicht
- Minder cravings

Blijf je voortgang bijhouden zodat je dokter je goed kan begeleiden.', 'article');

-- Demo triggers
insert into public.content_triggers (content_id, event_type, event_parameter)
select id, 'SYMPTOM_FIRST_LOG', 'Misselijkheid' from public.educational_content where title like 'Misselijkheid%';

insert into public.content_triggers (content_id, event_type, event_parameter)
select id, 'SYMPTOM_FIRST_LOG', 'Vermoeidheid' from public.educational_content where title like 'Vermoeidheid%';

insert into public.content_triggers (content_id, event_type, event_parameter)
select id, 'DOSAGE_INCREASE', null from public.educational_content where title like 'Wat te verwachten%';

insert into public.content_triggers (content_id, event_type, event_parameter)
select id, 'TREATMENT_WEEK', '4' from public.educational_content where title like '4 weken%';
