import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Separator } from "@/components/ui/separator";
import { IconPackage, IconMapPin } from "@tabler/icons-react";

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
      <h1 className="text-3xl font-bold tracking-tight">My Account</h1>
      <p className="text-muted-foreground">Manage your orders and settings.</p>
      <Separator className="my-6" />
      <div className="grid gap-8 md:grid-cols-[200px_1fr]">
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
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
