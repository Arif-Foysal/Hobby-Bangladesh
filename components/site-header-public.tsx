import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { createClient } from "@/lib/supabase/server";
import { SiteThemeToggle } from "./site-theme-toggle";
import { CartButton } from "./cart-button";
import { MobileNav } from "./mobile-nav";

export async function SiteHeader() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();

  let cartCount = 0;
  if (authData?.claims) {
    const { count } = await supabase
      .from("carts")
      .select("*", { count: "exact", head: true })
      .eq("user_id", authData.claims.sub);
    cartCount = count || 0;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4 lg:px-6">
        <MobileNav />

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
        </div>
      </div>
    </header>
  );
}
