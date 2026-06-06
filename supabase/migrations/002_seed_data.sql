-- Initial teammates (plain_password used for MVP; replace with hashes later)
insert into teammates (name, plain_password, is_active) values
  ('Dawoud',  'dawoud123',  true),
  ('Araf',    'araf123',    true),
  ('Sufiyan', 'sufiyan123', true),
  ('Nouho',   'nouho123',   true)
on conflict (name) do nothing;

-- Preset Islamic tasks
insert into preset_tasks (name, description, category, default_points, is_islamic, is_repeatable, default_max_completions, can_be_recurring) values
  ('Seek Ilm',                     'Lecture, class, reading, or notes',                    'islamic', 60, true, false, 1, true),
  ('Attend Halaqa/Dars in Person', 'Attend a halaqa, dars, or formal Islamic class in person', 'islamic', 80, true, false, 1, true),
  ('Read Quran',                   'Daily Quran reading session',                          'islamic', 50, true, false, 1, true),
  ('Memorize Quran',               'New memorization session',                             'islamic', 70, true, false, 1, true),
  ('Review Quran',                 'Review previously memorized portions',                 'islamic', 50, true, false, 1, true),
  ('Morning adhkar',               'Morning remembrance routine',                          'islamic', 30, true, false, 1, true),
  ('Evening adhkar',               'Evening remembrance routine',                          'islamic', 30, true, false, 1, true),
  ('Give sadaqah',                 'Give voluntary charity',                               'islamic', 50, true, false, 1, true)
on conflict do nothing;

-- Common regular preset tasks
insert into preset_tasks (name, description, category, default_points, is_islamic, is_repeatable, default_max_completions, can_be_recurring) values
  ('Journal',              'Write a journal entry',                     'growth', 20, false, false, 1, true),
  ('Workout',              'Any physical exercise session',             'health', 40, false, false, 1, true),
  ('Reading Regular Book', 'Read a non-fiction or fiction book',        'growth', 20, false, false, 1, true),
  ('Study',                'Studying for school or self-improvement',   'work',   30, false, false, 1, true),
  ('Apply to jobs',        'Submit job applications',                   'work',   35, false, false, 1, true),
  ('Clean room',           'Tidy and clean personal space',             'life',   20, false, false, 1, true)
on conflict do nothing;
