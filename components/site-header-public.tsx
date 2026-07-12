import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { BrandLogo } from "./brand-logo";
import { SiteThemeToggle } from "./site-theme-toggle";
import { CartButton } from "./cart-button";
import { MobileNav } from "./mobile-nav";
import { HeaderSearch } from "./header-search";
import { Button } from "@/components/ui/button";
import { IconUser, IconPackage, IconShoppingBag } from "@tabler/icons-react";

export async function SiteHeader() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();
  const isLoggedIn = !!authData?.claims;

  let cartCount = 0;
  if (isLoggedIn) {
    const { count } = await supabase
      .from("carts")
      .select("*", { count: "exact", head: true })
      .eq("user_id", authData.claims.sub);
    cartCount = count || 0;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 lg:px-6">
        <MobileNav />

        <BrandLogo />

        <nav className="hidden items-center gap-1 md:flex">
          <Link
            href="/products"
            className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <IconShoppingBag className="size-4" />
            Products
          </Link>
          {isLoggedIn && (
            <Link
              href="/account/orders"
            className="flex items-center gap-1.5 rounded-md px-3.5 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <IconPackage className="size-4" />
              Orders
            </Link>
          )}
        </nav>

        <div className="flex-1" />

        <div className="hidden md:block">
          <HeaderSearch />
        </div>

        <div className="flex items-center gap-1">
          {isLoggedIn ? (
            <Button variant="ghost" size="icon" asChild>
              <Link href="/account/orders">
                <IconUser className="size-5" />
                <span className="sr-only">Account</span>
              </Link>
            </Button>
          ) : (
            <Button variant="ghost" size="sm" asChild className="hidden md:flex">
              <Link href="/auth/login">
                <IconUser className="mr-1.5 size-4" />
                Sign In
              </Link>
            </Button>
          )}
          <SiteThemeToggle />
          <CartButton serverCartCount={cartCount} />
        </div>
      </div>

      {/* Mobile search - below navbar */}
      <div className="border-t px-4 py-2 md:hidden">
        <HeaderSearch />
      </div>
    </header>
  );
}
