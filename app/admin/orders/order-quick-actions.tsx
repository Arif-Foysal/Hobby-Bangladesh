"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateOrderStatus, updatePaymentStatus } from "./actions";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { fireConfetti } from "@/lib/confetti";

const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const PAYMENT_STATUSES = ["unpaid", "paid", "refunded", "failed"];

export function OrderQuickActions({
  orderId,
  currentStatus,
  currentPaymentStatus,
}: {
  orderId: string;
  currentStatus: string;
  currentPaymentStatus: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [payment, setPayment] = useState(currentPaymentStatus);
  const [statusLoading, setStatusLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  async function handleStatusChange(value: string) {
    setStatus(value);
    setStatusLoading(true);
    const result = await updateOrderStatus(orderId, value);
    setStatusLoading(false);
    if (result?.error) {
      toast.error(result.error);
      setStatus(currentStatus);
    } else {
      toast.success(`Status → ${value}`);
      router.refresh();
    }
  }

  async function handlePaymentChange(value: string) {
    setPayment(value);
    setPaymentLoading(true);
    const result = await updatePaymentStatus(orderId, value);
    setPaymentLoading(false);
    if (result?.error) {
      toast.error(result.error);
      setPayment(currentPaymentStatus);
    } else {
      toast.success(`Payment → ${value}`);
      if (value === "paid") fireConfetti();
      router.refresh();
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Select
        value={status}
        onValueChange={handleStatusChange}
        disabled={statusLoading}
      >
        <SelectTrigger className="h-8 w-[130px] text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {ORDER_STATUSES.map((s) => (
              <SelectItem key={s} value={s} className="text-xs capitalize">
                {s}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      <Select
        value={payment}
        onValueChange={handlePaymentChange}
        disabled={paymentLoading}
      >
        <SelectTrigger className="h-8 w-[130px] text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {PAYMENT_STATUSES.map((s) => (
              <SelectItem key={s} value={s} className="text-xs capitalize">
                {s}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}