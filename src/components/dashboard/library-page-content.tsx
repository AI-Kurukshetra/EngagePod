import { AdminLibraryManager } from "@/components/dashboard/admin-library-manager";
import { TeacherLibraryWorkspace } from "@/components/dashboard/teacher-library-workspace";
import type { DashboardSnapshot } from "@/types/domain";

export function LibraryPageContent({ snapshot }: { snapshot: DashboardSnapshot }) {
  if (snapshot.currentUser?.role === "admin") {
    return (
      <AdminLibraryManager
        currentUser={snapshot.currentUser}
        initialFolders={snapshot.libraryFolders}
        initialContent={snapshot.content}
      />
    );
  }

  return <TeacherLibraryWorkspace snapshot={snapshot} />;
}
