import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BrandLogo } from "@/components/brand-logo";
import { getStoreSetting } from "@/lib/supabase/store";
import { IconCircleCheck, IconPackage } from "@tabler/icons-react";

export const metadata = {
  title: "Order Confirmed | Hobby Bangladesh",
};

import { ConfettiOnMount } from "@/components/confetti";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const params = await searchParams;
  const orderNumber = params.order;
  const branding = await getStoreSetting("branding");
  const logoUrl = branding?.logo_url ?? null;

  return (
    <div className="flex min-h-screen flex-col">
      <ConfettiOnMount />
      <header className="mx-auto flex w-full max-w-7xl items-center px-4 py-4 lg:px-6">
        <BrandLogo logoUrl={logoUrl} />
      </header>
      <div className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center gap-6 px-4 py-24 text-center">
        <IconCircleCheck className="size-16 text-success" />
        <h1 className="font-display text-3xl font-bold">Order Confirmed!</h1>
        <p className="text-muted-foreground">
          Thank you for your order. We&apos;ll start processing it right away.
        </p>

        {orderNumber && (
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-sm">Order Number</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-mono font-bold">{orderNumber}</p>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-3">
          <Button asChild>
            <Link href="/account/orders">
              <IconPackage />
              View Orders
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
