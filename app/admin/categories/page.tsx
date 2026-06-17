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
import { getCategories } from "./actions";
import { IconPlus, IconPencil } from "@tabler/icons-react";
import { DeleteCategoryButton } from "./delete-button";
import { ToggleActiveButton } from "./toggle-button";

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <>
      <div className="flex items-center justify-between px-4 lg:px-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Categories</h2>
          <p className="text-muted-foreground">
            Manage your product categories.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/categories/new">
            <IconPlus />
            Add Category
          </Link>
        </Button>
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
                    No categories yet. Create your first one.
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((cat) => {
                  const parent = categories.find((c) => c.id === cat.parent_id);
                  return (
                    <TableRow key={cat.id}>
                      <TableCell className="font-medium">{cat.name}</TableCell>
                      <TableCell className="text-muted-foreground">{cat.slug}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {parent?.name ?? "—"}
                      </TableCell>
                      <TableCell>{cat.sort_order}</TableCell>
                      <TableCell>
                        <ToggleActiveButton id={cat.id} isActive={cat.is_active} />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/admin/categories/${cat.id}/edit`}>
                              <IconPencil />
                            </Link>
                          </Button>
                          <DeleteCategoryButton id={cat.id} name={cat.name} />
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
