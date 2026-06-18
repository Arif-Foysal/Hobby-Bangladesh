import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAdminCategories } from "./actions";
import { DataTableToolbar } from "@/components/admin/data-table-toolbar";
import { DataTablePagination } from "@/components/admin/data-table-pagination";
import { IconPlus, IconPencil } from "@tabler/icons-react";
import { DeleteCategoryButton } from "./delete-button";
import { ToggleActiveButton } from "./toggle-button";

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

  const { categories, total, totalPages } = await getAdminCategories({
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
            {total} categor{total !== 1 ? "ies" : "y"} total.
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

      <Card className="mx-4 lg:mx-6">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Parent</TableHead>
                <TableHead>Sort</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    {search ? "No categories match your search." : "No categories yet."}
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((cat) => (
                  <TableRow key={cat.id}>
                    <TableCell className="font-medium">{cat.name}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {cat.slug}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {(cat as { parent?: { name: string } }).parent?.name ?? "—"}
                    </TableCell>
                    <TableCell>{cat.sort_order}</TableCell>
                    <TableCell>
                      <ToggleActiveButton id={cat.id} isActive={cat.is_active} />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/admin/categories/${cat.id}/edit`}>
                            <IconPencil className="size-4" />
                          </Link>
                        </Button>
                        <DeleteCategoryButton id={cat.id} name={cat.name} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="px-4 lg:px-6">
          <DataTablePagination totalPages={totalPages} totalItems={total} />
        </div>
      )}
    </>
  );
}
