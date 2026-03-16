import { z } from "zod";

export const signInSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export const signUpSchema = z
  .object({
    fullName: z.string().min(2).max(120),
    schoolName: z.string().min(2).max(120),
    district: z.string().max(120).optional(),
    email: z.email(),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
    role: z.enum(["teacher", "student", "parent", "admin", "instructional_coach"]),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Passwords must match.",
    path: ["confirmPassword"],
  });

export const createLessonSchema = z.object({
  title: z.string().min(3).max(120),
  subject: z.string().min(2).max(60),
  gradeBand: z.string().min(2).max(40),
  durationMinutes: z.coerce.number().int().min(5).max(180),
  standards: z.array(z.string().min(2)).min(1),
  aiAssist: z.boolean().default(false),
});

export const launchSessionSchema = z.object({
  classroomId: z.string().min(3),
  lessonId: z.string().min(3),
  startsAt: z.string().datetime({ offset: true }),
});

export const submitResponseSchema = z.object({
  activityId: z.string().min(3),
  studentId: z.string().min(3),
  responseType: z.enum(["multiple_choice", "open_ended", "drawing"]),
  responseValue: z.string().min(1).max(1000),
});

export const createLibraryFolderSchema = z.object({
  name: z.string().trim().min(2).max(80),
});

export const updateLibraryFolderSchema = z.object({
  id: z.string().min(3),
  name: z.string().trim().min(2).max(80),
});

export const deleteLibraryFolderSchema = z.object({
  id: z.string().min(3),
});

export const createAdminContentSchema = z.object({
  title: z.string().trim().min(2).max(120),
  description: z.string().trim().min(2).max(1200),
  fileName: z.string().trim().min(1).max(180),
  fileDataUrl: z.string().trim().min(10).max(2_000_000),
});

export const updateAdminContentSchema = z
  .object({
    id: z.string().min(3),
    title: z.string().trim().min(2).max(120),
    description: z.string().trim().min(2).max(1200),
    fileName: z.string().trim().min(1).max(180).optional(),
    fileDataUrl: z.string().trim().min(10).max(2_000_000).optional(),
  })
  .refine(
    (value) => (value.fileName && value.fileDataUrl) || (!value.fileName && !value.fileDataUrl),
    {
      message: "File name and file data must be provided together.",
      path: ["fileDataUrl"],
    },
  );

export const deleteAdminContentSchema = z.object({
  id: z.string().min(3),
});

export const createLibraryFolderItemSchema = z.object({
  folderId: z.string().min(3),
  contentId: z.string().min(3),
});

export const createAssignmentMcqSchema = z.object({
  question: z.string().trim().min(5).max(600),
  optionA: z.string().trim().min(1).max(240),
  optionB: z.string().trim().min(1).max(240),
  optionC: z.string().trim().min(1).max(240),
  optionD: z.string().trim().min(1).max(240),
  correctOption: z.enum(["A", "B", "C", "D"]),
  points: z.coerce.number().int().min(1).max(100),
});

export const createAssignmentMcqAttemptSchema = z.object({
  mcqId: z.string().min(3),
  selectedOption: z.enum(["A", "B", "C", "D"]),
});
