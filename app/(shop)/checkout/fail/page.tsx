import Link from "next/link";
import { Button } from "@/components/ui/button";
import { IconX } from "@tabler/icons-react";

export const metadata = {
  title: "Payment Failed | Hobby Bangladesh",
};

export default function CheckoutFailPage() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center justify-center gap-6 px-4 py-24 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-destructive/10">
        <IconX className="size-8 text-destructive" />
      </div>
      <h1 className="text-3xl font-bold">Payment Failed</h1>
      <p className="text-muted-foreground">
        Your payment could not be processed. Your order has been saved and you
        can retry the payment from your orders page.
      </p>
      <div className="flex gap-3">
        <Button asChild>
          <Link href="/account/orders">View Orders</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/cart">Return to Cart</Link>
        </Button>
      </div>
    </div>
  );
}
