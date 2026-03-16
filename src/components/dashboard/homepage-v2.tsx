import {
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  BrainCircuit,
  CirclePlay,
  LayoutDashboard,
  LibraryBig,
  Linkedin,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  Twitter,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { APP_NAME, DASHBOARD_ROUTES } from "@/lib/constants";
import { formatNumber } from "@/lib/format";
import { createTestId } from "@/lib/test-id";
import { percentLabel } from "@/lib/utils";
import type { DashboardSnapshot } from "@/types/domain";

function averageMastery(snapshot: DashboardSnapshot) {
  if (!snapshot.progress.length) {
    return 0;
  }

  return snapshot.progress.reduce((sum, item) => sum + item.masteryRate, 0) / snapshot.progress.length;
}

function completionRate(snapshot: DashboardSnapshot) {
  if (!snapshot.assignments.length) {
    return 0;
  }

  const onTrack = snapshot.assignments.filter((assignment) => assignment.completionRate >= 75).length;
  return Math.round((onTrack / snapshot.assignments.length) * 100);
}

export function HomepageV2({ snapshot }: { snapshot: DashboardSnapshot }) {
  const school = snapshot.schools[0];
  const liveSession = snapshot.sessions.find((session) => session.status === "live");
  const totalActivities = snapshot.lessons.reduce((sum, lesson) => sum + lesson.activities.length, 0);
  const totalResources = snapshot.content.length + snapshot.media.length;
  const mastery = averageMastery(snapshot);
  const onTrack = completionRate(snapshot);
  const aiLessons = snapshot.lessons.filter((lesson) => lesson.aiAssist).length;

  const heroStats = [
    [
      <Users className="size-5" key="students" />,
      "Students learning",
      formatNumber(school?.activeStudents ?? 0),
      "Active learners connected to your workspace right now.",
      "bg-sky-50 text-sky-700",
    ],
    [
      <BookOpenCheck className="size-5" key="lessons" />,
      "Lessons available",
      formatNumber(snapshot.lessons.length),
      "Lesson flows ready for launch, reuse, or refinement.",
      "bg-emerald-50 text-emerald-700",
    ],
    [
      <CirclePlay className="size-5" key="activities" />,
      "Interactive activities",
      formatNumber(totalActivities),
      "Polls, quizzes, draw-it tasks, and open responses.",
      "bg-amber-50 text-amber-700",
    ],
    [
      <BarChart3 className="size-5" key="response-rate" />,
      "Live response rate",
      percentLabel(liveSession?.responseRate ?? 0),
      liveSession ? "Pulled from the active live session." : "Will update automatically when a session goes live.",
      "bg-rose-50 text-rose-700",
    ],
  ] as const;

  const valueProps = [
    [<BookOpenCheck className="size-5" key="teach" />, "Deliver high-quality instruction", "Build interactive lessons with media, checks for understanding, and reusable teaching sequences in one place."],
    [<Users className="size-5" key="participation" />, "Achieve fuller participation", "See who is responding and where support is needed while the lesson is still happening, not after it ends."],
    [<CirclePlay className="size-5" key="active" />, "Promote active learning", "Use live prompts, drawing, collaboration, and discussion moments that keep learners engaged throughout the lesson."],
    [<BrainCircuit className="size-5" key="differentiate" />, "Differentiate with confidence", "Combine performance signals, pacing data, and AI-supported guidance to respond more quickly to learner needs."],
  ] as const;

  const impactStats = [
    ["Average mastery", percentLabel(mastery), "based on current student progress data"],
    ["Assignments on track", percentLabel(onTrack), "calculated from real assignment completion"],
    ["Teachers visible", formatNumber(school?.activeTeachers ?? 0), "staff count attached to the active school"],
  ] as const;

  const resourceCards = [
    [<LibraryBig className="size-5" key="library" />, "Lesson and media library", formatNumber(totalResources), "resources currently available"],
    [<BarChart3 className="size-5" key="analytics" />, "Assessment and assignment tracking", formatNumber(snapshot.assessments.length + snapshot.assignments.length), "tracked records in the platform"],
    [<MessageSquareText className="size-5" key="family" />, "Family communication touchpoints", formatNumber(snapshot.notifications.length), "notifications currently available"],
  ] as const;
  const footerYear = new Date().getFullYear();

  return (
    <main className="relative overflow-hidden bg-[linear-gradient(180deg,#f7fbff_0%,#ffffff_44%,#fff8ef_100%)] pb-24">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[54rem] bg-[url('/images/edtech-hero-scene.svg')] bg-top bg-no-repeat bg-[length:min(1400px,100%)] opacity-[0.18]" />
      <div className="absolute inset-x-0 top-0 -z-10 h-[48rem] bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.18),_transparent_24%),radial-gradient(circle_at_top_right,_rgba(251,191,36,0.18),_transparent_24%),radial-gradient(circle_at_center,_rgba(45,212,191,0.14),_transparent_32%)]" />

      <header className="mx-auto flex max-w-[1400px] flex-col gap-4 px-4 py-6 md:flex-row md:items-center md:justify-between lg:px-10">
        <div className="flex items-center gap-3 self-start">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-sky-200/50">
            <Sparkles className="size-5" />
          </div>
          <div>
            <p className="font-[family:var(--font-display)] text-xl font-semibold text-slate-950">{APP_NAME}</p>
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Interactive instruction platform</p>
          </div>
        </div>
        <nav className="hidden items-center gap-5 text-sm font-medium text-slate-600 md:flex lg:gap-7">
          <a href="#features">Features</a>
          <a href="#impact">Impact</a>
          <a href="#resources">Resources</a>
          <a href="#roles">Roles</a>
        </nav>
        <div className="grid w-full gap-3 sm:flex sm:w-auto sm:items-center md:justify-end">
          <Button href="/login" variant="ghost" className="w-full sm:w-auto" data-testid={createTestId("home", "sign-in")}>
            Sign in
          </Button>
          <Button href="/register" className="w-full sm:w-auto" icon={<ArrowRight className="size-4" />} data-testid={createTestId("home", "get-started")}>
            Get started
          </Button>
        </div>
      </header>

      <section className="mx-auto max-w-[1400px] px-4 pb-14 pt-8 lg:px-10 lg:pb-20 lg:pt-12">
        <div className="space-y-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-white/85 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur">
            <ShieldCheck className="size-4 text-sky-700" />
            Teach live, assess instantly, and act on classroom signals faster
          </div>
          <div className="space-y-5">
            <h1 className="max-w-4xl font-[family:var(--font-display)] text-4xl font-semibold leading-[0.95] tracking-tight text-slate-950 sm:text-5xl md:text-6xl xl:text-7xl">
              Make instruction more interactive and learning progress easier to see.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8 md:text-xl">
              EngagePod gives teachers engaging lesson delivery, gives leaders real-time visibility into learning,
              and keeps families aligned with meaningful classroom progress.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button href="/register" className="w-full sm:w-auto" icon={<ArrowRight className="size-4" />} data-testid={createTestId("home", "hero-primary")}>
              Create your workspace
            </Button>
            <Button href="/dashboard" variant="secondary" className="w-full sm:w-auto" icon={<LayoutDashboard className="size-4" />} data-testid={createTestId("home", "hero-secondary")}>
              Explore the platform
            </Button>
          </div>
        </div>

        <div className="mt-8 grid gap-5 xl:grid-cols-[1.08fr_0.92fr]">
          <Card className="relative overflow-hidden border-slate-200/90 bg-slate-950 text-white">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(56,189,248,0.24),_transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(251,191,36,0.22),_transparent_24%)]" />
            <div className="relative space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="max-w-2xl">
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">Live classroom</p>
                  <h2 className="mt-3 font-[family:var(--font-display)] text-3xl font-semibold md:text-4xl">
                    Everything needed to run a more active lesson.
                  </h2>
                  <p className="mt-3 max-w-xl text-sm leading-6 text-white/75">
                    Guide a live lesson, monitor participation, and keep reusable content close by without breaking the teaching flow.
                  </p>
                </div>
                <div className="rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/80">
                  {liveSession ? "Live now" : "Ready to launch"}
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
                <div className="rounded-[30px] border border-white/10 bg-white/8 p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm text-white/70">Current room</p>
                      <p className="mt-3 text-2xl font-semibold">
                        {liveSession?.title ?? "No live session is active yet"}
                      </p>
                    </div>
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-cyan-400/15 text-cyan-300">
                      <CirclePlay className="size-6" />
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-[24px] border border-white/10 bg-white/8 p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-white/55">Engagement</p>
                      <p className="mt-3 font-[family:var(--font-display)] text-4xl font-semibold">
                        {percentLabel(liveSession?.engagementScore ?? 0)}
                      </p>
                    </div>
                    <div className="rounded-[24px] border border-white/10 bg-white/8 p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-white/55">Responses</p>
                      <p className="mt-3 font-[family:var(--font-display)] text-4xl font-semibold">
                        {percentLabel(liveSession?.responseRate ?? 0)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="rounded-[28px] bg-white p-5 text-slate-950 shadow-lg shadow-slate-900/10">
                    <p className="text-sm font-medium text-slate-500">AI-assisted lessons</p>
                    <p className="mt-3 font-[family:var(--font-display)] text-4xl font-semibold">
                      {formatNumber(aiLessons)}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Lesson flows already prepared for adaptive support and next-step recommendations.
                    </p>
                  </div>
                  <div className="rounded-[28px] border border-white/10 bg-white/8 p-5">
                    <p className="text-sm text-white/70">Resources ready</p>
                    <p className="mt-3 font-[family:var(--font-display)] text-4xl font-semibold">
                      {formatNumber(totalResources)}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-white/75">
                      Shared content and media available for reuse across classrooms.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2 xl:content-start">
            {heroStats.map(([icon, label, value, note, accent]) => (
              <Card
                key={label}
                className="relative overflow-hidden border-slate-200/90 bg-white/92"
                data-testid={createTestId("home", "stat", label)}
              >
                <div className="absolute inset-x-6 top-0 h-20 rounded-full bg-slate-100/80 blur-2xl" />
                <div className="relative">
                  <div className={`flex size-12 items-center justify-center rounded-2xl ${accent}`}>
                    {icon}
                  </div>
                  <p className="mt-5 text-sm font-medium text-slate-500">{label}</p>
                  <p className="mt-2 font-[family:var(--font-display)] text-4xl font-semibold text-slate-950">
                    {value}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{note}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-[1400px] px-4 py-8 lg:px-10 lg:py-12">
        <div className="space-y-6">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-700">Why teams use EngagePod</p>
            <h2 className="mt-4 font-[family:var(--font-display)] text-4xl font-semibold tracking-tight text-slate-950">A simpler way to deliver interactive teaching and measure what changed.</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {valueProps.map(([icon, title, description]) => (
              <Card key={title} className="border-slate-200/90 bg-white/92" data-testid={createTestId("home", "value", title)}>
                <div className="flex size-12 items-center justify-center rounded-2xl bg-slate-950 text-white">{icon}</div>
                <h3 className="mt-6 text-2xl font-semibold text-slate-950">{title}</h3>
                <p className="mt-4 text-sm leading-6 text-slate-600">{description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="impact" className="mx-auto max-w-[1400px] px-4 py-8 lg:px-10 lg:py-12">
        <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
          <Card className="border-slate-900/10 bg-slate-950 text-white">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">Impact you can see</p>
            <h2 className="mt-4 font-[family:var(--font-display)] text-4xl font-semibold tracking-tight">Real counts from your application, not placeholder marketing numbers.</h2>
            <p className="mt-4 text-sm leading-7 text-white/80">These values are calculated from the lessons, progress, assignments, and school records currently stored in EngagePod.</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {impactStats.map(([label, value, note]) => (
                <div key={label} className="rounded-[28px] border border-white/10 bg-white/8 p-5" data-testid={createTestId("home", "impact", label)}>
                  <p className="text-sm text-white/70">{label}</p>
                  <p className="mt-3 font-[family:var(--font-display)] text-4xl font-semibold">{value}</p>
                  <p className="mt-2 text-sm leading-6 text-white/75">{note}</p>
                </div>
              ))}
            </div>
          </Card>
          <Card className="border-slate-200/90 bg-white/92">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-700">From setup to school-wide visibility</p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {[
                ["Classrooms connected", formatNumber(snapshot.classrooms.length), "spaces already organized for launch and reporting"],
                ["Assessment records", formatNumber(snapshot.assessments.length), "performance snapshots tied to live instruction"],
                ["Assignments tracked", formatNumber(snapshot.assignments.length), "completion and follow-through visible in one place"],
                ["Integrations modeled", formatNumber(snapshot.integrations.length), "systems prepared for connected district workflows"],
              ].map(([label, value, note]) => (
                <div key={label} className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm font-medium text-slate-500">{label}</p>
                  <p className="mt-3 font-[family:var(--font-display)] text-4xl font-semibold text-slate-950">{value}</p>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{note}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      <section id="roles" className="mx-auto max-w-[1400px] px-4 py-8 lg:px-10 lg:py-12">
        <div className="space-y-6">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-700">Support every audience</p>
            <h2 className="mt-4 font-[family:var(--font-display)] text-4xl font-semibold tracking-tight text-slate-950">A single experience for teachers, leaders, and families.</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[
              ["Teachers", formatNumber(snapshot.classrooms.length), "classrooms connected", "Create and reuse lessons, launch sessions quickly, and capture evidence of understanding without leaving the teaching flow."],
              ["Leaders", formatNumber(school?.activeTeachers ?? 0), "teachers visible", "Monitor usage, engagement patterns, and learning momentum with fewer manual status checks."],
              ["Families", formatNumber(snapshot.notifications.length), "communication touchpoints", "Share progress and next steps more clearly so families know where support is needed."],
            ].map(([title, value, tag, description]) => (
              <Card key={title} className="border-slate-200/90 bg-white/92" data-testid={createTestId("home", "role", title)}>
                <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 w-fit">{tag}</div>
                <h3 className="mt-6 text-2xl font-semibold text-slate-950">{title}</h3>
                <p className="mt-3 font-[family:var(--font-display)] text-5xl font-semibold text-slate-950">{value}</p>
                <p className="mt-4 text-sm leading-6 text-slate-600">{description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="resources" className="mx-auto max-w-[1400px] px-4 py-8 lg:px-10 lg:py-12">
        <div className="space-y-6">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-700">Resources and readiness</p>
            <h2 className="mt-4 font-[family:var(--font-display)] text-4xl font-semibold tracking-tight text-slate-950">Keep content, analytics, and communication assets close to instruction.</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {resourceCards.map(([icon, title, value, label]) => (
              <Card key={title} className="border-slate-200/90 bg-white/92" data-testid={createTestId("home", "resource", title)}>
                <div className="flex size-12 items-center justify-center rounded-2xl bg-slate-950 text-white">{icon}</div>
                <h3 className="mt-6 text-2xl font-semibold text-slate-950">{title}</h3>
                <div className="mt-6 rounded-[24px] bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-500">{label}</p>
                  <p className="mt-2 font-[family:var(--font-display)] text-4xl font-semibold text-slate-950">{value}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <footer className="mx-auto max-w-[1400px] px-4 pb-6 pt-2 lg:px-10">
        <div className="rounded-[36px] border border-slate-200/90 bg-slate-950 px-6 py-8 text-white shadow-[0_28px_90px_-48px_rgba(15,23,42,0.65)] lg:px-8">
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-[1.1fr_0.8fr_0.8fr_0.9fr]">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-white/10 text-white">
                  <Sparkles className="size-5" />
                </div>
                <div>
                  <p className="font-[family:var(--font-display)] text-xl font-semibold">{APP_NAME}</p>
                  <p className="text-xs uppercase tracking-[0.28em] text-white/50">Interactive instruction platform</p>
                </div>
              </div>
              <p className="max-w-sm text-sm leading-6 text-white/70">
                One workspace for interactive teaching, live participation, progress visibility, and connected school communication.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">Product</h3>
              <div className="grid gap-3 text-sm text-white/70">
                <a href="#features" className="transition hover:text-white">Features</a>
                <a href="#impact" className="transition hover:text-white">Impact</a>
                <a href="#resources" className="transition hover:text-white">Resources</a>
                <a href="#roles" className="transition hover:text-white">Roles</a>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">Platform</h3>
              <div className="grid gap-3 text-sm text-white/70">
                {DASHBOARD_ROUTES.slice(0, 6).map((route) => (
                  <a key={route.href} href={route.href} className="transition hover:text-white">
                    {route.label}
                  </a>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">Company</h3>
              <div className="grid gap-3 text-sm text-white/70">
                <a href="#features" className="transition hover:text-white">About EngagePod</a>
                <a href="#impact" className="transition hover:text-white">District outcomes</a>
                <a href="#resources" className="transition hover:text-white">Resource center</a>
                <a href="#roles" className="transition hover:text-white">Support model</a>
              </div>
              <div className="flex items-center gap-3 pt-1 text-white/60">
                <a
                  href="https://www.linkedin.com"
                  className="flex size-9 items-center justify-center rounded-full border border-white/10 bg-white/5 transition hover:bg-white/10 hover:text-white"
                  aria-label="EngagePod on LinkedIn"
                >
                  <Linkedin className="size-4" />
                </a>
                <a
                  href="https://twitter.com"
                  className="flex size-9 items-center justify-center rounded-full border border-white/10 bg-white/5 transition hover:bg-white/10 hover:text-white"
                  aria-label="EngagePod on X"
                >
                  <Twitter className="size-4" />
                </a>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-5 text-sm text-white/50 lg:flex-row lg:items-center lg:justify-between">
            <p>{APP_NAME} © {footerYear}. All rights reserved.</p>
            <div className="flex flex-col gap-2 lg:items-end">
              <div className="flex flex-wrap gap-4 text-xs uppercase tracking-[0.2em] text-white/35">
                <span>Privacy</span>
                <span>Terms</span>
                <span>Security</span>
                <span>Accessibility</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
