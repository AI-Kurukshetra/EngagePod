import { LessonBuilderStudio } from "@/components/dashboard/lesson-builder-studio";
import { EmptyState } from "@/components/ui/empty-state";
import { getDashboardSnapshot } from "@/lib/platform-data";

export default async function BuilderPage() {
  const snapshot = await getDashboardSnapshot();

  if (!snapshot.lessons[0]) {
    return (
      <EmptyState
        title="No lessons available yet"
        description="Create your first lesson in Supabase-backed storage, then the builder will render the authoring canvas here."
      />
    );
  }

  return <LessonBuilderStudio lesson={snapshot.lessons[0]} />;
}
