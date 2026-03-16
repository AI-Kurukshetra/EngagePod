import { advancedFeatures, coreFeatures, innovativeIdeas } from "@/data/blueprint";
import { createEmptySnapshot } from "@/lib/snapshot";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type {
  AssessmentSummary,
  Assignment,
  AssignmentMcq,
  AssignmentMcqAttempt,
  Classroom,
  ContentAsset,
  DashboardSnapshot,
  IntegrationItem,
  LibraryFolder,
  Lesson,
  LessonActivity,
  LiveSession,
  MediaFile,
  NotificationItem,
  School,
  StudentProgress,
  UserProfile,
} from "@/types/domain";

type Row = Record<string, unknown>;

function mapUserProfile(row: Row): UserProfile {
  return {
    id: String(row.id),
    fullName: String(row.full_name ?? row.fullName ?? ""),
    email: String(row.email ?? ""),
    role: (row.role as UserProfile["role"]) ?? "teacher",
    avatar: row.avatar_url ? String(row.avatar_url) : undefined,
    schoolId: row.school_id ? String(row.school_id) : null,
    classroomIds: [],
    locale: String(row.locale ?? "en-US"),
    streakDays: Number(row.streak_days ?? 0),
  };
}

function mapSchool(row: Row): School {
  return {
    id: String(row.id),
    name: String(row.name ?? ""),
    district: String(row.district ?? ""),
    plan: (row.plan as School["plan"]) ?? "freemium",
    timeZone: String(row.time_zone ?? "UTC"),
    activeStudents: Number(row.active_students ?? 0),
    activeTeachers: Number(row.active_teachers ?? 0),
  };
}

function mapClassroom(row: Row): Classroom {
  return {
    id: String(row.id),
    schoolId: String(row.school_id ?? ""),
    title: String(row.title ?? ""),
    subject: String(row.subject ?? ""),
    gradeBand: String(row.grade_band ?? ""),
    rosterCount: Number(row.roster_count ?? 0),
    liveSessionId: row.live_session_id ? String(row.live_session_id) : undefined,
    paceMode: (row.pace_mode as Classroom["paceMode"]) ?? "teacher",
    completionRate: Number(row.completion_rate ?? 0),
  };
}

function mapActivity(row: Row): LessonActivity {
  return {
    id: String(row.id),
    lessonId: String(row.lesson_id ?? ""),
    title: String(row.title ?? ""),
    type: (row.type as LessonActivity["type"]) ?? "quiz",
    prompt: String(row.prompt ?? ""),
    estimatedMinutes: Number(row.estimated_minutes ?? 0),
    points: Number(row.points ?? 0),
  };
}

function mapLesson(row: Row, activities: LessonActivity[]): Lesson {
  return {
    id: String(row.id),
    title: String(row.title ?? ""),
    subject: String(row.subject ?? ""),
    gradeBand: String(row.grade_band ?? ""),
    status: (row.status as Lesson["status"]) ?? "draft",
    durationMinutes: Number(row.duration_minutes ?? 0),
    standards: Array.isArray(row.standards) ? row.standards.map(String) : [],
    featured: Boolean(row.featured),
    authoredBy: String(row.authored_by_name ?? row.created_by ?? ""),
    aiAssist: Boolean(row.ai_assist),
    activities,
    tags: Array.isArray(row.tags) ? row.tags.map(String) : [],
  };
}

function mapSession(row: Row): LiveSession {
  return {
    id: String(row.id),
    classroomId: String(row.classroom_id ?? ""),
    lessonId: String(row.lesson_id ?? ""),
    title: String(row.title ?? ""),
    attendeeCount: Number(row.attendee_count ?? 0),
    engagementScore: Number(row.engagement_score ?? 0),
    responseRate: Number(row.response_rate ?? 0),
    breakoutRooms: Number(row.breakout_rooms ?? 0),
    status: (row.status as LiveSession["status"]) ?? "scheduled",
    startsAt: String(row.starts_at ?? new Date().toISOString()),
  };
}

function mapAssignment(row: Row): Assignment {
  return {
    id: String(row.id),
    classroomId: String(row.classroom_id ?? ""),
    lessonId: String(row.lesson_id ?? ""),
    title: String(row.title ?? ""),
    dueDate: String(row.due_date ?? ""),
    completionRate: Number(row.completion_rate ?? 0),
    assignedCount: Number(row.assigned_count ?? 0),
  };
}

function mapAssignmentMcq(row: Row): AssignmentMcq {
  const correctOption = String(row.correct_option ?? "A");
  return {
    id: String(row.id ?? ""),
    schoolId: String(row.school_id ?? ""),
    question: String(row.question ?? ""),
    options: {
      A: String(row.option_a ?? ""),
      B: String(row.option_b ?? ""),
      C: String(row.option_c ?? ""),
      D: String(row.option_d ?? ""),
    },
    correctOption: (["A", "B", "C", "D"].includes(correctOption) ? correctOption : "A") as AssignmentMcq["correctOption"],
    points: Number(row.points ?? 0),
    createdAt: String(row.created_at ?? new Date().toISOString()),
    createdBy: row.created_by ? String(row.created_by) : null,
  };
}

function mapAssignmentMcqAttempt(row: Row): AssignmentMcqAttempt {
  const selectedOption = String(row.selected_option ?? "A");
  return {
    id: String(row.id ?? ""),
    mcqId: String(row.mcq_id ?? ""),
    schoolId: String(row.school_id ?? ""),
    studentId: String(row.student_id ?? ""),
    selectedOption: (["A", "B", "C", "D"].includes(selectedOption) ? selectedOption : "A") as AssignmentMcqAttempt["selectedOption"],
    isCorrect: Boolean(row.is_correct),
    pointsEarned: Number(row.points_earned ?? 0),
    createdAt: String(row.created_at ?? new Date().toISOString()),
  };
}

function mapAssessment(row: Row): AssessmentSummary {
  return {
    id: String(row.id),
    title: String(row.title ?? ""),
    format: (row.format as AssessmentSummary["format"]) ?? "formative",
    averageScore: Number(row.average_score ?? 0),
    submissionRate: Number(row.submission_rate ?? 0),
    flaggedForReview: Number(row.flagged_for_review ?? 0),
  };
}

function mapProgress(row: Row): StudentProgress {
  return {
    studentId: String(row.student_id ?? ""),
    masteryRate: Number(row.mastery_rate ?? 0),
    riskLevel: (row.risk_level as StudentProgress["riskLevel"]) ?? "low",
    lastActive: String(row.last_active ?? new Date().toISOString()),
  };
}

function mapNotification(row: Row): NotificationItem {
  return {
    id: String(row.id),
    title: String(row.title ?? ""),
    audience: Array.isArray(row.audience) ? (row.audience as NotificationItem["audience"]) : [],
    channel: (row.channel as NotificationItem["channel"]) ?? "in_app",
    createdAt: String(row.created_at ?? new Date().toISOString()),
    status: (row.status as NotificationItem["status"]) ?? "queued",
  };
}

function mapContent(row: Row): ContentAsset {
  const folderIds = new Set<string>();
  if (row.folder_id) {
    folderIds.add(String(row.folder_id));
  }
  if (Array.isArray(row.folder_ids)) {
    row.folder_ids.forEach((folderId) => {
      if (folderId) {
        folderIds.add(String(folderId));
      }
    });
  }

  return {
    id: String(row.id),
    folderId: row.folder_id ? String(row.folder_id) : null,
    folderIds: [...folderIds],
    title: String(row.title ?? ""),
    description: String(row.description ?? ""),
    type: (row.type as ContentAsset["type"]) ?? "resource",
    subject: String(row.subject ?? ""),
    gradeBand: String(row.grade_band ?? ""),
    downloads: Number(row.downloads ?? 0),
    fileName: row.file_name ? String(row.file_name) : null,
    fileUrl: row.file_url ? String(row.file_url) : null,
    createdBy: row.created_by ? String(row.created_by) : null,
    createdByName: row.created_by_name ? String(row.created_by_name) : null,
    createdAt: String(row.created_at ?? new Date().toISOString()),
  };
}

function mapLibraryFolder(row: Row): LibraryFolder {
  return {
    id: String(row.id),
    schoolId: String(row.school_id ?? ""),
    name: String(row.name ?? ""),
    createdBy: row.created_by ? String(row.created_by) : null,
    createdAt: String(row.created_at ?? new Date().toISOString()),
    updatedAt: String(row.updated_at ?? row.created_at ?? new Date().toISOString()),
  };
}

function mapMedia(row: Row): MediaFile {
  return {
    id: String(row.id),
    lessonId: row.lesson_id ? String(row.lesson_id) : undefined,
    kind: (row.kind as MediaFile["kind"]) ?? "document",
    name: String(row.name ?? ""),
    url: String(row.url ?? ""),
  };
}

function mapIntegration(row: Row): IntegrationItem {
  return {
    id: String(row.id),
    name: String(row.name ?? ""),
    category: (row.category as IntegrationItem["category"]) ?? "analytics",
    status: (row.status as IntegrationItem["status"]) ?? "available",
  };
}

async function selectRows(
  table: string,
  supabase: NonNullable<Awaited<ReturnType<typeof createServerSupabaseClient>>>,
  options?: {
    match?: Record<string, string>;
    in?: { column: string; values: string[] };
    order?: { column: string; ascending?: boolean };
  },
) {
  let query = supabase.from(table).select("*");

  if (options?.match) {
    Object.entries(options.match).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
  }

  if (options?.in) {
    if (options.in.values.length === 0) {
      return [] as Row[];
    }
    query = query.in(options.in.column, options.in.values);
  }

  if (options?.order) {
    query = query.order(options.order.column, { ascending: options.order.ascending ?? true });
  }

  const { data, error } = await query;
  if (error || !data) {
    return [] as Row[];
  }

  return data as Row[];
}

export async function getDashboardSnapshot(): Promise<DashboardSnapshot> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return createEmptySnapshot();
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return createEmptySnapshot();
  }

  const profileRows = await selectRows("users", supabase, {
    match: { id: user.id },
  });

  const currentUser =
    profileRows[0] ? mapUserProfile(profileRows[0]) : mapUserProfile({
      id: user.id,
      email: user.email ?? "",
      full_name: user.user_metadata.full_name ?? user.email ?? "",
      role: user.user_metadata.role ?? "teacher",
      locale: user.user_metadata.locale ?? "en-US",
      avatar_url: user.user_metadata.avatar_url ?? "",
      school_id: user.user_metadata.school_id ?? null,
      streak_days: 0,
    });

  const schoolId = currentUser.schoolId;

  const [schools, schoolUsers, classrooms, lessons] = await Promise.all([
    schoolId ? selectRows("schools", supabase, { match: { id: schoolId } }) : Promise.resolve([] as Row[]),
    schoolId
      ? selectRows("users", supabase, {
          match: { school_id: schoolId },
          order: { column: "full_name" },
        })
      : Promise.resolve([] as Row[]),
    schoolId
      ? selectRows("classrooms", supabase, {
          match: { school_id: schoolId },
          order: { column: "title" },
        })
      : Promise.resolve([] as Row[]),
    schoolId
      ? selectRows("lessons", supabase, {
          match: { school_id: schoolId },
          order: { column: "created_at", ascending: false },
        })
      : Promise.resolve([] as Row[]),
  ]);

  const classroomList = classrooms.map(mapClassroom);
  const lessonIds = lessons.map((lesson) => String(lesson.id));
  const classroomIds = classroomList.map((classroom) => classroom.id);
  const mappedActivities = (await selectRows("activities", supabase, {
    in: { column: "lesson_id", values: lessonIds },
    order: { column: "position" },
  })).map(mapActivity);

  currentUser.classroomIds = classroomList
    .filter((classroom) => String((classrooms.find((row) => String(row.id) === classroom.id)?.teacher_id ?? "")) === currentUser.id)
    .map((classroom) => classroom.id);

  const libraryFolders = schoolId
    ? (await selectRows("library_folders", supabase, {
        match: { school_id: schoolId },
        order: { column: "updated_at", ascending: false },
      })).map(mapLibraryFolder)
    : [];
  const contentRows = schoolId
    ? await selectRows("content_library", supabase, {
        match: { school_id: schoolId },
        order: { column: "downloads", ascending: false },
      })
    : [];
  const libraryFolderItemRows =
    libraryFolders.length && contentRows.length
      ? await selectRows("library_folder_items", supabase, {
          in: { column: "folder_id", values: libraryFolders.map((folder) => folder.id) },
        })
      : [];
  const folderIdsByContentId = new Map<string, string[]>();

  libraryFolderItemRows.forEach((row) => {
    const contentId = String(row.content_id ?? "");
    const folderId = String(row.folder_id ?? "");

    if (!contentId || !folderId) {
      return;
    }

    const currentFolderIds = folderIdsByContentId.get(contentId) ?? [];
    if (!currentFolderIds.includes(folderId)) {
      currentFolderIds.push(folderId);
      folderIdsByContentId.set(contentId, currentFolderIds);
    }
  });

  return {
    currentUser,
    schools: schools.map(mapSchool),
    schoolUsers: schoolUsers.map(mapUserProfile),
    classrooms: classroomList,
    lessons: lessons.map((lesson) =>
      mapLesson(
        lesson,
        mappedActivities.filter((activity) => activity.lessonId === String(lesson.id)),
      ),
    ),
    sessions: (await selectRows("sessions", supabase, {
      in: { column: "classroom_id", values: classroomIds },
      order: { column: "starts_at" },
    })).map(mapSession),
    assignments: (await selectRows("assignments", supabase, {
      in: { column: "classroom_id", values: classroomIds },
      order: { column: "due_date" },
    })).map(mapAssignment),
    assignmentMcqs: schoolId
      ? (await selectRows("assignment_mcqs", supabase, {
          match: { school_id: schoolId },
          order: { column: "created_at", ascending: false },
        })).map(mapAssignmentMcq)
      : [],
    assignmentMcqAttempts: schoolId
      ? (await selectRows("assignment_mcq_attempts", supabase, {
          match: { school_id: schoolId },
          order: { column: "created_at", ascending: false },
        })).map(mapAssignmentMcqAttempt)
      : [],
    assessments: (await selectRows("assessments", supabase, {
      in: { column: "lesson_id", values: lessonIds },
      order: { column: "created_at", ascending: false },
    })).map(mapAssessment),
    progress: (await selectRows("student_progress", supabase, {
      in: { column: "classroom_id", values: classroomIds },
      order: { column: "created_at", ascending: false },
    })).map(mapProgress),
    notifications: schoolId
      ? (await selectRows("notifications", supabase, {
          match: { school_id: schoolId },
          order: { column: "created_at", ascending: false },
        })).map(mapNotification)
      : [],
    libraryFolders,
    content: contentRows.map((row) =>
      mapContent({
        ...row,
        folder_ids: folderIdsByContentId.get(String(row.id ?? "")) ?? [],
        created_by_name:
          row.created_by_name ??
          schoolUsers.find((userRow) => String(userRow.id ?? "") === String(row.created_by ?? ""))?.full_name ??
          null,
      }),
    ),
    media: (await selectRows("media_files", supabase, {
      in: { column: "lesson_id", values: lessonIds },
      order: { column: "created_at", ascending: false },
    })).map(mapMedia),
    integrations: schoolId
      ? (await selectRows("integrations", supabase, {
          match: { school_id: schoolId },
          order: { column: "created_at", ascending: false },
        })).map(mapIntegration)
      : [],
  };
}

export async function getPlatformBlueprint() {
  return {
    coreFeatures,
    advancedFeatures,
    innovativeIdeas,
  };
}

export async function getApiPayload() {
  const snapshot = await getDashboardSnapshot();
  return {
    snapshot,
    coreFeatures,
    advancedFeatures,
    innovativeIdeas,
    responses: snapshot.progress,
    activities: snapshot.lessons.flatMap((lesson) => lesson.activities),
  };
}
