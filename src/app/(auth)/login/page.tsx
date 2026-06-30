import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { siteConfig } from "@/config/site";

export const metadata = { title: "Sign in" };

/**
 * Placeholder sign-in screen. The form is intentionally non-functional —
 * it marks where real authentication will be wired into the auth seam.
 */
export default function LoginPage() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="space-y-2 text-center">
        <div className="mx-auto flex size-10 items-center justify-center rounded-xl bg-primary font-bold text-primary-foreground">
          T
        </div>
        <CardTitle className="text-xl">Sign in to {siteConfig.name}</CardTitle>
        <CardDescription>
          Authentication is not wired up yet — this is a placeholder.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Input type="email" placeholder="you@titan.dev" disabled />
        <Input type="password" placeholder="Password" disabled />
        <Button className="w-full" disabled>
          Continue
        </Button>
        <Button
          variant="ghost"
          className="w-full"
          render={<Link href="/dashboard" />}
        >
          Skip to dashboard →
        </Button>
      </CardContent>
    </Card>
  );
}
