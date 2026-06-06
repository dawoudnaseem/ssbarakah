-- Initial teammates (plain_password used for MVP; replace with hashes later)
insert into teammates (name, plain_password, is_active) values
  ('Dawoud',  'dawoud123',  true),
  ('Araf',    'araf123',    true),
  ('Sufiyan', 'sufiyan123', true),
  ('Nouho',   'nouho123',   true)
on conflict (name) do nothing;

-- Preset Islamic tasks (requirements Section 10.5)
insert into preset_tasks (name, description, category, default_points, is_islamic, is_repeatable, default_max_completions, can_be_recurring) values
  ('Read Quran',          'Daily Quran reading session',               'islamic', 50, true,  false, 1, true),
  ('Seek Ilm',            'Lecture, class, reading, or notes',         'islamic', 60, true,  false, 1, true),
  ('Pray at the mosque',  'Attending prayer at the masjid',            'islamic', 40, true,  true,  5, true),
  ('Morning adhkar',      'Morning remembrance routine',               'islamic', 30, true,  false, 1, true),
  ('Evening adhkar',      'Evening remembrance routine',               'islamic', 30, true,  false, 1, true),
  ('Memorize Quran',      'New memorization session',                  'islamic', 70, true,  false, 1, false),
  ('Review Quran',        'Review previously memorized portions',      'islamic', 50, true,  false, 1, true),
  ('Attend Islamic class','Formal Islamic class or halaqah',           'islamic', 80, true,  false, 1, false),
  ('Give sadaqah',        'Give voluntary charity',                    'islamic', 50, true,  false, 1, false)
on conflict do nothing;

-- Common regular preset tasks
insert into preset_tasks (name, description, category, default_points, is_islamic, is_repeatable, default_max_completions, can_be_recurring) values
  ('Workout',        'Any physical exercise session',                   'health',  40, false, false, 1, true),
  ('Code for 1 hour','Focused coding session',                         'work',    30, false, false, 1, true),
  ('Study',          'Studying for school or self-improvement',         'work',    30, false, false, 1, true),
  ('Read 10 pages',  'Read 10 pages of any non-fiction book',           'growth',  20, false, true,  3, true),
  ('Clean room',     'Tidy and clean personal space',                   'life',    20, false, false, 1, false),
  ('Apply to jobs',  'Submit job applications',                         'work',    35, false, false, 1, true),
  ('Journal',        'Write a journal entry',                           'growth',  20, false, false, 1, true)
on conflict do nothing;
