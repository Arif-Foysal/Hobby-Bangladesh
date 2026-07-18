import { LoginForm } from "@/components/login-form";
import { getStoreSetting } from "@/lib/supabase/store";

export default async function Page() {
  const branding = await getStoreSetting("branding");
  const logoUrl = branding?.logo_url ?? null;

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm logoUrl={logoUrl} />
      </div>
    </div>
  );
}
