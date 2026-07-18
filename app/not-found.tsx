import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/brand-logo";
import { getStoreSetting } from "@/lib/supabase/store";

export default async function NotFound() {
  const branding = await getStoreSetting("branding");
  const logoUrl = branding?.logo_url ?? null;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-7xl items-center px-4 py-4 lg:px-6">
        <BrandLogo logoUrl={logoUrl} />
      </header>
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="flex size-20 items-center justify-center rounded-full bg-primary/10">
          <span className="font-display text-4xl font-bold text-primary">404</span>
        </div>
        <h1 className="font-display text-2xl font-bold">Page Not Found</h1>
        <p className="max-w-md text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex gap-3">
          <Button asChild>
            <Link href="/">Go Home</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/products">Browse Products</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
