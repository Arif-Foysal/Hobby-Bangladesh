import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatMoney } from "@/lib/utils";
import type { InvoiceData } from "@/lib/database/types";

const STATUS_TONE: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-violet-100 text-violet-800",
  shipped: "bg-cyan-100 text-cyan-800",
  delivered: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-rose-100 text-rose-800",
};

const PAYMENT_TONE: Record<string, string> = {
  unpaid: "bg-amber-100 text-amber-800",
  paid: "bg-emerald-100 text-emerald-800",
  refunded: "bg-blue-100 text-blue-800",
  failed: "bg-rose-100 text-rose-800",
};

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-BD", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

function InvoiceLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
    </p>
  );
}

export function InvoiceDocument({ data }: { data: InvoiceData }) {
  const { order, items, customer, store, currency } = data;
  const issuedDate = formatDate(order.created_at);
  const statusTone = STATUS_TONE[order.status] ?? "bg-muted text-muted-foreground";
  const paymentTone = PAYMENT_TONE[order.payment_status] ?? "bg-muted text-muted-foreground";
  const addr = order.shipping_address;

  return (
    <div className="invoice-page mx-auto w-full max-w-[210mm] bg-white text-foreground shadow-xl print:shadow-none">
      <div className="flex flex-col gap-10 p-[14mm] print:p-0">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="flex items-center gap-3">
            {store.logo_url ? (
              <Image
                src={store.logo_url}
                alt={store.name}
                width={180}
                height={48}
                className="h-11 w-auto object-contain"
              />
            ) : (
              <div className="flex items-center gap-3 rounded-xl bg-primary px-4 py-2.5 text-primary-foreground">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-6"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
                <span className="font-display text-lg font-bold tracking-tight">
                  {store.name}
                </span>
              </div>
            )}
          </div>

          <div className="text-right">
            <h1 className="font-display text-4xl font-bold tracking-tight text-primary">
              INVOICE
            </h1>
            <p className="mt-1 font-mono text-sm font-medium">{order.order_number}</p>
            <div className="mt-2 flex items-center justify-end gap-2">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusTone}`}
              >
                {order.status}
              </span>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${paymentTone}`}
              >
                {order.payment_status}
              </span>
            </div>
          </div>
        </div>

        {/* Parties */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="rounded-lg border bg-card p-4">
            <InvoiceLabel>Bill To</InvoiceLabel>
            <p className="mt-1 font-semibold">
              {customer.name ?? addr.name ?? "—"}
              {customer.is_guest && (
                <span className="ml-2 text-xs font-normal italic text-muted-foreground">
                  (guest)
                </span>
              )}
            </p>
            {customer.email && <p className="text-sm">{customer.email}</p>}
            {customer.phone && <p className="text-sm">{customer.phone}</p>}
          </div>

          <div className="rounded-lg border bg-card p-4">
            <InvoiceLabel>Ship To</InvoiceLabel>
            <p className="mt-1 font-semibold">{addr.name || customer.name || "—"}</p>
            {addr.address && <p className="text-sm">{addr.address}</p>}
            {(addr.area || addr.city || addr.division) && (
              <p className="text-sm">
                {[addr.area, addr.city, addr.division].filter(Boolean).join(", ")}
              </p>
            )}
            {addr.phone && <p className="text-sm">{addr.phone}</p>}
          </div>
        </div>

        {/* Meta strip */}
        <div className="grid grid-cols-2 gap-4 border-y py-3 sm:grid-cols-4">
          <div>
            <InvoiceLabel>Issued</InvoiceLabel>
            <p className="text-sm font-medium">{issuedDate}</p>
          </div>
          <div>
            <InvoiceLabel>Payment</InvoiceLabel>
            <p className="text-sm font-medium">
              {order.payment_method === "sslcommerz" ? "Online" : "Cash on Delivery"}
            </p>
          </div>
          {order.transaction_id && (
            <div>
              <InvoiceLabel>Transaction</InvoiceLabel>
              <p className="truncate font-mono text-xs">{order.transaction_id}</p>
            </div>
          )}
          <div className="sm:text-right">
            <InvoiceLabel>Store</InvoiceLabel>
            <p className="text-sm font-medium">{store.name}</p>
            {store.phone && <p className="text-xs text-muted-foreground">{store.phone}</p>}
          </div>
        </div>

        {/* Items table */}
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted text-left">
                <th className="w-10 px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  #
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Description
                </th>
                <th className="w-16 px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Qty
                </th>
                <th className="w-28 px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Unit Price
                </th>
                <th className="w-32 px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr
                  key={item.id}
                  className={i % 2 === 0 ? "bg-card" : "bg-muted"}
                >
                  <td className="px-4 py-3 align-top text-muted-foreground">{i + 1}</td>
                  <td className="px-4 py-3 font-medium">{item.product_name}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{item.quantity}</td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {formatMoney(item.unit_price, currency)}
                  </td>
                  <td className="px-4 py-3 text-right font-medium tabular-nums">
                    {formatMoney(item.total, currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals + notes */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="flex flex-col gap-3">
            {order.notes && (
              <div>
                <InvoiceLabel>Notes</InvoiceLabel>
                <div className="mt-1 whitespace-pre-wrap rounded-lg border bg-card p-3 text-sm">
                  {order.notes}
                </div>
              </div>
            )}
            {order.coupon_code && (
              <div>
                <InvoiceLabel>Coupon Applied</InvoiceLabel>
                <p className="mt-1 font-mono text-sm font-medium">{order.coupon_code}</p>
              </div>
            )}
          </div>

          <div className="sm:ml-auto sm:w-72">
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="tabular-nums">{formatMoney(order.subtotal, currency)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="tabular-nums">
                  {order.shipping_cost === 0
                    ? "Free"
                    : formatMoney(order.shipping_cost, currency)}
                </span>
              </div>
              {order.discount > 0 && (
                <div className="flex items-center justify-between text-primary">
                  <span className="flex items-center gap-2">
                    Discount
                    {order.coupon_code && (
                      <Badge variant="secondary" className="font-mono">
                        {order.coupon_code}
                      </Badge>
                    )}
                  </span>
                  <span className="tabular-nums">
                    − {formatMoney(order.discount, currency)}
                  </span>
                </div>
              )}
              <Separator />
              <div className="flex items-center justify-between">
                <span className="font-semibold">Total</span>
                <span className="font-display text-2xl font-bold tabular-nums text-primary">
                  {formatMoney(order.total, currency)}
                </span>
              </div>
              {store.tax_rate > 0 && (
                <p className="pt-1 text-[10px] text-muted-foreground">
                  Includes {store.tax_label ?? "VAT"} @ {store.tax_rate}%
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 border-t pt-6 text-center">
          <p className="font-display text-lg font-semibold">
            Thank you for shopping with {store.name}!
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {store.email && <span>{store.email} · </span>}
            {store.phone && <span>{store.phone} · </span>}
            {store.address && <span>{store.address}</span>}
            {store.whatsapp_number && <span> · WhatsApp: {store.whatsapp_number}</span>}
          </p>
          <p className="mt-3 text-[10px] text-muted-foreground">
            This is a system-generated invoice. No signature required.
          </p>
        </div>
      </div>
    </div>
  );
}