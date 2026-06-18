import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Separator } from "@/components/ui/separator";
import { IconPackage, IconMapPin, IconUser } from "@tabler/icons-react";

const navItems = [
  { label: "Orders", href: "/account/orders", icon: IconPackage },
  { label: "Addresses", href: "/account/addresses", icon: IconMapPin },
];

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();
  if (!authData?.claims) redirect("/auth/login");

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
          <IconUser className="size-5 text-primary" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">My Account</h1>
          <p className="text-sm text-muted-foreground">Manage your orders, addresses, and settings.</p>
        </div>
      </div>
      <Separator className="my-6" />
      <div className="grid gap-8 md:grid-cols-[220px_1fr]">
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div>{children}</div>
      </div>
    </div>
  );
}
