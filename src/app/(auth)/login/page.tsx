import { AuthForm } from "@/components/forms/auth-form";
import { Card } from "@/components/ui/card";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string }>;
}) {
  const params = await searchParams;
  const showRegisteredMessage = params.registered === "1";

  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <Card className="w-full max-w-xl space-y-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-600">Secure access</p>
          <h1 className="mt-3 text-4xl font-semibold text-slate-950">Connect your EngagePod workspace</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Sign in with your Supabase-backed account to access your classroom, lesson library, and analytics workspace.
          </p>
        </div>
        {showRegisteredMessage ? (
          <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Registration completed. Sign in with your new account to continue.
          </p>
        ) : null}
        <AuthForm mode="signin" />
      </Card>
    </main>
  );
}
