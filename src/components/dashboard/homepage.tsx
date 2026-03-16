import {
  ArrowRight,
  BarChart3,
  BookOpen,
  BrainCircuit,
  CirclePlay,
  LayoutDashboard,
  LibraryBig,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { APP_NAME, DASHBOARD_ROUTES } from "@/lib/constants";
import { formatNumber } from "@/lib/format";
import { createTestId } from "@/lib/test-id";
import { percentLabel } from "@/lib/utils";
import type { DashboardSnapshot, FeatureItem } from "@/types/domain";

function averageMastery(snapshot: DashboardSnapshot) {
  if (!snapshot.progress.length) {
    return 0;
  }

  return snapshot.progress.reduce((sum, item) => sum + item.masteryRate, 0) / snapshot.progress.length;
}

export function Homepage({
  snapshot,
  coreFeatures,
  advancedFeatures,
  innovativeIdeas,
}: {
  snapshot: DashboardSnapshot;
  coreFeatures: FeatureItem[];
  advancedFeatures: FeatureItem[];
  innovativeIdeas: string[];
}) {
  const activeSchool = snapshot.schools[0];
  const liveSession = snapshot.sessions.find((session) => session.status === "live");
  const totalActivities = snapshot.lessons.reduce((sum, lesson) => sum + lesson.activities.length, 0);
  const publishedLessons = snapshot.lessons.filter((lesson) => lesson.status !== "draft").length;
  const aiAssistedLessons = snapshot.lessons.filter((lesson) => lesson.aiAssist).length;
  const masteryAverage = averageMastery(snapshot);
  const assignmentsOnTrack = snapshot.assignments.filter((assignment) => assignment.completionRate >= 75).length;
  const resourceCount = snapshot.content.length + snapshot.media.length;
  const featureSpotlights = [...coreFeatures.slice(0, 3), ...advancedFeatures.slice(0, 3)];

  const proofCards = [
    {
      label: "Students reached",
      value: formatNumber(activeSchool?.activeStudents ?? 0),
      detail: "Live enrollment connected to your workspace",
      accent: "from-amber-300 via-orange-300 to-rose-300",
    },
    {
      label: "Lessons published",
      value: formatNumber(publishedLessons),
      detail: "Interactive lessons ready for classroom launch",
      accent: "from-cyan-300 via-sky-300 to-blue-400",
    },
    {
      label: "Activity blocks",
      value: formatNumber(totalActivities),
      detail: "Polls, quizzes, draw-it tasks, and collaboration moments",
      accent: "from-emerald-300 via-teal-300 to-cyan-300",
    },
    {
      label: "Live response rate",
      value: percentLabel(liveSession?.responseRate ?? 0),
      detail: liveSession ? `${liveSession.title} is currently active` : "Ready for your next live session",
      accent: "from-fuchsia-300 via-pink-300 to-rose-300",
    },
  ];

  const roleCards = [
    {
      title: "For teachers",
      value: formatNumber(snapshot.classrooms.length),
      label: "classrooms organized",
      description:
        "Plan lessons once, launch them live or student-paced, and capture checks for understanding in the same workflow.",
      icon: <CirclePlay className="size-5" />,
    },
    {
      title: "For school leaders",
      value: formatNumber(activeSchool?.activeTeachers ?? 0),
      label: "staff members visible",
      description:
        "See which lessons are running, where engagement drops, and how teams are moving mastery over time.",
      icon: <BarChart3 className="size-5" />,
    },
    {
      title: "For families",
      value: formatNumber(snapshot.notifications.length),
      label: "parent-ready updates",
      description:
        "Surface assignment progress, intervention signals, and next steps without making families dig through multiple tools.",
      icon: <Users className="size-5" />,
    },
  ];

  return (
    <main className="relative overflow-hidden bg-[linear-gradient(180deg,#fbfdff_0%,#f3f9ff_24%,#fffaf1_100%)] pb-20">
      <div className="absolute inset-x-0 top-0 -z-10 h-[46rem] bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.20),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(245,158,11,0.18),_transparent_28%),radial-gradient(circle_at_center,_rgba(20,184,166,0.14),_transparent_38%)]" />
      <header className="mx-auto flex max-w-[1400px] items-center justify-between px-4 py-6 lg:px-10">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-sky-300/30">
            <Sparkles className="size-5" />
          </div>
          <div>
            <p className="font-[family:var(--font-display)] text-xl font-semibold text-slate-950">{APP_NAME}</p>
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Interactive learning platform</p>
          </div>
        </div>
        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 lg:flex">
          <a href="#solutions">Solutions</a>
          <a href="#outcomes">Outcomes</a>
          <a href="#experience">Experience</a>
          <a href="#roles">Roles</a>
        </nav>
        <div className="flex items-center gap-3">
          <Button href="/login" variant="ghost" data-testid={createTestId("home", "sign-in")}>
            Sign in
          </Button>
          <Button
            href="/register"
            icon={<ArrowRight className="size-4" />}
            data-testid={createTestId("home", "create-account")}
          >
            Start with EngagePod
          </Button>
        </div>
      </header>

      <section className="mx-auto grid max-w-[1400px] gap-8 px-4 pb-12 pt-6 lg:grid-cols-[1.08fr_0.92fr] lg:px-10 lg:pb-20 lg:pt-10">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm shadow-slate-200/50 backdrop-blur">
            <ShieldCheck className="size-4 text-sky-600" />
            Teaching, assessment, and visibility in one secure workspace
          </div>
          <div className="space-y-5">
            <h1 className="max-w-4xl font-[family:var(--font-display)] text-5xl font-semibold leading-[0.95] tracking-tight text-slate-950 md:text-6xl xl:text-7xl">
              Make every lesson feel live, responsive, and ready to scale.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-600 md:text-xl">
              EngagePod helps teachers launch interactive instruction, gives leaders real-time classroom visibility,
              and keeps families aligned with the progress that matters most.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              href="/register"
              className="w-full sm:w-auto"
              icon={<ArrowRight className="size-4" />}
              data-testid={createTestId("home", "hero-primary")}
            >
              Create your workspace
            </Button>
            <Button
              href="/dashboard"
              variant="secondary"
              className="w-full sm:w-auto"
              icon={<LayoutDashboard className="size-4" />}
              data-testid={createTestId("home", "hero-secondary")}
            >
              Explore the platform
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {proofCards.slice(0, 3).map((card) => (
              <div
                key={card.label}
                className="rounded-[28px] border border-white/80 bg-white/75 p-5 shadow-[0_16px_50px_-30px_rgba(15,23,42,0.3)] backdrop-blur"
                data-testid={createTestId("home", "hero-stat", card.label)}
              >
                <p className="text-sm font-medium text-slate-500">{card.label}</p>
                <p className="mt-3 font-[family:var(--font-display)] text-4xl font-semibold text-slate-950">
                  {card.value}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{card.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-5">
          <Card className="relative overflow-hidden border-slate-950/10 bg-slate-950 text-white">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(56,189,248,0.28),_transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(251,191,36,0.22),_transparent_24%)]" />
            <div className="relative space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">Live classroom</p>
                  <h2 className="mt-3 font-[family:var(--font-display)] text-3xl font-semibold">
                    Real-time participation, without losing the flow of instruction.
                  </h2>
                </div>
                <div className="rounded-full bg-white/10 px-3 py-2 text-xs font-semibold text-white/80">
                  {liveSession ? "Session in progress" : "Ready to launch"}
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-[28px] border border-white/10 bg-white/8 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm text-white/70">Current room</p>
                      <p className="mt-2 text-2xl font-semibold">
                        {liveSession?.title ?? "No live session is active"}
                      </p>
                    </div>
                    <CirclePlay className="size-10 text-cyan-300" />
                  </div>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-3xl bg-white/10 p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-white/60">Engagement</p>
                      <p className="mt-3 text-3xl font-semibold">{percentLabel(liveSession?.engagementScore ?? 0)}</p>
                    </div>
                    <div className="rounded-3xl bg-white/10 p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-white/60">Responses</p>
                      <p className="mt-3 text-3xl font-semibold">{percentLabel(liveSession?.responseRate ?? 0)}</p>
                    </div>
                  </div>
                </div>
                <div className="grid gap-4">
                  <div className="rounded-[28px] bg-white p-5 text-slate-950 shadow-lg shadow-slate-900/10">
                    <p className="text-sm font-medium text-slate-500">Resource library</p>
                    <p className="mt-3 font-[family:var(--font-display)] text-4xl font-semibold">
                      {formatNumber(resourceCount)}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Lessons, templates, media, and field-trip style assets ready for reuse.
                    </p>
                  </div>
                  <div className="rounded-[28px] border border-white/10 bg-white/8 p-5">
                    <p className="text-sm text-white/70">AI-guided lesson support</p>
                    <p className="mt-3 font-[family:var(--font-display)] text-4xl font-semibold">
                      {formatNumber(aiAssistedLessons)}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-white/75">
                      Lesson flows already marked for adaptive recommendations and support.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            {proofCards.slice(2).map((card) => (
              <Card
                key={card.label}
                className="relative overflow-hidden border-slate-200/90 bg-white/90"
                data-testid={createTestId("home", "proof-card", card.label)}
              >
                <div className={`absolute inset-x-6 top-0 h-24 rounded-full bg-gradient-to-r ${card.accent} blur-3xl`} />
                <div className="relative">
                  <p className="text-sm font-medium text-slate-500">{card.label}</p>
                  <p className="mt-3 font-[family:var(--font-display)] text-4xl font-semibold text-slate-950">
                    {card.value}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{card.detail}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="solutions" className="mx-auto max-w-[1400px] px-4 py-8 lg:px-10 lg:py-12">
        <div className="rounded-[36px] border border-slate-200/80 bg-white/85 p-7 shadow-[0_28px_100px_-46px_rgba(15,23,42,0.28)] backdrop-blur lg:p-10">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-700">One connected workflow</p>
              <h2 className="font-[family:var(--font-display)] text-4xl font-semibold tracking-tight text-slate-950">
                From lesson prep to district-level visibility, every move stays connected.
              </h2>
              <p className="text-base leading-7 text-slate-600">
                Replace disconnected presentation tools, response apps, spreadsheets, and parent updates with a
                single product surface designed for daily instruction.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                {
                  icon: <BookOpen className="size-5 text-sky-700" />,
                  title: "Build once",
                  description: "Create a lesson once and reuse it live, asynchronous, or as a small-group intervention path.",
                },
                {
                  icon: <BrainCircuit className="size-5 text-emerald-700" />,
                  title: "Respond in the moment",
                  description: "Capture polls, quizzes, sketches, and open responses without leaving the teaching flow.",
                },
                {
                  icon: <BarChart3 className="size-5 text-amber-700" />,
                  title: "Act on what changed",
                  description: "Translate participation and mastery trends into follow-up moves for teachers, leaders, and families.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-[28px] border border-slate-200 bg-slate-50 p-5"
                  data-testid={createTestId("home", "solution", item.title)}
                >
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-white shadow-sm">
                    {item.icon}
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-slate-950">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="outcomes" className="mx-auto max-w-[1400px] px-4 py-8 lg:px-10 lg:py-12">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <Card className="border-slate-900/10 bg-slate-950 text-white">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">Instructional outcomes</p>
            <h2 className="mt-4 font-[family:var(--font-display)] text-4xl font-semibold tracking-tight">
              Stronger signals, faster interventions, less manual reporting.
            </h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                { label: "Average mastery", value: percentLabel(masteryAverage) },
                { label: "Assignments on track", value: `${assignmentsOnTrack}/${snapshot.assignments.length || 0}` },
                { label: "Assessments active", value: formatNumber(snapshot.assessments.length) },
              ].map((item) => (
                <div key={item.label} className="rounded-[28px] border border-white/10 bg-white/8 p-5">
                  <p className="text-sm text-white/70">{item.label}</p>
                  <p className="mt-3 font-[family:var(--font-display)] text-4xl font-semibold">{item.value}</p>
                </div>
              ))}
            </div>
          </Card>
          <div className="grid gap-4">
            {featureSpotlights.map((item, index) => (
              <Card
                key={item.id}
                className="border-slate-200/90 bg-white/90"
                data-testid={createTestId("home", "capability", item.id)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                      {String(index + 1).padStart(2, "0")}
                    </p>
                    <h3 className="mt-2 text-2xl font-semibold text-slate-950">{item.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
                  </div>
                  <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    {item.priority}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="roles" className="mx-auto max-w-[1400px] px-4 py-8 lg:px-10 lg:py-12">
        <div className="space-y-6">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-700">Designed for each role</p>
            <h2 className="mt-4 font-[family:var(--font-display)] text-4xl font-semibold tracking-tight text-slate-950">
              Every audience gets what they need without adding another product to manage.
            </h2>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {roleCards.map((card) => (
              <Card key={card.title} className="border-slate-200/90 bg-white/90" data-testid={createTestId("home", "role", card.title)}>
                <div className="flex items-center justify-between">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                    {card.icon}
                  </div>
                  <div className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                    {card.label}
                  </div>
                </div>
                <h3 className="mt-6 text-2xl font-semibold text-slate-950">{card.title}</h3>
                <p className="mt-3 font-[family:var(--font-display)] text-5xl font-semibold text-slate-950">{card.value}</p>
                <p className="mt-4 text-sm leading-6 text-slate-600">{card.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="experience" className="mx-auto max-w-[1400px] px-4 py-8 lg:px-10 lg:py-12">
        <div className="grid gap-6 lg:grid-cols-[0.88fr_1.12fr]">
          <Card className="border-slate-900/10 bg-[linear-gradient(145deg,#0f172a_0%,#123d63_55%,#e0a24d_140%)] text-white">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">Inside the platform</p>
            <h2 className="mt-4 font-[family:var(--font-display)] text-4xl font-semibold tracking-tight">
              Navigate the full EngagePod surface with one shared data model underneath.
            </h2>
            <p className="mt-4 text-sm leading-7 text-white/80">
              Product areas stay intentionally connected, so lesson data, live responses, assignments, family updates,
              and analytics don’t fragment across separate tools.
            </p>
            <div className="mt-8 grid gap-3">
              {DASHBOARD_ROUTES.map((route, index) => (
                <div
                  key={route.href}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/8 px-4 py-3"
                  data-testid={createTestId("home", "route", route.label)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold uppercase tracking-[0.24em] text-white/55">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="font-medium text-white">{route.label}</span>
                  </div>
                  <ArrowRight className="size-4 text-cyan-300" />
                </div>
              ))}
            </div>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-slate-200 bg-white/95">
              <LibraryBig className="size-10 text-sky-700" />
              <h3 className="mt-5 text-2xl font-semibold text-slate-950">Content that stays reusable</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {formatNumber(snapshot.content.length)} content items and {formatNumber(snapshot.media.length)} media
                assets are already available for remix, launch, or district-wide sharing.
              </p>
            </Card>
            <Card className="border-slate-200 bg-white/95">
              <Users className="size-10 text-emerald-700" />
              <h3 className="mt-5 text-2xl font-semibold text-slate-950">Assignments with visibility</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {formatNumber(snapshot.assignments.length)} assignments are tracked with completion status, giving
                teams cleaner follow-through than static slide delivery ever could.
              </p>
            </Card>
            <Card className="border-slate-200 bg-white/95">
              <BrainCircuit className="size-10 text-amber-700" />
              <h3 className="mt-5 text-2xl font-semibold text-slate-950">Adaptive ideas, responsibly applied</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {innovativeIdeas[0]}
              </p>
            </Card>
            <Card className="border-slate-200 bg-white/95">
              <BarChart3 className="size-10 text-rose-700" />
              <h3 className="mt-5 text-2xl font-semibold text-slate-950">Connected systems</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {formatNumber(snapshot.integrations.length)} integrations are already modeled so districts can connect
                learning workflows without rebuilding the data layer each time.
              </p>
            </Card>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-4 py-8 lg:px-10 lg:py-14">
        <Card className="overflow-hidden border-slate-200 bg-[linear-gradient(135deg,#fff7ed_0%,#ffffff_44%,#eff6ff_100%)]">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-700">Launch the full experience</p>
              <h2 className="font-[family:var(--font-display)] text-4xl font-semibold tracking-tight text-slate-950">
                Bring live participation, assessment, and school-wide visibility into one EngagePod workspace.
              </h2>
              <p className="max-w-2xl text-base leading-7 text-slate-600">
                Start with a single classroom or set up a full district-ready rollout. The same product surface supports
                daily instruction, intervention planning, and family communication.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Button href="/register" className="w-full sm:w-auto" icon={<ArrowRight className="size-4" />}>
                Create account
              </Button>
              <Button href="/login" variant="secondary" className="w-full sm:w-auto">
                Sign in
              </Button>
            </div>
          </div>
        </Card>
      </section>
    </main>
  );
}
