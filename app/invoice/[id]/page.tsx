import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getInvoiceData } from "@/app/admin/orders/actions";
import { InvoiceDocument } from "@/components/invoice-document";
import { InvoicePrintButton } from "@/components/invoice-print-button";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getInvoiceData(id).catch(() => null);
  return {
    title: data ? `Invoice ${data.order.order_number} | Hobby Bangladesh` : "Invoice",
  };
}

export default async function InvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Auth + admin gate (clean redirect, avoids /admin/orders → /auth/login chain).
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();
  if (!authData?.claims) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", authData.claims.sub)
    .single();
  if (profile?.role !== "admin") redirect("/auth/login");

  const data = await getInvoiceData(id);
  if (!data) redirect(`/admin/orders/${id}`);

  return (
    <div className="invoice-root min-h-screen p-6">
      <InvoicePrintButton />
      <InvoiceDocument data={data} />
    </div>
  );
}