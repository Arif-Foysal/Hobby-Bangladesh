import { notFound, redirect } from "next/navigation";
import { getProductBySlug } from "../../actions";
import { ProductLandingPage } from "@/components/product-landing-page";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product Not Found" };
  return {
    title: `${product.name} | Hobby Bangladesh`,
    description: product.short_desc ?? product.description?.slice(0, 160),
  };
}

export default async function ProductLandingPageRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const hasLandingPage =
    product.landing_page_enabled && product.landing_page_sections &&
    Object.keys(product.landing_page_sections).length > 0;

  if (!hasLandingPage) {
    redirect(`/products/${slug}`);
  }

  return <ProductLandingPage product={product} />;
}
