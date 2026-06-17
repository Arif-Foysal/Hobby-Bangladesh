import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMyAddresses } from "@/app/account/actions";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IconMapPin } from "@tabler/icons-react";
import { DeleteAddressButton } from "./delete-button";

export const metadata = { title: "Addresses | Hobby Bangladesh" };

export default async function AddressesPage() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();
  if (!authData?.claims) redirect("/auth/login");

  const addresses = await getMyAddresses();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Addresses</h2>
      </div>

      {addresses.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-12 text-center">
          <IconMapPin className="size-12 text-muted-foreground" />
          <p className="text-muted-foreground">
            No saved addresses. Addresses will be saved during checkout.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((addr) => (
            <Card key={addr.id}>
              <CardContent className="flex flex-col gap-2 p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{addr.label}</span>
                  {addr.is_default && <Badge variant="secondary">Default</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">{addr.name}</p>
                <p className="text-sm text-muted-foreground">
                  {addr.address}, {addr.area}, {addr.city}, {addr.division}
                </p>
                <p className="text-sm text-muted-foreground">{addr.phone}</p>
                <DeleteAddressButton id={addr.id} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
