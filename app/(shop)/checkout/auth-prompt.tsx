"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { IconLogin, IconUserPlus } from "@tabler/icons-react";

export function CheckoutAuthPrompt() {
  return (
    <div className="mx-auto mt-8 max-w-md">
      <Card>
        <CardHeader className="text-center">
          <CardTitle>Sign in to continue</CardTitle>
          <CardDescription>
            You need an account to place an order. Your cart items will be preserved.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button asChild size="lg" className="w-full">
            <Link href="/auth/login?redirect=/checkout">
              <IconLogin />
              Sign In
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full">
            <Link href="/auth/sign-up?redirect=/checkout">
              <IconUserPlus />
              Create Account
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
