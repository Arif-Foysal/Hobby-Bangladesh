import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/supabase/admin";
import {
  IconUserCircle,
  IconLogin,
  IconPackage,
  IconMapPin,
  IconLogout,
} from "@tabler/icons-react";
import { SiteThemeToggle } from "./site-theme-toggle";
import { CartButton } from "./cart-button";

export async function SiteHeader() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();
  const isLoggedIn = !!authData?.claims;
  const userId = authData?.claims?.sub;

  let cartCount = 0;
  if (userId) {
    const { count } = await supabase
      .from("carts")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);
    cartCount = count || 0;
  }

  const profile = isLoggedIn ? await getCurrentProfile() : null;
  const displayName = profile?.name ?? authData?.claims?.email ?? "";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4 lg:px-6">
        <Link href="/" className="flex items-center gap-2 font-bold">
          Hobby BD
        </Link>

        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link href="/products" className="px-3 py-2 text-sm">
                  Products
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex-1" />

        <div className="flex items-center gap-1">
          <SiteThemeToggle />

          <CartButton serverCartCount={cartCount} />

          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <IconUserCircle className="size-5" />
                  <span className="sr-only">Account</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {displayName && (
                  <>
                    <div className="px-2 py-1.5 text-sm font-medium">
                      {displayName}
                    </div>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem asChild>
                  <Link href="/account/orders">
                    <IconPackage />
                    My Orders
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/account/addresses">
                    <IconMapPin />
                    Addresses
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/auth/sign-out">
                    <IconLogout />
                    Sign Out
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" size="sm" asChild>
              <Link href="/auth/login">
                <IconLogin />
                <span className="hidden sm:block">Sign In</span>
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
