create extension if not exists "pgcrypto";

create table if not exists public.schools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  district text not null,
  plan text not null check (plan in ('freemium', 'district', 'enterprise')),
  time_zone text not null default 'UTC',
  active_students integer not null default 0,
  active_teachers integer not null default 0,
  created_at timestamptz not null default now()
);

create unique index if not exists schools_name_district_unique_idx
on public.schools (lower(name), lower(district));

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  school_id uuid references public.schools(id) on delete set null,
  full_name text not null,
  email text not null unique,
  role text not null check (role in ('teacher', 'student', 'parent', 'admin', 'instructional_coach')),
  locale text not null default 'en-US',
  avatar_url text,
  streak_days integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.classrooms (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  teacher_id uuid references public.users(id) on delete set null,
  title text not null,
  subject text not null,
  grade_band text not null,
  pace_mode text not null default 'teacher' check (pace_mode in ('teacher', 'student')),
  roster_count integer not null default 0,
  completion_rate integer not null default 0 check (completion_rate between 0 and 100),
  created_at timestamptz not null default now()
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references public.schools(id) on delete cascade,
  created_by uuid references public.users(id) on delete set null,
  title text not null,
  subject text not null,
  grade_band text not null,
  status text not null default 'draft' check (status in ('draft', 'published', 'live')),
  duration_minutes integer not null default 30,
  standards text[] not null default '{}',
  featured boolean not null default false,
  ai_assist boolean not null default false,
  tags text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  title text not null,
  type text not null check (type in ('quiz', 'poll', 'draw', 'open_ended', 'collaboration', 'video', 'field_trip')),
  prompt text not null,
  estimated_minutes integer not null default 5,
  points integer not null default 0,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  classroom_id uuid not null references public.classrooms(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  title text not null,
  status text not null default 'scheduled' check (status in ('scheduled', 'live', 'completed')),
  attendee_count integer not null default 0,
  engagement_score integer not null default 0 check (engagement_score between 0 and 100),
  response_rate integer not null default 0 check (response_rate between 0 and 100),
  breakout_rooms integer not null default 0,
  starts_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.responses (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.activities(id) on delete cascade,
  student_id uuid not null references public.users(id) on delete cascade,
  response_type text not null check (response_type in ('multiple_choice', 'open_ended', 'drawing')),
  response_value text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.assessments (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  title text not null,
  format text not null check (format in ('formative', 'summative')),
  average_score integer not null default 0 check (average_score between 0 and 100),
  submission_rate integer not null default 0 check (submission_rate between 0 and 100),
  flagged_for_review integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  classroom_id uuid not null references public.classrooms(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  title text not null,
  due_date date not null,
  completion_rate integer not null default 0 check (completion_rate between 0 and 100),
  assigned_count integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.assignment_mcqs (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  created_by uuid references public.users(id) on delete set null,
  question text not null,
  option_a text not null,
  option_b text not null,
  option_c text not null,
  option_d text not null,
  correct_option text not null check (correct_option in ('A', 'B', 'C', 'D')),
  points integer not null default 5 check (points between 1 and 100),
  created_at timestamptz not null default now()
);

create index if not exists assignment_mcqs_school_created_idx
on public.assignment_mcqs (school_id, created_at desc);

create table if not exists public.assignment_mcq_attempts (
  id uuid primary key default gen_random_uuid(),
  mcq_id uuid not null references public.assignment_mcqs(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  student_id uuid not null references public.users(id) on delete cascade,
  selected_option text not null check (selected_option in ('A', 'B', 'C', 'D')),
  is_correct boolean not null default false,
  points_earned integer not null default 0 check (points_earned >= 0),
  created_at timestamptz not null default now()
);

create unique index if not exists assignment_mcq_attempts_unique_mcq_student_idx
on public.assignment_mcq_attempts (mcq_id, student_id);

create index if not exists assignment_mcq_attempts_school_created_idx
on public.assignment_mcq_attempts (school_id, created_at desc);

create table if not exists public.student_progress (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.users(id) on delete cascade,
  classroom_id uuid references public.classrooms(id) on delete cascade,
  mastery_rate integer not null default 0 check (mastery_rate between 0 and 100),
  risk_level text not null default 'low' check (risk_level in ('low', 'medium', 'high')),
  last_active timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.content_library (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references public.schools(id) on delete cascade,
  folder_id uuid,
  created_by uuid references public.users(id) on delete set null,
  title text not null,
  description text not null default '',
  type text not null check (type in ('template', 'lesson', 'video', 'field_trip', 'resource')),
  subject text not null,
  grade_band text not null,
  file_name text,
  file_url text,
  downloads integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.content_library add column if not exists created_by uuid references public.users(id) on delete set null;
alter table public.content_library add column if not exists folder_id uuid references public.library_folders(id) on delete set null;
alter table public.content_library add column if not exists description text not null default '';
alter table public.content_library add column if not exists file_name text;
alter table public.content_library add column if not exists file_url text;

create table if not exists public.library_folders (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  created_by uuid references public.users(id) on delete set null,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists library_folders_school_name_unique_idx
on public.library_folders (school_id, lower(name));

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'content_library_folder_id_fkey'
  ) then
    alter table public.content_library
    add constraint content_library_folder_id_fkey
    foreign key (folder_id) references public.library_folders(id) on delete set null;
  end if;
end $$;

create table if not exists public.library_folder_items (
  id uuid primary key default gen_random_uuid(),
  folder_id uuid not null references public.library_folders(id) on delete cascade,
  content_id uuid not null references public.content_library(id) on delete cascade,
  added_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create unique index if not exists library_folder_items_folder_content_unique_idx
on public.library_folder_items (folder_id, content_id);

create table if not exists public.media_files (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid references public.lessons(id) on delete cascade,
  kind text not null check (kind in ('image', 'video', 'audio', 'document', '3d')),
  name text not null,
  url text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references public.schools(id) on delete cascade,
  title text not null,
  audience text[] not null default '{}',
  channel text not null check (channel in ('in_app', 'email', 'push')),
  status text not null check (status in ('queued', 'sent')),
  created_at timestamptz not null default now()
);

create table if not exists public.integrations (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references public.schools(id) on delete cascade,
  name text not null,
  category text not null check (category in ('lms', 'storage', 'analytics', 'communication')),
  status text not null check (status in ('connected', 'available')),
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  generated_school_id uuid;
  requested_school_name text;
  requested_district text;
begin
  generated_school_id := nullif(new.raw_user_meta_data ->> 'school_id', '')::uuid;
  requested_school_name := nullif(trim(new.raw_user_meta_data ->> 'school_name'), '');
  requested_district := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'district'), ''),
    requested_school_name || ' District'
  );

  if generated_school_id is null and requested_school_name is not null then
    insert into public.schools (name, district, plan, time_zone, active_students, active_teachers)
    values (
      requested_school_name,
      requested_district,
      'freemium',
      coalesce(nullif(trim(new.raw_user_meta_data ->> 'time_zone'), ''), 'UTC'),
      0,
      0
    )
    on conflict (lower(name), lower(district)) do update
    set
      name = excluded.name,
      district = excluded.district,
      time_zone = excluded.time_zone
    returning id into generated_school_id;
  end if;

  insert into public.users (id, full_name, email, role, locale, avatar_url, school_id, streak_days)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data ->> 'role', 'teacher'),
    coalesce(new.raw_user_meta_data ->> 'locale', 'en-US'),
    new.raw_user_meta_data ->> 'avatar_url',
    generated_school_id,
    0
  )
  on conflict (id) do update
  set
    full_name = excluded.full_name,
    email = excluded.email,
    role = excluded.role,
    locale = excluded.locale,
    avatar_url = excluded.avatar_url,
    school_id = excluded.school_id;

  return new;
end;
$$;

create or replace function public.current_school_id()
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select school_id
  from public.users
  where id = auth.uid()
  limit 1;
$$;

create or replace function public.current_user_role()
returns text
language sql
security definer
set search_path = public
stable
as $$
  select role
  from public.users
  where id = auth.uid()
  limit 1;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.schools enable row level security;
alter table public.users enable row level security;
alter table public.classrooms enable row level security;
alter table public.lessons enable row level security;
alter table public.activities enable row level security;
alter table public.sessions enable row level security;
alter table public.responses enable row level security;
alter table public.assessments enable row level security;
alter table public.assignments enable row level security;
alter table public.assignment_mcqs enable row level security;
alter table public.assignment_mcq_attempts enable row level security;
alter table public.student_progress enable row level security;
alter table public.content_library enable row level security;
alter table public.library_folders enable row level security;
alter table public.media_files enable row level security;
alter table public.notifications enable row level security;
alter table public.integrations enable row level security;
alter table public.library_folder_items enable row level security;

drop policy if exists "authenticated users can view schools" on public.schools;
drop policy if exists "users can view profiles from their school" on public.users;
drop policy if exists "users can update their own profile" on public.users;
drop policy if exists "school members can read lessons" on public.lessons;
drop policy if exists "teachers and admins can manage lessons" on public.lessons;
drop policy if exists "school members can read classroom entities" on public.classrooms;
drop policy if exists "school members can read sessions" on public.sessions;
drop policy if exists "school members can read activities" on public.activities;
drop policy if exists "school members can read assignment, assessment, progress, content, media, notifications, integrations" on public.assignments;
drop policy if exists "school members can read assignment MCQs" on public.assignment_mcqs;
drop policy if exists "teachers and admins can manage assignment MCQs" on public.assignment_mcqs;
drop policy if exists "school members can read assignment MCQ attempts" on public.assignment_mcq_attempts;
drop policy if exists "students can manage their assignment MCQ attempts" on public.assignment_mcq_attempts;
drop policy if exists "teachers and admins can manage assignment MCQ attempts" on public.assignment_mcq_attempts;
drop policy if exists "school members can read assessments" on public.assessments;
drop policy if exists "students and staff can read progress" on public.student_progress;
drop policy if exists "school members can read content library" on public.content_library;
drop policy if exists "admins can manage content library" on public.content_library;
drop policy if exists "school members can read library folders" on public.library_folders;
drop policy if exists "teachers and admins can manage library folders" on public.library_folders;
drop policy if exists "school members can read library folder items" on public.library_folder_items;
drop policy if exists "teachers and admins can manage library folder items" on public.library_folder_items;
drop policy if exists "school members can read media files" on public.media_files;
drop policy if exists "school members can read notifications" on public.notifications;
drop policy if exists "school members can read integrations" on public.integrations;

create policy "authenticated users can view schools"
on public.schools for select
to authenticated
using (true);

create policy "users can view profiles from their school"
on public.users for select
to authenticated
using (
  id = auth.uid()
  or (
    school_id is not null
    and school_id = public.current_school_id()
  )
);

create policy "users can update their own profile"
on public.users for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "school members can read lessons"
on public.lessons for select
to authenticated
using (
  school_id is not null
  and school_id in (
    select school_id from public.users where id = auth.uid()
  )
);

create policy "teachers and admins can manage lessons"
on public.lessons for all
to authenticated
using (
  exists (
    select 1 from public.users
    where id = auth.uid() and role in ('teacher', 'admin', 'instructional_coach')
  )
)
with check (
  exists (
    select 1 from public.users
    where id = auth.uid() and role in ('teacher', 'admin', 'instructional_coach')
  )
);

create policy "school members can read classroom entities"
on public.classrooms for select
to authenticated
using (
  school_id in (
    select school_id from public.users where id = auth.uid()
  )
);

create policy "school members can read sessions"
on public.sessions for select
to authenticated
using (
  classroom_id in (
    select id from public.classrooms
    where school_id in (
      select school_id from public.users where id = auth.uid()
    )
  )
);

create policy "school members can read activities"
on public.activities for select
to authenticated
using (
  lesson_id in (
    select id from public.lessons
    where school_id in (
      select school_id from public.users where id = auth.uid()
    )
  )
);

create policy "school members can read assignment, assessment, progress, content, media, notifications, integrations"
on public.assignments for select
to authenticated
using (true);

create policy "school members can read assignment MCQs"
on public.assignment_mcqs for select
to authenticated
using (
  school_id = public.current_school_id()
);

create policy "teachers and admins can manage assignment MCQs"
on public.assignment_mcqs for all
to authenticated
using (
  school_id = public.current_school_id()
  and public.current_user_role() in ('teacher', 'admin', 'instructional_coach')
)
with check (
  school_id = public.current_school_id()
  and public.current_user_role() in ('teacher', 'admin', 'instructional_coach')
);

create policy "school members can read assignment MCQ attempts"
on public.assignment_mcq_attempts for select
to authenticated
using (
  school_id = public.current_school_id()
);

create policy "students can manage their assignment MCQ attempts"
on public.assignment_mcq_attempts for all
to authenticated
using (
  school_id = public.current_school_id()
  and student_id = auth.uid()
  and public.current_user_role() = 'student'
)
with check (
  school_id = public.current_school_id()
  and student_id = auth.uid()
  and public.current_user_role() = 'student'
);

create policy "teachers and admins can manage assignment MCQ attempts"
on public.assignment_mcq_attempts for all
to authenticated
using (
  school_id = public.current_school_id()
  and public.current_user_role() in ('teacher', 'admin', 'instructional_coach')
)
with check (
  school_id = public.current_school_id()
  and public.current_user_role() in ('teacher', 'admin', 'instructional_coach')
);

create policy "school members can read assessments"
on public.assessments for select
to authenticated
using (true);

create policy "students and staff can read progress"
on public.student_progress for select
to authenticated
using (true);

create policy "school members can read content library"
on public.content_library for select
to authenticated
using (true);

create policy "admins can manage content library"
on public.content_library for all
to authenticated
using (
  school_id = public.current_school_id()
  and public.current_user_role() = 'admin'
)
with check (
  school_id = public.current_school_id()
  and public.current_user_role() = 'admin'
);

create policy "school members can read library folders"
on public.library_folders for select
to authenticated
using (
  school_id = public.current_school_id()
);

create policy "teachers and admins can manage library folders"
on public.library_folders for all
to authenticated
using (
  school_id = public.current_school_id()
  and public.current_user_role() in ('teacher', 'admin', 'instructional_coach')
)
with check (
  school_id = public.current_school_id()
  and public.current_user_role() in ('teacher', 'admin', 'instructional_coach')
);

create policy "school members can read library folder items"
on public.library_folder_items for select
to authenticated
using (
  folder_id in (
    select id from public.library_folders
    where school_id = public.current_school_id()
  )
);

create policy "teachers and admins can manage library folder items"
on public.library_folder_items for all
to authenticated
using (
  folder_id in (
    select id from public.library_folders
    where school_id = public.current_school_id()
  )
  and public.current_user_role() in ('teacher', 'admin', 'instructional_coach')
)
with check (
  folder_id in (
    select id from public.library_folders
    where school_id = public.current_school_id()
  )
  and public.current_user_role() in ('teacher', 'admin', 'instructional_coach')
);

create policy "school members can read media files"
on public.media_files for select
to authenticated
using (true);

create policy "school members can read notifications"
on public.notifications for select
to authenticated
using (true);

create policy "school members can read integrations"
on public.integrations for select
to authenticated
using (true);
