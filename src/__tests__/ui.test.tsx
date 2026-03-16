import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AccountMenu } from "@/components/app-shell/account-menu";
import { AccountActions } from "@/components/app-shell/account-actions";
import { AuthForm } from "@/components/forms/auth-form";
import { AdminPanel } from "@/components/dashboard/admin-panel";
import { LibraryPageContent } from "@/components/dashboard/library-page-content";
import { LibraryFolderManager } from "@/components/dashboard/library-folder-manager";
import { LessonBuilderStudio } from "@/components/dashboard/lesson-builder-studio";
import { StudentResponseStudio } from "@/components/dashboard/student-response-studio";
import { StudentAssignmentsWorkspace } from "@/components/dashboard/student-assignments-workspace";
import { TeacherAssignmentsWorkspace } from "@/components/dashboard/teacher-assignments-workspace";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Progress } from "@/components/ui/progress";
import { Select } from "@/components/ui/select";
import { StatCard } from "@/components/ui/stat-card";
import { snapshotFixture } from "@/__tests__/fixtures/snapshot";

const push = vi.fn();
const refresh = vi.fn();
const signInWithPassword = vi.fn();
const signUp = vi.fn();
const signOut = vi.fn();
const fetchMock = vi.fn();
let shouldReturnNullClient = false;

beforeEach(() => {
  push.mockReset();
  refresh.mockReset();
  signInWithPassword.mockReset();
  signUp.mockReset();
  signOut.mockReset();
  fetchMock.mockReset();
  shouldReturnNullClient = false;
  vi.stubGlobal("fetch", fetchMock);
});

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push,
    refresh,
  }),
}));

vi.mock("@/lib/supabase/client", () => ({
  createBrowserSupabaseClient: () =>
    shouldReturnNullClient
      ? null
      : {
          auth: {
            signInWithPassword,
            signUp,
            signOut,
          },
        },
}));

describe("ui components", () => {
  it("renders button, badge, card, input, progress, and stat card", () => {
    render(
      <div>
        <Button>Primary action</Button>
        <Badge tone="info">Live</Badge>
        <Card>Card body</Card>
        <EmptyState title="No data" description="Add records" />
        <Input placeholder="Search" />
        <Select defaultValue="teacher">
          <option value="teacher">teacher</option>
        </Select>
        <Progress value={80} />
        <StatCard label="Active learners" value="1280" trend="+12%" />
      </div>,
    );

    expect(screen.getByRole("button", { name: "Primary action" })).toBeInTheDocument();
    expect(screen.getByText("Live")).toBeInTheDocument();
    expect(screen.getByText("Card body")).toBeInTheDocument();
    expect(screen.getByText("No data")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Search")).toBeInTheDocument();
    expect(screen.getByDisplayValue("teacher")).toBeInTheDocument();
    expect(screen.getByText("80%")).toBeInTheDocument();
    expect(screen.getByText("1280")).toBeInTheDocument();
  });

  it("renders a modal when open", () => {
    render(
      <Modal open title="Create folder" description="Organize content" onClose={vi.fn()}>
        <div>Body</div>
      </Modal>,
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Create folder")).toBeInTheDocument();
    expect(screen.getByText("Body")).toBeInTheDocument();
  });

  it("signs out from account actions and routes to login", async () => {
    signOut.mockResolvedValueOnce({ error: null });
    const user = userEvent.setup();
    render(<AccountActions />);

    await user.click(screen.getByRole("button", { name: /logout/i }));

    expect(signOut).toHaveBeenCalled();
    expect(push).toHaveBeenCalledWith("/login");
    expect(refresh).toHaveBeenCalled();
  });

  it("opens the top-right account menu and shows profile and logout options", async () => {
    const user = userEvent.setup();
    render(<AccountMenu currentUser={snapshotFixture.currentUser!} />);

    await user.click(screen.getByTestId("account-menu__trigger"));

    expect(screen.getByTestId("account-menu__list")).toBeInTheDocument();
    expect(screen.getByTestId("account-menu__profile")).toBeInTheDocument();
    expect(screen.getByTestId("account-menu__logout")).toBeInTheDocument();
  });

  it("signs out from the top-right account menu", async () => {
    signOut.mockResolvedValueOnce({ error: null });
    const user = userEvent.setup();
    render(<AccountMenu currentUser={snapshotFixture.currentUser!} />);

    await user.click(screen.getByTestId("account-menu__trigger"));
    await user.click(screen.getByTestId("account-menu__logout"));

    expect(signOut).toHaveBeenCalled();
    expect(push).toHaveBeenCalledWith("/login");
    expect(refresh).toHaveBeenCalled();
  });

  it("shows logout errors from account actions", async () => {
    signOut.mockResolvedValueOnce({ error: { message: "Unable to sign out" } });
    const user = userEvent.setup();
    render(<AccountActions layout="sidebar" />);

    await user.click(screen.getByRole("button", { name: /logout/i }));

    expect(await screen.findByText(/Unable to sign out/i)).toBeInTheDocument();
  });

  it("renders admin counts and school user lists", () => {
    render(<AdminPanel snapshot={{ ...snapshotFixture, currentUser: { ...snapshotFixture.currentUser!, role: "admin" } }} />);

    expect(screen.getByText("Teachers")).toBeInTheDocument();
    expect(screen.getByText("Parents")).toBeInTheDocument();
    expect(screen.getByText("Jordan Lee")).toBeInTheDocument();
    expect(screen.getByText("Ava Parent")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create library content/i })).toBeInTheDocument();
  });

  it("renders admin library creation in the library module", () => {
    render(<LibraryPageContent snapshot={{ ...snapshotFixture, currentUser: { ...snapshotFixture.currentUser!, role: "admin" } }} />);

    expect(screen.getByText(/create shared library content/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create new library/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /table view/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /grid view/i })).toBeInTheDocument();
    expect(screen.queryByText(/organize your library your way/i)).not.toBeInTheDocument();
  });

  it("switches the admin library module between grid and table views", async () => {
    const user = userEvent.setup();
    render(<LibraryPageContent snapshot={{ ...snapshotFixture, currentUser: { ...snapshotFixture.currentUser!, role: "admin" } }} />);

    expect(screen.queryByTestId("admin-library__table")).not.toBeInTheDocument();
    expect(screen.getByText("Weather card deck")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /table view/i }));

    expect(screen.getByTestId("admin-library__table")).toBeInTheDocument();
    expect(screen.queryByRole("columnheader", { name: /folder/i })).not.toBeInTheDocument();
    expect(screen.getAllByText("Weather card deck").length).toBeGreaterThan(0);

    await user.click(screen.getByRole("button", { name: /grid view/i }));

    expect(screen.queryByTestId("admin-library__table")).not.toBeInTheDocument();
  });

  it("creates a new admin library item from the library module", async () => {
    const originalFileReader = globalThis.FileReader;

    class MockFileReader {
      public result: string | ArrayBuffer | null = null;

      public onload: ((this: FileReader, ev: ProgressEvent<FileReader>) => unknown) | null = null;

      public onerror: ((this: FileReader, ev: ProgressEvent<FileReader>) => unknown) | null = null;

      readAsDataURL(file: Blob) {
        this.result = `data:application/pdf;base64,${file.size}`;
        this.onload?.call(this as FileReader, {} as ProgressEvent<FileReader>);
      }
    }

    vi.stubGlobal("FileReader", MockFileReader);
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ok: true,
        data: {
          id: "content-3",
          folder_id: "folder-1",
          title: "Grade 6 Toolkit",
          description: "Teacher-ready science resource pack.",
          type: "resource",
          subject: "General",
          grade_band: "All Grades",
          downloads: 0,
          file_name: "toolkit.pdf",
          file_url: "data:application/pdf;base64,12",
          created_by: "user-1",
          created_at: "2026-03-14T11:00:00+05:30",
        },
      }),
    });

    const user = userEvent.setup();
    render(<LibraryPageContent snapshot={{ ...snapshotFixture, currentUser: { ...snapshotFixture.currentUser!, role: "admin" } }} />);

    await user.click(screen.getByRole("button", { name: /create new library/i }));
    await user.type(screen.getByLabelText(/^name$/i), "Grade 6 Toolkit");
    await user.type(screen.getByLabelText(/description/i), "Teacher-ready science resource pack.");
    await user.upload(
      screen.getByLabelText(/upload file/i),
      new File(["pdf-content"], "toolkit.pdf", { type: "application/pdf" }),
    );
    await user.click(screen.getByRole("button", { name: /create library/i }));

    expect(await screen.findByText("Library content created successfully.")).toBeInTheDocument();
    expect(await screen.findByText("Grade 6 Toolkit")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/content",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }),
    );

    vi.stubGlobal("FileReader", originalFileReader);
  });

  it("edits an admin library item from the library module", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ok: true,
        data: {
          id: "content-1",
          title: "Updated Weather card deck",
          description: "Updated deck for science review.",
          type: "template",
          subject: "Science",
          grade_band: "Grade 6",
          downloads: 100,
          file_name: "weather-card-deck.pdf",
          file_url: "https://example.com/weather-card-deck.pdf",
          created_by: "admin-1",
          created_at: "2026-03-12T09:00:00+05:30",
        },
      }),
    });

    const user = userEvent.setup();
    render(<LibraryPageContent snapshot={{ ...snapshotFixture, currentUser: { ...snapshotFixture.currentUser!, role: "admin" } }} />);

    await user.click(screen.getByRole("button", { name: /edit weather card deck/i }));
    const titleInput = screen.getByLabelText(/^name$/i);
    await user.clear(titleInput);
    await user.type(titleInput, "Updated Weather card deck");
    await user.clear(screen.getByLabelText(/description/i));
    await user.type(screen.getByLabelText(/description/i), "Updated deck for science review.");
    await user.click(screen.getByRole("button", { name: /save changes/i }));

    expect(await screen.findByText("Library content updated successfully.")).toBeInTheDocument();
    expect(await screen.findByText("Updated Weather card deck")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/content",
      expect.objectContaining({
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      }),
    );
  });

  it("deletes an admin library item from the library module", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ok: true,
        data: { id: "content-1" },
      }),
    });

    const user = userEvent.setup();
    render(<LibraryPageContent snapshot={{ ...snapshotFixture, currentUser: { ...snapshotFixture.currentUser!, role: "admin" } }} />);

    await user.click(screen.getByRole("button", { name: /delete weather card deck/i }));
    await user.click(screen.getByRole("button", { name: /delete library/i }));

    expect(await screen.findByText("Library content deleted successfully.")).toBeInTheDocument();
    expect(screen.queryByText("Weather card deck")).not.toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith("/api/content?id=content-1", { method: "DELETE" });
  });

  it("keeps the existing teacher library experience", () => {
    render(<LibraryPageContent snapshot={snapshotFixture} />);

    expect(screen.getByText(/organize your library your way/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /science essentials \(1\)/i })).toBeInTheDocument();
    expect(screen.getByText(/^lessons$/i)).toBeInTheDocument();
    expect(screen.queryByText(/ready-to-teach lesson inventory/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/reusable assets/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/science essentials library list/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /create new library/i })).not.toBeInTheDocument();
  });

  it("updates the lessons section for the selected folder", async () => {
    const user = userEvent.setup();
    render(<LibraryPageContent snapshot={snapshotFixture} />);

    expect(screen.getByRole("heading", { name: /science essentials/i })).toBeInTheDocument();
    expect(screen.getByText("Weather card deck")).toBeInTheDocument();
    expect(screen.queryAllByText("Fraction intervention toolkit")).toHaveLength(0);

    await user.click(screen.getByTestId("library-folder__math-support"));

    expect(screen.getByRole("heading", { name: /math support/i })).toBeInTheDocument();
    expect(screen.getByText("Fraction intervention toolkit")).toBeInTheDocument();
    expect(screen.queryAllByText("Weather card deck")).toHaveLength(0);
  });

  it("lets teachers add a shared library into the selected folder", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ok: true,
        data: {
          id: "item-1",
          folderId: "folder-1",
          contentId: "content-2",
        },
      }),
    });

    const user = userEvent.setup();
    render(<LibraryPageContent snapshot={snapshotFixture} />);

    expect(screen.getByText("Weather card deck")).toBeInTheDocument();
    expect(screen.queryAllByText("Fraction intervention toolkit")).toHaveLength(0);

    await user.click(screen.getByRole("button", { name: /science essentials \(1\)/i }));

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(/science essentials library list/i)).toBeInTheDocument();
    expect(screen.getAllByText("Weather card deck").length).toBeGreaterThan(0);
    expect(screen.getByText("Fraction intervention toolkit")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /^add to folder$/i }));

    expect(await screen.findByText("Library added to the selected folder.")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /added in folder/i }).length).toBeGreaterThan(0);
    await user.click(screen.getByRole("button", { name: /close modal/i }));
    expect(screen.getByText("Fraction intervention toolkit")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/library-folder-items",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }),
    );
  });

  it("collects multiple-choice, open-ended, and drawing responses with live results", async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ok: true,
          data: { responseId: "response-1" },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ok: true,
          data: { responseId: "response-2" },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ok: true,
          data: { responseId: "response-3" },
        }),
      });

    const user = userEvent.setup();
    render(<StudentResponseStudio snapshot={snapshotFixture} session={snapshotFixture.sessions[0] ?? null} />);

    await user.type(screen.getByTestId("responses__mc-student"), "Maya Chen");
    await user.click(screen.getByTestId("responses__mc-option__warm-humid-air"));
    await user.click(screen.getByTestId("responses__mc-submit"));

    expect(await screen.findByText(/response collected in real time/i)).toBeInTheDocument();
    expect(screen.getByText(/1 response \/ 100%/i)).toBeInTheDocument();

    await user.type(screen.getByTestId("responses__oe-student"), "Jordan Lee");
    await user.type(screen.getByTestId("responses__oe-input"), "Warm air rises and cool air causes the moisture to condense.");
    await user.click(screen.getByTestId("responses__oe-submit"));

    expect(await screen.findByText(/warm air rises and cool air causes the moisture to condense\./i)).toBeInTheDocument();

    await user.type(screen.getByTestId("responses__draw-student"), "Sofia Patel");
    await user.click(screen.getByTestId("responses__draw-cell__0"));
    await user.click(screen.getByTestId("responses__draw-cell__1"));
    await user.click(screen.getByTestId("responses__draw-submit"));

    expect(await screen.findByText("Sofia Patel")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "/api/responses",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }),
    );
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("creates an MCQ in the teacher assignments module", async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ok: true,
          data: [],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ok: true,
          data: {
            id: "mcq-1",
            question: "Which layer of Earth is liquid?",
            options: {
              A: "Crust",
              B: "Outer core",
              C: "Mantle",
              D: "Inner core",
            },
            correctOption: "B",
            points: 8,
            createdAt: "2026-03-14T11:33:00+05:30",
            createdBy: "teacher-1",
          },
        }),
      });

    const user = userEvent.setup();
    render(<TeacherAssignmentsWorkspace assessments={snapshotFixture.assessments} assignments={snapshotFixture.assignments} />);

    await user.type(screen.getByTestId("assignments__mcq__question"), "Which layer of Earth is liquid?");
    await user.type(screen.getByTestId("assignments__mcq__option__a"), "Crust");
    await user.type(screen.getByTestId("assignments__mcq__option__b"), "Outer core");
    await user.type(screen.getByTestId("assignments__mcq__option__c"), "Mantle");
    await user.type(screen.getByTestId("assignments__mcq__option__d"), "Inner core");
    await user.selectOptions(screen.getByTestId("assignments__mcq__correct"), "B");
    await user.clear(screen.getByTestId("assignments__mcq__points"));
    await user.type(screen.getByTestId("assignments__mcq__points"), "8");
    await user.click(screen.getByTestId("assignments__mcq__create"));

    expect(await screen.findByText("MCQ created successfully.")).toBeInTheDocument();
    expect(screen.getByText("Which layer of Earth is liquid?")).toBeInTheDocument();
    expect(screen.getByText("Correct answer: B")).toBeInTheDocument();
    expect(screen.getByText("8 pts")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "/api/assignment-mcqs",
      expect.objectContaining({
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/assignment-mcqs",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }),
    );
  });

  it("lets a student attend an MCQ assignment and see the result", async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ok: true,
          data: [
            {
              id: "mcq-1",
              question: "Which layer of Earth is liquid?",
              options: {
                A: "Crust",
                B: "Outer core",
                C: "Mantle",
                D: "Inner core",
              },
              correctOption: "B",
              points: 8,
            },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ok: true,
          data: [],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ok: true,
          data: {
            id: "attempt-1",
            mcqId: "mcq-1",
            selectedOption: "B",
            isCorrect: true,
            pointsEarned: 8,
          },
        }),
      });

    const user = userEvent.setup();
    render(<StudentAssignmentsWorkspace assignments={snapshotFixture.assignments} />);

    expect(await screen.findByText("Which layer of Earth is liquid?")).toBeInTheDocument();
    await user.click(screen.getByTestId("student-assignments__option__mcq-1__b"));
    await user.click(screen.getByTestId("student-assignments__submit__mcq-1"));

    expect(await screen.findByText("Assignment response submitted.")).toBeInTheDocument();
    expect(screen.getByText(/Correct \| Selected B \| Score 8/i)).toBeInTheDocument();
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "/api/assignment-mcqs",
      expect.objectContaining({ method: "GET" }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/assignment-mcq-attempts",
      expect.objectContaining({ method: "GET" }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      "/api/assignment-mcq-attempts",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("builds lessons with draggable interactive and multimedia blocks", async () => {
    const user = userEvent.setup();
    render(<LessonBuilderStudio lesson={snapshotFixture.lessons[0]!} />);

    expect(screen.getByText(/drag blocks into teaching order/i)).toBeInTheDocument();
    expect(screen.getByText("Warm-up poll")).toBeInTheDocument();

    await user.click(screen.getByTestId("builder-palette__add__image"));

    expect(screen.getAllByText("Image reveal").length).toBeGreaterThan(0);

    fireEvent.dragStart(screen.getByLabelText("Image reveal"), {
      dataTransfer: {
        setData: vi.fn(),
      },
    });
    fireEvent.dragOver(screen.getByTestId("builder-canvas__dropzone__0"));
    fireEvent.drop(screen.getByTestId("builder-canvas__dropzone__0"));

    const blockTitles = screen.getAllByRole("heading", { level: 4 }).map((item) => item.textContent);
    expect(blockTitles[0]).toBe("Image reveal");
    expect(blockTitles).toContain("Warm-up poll");
  });

  it("renders an empty state call to action when provided", () => {
    render(<EmptyState title="No data" description="Add records" ctaLabel="Create" ctaHref="/login" />);

    expect(screen.getByRole("link", { name: /create/i })).toHaveAttribute("href", "/login");
  });

  it("shows a configuration error when no supabase client exists", async () => {
    shouldReturnNullClient = true;
    const user = userEvent.setup();
    render(<AuthForm mode="signin" />);

    await user.type(screen.getByLabelText(/work email/i), "teacher@engagepod.edu");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText(/Supabase is not configured/i)).toBeInTheDocument();
  });

  it("handles empty credential fields safely", async () => {
    const user = userEvent.setup();
    render(<AuthForm mode="signin" />);

    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText(/Invalid email address/i)).toBeInTheDocument();
  });

  it("falls back safely when form fields are missing from FormData", async () => {
    const user = userEvent.setup();
    render(<AuthForm mode="signin" />);

    screen.getByLabelText(/work email/i).removeAttribute("name");
    screen.getByLabelText(/password/i).removeAttribute("name");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText(/Invalid email address/i)).toBeInTheDocument();
  });

  it("validates invalid auth payloads", async () => {
    const user = userEvent.setup();
    render(<AuthForm mode="signin" />);

    await user.type(screen.getByLabelText(/work email/i), "bad-email");
    await user.type(screen.getByLabelText(/password/i), "short");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText(/Invalid email address/i)).toBeInTheDocument();
  });

  it("handles supabase auth errors", async () => {
    signInWithPassword.mockResolvedValueOnce({ error: { message: "Invalid login" } });
    const user = userEvent.setup();
    render(<AuthForm mode="signin" />);

    await user.type(screen.getByLabelText(/work email/i), "teacher@engagepod.edu");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText("Invalid login")).toBeInTheDocument();
  });

  it("routes into the workspace after successful auth", async () => {
    signInWithPassword.mockResolvedValueOnce({ error: null });
    const user = userEvent.setup();
    render(<AuthForm mode="signin" />);

    await user.type(screen.getByLabelText(/work email/i), "teacher@engagepod.edu");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(push).toHaveBeenCalledWith("/dashboard");
    expect(refresh).toHaveBeenCalled();
  });

  it("renders and validates the signup form", async () => {
    const user = userEvent.setup();
    render(<AuthForm mode="signup" />);

    await user.type(screen.getByLabelText(/full name/i), "Jordan Lee");
    await user.type(screen.getByLabelText(/workspace name/i), "Springfield Academy");
    await user.type(screen.getByLabelText(/work email/i), "jordan@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "password123");
    await user.type(screen.getByLabelText(/confirm password/i), "password456");
    await user.click(screen.getByRole("button", { name: /create account/i }));

    expect(await screen.findByText(/Passwords must match/i)).toBeInTheDocument();
  });

  it("handles missing signup fields safely", async () => {
    const user = userEvent.setup();
    render(<AuthForm mode="signup" />);

    screen.getByLabelText(/full name/i).removeAttribute("name");
    screen.getByLabelText(/workspace name/i).removeAttribute("name");
    screen.getByLabelText(/district/i).removeAttribute("name");
    screen.getByLabelText(/work email/i).removeAttribute("name");
    screen.getByLabelText(/^password$/i).removeAttribute("name");
    screen.getByLabelText(/confirm password/i).removeAttribute("name");
    screen.getByLabelText(/role/i).removeAttribute("name");
    await user.click(screen.getByRole("button", { name: /create account/i }));

    expect(await screen.findByText(/Too small: expected string to have >=2 characters/i)).toBeInTheDocument();
  });

  it("submits signup metadata to supabase", async () => {
    signUp.mockResolvedValueOnce({ data: { session: null }, error: null });
    const user = userEvent.setup();
    render(<AuthForm mode="signup" />);

    await user.type(screen.getByLabelText(/full name/i), "Jordan Lee");
    await user.selectOptions(screen.getByLabelText(/role/i), "teacher");
    await user.type(screen.getByLabelText(/workspace name/i), "Springfield Academy");
    await user.type(screen.getByLabelText(/district/i), "Metro District");
    await user.type(screen.getByLabelText(/work email/i), "jordan@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "password123");
    await user.type(screen.getByLabelText(/confirm password/i), "password123");
    await user.click(screen.getByRole("button", { name: /create account/i }));

    expect(signUp).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "jordan@example.com",
        options: expect.objectContaining({
          data: expect.objectContaining({
            full_name: "Jordan Lee",
            school_name: "Springfield Academy",
            district: "Metro District",
            role: "teacher",
          }),
        }),
      }),
    );
    expect(push).toHaveBeenCalledWith("/login?registered=1");
    expect(refresh).toHaveBeenCalled();
  });

  it("signs out the temporary session and routes to login after successful signup", async () => {
    signOut.mockResolvedValueOnce({ error: null });
    signUp.mockResolvedValueOnce({ data: { session: { access_token: "token" } }, error: null });
    const user = userEvent.setup();
    render(<AuthForm mode="signup" />);

    await user.type(screen.getByLabelText(/full name/i), "Jordan Lee");
    await user.selectOptions(screen.getByLabelText(/role/i), "teacher");
    await user.type(screen.getByLabelText(/workspace name/i), "Springfield Academy");
    await user.type(screen.getByLabelText(/work email/i), "jordan@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "password123");
    await user.type(screen.getByLabelText(/confirm password/i), "password123");
    await user.click(screen.getByRole("button", { name: /create account/i }));

    expect(signOut).toHaveBeenCalled();
    expect(push).toHaveBeenCalledWith("/login?registered=1");
    expect(refresh).toHaveBeenCalled();
  });

  it("shows signup errors returned by supabase", async () => {
    signUp.mockResolvedValueOnce({ error: { message: "Email already registered" } });
    const user = userEvent.setup();
    render(<AuthForm mode="signup" />);

    await user.type(screen.getByLabelText(/full name/i), "Jordan Lee");
    await user.selectOptions(screen.getByLabelText(/role/i), "teacher");
    await user.type(screen.getByLabelText(/workspace name/i), "Springfield Academy");
    await user.type(screen.getByLabelText(/work email/i), "jordan@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "password123");
    await user.type(screen.getByLabelText(/confirm password/i), "password123");
    await user.click(screen.getByRole("button", { name: /create account/i }));

    expect(await screen.findByText(/Email already registered/i)).toBeInTheDocument();
  });

  it("defaults the district metadata from the workspace name when no district is provided", async () => {
    signUp.mockResolvedValueOnce({ data: { session: null }, error: null });
    const user = userEvent.setup();
    render(<AuthForm mode="signup" />);

    await user.type(screen.getByLabelText(/full name/i), "Jordan Lee");
    await user.selectOptions(screen.getByLabelText(/role/i), "teacher");
    await user.type(screen.getByLabelText(/workspace name/i), "Springfield Academy");
    await user.type(screen.getByLabelText(/work email/i), "jordan@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "password123");
    await user.type(screen.getByLabelText(/confirm password/i), "password123");
    await user.click(screen.getByRole("button", { name: /create account/i }));

    expect(signUp).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.objectContaining({
          data: expect.objectContaining({
            district: "Springfield Academy District",
          }),
        }),
      }),
    );
  });

  it("creates, edits, and deletes folders from the library manager", async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ok: true,
          data: {
            id: "folder-3",
            schoolId: "school-1",
            name: "Assessment Bank",
            createdBy: "user-1",
            createdAt: "2026-03-14T09:00:00+05:30",
            updatedAt: "2026-03-14T09:00:00+05:30",
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ok: true,
          data: {
            id: "folder-1",
            schoolId: "school-1",
            name: "Updated Science Essentials",
            createdBy: "user-1",
            createdAt: "2026-03-10T09:00:00+05:30",
            updatedAt: "2026-03-14T10:00:00+05:30",
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ok: true,
          data: { id: "folder-3" },
        }),
      });

    const user = userEvent.setup();
    render(<LibraryFolderManager initialFolders={snapshotFixture.libraryFolders} />);

    await user.click(screen.getByRole("button", { name: /add folder/i }));
    await user.type(screen.getByPlaceholderText(/example: grade 6 science/i), "Assessment Bank");
    await user.click(screen.getByRole("button", { name: /create folder/i }));

    expect(await screen.findByText("Assessment Bank")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "/api/library-folders",
      expect.objectContaining({ method: "POST" }),
    );

    await user.click(screen.getByRole("button", { name: /edit science essentials/i }));
    const nameInput = screen.getByDisplayValue("Science Essentials");
    await user.clear(nameInput);
    await user.type(nameInput, "Updated Science Essentials");
    await user.click(screen.getByRole("button", { name: /save changes/i }));

    expect(await screen.findByText("Updated Science Essentials")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/library-folders",
      expect.objectContaining({ method: "PATCH" }),
    );

    await user.click(screen.getByRole("button", { name: /delete assessment bank/i }));
    await user.click(screen.getByRole("button", { name: /delete folder/i }));

    expect(await screen.findByText(/folder deleted successfully/i)).toBeInTheDocument();
    expect(screen.queryByText("Assessment Bank")).not.toBeInTheDocument();
    expect(fetchMock).toHaveBeenNthCalledWith(3, "/api/library-folders?id=folder-3", { method: "DELETE" });
  });
});
