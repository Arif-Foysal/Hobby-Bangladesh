"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useRouter } from "next/navigation";
import { IconMenu, IconUser, IconHome, IconShoppingBag, IconShoppingCart, IconPackage, IconDashboard, IconLogout } from "@tabler/icons-react";
import { createClient } from "@/lib/supabase/client";
import { BrandLogo } from "./brand-logo";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

export function MobileNav({ logoUrl }: { logoUrl?: string | null }) {
  const [open, setOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getClaims().then(async ({ data }) => {
      const loggedIn = !!data?.claims;
      setIsLoggedIn(loggedIn);
      if (loggedIn && data?.claims?.sub) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.claims.sub)
          .single();
        setIsAdmin(profile?.role === "admin");
      }
    });
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setOpen(false);
    toast.success("Signed out");
    router.push("/auth/login");
    router.refresh();
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <IconMenu className="size-5" />
          <span className="sr-only">Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>
            <BrandLogo logoUrl={logoUrl} />
          </SheetTitle>
        </SheetHeader>
        <nav className="mt-6 flex flex-col gap-1">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
          >
            <IconHome className="size-4" />
            Home
          </Link>
          <Link
            href="/products"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
          >
            <IconShoppingBag className="size-4" />
            Products
          </Link>
          <Link
            href="/cart"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
          >
            <IconShoppingCart className="size-4" />
            Cart
          </Link>
          {isLoggedIn && (
            <Link
              href="/account/orders"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
            >
              <IconPackage className="size-4" />
              Orders
            </Link>
          )}
          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-primary hover:bg-primary/10"
            >
              <IconDashboard className="size-4" />
              Admin Dashboard
            </Link>
          )}
          <Separator className="my-2" />
          {isLoggedIn ? (
            <>
              <Link
                href="/account/orders"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
              >
                <IconUser className="size-4" />
                My Account
              </Link>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10"
              >
                <IconLogout className="size-4" />
                Sign Out
              </button>
            </>
          ) : (
            <Link
              href="/auth/login"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
            >
              <IconUser className="size-4" />
              Sign In
            </Link>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
