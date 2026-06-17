import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AddressForm } from "../address-form";

export const metadata = { title: "Add Address | Hobby Bangladesh" };

export default async function NewAddressPage() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();
  if (!authData?.claims) redirect("/auth/login");

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-bold">Add Address</h2>
      <AddressForm />
    </div>
  );
}
