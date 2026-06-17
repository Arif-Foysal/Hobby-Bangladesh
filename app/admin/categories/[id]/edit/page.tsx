import { getCategory, getCategories } from "../../actions";
import { CategoryForm } from "../../category-form";
import { notFound } from "next/navigation";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [category, categories] = await Promise.all([
    getCategory(id),
    getCategories(),
  ]);

  if (!category) notFound();

  return <CategoryForm category={category} categories={categories} />;
}
