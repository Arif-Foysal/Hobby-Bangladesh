import { getProduct } from "../../actions";
import { getCategories } from "../../../categories/actions";
import { ProductForm } from "../../product-form";
import { notFound } from "next/navigation";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories] = await Promise.all([getProduct(id), getCategories()]);

  if (!product) notFound();

  return (
    <ProductForm
      product={{
        ...product,
        images: Array.isArray(product.images) ? product.images : [],
      }}
      categories={categories}
    />
  );
}
