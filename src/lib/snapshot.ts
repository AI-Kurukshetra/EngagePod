import type { DashboardSnapshot, UserProfile } from "@/types/domain";

export function createEmptySnapshot(currentUser: UserProfile | null = null): DashboardSnapshot {
  return {
    currentUser,
    schools: [],
    schoolUsers: [],
    classrooms: [],
    lessons: [],
    sessions: [],
    assignments: [],
    assignmentMcqs: [],
    assignmentMcqAttempts: [],
    assessments: [],
    progress: [],
    notifications: [],
    libraryFolders: [],
    content: [],
    media: [],
    integrations: [],
  };
}
