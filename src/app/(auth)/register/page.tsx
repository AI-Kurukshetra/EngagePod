import { AuthForm } from "@/components/forms/auth-form";
import { Card } from "@/components/ui/card";

export default function RegisterPage() {
  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <Card className="w-full max-w-xl space-y-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-600">New workspace access</p>
          <h1 className="mt-3 text-4xl font-semibold text-slate-950">Register for EngagePod</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Create your account and workspace in one step. After registration, sign in with your credentials to enter
            EngagePod.
          </p>
        </div>
        <AuthForm mode="signup" />
      </Card>
    </main>
  );
}
