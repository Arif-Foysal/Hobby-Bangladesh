import { notFound } from "next/navigation";
import { getCoupon } from "../../actions";
import { CouponForm } from "../../coupon-form";

export const metadata = { title: "Edit Coupon | Admin | Hobby Bangladesh" };

export default async function EditCouponPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const coupon = await getCoupon(id);
  if (!coupon) notFound();

  return <CouponForm coupon={coupon} />;
}
