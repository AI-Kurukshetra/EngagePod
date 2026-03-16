insert into public.schools (id, name, district, plan, time_zone, active_students, active_teachers)
values
  ('11111111-1111-1111-1111-111111111111', 'Northstar K-12 Academy', 'Bengaluru Learning District', 'enterprise', 'Asia/Kolkata', 1280, 84)
on conflict (id) do nothing;

insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  confirmation_sent_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
values
  (
    '00000000-0000-0000-0000-000000000000',
    '10000000-0000-0000-0000-000000000001',
    'authenticated',
    'authenticated',
    'admin@northstar.edu',
    crypt('EngagePod@123', gen_salt('bf')),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object(
      'full_name', 'Avery Admin',
      'role', 'admin',
      'school_id', '11111111-1111-1111-1111-111111111111',
      'school_name', 'Northstar K-12 Academy',
      'district', 'Bengaluru Learning District'
    ),
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '10000000-0000-0000-0000-000000000002',
    'authenticated',
    'authenticated',
    'teacher@northstar.edu',
    crypt('EngagePod@123', gen_salt('bf')),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object(
      'full_name', 'Taylor Teacher',
      'role', 'teacher',
      'school_id', '11111111-1111-1111-1111-111111111111',
      'school_name', 'Northstar K-12 Academy',
      'district', 'Bengaluru Learning District'
    ),
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '10000000-0000-0000-0000-000000000011',
    'authenticated',
    'authenticated',
    'student1@northstar.edu',
    crypt('EngagePod@123', gen_salt('bf')),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object(
      'full_name', 'Sam Student',
      'role', 'student',
      'school_id', '11111111-1111-1111-1111-111111111111',
      'school_name', 'Northstar K-12 Academy',
      'district', 'Bengaluru Learning District'
    ),
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '10000000-0000-0000-0000-000000000012',
    'authenticated',
    'authenticated',
    'student2@northstar.edu',
    crypt('EngagePod@123', gen_salt('bf')),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object(
      'full_name', 'Riley Student',
      'role', 'student',
      'school_id', '11111111-1111-1111-1111-111111111111',
      'school_name', 'Northstar K-12 Academy',
      'district', 'Bengaluru Learning District'
    ),
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '10000000-0000-0000-0000-000000000013',
    'authenticated',
    'authenticated',
    'student3@northstar.edu',
    crypt('EngagePod@123', gen_salt('bf')),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object(
      'full_name', 'Jordan Student',
      'role', 'student',
      'school_id', '11111111-1111-1111-1111-111111111111',
      'school_name', 'Northstar K-12 Academy',
      'district', 'Bengaluru Learning District'
    ),
    now(),
    now()
  )
on conflict (id) do update
set
  email = excluded.email,
  encrypted_password = excluded.encrypted_password,
  raw_user_meta_data = excluded.raw_user_meta_data,
  updated_at = excluded.updated_at;

insert into public.users (id, school_id, full_name, email, role, locale, streak_days)
values
  ('10000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Avery Admin', 'admin@northstar.edu', 'admin', 'en-US', 12),
  ('10000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'Taylor Teacher', 'teacher@northstar.edu', 'teacher', 'en-US', 24),
  ('10000000-0000-0000-0000-000000000011', '11111111-1111-1111-1111-111111111111', 'Sam Student', 'student1@northstar.edu', 'student', 'en-US', 5),
  ('10000000-0000-0000-0000-000000000012', '11111111-1111-1111-1111-111111111111', 'Riley Student', 'student2@northstar.edu', 'student', 'en-US', 7),
  ('10000000-0000-0000-0000-000000000013', '11111111-1111-1111-1111-111111111111', 'Jordan Student', 'student3@northstar.edu', 'student', 'en-US', 3)
on conflict (id) do update
set
  school_id = excluded.school_id,
  full_name = excluded.full_name,
  email = excluded.email,
  role = excluded.role,
  locale = excluded.locale,
  streak_days = excluded.streak_days;

insert into public.classrooms (id, school_id, teacher_id, title, subject, grade_band, pace_mode, roster_count, completion_rate)
values
  ('22222222-2222-2222-2222-222222222221', '11111111-1111-1111-1111-111111111111', '10000000-0000-0000-0000-000000000002', '6A Earth Systems', 'Science', 'Grade 6', 'teacher', 32, 91),
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', '10000000-0000-0000-0000-000000000002', '5C Number Lab', 'Mathematics', 'Grade 5', 'student', 28, 87)
on conflict (id) do nothing;

insert into public.lessons (id, school_id, created_by, title, subject, grade_band, status, duration_minutes, standards, featured, ai_assist, tags)
values
  ('33333333-3333-3333-3333-333333333331', '11111111-1111-1111-1111-111111111111', '10000000-0000-0000-0000-000000000002', 'Forces That Shape Our World', 'Science', 'Grade 6', 'live', 35, array['NGSS MS-ESS2-1', 'NCERT Sci 6.3'], true, true, array['interactive', 'earth-science', 'field-trip']),
  ('33333333-3333-3333-3333-333333333332', '11111111-1111-1111-1111-111111111111', '10000000-0000-0000-0000-000000000002', 'Fraction Sense Sprint', 'Mathematics', 'Grade 5', 'published', 28, array['CCSS.MATH.CONTENT.5.NF.A.1'], true, false, array['quiz', 'gamified', 'math'])
on conflict (id) do nothing;

insert into public.activities (id, lesson_id, title, type, prompt, estimated_minutes, points, position)
values
  ('44444444-4444-4444-4444-444444444441', '33333333-3333-3333-3333-333333333331', 'Warm-up poll', 'poll', 'Which force do you notice most often in daily life?', 3, 10, 1),
  ('44444444-4444-4444-4444-444444444442', '33333333-3333-3333-3333-333333333331', 'Interactive video checkpoint', 'video', 'Watch the erosion clip and answer the embedded quiz.', 7, 15, 2),
  ('44444444-4444-4444-4444-444444444443', '33333333-3333-3333-3333-333333333331', 'Open-ended reasoning', 'open_ended', 'Explain how water, wind, and gravity can work together to shape landforms.', 6, 15, 3),
  ('44444444-4444-4444-4444-444444444444', '33333333-3333-3333-3333-333333333331', 'Draw-it sketch', 'draw', 'Sketch a quick diagram showing where erosion is happening in the landscape.', 8, 20, 4),
  ('44444444-4444-4444-4444-444444444445', '33333333-3333-3333-3333-333333333332', 'Rapid recall', 'quiz', 'Choose the equivalent fraction for each card.', 6, 20, 1),
  ('44444444-4444-4444-4444-444444444446', '33333333-3333-3333-3333-333333333332', 'Fraction reflection', 'open_ended', 'Describe how you know two fractions are equivalent without using a calculator.', 5, 10, 2)
on conflict (id) do nothing;

insert into public.sessions (id, classroom_id, lesson_id, title, status, attendee_count, engagement_score, response_rate, breakout_rooms, starts_at)
values
  ('55555555-5555-5555-5555-555555555551', '22222222-2222-2222-2222-222222222221', '33333333-3333-3333-3333-333333333331', 'Forces That Shape Our World', 'live', 29, 94, 89, 4, '2026-03-14T11:30:00+05:30'),
  ('55555555-5555-5555-5555-555555555552', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333332', 'Fraction Sense Sprint', 'scheduled', 28, 88, 93, 3, '2026-03-15T09:00:00+05:30')
on conflict (id) do nothing;

insert into public.assessments (id, lesson_id, title, format, average_score, submission_rate, flagged_for_review)
values
  ('66666666-6666-6666-6666-666666666661', '33333333-3333-3333-3333-333333333331', 'Science checkpoint', 'formative', 86, 91, 2),
  ('66666666-6666-6666-6666-666666666662', '33333333-3333-3333-3333-333333333332', 'Math sprint review', 'summative', 83, 95, 1)
on conflict (id) do nothing;

insert into public.assignments (id, classroom_id, lesson_id, title, due_date, completion_rate, assigned_count)
values
  ('77777777-7777-7777-7777-777777777771', '22222222-2222-2222-2222-222222222221', '33333333-3333-3333-3333-333333333331', 'Erosion reflection journal', '2026-03-16', 74, 32),
  ('77777777-7777-7777-7777-777777777772', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333332', 'Fraction mastery checkpoint', '2026-03-17', 81, 28)
on conflict (id) do nothing;

insert into public.assignment_mcqs (
  id,
  school_id,
  created_by,
  question,
  option_a,
  option_b,
  option_c,
  option_d,
  correct_option,
  points
)
values
  (
    '78787878-7878-7878-7878-787878787871',
    '11111111-1111-1111-1111-111111111111',
    '10000000-0000-0000-0000-000000000002',
    'Which Earth layer is mostly liquid iron and nickel?',
    'Crust',
    'Outer core',
    'Mantle',
    'Inner core',
    'B',
    8
  ),
  (
    '78787878-7878-7878-7878-787878787872',
    '11111111-1111-1111-1111-111111111111',
    '10000000-0000-0000-0000-000000000002',
    'What is an equivalent fraction to 3/6?',
    '1/3',
    '2/3',
    '1/2',
    '3/12',
    'C',
    5
  )
on conflict (id) do nothing;

insert into public.assignment_mcq_attempts (
  id,
  mcq_id,
  school_id,
  student_id,
  selected_option,
  is_correct,
  points_earned
)
values
  (
    '79797979-7979-7979-7979-797979797971',
    '78787878-7878-7878-7878-787878787871',
    '11111111-1111-1111-1111-111111111111',
    '10000000-0000-0000-0000-000000000011',
    'B',
    true,
    8
  ),
  (
    '79797979-7979-7979-7979-797979797972',
    '78787878-7878-7878-7878-787878787872',
    '11111111-1111-1111-1111-111111111111',
    '10000000-0000-0000-0000-000000000012',
    'A',
    false,
    0
  )
on conflict (id) do nothing;

insert into public.library_folders (id, school_id, created_by, name)
values
  ('12121212-1212-1212-1212-121212121211', '11111111-1111-1111-1111-111111111111', '10000000-0000-0000-0000-000000000002', 'Science Essentials'),
  ('12121212-1212-1212-1212-121212121212', '11111111-1111-1111-1111-111111111111', '10000000-0000-0000-0000-000000000002', 'Math Support')
on conflict (id) do nothing;

insert into public.content_library (
  id,
  school_id,
  folder_id,
  created_by,
  title,
  description,
  type,
  subject,
  grade_band,
  file_name,
  file_url,
  downloads
)
values
  (
    '88888888-8888-8888-8888-888888888881',
    '11111111-1111-1111-1111-111111111111',
    '12121212-1212-1212-1212-121212121211',
    '10000000-0000-0000-0000-000000000001',
    'Volcano explorer field trip',
    'A ready-to-use field trip pack with location prompts, discussion cues, and printable student notes.',
    'field_trip',
    'Science',
    'Grade 6-8',
    'volcano-explorer-pack.pdf',
    'https://example.com/library/volcano-explorer-pack.pdf',
    320
  ),
  (
    '88888888-8888-8888-8888-888888888882',
    '11111111-1111-1111-1111-111111111111',
    '12121212-1212-1212-1212-121212121212',
    '10000000-0000-0000-0000-000000000001',
    'Fraction intervention toolkit',
    'Mini-lessons, reteach prompts, and printable practice routines for small-group support.',
    'resource',
    'Mathematics',
    'Grade 4-6',
    'fraction-intervention-toolkit.pdf',
    'https://example.com/library/fraction-intervention-toolkit.pdf',
    198
  ),
  (
    '88888888-8888-8888-8888-888888888883',
    '11111111-1111-1111-1111-111111111111',
    null,
    '10000000-0000-0000-0000-000000000001',
    'Storm systems response deck',
    'Interactive response slides designed for multiple-choice, open-ended, and draw-it checkpoints.',
    'lesson',
    'Science',
    'Grade 6',
    'storm-systems-response-deck.pdf',
    'https://example.com/library/storm-systems-response-deck.pdf',
    146
  ),
  (
    '88888888-8888-8888-8888-888888888884',
    '11111111-1111-1111-1111-111111111111',
    null,
    '10000000-0000-0000-0000-000000000001',
    'Landform image annotation kit',
    'A multimedia image set with hotspot prompts and annotation ideas for drag-and-drop lesson building.',
    'template',
    'Science',
    'Grade 5-7',
    'landform-image-annotation-kit.pdf',
    'https://example.com/library/landform-image-annotation-kit.pdf',
    88
  )
on conflict (id) do nothing;

insert into public.library_folder_items (folder_id, content_id, added_by)
values
  ('12121212-1212-1212-1212-121212121211', '88888888-8888-8888-8888-888888888881', '10000000-0000-0000-0000-000000000002'),
  ('12121212-1212-1212-1212-121212121211', '88888888-8888-8888-8888-888888888883', '10000000-0000-0000-0000-000000000002'),
  ('12121212-1212-1212-1212-121212121212', '88888888-8888-8888-8888-888888888882', '10000000-0000-0000-0000-000000000002'),
  ('12121212-1212-1212-1212-121212121212', '88888888-8888-8888-8888-888888888884', '10000000-0000-0000-0000-000000000002')
on conflict (folder_id, content_id) do nothing;

insert into public.media_files (id, lesson_id, kind, name, url)
values
  ('99999999-9999-9999-9999-999999999991', '33333333-3333-3333-3333-333333333331', 'video', 'Erosion timelapse', 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80'),
  ('99999999-9999-9999-9999-999999999992', '33333333-3333-3333-3333-333333333331', 'image', 'Coastline annotations', 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=80'),
  ('99999999-9999-9999-9999-999999999993', '33333333-3333-3333-3333-333333333331', 'document', 'Landform evidence notes', 'https://example.com/media/landform-evidence-notes.pdf'),
  ('99999999-9999-9999-9999-999999999994', '33333333-3333-3333-3333-333333333332', 'image', 'Fraction strip gallery', 'https://images.unsplash.com/photo-1516117172878-fd2c41f4a759?auto=format&fit=crop&w=1200&q=80')
on conflict (id) do nothing;

insert into public.responses (id, activity_id, student_id, response_type, response_value, created_at)
values
  (
    '10101010-1010-1010-1010-101010101011',
    '44444444-4444-4444-4444-444444444441',
    '10000000-0000-0000-0000-000000000011',
    'multiple_choice',
    'Wind and rain together',
    '2026-03-14T11:33:00+05:30'
  ),
  (
    '10101010-1010-1010-1010-101010101012',
    '44444444-4444-4444-4444-444444444443',
    '10000000-0000-0000-0000-000000000012',
    'open_ended',
    'Water loosens soil, gravity pulls it downward, and wind can move the loose particles farther away.',
    '2026-03-14T11:36:00+05:30'
  ),
  (
    '10101010-1010-1010-1010-101010101013',
    '44444444-4444-4444-4444-444444444444',
    '10000000-0000-0000-0000-000000000013',
    'drawing',
    '1111000011110000001100000011000000110000001100000000000000000000',
    '2026-03-14T11:39:00+05:30'
  )
on conflict (id) do nothing;

insert into public.notifications (id, school_id, title, audience, channel, status)
values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', '11111111-1111-1111-1111-111111111111', 'Parent digest scheduled for 5:00 PM', array['parent'], 'email', 'queued'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', '11111111-1111-1111-1111-111111111111', 'Live lesson reminder sent to 6A', array['student', 'teacher'], 'push', 'sent')
on conflict (id) do nothing;

insert into public.integrations (id, school_id, name, category, status)
values
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1', '11111111-1111-1111-1111-111111111111', 'Google Classroom', 'lms', 'connected'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2', '11111111-1111-1111-1111-111111111111', 'Canvas', 'lms', 'available'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb3', '11111111-1111-1111-1111-111111111111', 'OneDrive', 'storage', 'connected')
on conflict (id) do nothing;
