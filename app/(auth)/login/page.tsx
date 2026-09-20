import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;
  const safeNext = next && next.startsWith("/") ? next : "/dashboard";

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-8 p-6">
      <div>
        <p className="font-display text-lg font-bold text-primary">Marketing Co-Pilot</p>
        <h1 className="text-4xl">Let&apos;s get you in</h1>
      </div>
      <LoginForm
        next={safeNext}
        initialError={error}
        googleEnabled={process.env.NEXT_PUBLIC_AUTH_GOOGLE === "true"}
      />
    </main>
  );
}
