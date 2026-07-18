import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getStoreSetting } from "@/lib/supabase/store";
import { BrandLogo } from "./brand-logo";
import { SiteThemeToggle } from "./site-theme-toggle";
import { CartButton } from "./cart-button";
import { MobileNav } from "./mobile-nav";
import { HeaderSearch } from "./header-search";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IconUser, IconPackage, IconShoppingBag, IconDashboard } from "@tabler/icons-react";
import { SignOutButton } from "./sign-out-button";

export async function SiteHeader() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();
  const isLoggedIn = !!authData?.claims;

  let isAdmin = false;
  let cartCount = 0;

  if (isLoggedIn) {
    const [profileRes, cartRes] = await Promise.all([
      supabase.from("profiles").select("role").eq("id", authData.claims.sub).single(),
      supabase.from("carts").select("*", { count: "exact", head: true }).eq("user_id", authData.claims.sub),
    ]);
    isAdmin = profileRes.data?.role === "admin";
    cartCount = cartRes.count || 0;
  }

  const branding = await getStoreSetting("branding");
  const logoUrl = branding?.logo_url ?? null;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 lg:px-6">
        <MobileNav logoUrl={logoUrl} />

        <BrandLogo logoUrl={logoUrl} />

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
          {isAdmin && (
            <Link
              href="/admin"
              className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
            >
              <IconDashboard className="size-4" />
              Admin
            </Link>
          )}
        </nav>

        <div className="flex-1" />

        <div className="hidden md:block">
          <HeaderSearch />
        </div>

        <div className="flex items-center gap-1">
          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <IconUser className="size-5" />
                  <span className="sr-only">Account</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {isAdmin && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="flex items-center gap-2">
                        <IconDashboard className="size-4" />
                        Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem asChild>
                  <Link href="/account/orders" className="flex items-center gap-2">
                    <IconPackage className="size-4" />
                    My Orders
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <SignOutButton />
              </DropdownMenuContent>
            </DropdownMenu>
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
