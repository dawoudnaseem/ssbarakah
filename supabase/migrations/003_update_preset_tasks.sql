-- Rename "Attend Islamic class" → "Attend Halaqa/Dars in Person"
update preset_tasks
set name = 'Attend Halaqa/Dars in Person',
    description = 'Attend a halaqa, dars, or formal Islamic class in person',
    can_be_recurring = true
where name = 'Attend Islamic class';

-- Rename "Read 10 pages" → "Reading Regular Book"; 20 pts, not repeatable
update preset_tasks
set name = 'Reading Regular Book',
    description = 'Read a non-fiction or fiction book',
    default_points = 20,
    is_repeatable = false,
    default_max_completions = 1,
    can_be_recurring = true
where name = 'Read 10 pages';

-- Remove "Code for 1 hour"
delete from preset_tasks where name = 'Code for 1 hour';
