import { getCategories } from "../actions";
import { CategoryForm } from "../category-form";

export default async function NewCategoryPage() {
  const categories = await getCategories();

  return <CategoryForm categories={categories} />;
}
