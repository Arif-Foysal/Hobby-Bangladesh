import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { getStoreSetting } from "@/lib/supabase/store";
import { BrandLogo } from "./brand-logo";

export async function SiteFooter() {
  const storeInfo = await getStoreSetting("store");
  const storeName = storeInfo?.name ?? "Hobby Bangladesh";

  return (
    <footer className="border-t bg-muted/50">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <BrandLogo />
            <p className="mt-2 text-sm text-muted-foreground">
              Your destination for hobby products in Bangladesh.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold">Shop</h4>
            <nav className="mt-2 flex flex-col gap-2">
              <Link href="/products" className="text-sm text-muted-foreground hover:text-foreground">
                All Products
              </Link>
            </nav>
          </div>

          <div>
            <h4 className="text-sm font-semibold">Account</h4>
            <nav className="mt-2 flex flex-col gap-2">
              <Link href="/account/orders" className="text-sm text-muted-foreground hover:text-foreground">
                My Orders
              </Link>
              <Link href="/account/addresses" className="text-sm text-muted-foreground hover:text-foreground">
                Addresses
              </Link>
              <Link href="/cart" className="text-sm text-muted-foreground hover:text-foreground">
                Cart
              </Link>
            </nav>
          </div>

          <div>
            <h4 className="text-sm font-semibold">Contact</h4>
            <div className="mt-2 flex flex-col gap-2 text-sm text-muted-foreground">
              {storeInfo?.email && <p>{storeInfo.email}</p>}
              {storeInfo?.phone && <p>{storeInfo.phone}</p>}
              {storeInfo?.address && <p>{storeInfo.address}</p>}
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        <p className="text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} {storeName}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
