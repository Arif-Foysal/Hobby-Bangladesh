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
import { getProducts } from "./actions";
import { IconPlus, IconPencil } from "@tabler/icons-react";
import { DeleteProductButton } from "./delete-button";
import { ToggleProductActiveButton } from "./toggle-button";

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <>
      <div className="flex items-center justify-between px-4 lg:px-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Products</h2>
          <p className="text-muted-foreground">Manage your product catalog.</p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">
            <IconPlus />
            Add Product
          </Link>
        </Button>
      </div>

      <Card className="mx-4 lg:mx-6">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]">Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    No products yet. Create your first one.
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
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {product.categories?.name ?? "—"}
                      </TableCell>
                      <TableCell>৳ {product.price.toLocaleString()}</TableCell>
                      <TableCell>{product.stock_qty}</TableCell>
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
                              <IconPencil />
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
    </>
  );
}
