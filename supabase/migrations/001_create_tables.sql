-- teammates: app users with simple password auth
create table if not exists teammates (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  password_hash text,
  plain_password text,
  is_active boolean default true,
  current_chad boolean default false,
  current_chud boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- preset_tasks: reusable task templates managed by admin
create table if not exists preset_tasks (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  category text not null,
  default_points integer not null,
  is_islamic boolean default false,
  is_repeatable boolean default false,
  default_max_completions integer default 1,
  can_be_recurring boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- daily_tasks: actual assigned tasks for a teammate on a specific day
create table if not exists daily_tasks (
  id uuid primary key default gen_random_uuid(),
  teammate_id uuid references teammates(id) on delete cascade,
  preset_task_id uuid references preset_tasks(id),
  name text not null,
  description text,
  category text not null,
  points integer not null,
  is_required boolean default true,
  is_completed boolean default false,
  is_repeatable boolean default false,
  max_completions integer default 1,
  completion_count integer default 0,
  task_date date not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- recurring_tasks: tasks that auto-generate on future days
create table if not exists recurring_tasks (
  id uuid primary key default gen_random_uuid(),
  teammate_id uuid references teammates(id) on delete cascade,
  preset_task_id uuid references preset_tasks(id),
  name text not null,
  description text,
  category text not null,
  points integer not null,
  is_required boolean default true,
  is_repeatable boolean default false,
  max_completions integer default 1,
  recurrence_type text not null check (recurrence_type in ('daily', 'weekly', 'custom_days')),
  recurrence_days text[],
  is_active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- task_completions: each individual completion event (supports repeatable tasks)
create table if not exists task_completions (
  id uuid primary key default gen_random_uuid(),
  daily_task_id uuid references daily_tasks(id) on delete cascade,
  teammate_id uuid references teammates(id) on delete cascade,
  points_awarded integer not null,
  completed_at timestamp with time zone default now(),
  task_date date not null
);

-- daily_results: finalized team outcome for each day
create table if not exists daily_results (
  id uuid primary key default gen_random_uuid(),
  result_date date not null unique,
  outcome text not null check (outcome in ('survived', 'sunk')),
  completion_percentage numeric not null,
  total_required_tasks integer not null,
  completed_required_tasks integer not null,
  missed_required_tasks integer not null,
  chad_teammate_id uuid references teammates(id),
  chud_teammate_id uuid references teammates(id),
  created_at timestamp with time zone default now()
);

-- teammate_daily_stats: per-teammate aggregated stats for each day
create table if not exists teammate_daily_stats (
  id uuid primary key default gen_random_uuid(),
  teammate_id uuid references teammates(id) on delete cascade,
  stat_date date not null,
  points_earned integer default 0,
  total_required_tasks integer default 0,
  completed_required_tasks integer default 0,
  missed_required_tasks integer default 0,
  completed_all_required boolean default false,
  is_chad boolean default false,
  is_chud boolean default false,
  created_at timestamp with time zone default now(),
  unique(teammate_id, stat_date)
);
