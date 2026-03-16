export type UserRole =
  | "teacher"
  | "student"
  | "parent"
  | "admin"
  | "instructional_coach";

export type ActivityKind =
  | "quiz"
  | "poll"
  | "draw"
  | "open_ended"
  | "collaboration"
  | "video"
  | "field_trip";

export type Priority = "must-have" | "important" | "innovative" | "nice-to-have";
export type Complexity = "low" | "medium" | "high";

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  avatar?: string;
  schoolId: string | null;
  classroomIds: string[];
  locale: string;
  streakDays: number;
}

export interface School {
  id: string;
  name: string;
  district: string;
  plan: "freemium" | "district" | "enterprise";
  timeZone: string;
  activeStudents: number;
  activeTeachers: number;
}

export interface Classroom {
  id: string;
  schoolId: string;
  title: string;
  subject: string;
  gradeBand: string;
  rosterCount: number;
  liveSessionId?: string;
  paceMode: "teacher" | "student";
  completionRate: number;
}

export interface LessonActivity {
  id: string;
  lessonId: string;
  title: string;
  type: ActivityKind;
  prompt: string;
  estimatedMinutes: number;
  points: number;
}

export interface Lesson {
  id: string;
  title: string;
  subject: string;
  gradeBand: string;
  status: "draft" | "published" | "live";
  durationMinutes: number;
  standards: string[];
  featured: boolean;
  authoredBy: string;
  aiAssist: boolean;
  activities: LessonActivity[];
  tags: string[];
}

export interface LiveSession {
  id: string;
  classroomId: string;
  lessonId: string;
  title: string;
  attendeeCount: number;
  engagementScore: number;
  responseRate: number;
  breakoutRooms: number;
  status: "scheduled" | "live" | "completed";
  startsAt: string;
}

export interface Assignment {
  id: string;
  classroomId: string;
  lessonId: string;
  title: string;
  dueDate: string;
  completionRate: number;
  assignedCount: number;
}

export interface AssignmentMcq {
  id: string;
  schoolId: string;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctOption: "A" | "B" | "C" | "D";
  points: number;
  createdAt: string;
  createdBy: string | null;
}

export interface AssignmentMcqAttempt {
  id: string;
  mcqId: string;
  schoolId: string;
  studentId: string;
  selectedOption: "A" | "B" | "C" | "D";
  isCorrect: boolean;
  pointsEarned: number;
  createdAt: string;
}

export interface AssessmentSummary {
  id: string;
  title: string;
  format: "formative" | "summative";
  averageScore: number;
  submissionRate: number;
  flaggedForReview: number;
}

export interface StudentProgress {
  studentId: string;
  masteryRate: number;
  riskLevel: "low" | "medium" | "high";
  lastActive: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  audience: UserRole[];
  channel: "in_app" | "email" | "push";
  createdAt: string;
  status: "queued" | "sent";
}

export interface ContentAsset {
  id: string;
  folderId: string | null;
  folderIds: string[];
  title: string;
  description: string;
  type: "template" | "lesson" | "video" | "field_trip" | "resource";
  subject: string;
  gradeBand: string;
  downloads: number;
  fileName: string | null;
  fileUrl: string | null;
  createdBy: string | null;
  createdByName: string | null;
  createdAt: string;
}

export interface LibraryFolder {
  id: string;
  schoolId: string;
  name: string;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MediaFile {
  id: string;
  lessonId?: string;
  kind: "image" | "video" | "audio" | "document" | "3d";
  name: string;
  url: string;
}

export interface IntegrationItem {
  id: string;
  name: string;
  category: "lms" | "storage" | "analytics" | "communication";
  status: "connected" | "available";
}

export interface FeatureItem {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  complexity: Complexity;
}

export interface MetricCard {
  label: string;
  value: string;
  trend: string;
}

export interface DashboardSnapshot {
  currentUser: UserProfile | null;
  schools: School[];
  schoolUsers: UserProfile[];
  classrooms: Classroom[];
  lessons: Lesson[];
  sessions: LiveSession[];
  assignments: Assignment[];
  assignmentMcqs: AssignmentMcq[];
  assignmentMcqAttempts: AssignmentMcqAttempt[];
  assessments: AssessmentSummary[];
  progress: StudentProgress[];
  notifications: NotificationItem[];
  libraryFolders: LibraryFolder[];
  content: ContentAsset[];
  media: MediaFile[];
  integrations: IntegrationItem[];
}
