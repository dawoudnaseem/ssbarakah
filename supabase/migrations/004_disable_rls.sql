-- Disable RLS on all tables and grant full access to anon + authenticated roles.
-- This app uses its own auth (localStorage + admin code) and does not rely on
-- Supabase row-level security. Without these grants the anon key can SELECT
-- and INSERT but DELETE/UPDATE are silently blocked (no error, 0 rows affected).

alter table teammates            disable row level security;
alter table preset_tasks         disable row level security;
alter table daily_tasks          disable row level security;
alter table recurring_tasks      disable row level security;
alter table task_completions     disable row level security;
alter table daily_results        disable row level security;
alter table teammate_daily_stats disable row level security;

grant select, insert, update, delete on all tables in schema public to anon;
grant select, insert, update, delete on all tables in schema public to authenticated;
