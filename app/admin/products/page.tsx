import Link from "next/link";
import Image from "next/image";
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
import { getAdminProducts } from "./actions";
import { getCategories } from "../categories/actions";
import { DeleteProductButton } from "./delete-button";
import { ToggleProductActiveButton } from "./toggle-button";
import { DataTableToolbar } from "@/components/admin/data-table-toolbar";
import { DataTablePagination } from "@/components/admin/data-table-pagination";
import { IconPlus, IconPencil } from "@tabler/icons-react";

export const metadata = { title: "Products | Admin | Hobby Bangladesh" };

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const search = typeof params.search === "string" ? params.search : undefined;
  const status = typeof params.status === "string" ? params.status : undefined;
  const category = typeof params.category === "string" ? params.category : undefined;
  const sort = typeof params.sort === "string" ? params.sort : "newest";
  const page = typeof params.page === "string" ? parseInt(params.page) : 1;
  const perPage = typeof params.perPage === "string" ? parseInt(params.perPage) : 20;

  const [{ products, total, totalPages }, categories] = await Promise.all([
    getAdminProducts({ search, status, category, sort, page, perPage }),
    getCategories(),
  ]);

  const categoryFilterOptions = categories.map((c) => ({
    label: c.name,
    value: c.id,
  }));

  return (
    <>
      <div className="flex items-center justify-between px-4 lg:px-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Products</h2>
          <p className="text-muted-foreground">
            {total} product{total !== 1 ? "s" : ""} in your catalog.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">
            <IconPlus className="mr-2 size-4" />
            Add Product
          </Link>
        </Button>
      </div>

      <div className="px-4 lg:px-6">
        <DataTableToolbar
          searchPlaceholder="Search by name, SKU, or slug..."
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
              key: "category",
              label: "Category",
              options: categoryFilterOptions,
            },
            {
              key: "sort",
              label: "Sort By",
              options: [
                { label: "Newest First", value: "newest" },
                { label: "Oldest First", value: "oldest" },
                { label: "Price: Low → High", value: "price_asc" },
                { label: "Price: High → Low", value: "price_desc" },
                { label: "Name: A → Z", value: "name_asc" },
                { label: "Name: Z → A", value: "name_desc" },
                { label: "Stock: Low → High", value: "stock_asc" },
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
                <TableHead className="w-[60px]">Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                    {search ? "No products match your search." : "No products yet."}
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => {
                  const image =
                    Array.isArray(product.images) && product.images.length > 0
                      ? product.images[0]
                      : null;
                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        {image?.url ? (
                          <Image
                            src={image.url}
                            alt={product.name}
                            width={40}
                            height={40}
                            className="rounded-md object-cover"
                          />
                        ) : (
                          <div className="flex size-10 items-center justify-center rounded-md bg-muted text-xs text-muted-foreground">
                            N/A
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="hover:underline"
                        >
                          {product.name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {product.categories?.name ?? "—"}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {product.sku ?? "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        ৳ {product.price.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={
                            product.stock_qty === 0
                              ? "text-destructive font-medium"
                              : product.stock_qty < 10
                                ? "text-yellow-600 font-medium"
                                : ""
                          }
                        >
                          {product.stock_qty}
                        </span>
                      </TableCell>
                      <TableCell>
                        <ToggleProductActiveButton
                          id={product.id}
                          isActive={product.is_active}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/admin/products/${product.id}/edit`}>
                              <IconPencil className="size-4" />
                            </Link>
                          </Button>
                          <DeleteProductButton id={product.id} name={product.name} />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
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
