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
import { IconMenu, IconUser, IconHome, IconShoppingBag, IconShoppingCart, IconPackage } from "@tabler/icons-react";
import { createClient } from "@/lib/supabase/client";
import { BrandLogo } from "./brand-logo";
import { Separator } from "@/components/ui/separator";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getClaims().then(({ data }) => {
      setIsLoggedIn(!!data?.claims);
    });
  }, []);

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
            <BrandLogo />
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
          <Separator className="my-2" />
          <Link
            href={isLoggedIn ? "/account/orders" : "/auth/login"}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
          >
            <IconUser className="size-4" />
            {isLoggedIn ? "My Account" : "Sign In"}
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
