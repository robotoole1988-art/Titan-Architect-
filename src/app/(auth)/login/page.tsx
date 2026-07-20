import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { siteConfig } from "@/config/site";
import { LoginForm, getFounderSession } from "@/features/auth";

export const metadata = { title: "Sign in" };

const NOTICES: Record<string, string> = {
  "not-authorised": "That account is not the founder — this instance is founder-only.",
  "link-expired": "That sign-in link has expired or was already used. Request a fresh one.",
  "missing-code": "The sign-in link was incomplete. Request a fresh one.",
  "auth-unconfigured":
    "Auth is not configured on this server — set SUPABASE_ANON_KEY and TITAN_FOUNDER_EMAIL.",
};

/** The real founder door (ADR-054): magic link, founder-only. */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  if (await getFounderSession()) redirect("/dashboard");
  const { notice } = await searchParams;
  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="space-y-2 text-center">
        <div className="mx-auto flex size-10 items-center justify-center rounded-xl bg-primary font-bold text-primary-foreground">
          T
        </div>
        <CardTitle className="text-xl">Sign in to {siteConfig.name}</CardTitle>
        <CardDescription>
          Founder access only. Enter your email and we&apos;ll send a one-time
          sign-in link — no passwords exist on this platform.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm notice={notice ? NOTICES[notice] : undefined} />
      </CardContent>
    </Card>
  );
}
