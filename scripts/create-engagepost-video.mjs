import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { chromium } from "playwright-core";
import ffmpegPath from "ffmpeg-static";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";
const ROOT_DIR = process.cwd();
const OUTPUT_ROOT = path.join(ROOT_DIR, "artifacts", "engagepost");
const FRAMES_DIR = path.join(OUTPUT_ROOT, "frames");
const AUDIO_DIR = path.join(OUTPUT_ROOT, "audio");
const SEGMENTS_DIR = path.join(OUTPUT_ROOT, "segments");
const FINAL_VIDEO = path.join(ROOT_DIR, "engagepost.mp4");
const SAMPLE_FILE = path.join(OUTPUT_ROOT, "admin-library-demo.txt");

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
].filter(Boolean);

const ROLES = {
  admin: {
    email: "admin@engagepod.com",
    password: "Test@123",
  },
  teacher: {
    email: "jinesh.darji@bacancy.com",
    password: "Test@123",
  },
  student: {
    email: "student@engagepod.com",
    password: "Test@123",
  },
};

const slides = [];

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function resetDir(dirPath) {
  fs.rmSync(dirPath, { recursive: true, force: true });
  ensureDir(dirPath);
}

function toPosix(filePath) {
  return filePath.replaceAll("\\", "/");
}

function run(command, args, context) {
  const result = spawnSync(command, args, { stdio: "pipe", encoding: "utf-8" });
  if (result.status !== 0) {
    throw new Error(
      [
        `Command failed (${context}): ${command} ${args.join(" ")}`,
        result.stdout?.trim() ? `STDOUT:\n${result.stdout.trim()}` : "",
        result.stderr?.trim() ? `STDERR:\n${result.stderr.trim()}` : "",
      ]
        .filter(Boolean)
        .join("\n\n"),
    );
  }
}

function getChromePath() {
  const found = CHROME_CANDIDATES.find((candidate) => fs.existsSync(candidate));
  if (!found) {
    throw new Error(
      "Chrome executable not found. Set CHROME_PATH env var to a valid Chrome/Chromium executable.",
    );
  }
  return found;
}

function powershellEscape(value) {
  return value.replaceAll("'", "''");
}

function synthesizeNarrationToWav(text, outputPath) {
  const encodedNarration = Buffer.from(text, "utf16le").toString("base64");
  const script = [
    "Add-Type -AssemblyName System.Speech",
    "$voice = New-Object System.Speech.Synthesis.SpeechSynthesizer",
    "$voice.Rate = -1",
    "$voice.Volume = 100",
    `$voice.SetOutputToWaveFile('${powershellEscape(outputPath)}')`,
    `$text = [System.Text.Encoding]::Unicode.GetString([System.Convert]::FromBase64String('${encodedNarration}'))`,
    "$voice.Speak($text)",
    "$voice.Dispose()",
  ].join("; ");

  run(
    "powershell",
    ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", script],
    `tts ${path.basename(outputPath)}`,
  );
}

async function waitForHome() {
  const response = await fetch(BASE_URL);
  if (!response.ok) {
    throw new Error(`App is not reachable at ${BASE_URL}. Status: ${response.status}`);
  }
}

async function login(page, { email, password }) {
  await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle" });

  if (!page.url().includes("/login")) {
    return;
  }

  await page.fill('[data-testid="auth__email"]', email);
  await page.fill('[data-testid="auth__password"]', password);
  await Promise.all([
    page.waitForURL("**/dashboard**", { timeout: 60000 }),
    page.click('[data-testid="auth__submit"]'),
  ]);
  await page.waitForLoadState("networkidle");
}

async function captureSlide(page, { key, narration, route, waitForText }) {
  if (route) {
    await page.goto(`${BASE_URL}${route}`, { waitUntil: "networkidle" });
  }
  if (waitForText) {
    try {
      await page.getByText(waitForText, { exact: false }).first().waitFor({ timeout: 30000 });
    } catch {
      console.warn(`Wait text not found for ${key}: ${waitForText}`);
    }
  }

  await page.waitForTimeout(1400);
  await page.evaluate(() => window.scrollTo(0, 0));

  const index = slides.length + 1;
  const slideId = String(index).padStart(2, "0");
  const imagePath = path.join(FRAMES_DIR, `${slideId}-${key}.png`);

  await page.screenshot({ path: imagePath, fullPage: false });

  slides.push({
    index,
    key,
    imagePath,
    narration,
  });

  console.log(`Captured slide ${slideId}: ${key}`);
}

async function buildCaptureDeck() {
  const chromePath = getChromePath();
  const browser = await chromium.launch({
    headless: true,
    executablePath: chromePath,
    args: ["--disable-gpu", "--disable-dev-shm-usage"],
  });

  const integrationTitle = `Shared STEM Library ${new Date().toISOString().replace(/[:.]/g, "-")}`;
  let integrationSeenInTeacherLibrary = false;

  try {
    {
      const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
      const page = await context.newPage();
      await captureSlide(page, {
        key: "home-intro",
        route: "/",
        waitForText: "Make instruction more interactive",
        narration:
          "Welcome to EngagePod. EngagePod is an interactive EdTech platform that connects lesson delivery, classroom engagement, assignments, analytics, and family visibility in one workspace.",
      });
      await context.close();
    }

    {
      const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
      const page = await context.newPage();
      await login(page, ROLES.admin);

      await captureSlide(page, {
        key: "admin-dashboard",
        route: "/dashboard",
        waitForText: "MCQ result board",
        narration:
          "Now we are in the Admin role dashboard. This screen gives school-level visibility into live sessions, assignment momentum, and MCQ outcomes across classrooms.",
      });

      await captureSlide(page, {
        key: "admin-library-overview",
        route: "/dashboard/library",
        waitForText: "Create shared library content",
        narration:
          "This is the Admin library management module. Admin can upload shared resources once, and those resources become available to teachers in their library workspace.",
      });

      await page.click('[data-testid="admin-library__create"]');
      await page.fill('[data-testid="admin-library__title"]', integrationTitle);
      await page.fill(
        '[data-testid="admin-library__description"]',
        "District-ready STEM resource pack created by admin for teacher reuse.",
      );
      await page.setInputFiles('[data-testid="admin-library__file"]', SAMPLE_FILE);
      await Promise.all([
        page.waitForResponse(
          (response) =>
            response.url().includes("/api/content") &&
            response.request().method() === "POST" &&
            response.ok(),
          { timeout: 60000 },
        ),
        page.click('[data-testid="admin-library__save"]'),
      ]);
      await page.getByText(integrationTitle, { exact: false }).first().waitFor({ timeout: 30000 });

      await captureSlide(page, {
        key: "admin-library-created",
        narration:
          "Here, admin has created a shared library item. This content is now published at workspace level and can be consumed by teachers without duplicate upload.",
      });

      await captureSlide(page, {
        key: "admin-builder",
        route: "/dashboard/builder",
        waitForText: "Lesson canvas",
        narration:
          "This is the Builder module for content design. Admin and teacher can structure interactive lessons, sequence activity blocks, and prepare instruction before live delivery.",
      });

      await captureSlide(page, {
        key: "admin-parents",
        route: "/dashboard/parent",
        waitForText: "Home visibility without dashboard overload",
        narration:
          "This Parents screen gives admin a family-facing visibility layer, so student progress can be communicated clearly without exposing operational complexity.",
      });

      await captureSlide(page, {
        key: "admin-teacher-module",
        route: "/dashboard/admin",
        waitForText: "Create shared content for teachers",
        narration:
          "This Teacher management module helps admin monitor staff and keep shared instructional resources consistent across classrooms.",
      });

      await captureSlide(page, {
        key: "admin-profile",
        route: "/dashboard/profile",
        waitForText: "Profile settings",
        narration:
          "Every role also includes a Profile screen for account identity and workspace preferences.",
      });

      await context.close();
    }

    {
      const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
      const page = await context.newPage();
      await login(page, ROLES.teacher);

      await captureSlide(page, {
        key: "teacher-dashboard",
        route: "/dashboard",
        waitForText: "What learners need next",
        narration:
          "Now we are in the Teacher role dashboard. Teachers use this overview to track classroom readiness, assignment status, and quick learning signals.",
      });

      await captureSlide(page, {
        key: "teacher-library",
        route: "/dashboard/library",
        waitForText: "Organize your library your way",
        narration:
          "This is the Teacher library workspace. Teachers can create folders and organize reusable materials for faster lesson preparation.",
      });

      const browseButtons = page.getByRole("button", { name: "Browse library" });
      if ((await browseButtons.count()) > 0) {
        await browseButtons.first().click();
        await page.getByText(integrationTitle, { exact: false }).first().waitFor({ timeout: 30000 });
        integrationSeenInTeacherLibrary = true;

        await captureSlide(page, {
          key: "teacher-library-integration",
          narration:
            "This demonstrates integration. The library created by admin is now visible in the teacher workspace, so teachers can add it into folders and use it in classroom planning.",
        });

        await page.keyboard.press("Escape");
      }

      await captureSlide(page, {
        key: "teacher-builder",
        route: "/dashboard/builder",
        waitForText: "Lesson canvas",
        narration:
          "In Builder, teachers can craft lesson flow, add activity types, and turn library resources into deliverable classroom sessions.",
      });

      await captureSlide(page, {
        key: "teacher-live",
        route: "/dashboard/live",
        waitForText: "Upcoming live learning blocks",
        narration:
          "The Live module is where teachers run and monitor live class sessions, tracking engagement and response signals in real time.",
      });

      await captureSlide(page, {
        key: "teacher-responses",
        route: "/dashboard/responses",
        waitForText: "Confidence-check poll",
        narration:
          "Student Response studio captures multiple-choice, open-ended, and drawing responses. This gives immediate evidence of understanding during instruction.",
      });

      await captureSlide(page, {
        key: "teacher-analytics",
        route: "/dashboard/analytics",
        waitForText: "Risk and mastery analytics",
        narration:
          "Analytics helps teachers identify risk and mastery trends, so intervention decisions are based on live evidence rather than delayed reports.",
      });

      await captureSlide(page, {
        key: "teacher-assignments",
        route: "/dashboard/assignments",
        waitForText: "Create MCQ assignments",
        narration:
          "Assignments workspace is where teachers publish work, track due progress, and align assessments with classroom goals.",
      });

      await captureSlide(page, {
        key: "teacher-profile",
        route: "/dashboard/profile",
        waitForText: "Profile settings",
        narration:
          "Teacher profile stores identity and preferences used across all modules in the workspace.",
      });

      await context.close();
    }

    {
      const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
      const page = await context.newPage();
      await login(page, ROLES.student);

      await captureSlide(page, {
        key: "student-dashboard",
        route: "/dashboard",
        waitForText: "What you need to complete",
        narration:
          "Now we are in the Student role dashboard. Students get a focused view of what to complete next and how they are performing.",
      });

      await captureSlide(page, {
        key: "student-live",
        route: "/dashboard/live",
        waitForText: "Your upcoming live classes",
        narration:
          "The student Live screen shows upcoming sessions and supports participation during scheduled learning blocks.",
      });

      await captureSlide(page, {
        key: "student-analytics",
        route: "/dashboard/analytics",
        waitForText: "Progress and mastery signals",
        narration:
          "Student analytics provides personal progress and mastery signals so learners can understand their performance trajectory.",
      });

      await captureSlide(page, {
        key: "student-assignments",
        route: "/dashboard/assignments",
        waitForText: "Assignments",
        narration:
          "In Assignments, students attempt published work. This is directly integrated with teacher publishing and grading workflows.",
      });

      await captureSlide(page, {
        key: "student-profile",
        route: "/dashboard/profile",
        waitForText: "Profile settings",
        narration:
          "Student profile manages account details while preserving role-specific access controls across the platform.",
      });

      await context.close();
    }

    await captureFinalSummary(browser, integrationSeenInTeacherLibrary);
  } finally {
    await browser.close();
  }
}

async function captureFinalSummary(browser, integrationSeenInTeacherLibrary) {
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();
  await captureSlide(page, {
    key: "summary",
    route: "/",
    waitForText: "Make instruction more interactive",
    narration: integrationSeenInTeacherLibrary
      ? "To summarize, EngagePod connects admin publishing, teacher planning and delivery, and student completion in one continuous EdTech workflow."
      : "To summarize, EngagePod provides a unified EdTech workflow connecting admin management, teacher delivery, and student learning progress.",
  });
  await context.close();
}

function buildVideo() {
  slides.forEach((slide) => {
    const slideId = String(slide.index).padStart(2, "0");
    const audioPath = path.join(AUDIO_DIR, `${slideId}-${slide.key}.wav`);
    const segmentPath = path.join(SEGMENTS_DIR, `${slideId}-${slide.key}.mp4`);

    synthesizeNarrationToWav(slide.narration, audioPath);

    run(
      ffmpegPath,
      [
        "-y",
        "-loop",
        "1",
        "-i",
        slide.imagePath,
        "-i",
        audioPath,
        "-vf",
        "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,format=yuv420p",
        "-c:v",
        "libx264",
        "-preset",
        "medium",
        "-crf",
        "22",
        "-c:a",
        "aac",
        "-b:a",
        "192k",
        "-shortest",
        segmentPath,
      ],
      `segment ${slideId}`,
    );
  });

  const concatListPath = path.join(OUTPUT_ROOT, "concat-list.txt");
  const concatBody = slides
    .map((slide) => {
      const slideId = String(slide.index).padStart(2, "0");
      const segmentPath = path.join(SEGMENTS_DIR, `${slideId}-${slide.key}.mp4`);
      return `file '${toPosix(segmentPath).replaceAll("'", "'\\''")}'`;
    })
    .join("\n");
  fs.writeFileSync(concatListPath, concatBody);

  const tempOutput = path.join(OUTPUT_ROOT, "engagepost.mp4");
  run(
    ffmpegPath,
    ["-y", "-f", "concat", "-safe", "0", "-i", concatListPath, "-c", "copy", tempOutput],
    "concat",
  );

  fs.copyFileSync(tempOutput, FINAL_VIDEO);
}

async function main() {
  ensureDir(OUTPUT_ROOT);
  resetDir(FRAMES_DIR);
  resetDir(AUDIO_DIR);
  resetDir(SEGMENTS_DIR);

  fs.writeFileSync(
    SAMPLE_FILE,
    "Admin-created STEM library resource for teacher integration demo in EngagePod.",
    "utf-8",
  );

  await waitForHome();
  await buildCaptureDeck();

  if (!slides.length) {
    throw new Error("No slides captured. Aborting video generation.");
  }

  fs.writeFileSync(path.join(OUTPUT_ROOT, "slides.json"), JSON.stringify(slides, null, 2), "utf-8");
  buildVideo();

  console.log(`Video generated: ${FINAL_VIDEO}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
