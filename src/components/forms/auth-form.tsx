"use client";

import Link from "next/link";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { ArrowRight, LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { createTestId } from "@/lib/test-id";
import { signInSchema, signUpSchema } from "@/lib/validation/schemas";
import type { UserRole } from "@/types/domain";

const roleOptions: UserRole[] = [
  "teacher",
  "student",
  "parent",
  "admin",
  "instructional_coach",
];

export function AuthForm({ mode = "signin" }: { mode?: "signin" | "signup" }) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const isSignUp = mode === "signup";
  const actionLabel = useMemo(() => (isSignUp ? "Create account" : "Sign in"), [isSignUp]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const supabase = createBrowserSupabaseClient();
    if (!supabase) {
      setErrorMessage("Supabase is not configured. Add the required environment variables.");
      setLoading(false);
      return;
    }

    const formData = new FormData(event.currentTarget);

    if (isSignUp) {
      const payload = {
        fullName: String(formData.get("fullName") ?? ""),
        schoolName: String(formData.get("schoolName") ?? ""),
        district: String(formData.get("district") ?? ""),
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
        confirmPassword: String(formData.get("confirmPassword") ?? ""),
        role: String(formData.get("role") ?? "") as UserRole,
      };

      const parsed = signUpSchema.safeParse(payload);
      if (!parsed.success) {
        setErrorMessage(parsed.error.issues[0]?.message ?? "Invalid registration details.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: parsed.data.email,
        password: parsed.data.password,
        options: {
          data: {
            full_name: parsed.data.fullName,
            school_name: parsed.data.schoolName,
            district: parsed.data.district || `${parsed.data.schoolName} District`,
            role: parsed.data.role,
            locale: Intl.DateTimeFormat().resolvedOptions().locale,
            time_zone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
        },
      });

      if (error) {
        setErrorMessage(error.message);
        setLoading(false);
        return;
      }

      const workspaceName = parsed.data.schoolName.trim();
      if (data?.session) {
        await supabase.auth.signOut();
      }

      setSuccessMessage(`Account created for ${workspaceName}. Sign in to continue.`);
      setLoading(false);
      router.push("/login?registered=1");
      router.refresh();
      return;
    }

    const payload = {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    };

    const parsed = signInSchema.safeParse(payload);
    if (!parsed.success) {
      setErrorMessage(parsed.error.issues[0]?.message ?? "Invalid credentials.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    if (error) {
      setErrorMessage(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
      {isSignUp ? (
        <>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="fullName">
              Full name
            </label>
            <Input
              id="fullName"
              name="fullName"
              type="text"
              placeholder="Jordan Lee"
              data-testid={createTestId("auth", "full-name")}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="role">
              Role
            </label>
            <Select id="role" name="role" defaultValue="teacher" data-testid={createTestId("auth", "role")}>
              {roleOptions.map((role) => (
                <option key={role} value={role}>
                  {role.replaceAll("_", " ")}
                </option>
              ))}
            </Select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="schoolName">
                Workspace name
              </label>
              <Input
                id="schoolName"
                name="schoolName"
                type="text"
                placeholder="North Campus Academy"
                data-testid={createTestId("auth", "school-name")}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="district">
                District
              </label>
              <Input
                id="district"
                name="district"
                type="text"
                placeholder="Optional district name"
                data-testid={createTestId("auth", "district")}
              />
            </div>
          </div>
        </>
      ) : null}

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700" htmlFor="email">
          Work email
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="teacher@engagepod.edu"
          data-testid={createTestId("auth", "email")}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="password">
            Password
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Minimum 8 characters"
            data-testid={createTestId("auth", "password")}
          />
        </div>
        {isSignUp ? (
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="confirmPassword">
              Confirm password
            </label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Re-enter password"
              data-testid={createTestId("auth", "confirm-password")}
            />
          </div>
        ) : null}
      </div>

      {errorMessage ? (
        <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{errorMessage}</p>
      ) : null}
      {successMessage ? (
        <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{successMessage}</p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button
          type="submit"
          disabled={loading}
          icon={isSignUp ? <UserPlus className="size-4" /> : <LogIn className="size-4" />}
          data-testid={createTestId("auth", "submit")}
        >
          {loading ? "Processing..." : actionLabel}
        </Button>
        <Link
          href={(isSignUp ? "/login" : "/register") as Route}
          className="inline-flex items-center gap-2 text-sm font-semibold text-sky-700"
        >
          {isSignUp ? "Already have an account? Sign in" : "Need an account? Register"}
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </form>
  );
}
