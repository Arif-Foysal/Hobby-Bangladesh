import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getAdminCategories } from "./actions";
import { DataTableToolbar } from "@/components/admin/data-table-toolbar";
import { IconPlus } from "@tabler/icons-react";
import { CategorySortableTable } from "./category-sortable-table";

export const metadata = { title: "Categories | Admin | Hobby Bangladesh" };

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const search = typeof params.search === "string" ? params.search : undefined;
  const status = typeof params.status === "string" ? params.status : undefined;
  const sort = typeof params.sort === "string" ? params.sort : "sort_order";
  const page = typeof params.page === "string" ? parseInt(params.page) : 1;

  const { categories, total } = await getAdminCategories({
    search,
    status,
    sort,
    page,
    perPage: 50,
  });

  return (
    <>
      <div className="flex items-center justify-between px-4 lg:px-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Categories</h2>
          <p className="text-muted-foreground">
            {total} categor{total !== 1 ? "ies" : "y"} total. Drag rows to reorder.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/categories/new">
            <IconPlus className="mr-2 size-4" />
            Add Category
          </Link>
        </Button>
      </div>

      <div className="px-4 lg:px-6">
        <DataTableToolbar
          searchPlaceholder="Search by name or slug..."
          filters={[
            {
              key: "status",
              label: "Status",
              options: [
                { label: "Active", value: "active" },
                { label: "Inactive", value: "inactive" },
              ],
            },
            {
              key: "sort",
              label: "Sort",
              options: [
                { label: "Sort Order", value: "sort_order" },
                { label: "Name: A → Z", value: "name_asc" },
                { label: "Name: Z → A", value: "name_desc" },
                { label: "Newest First", value: "newest" },
              ],
            },
          ]}
        />
      </div>

      <div className="px-4 lg:px-6">
        <CategorySortableTable categories={categories} />
      </div>
    </>
  );
}
