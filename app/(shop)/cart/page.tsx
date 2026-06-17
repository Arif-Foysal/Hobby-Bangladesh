import { CartPageContent } from "./cart-content";

export const metadata = {
  title: "Cart | Hobby Bangladesh",
};

export default function CartPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      <h1 className="text-3xl font-bold tracking-tight">Shopping Cart</h1>
      <CartPageContent />
    </div>
  );
}
