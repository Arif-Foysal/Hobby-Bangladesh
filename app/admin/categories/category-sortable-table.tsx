"use client";

import { useState, useId } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { IconPencil, IconGripVertical } from "@tabler/icons-react";
import { toast } from "sonner";
import { updateCategorySortOrders } from "./actions";
import { DeleteCategoryButton } from "./delete-button";
import { ToggleActiveButton } from "./toggle-button";

const PLACEHOLDER_IMG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-family='system-ui' font-size='10'%3ENo%20Img%3C/text%3E%3C/svg%3E";

interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  parent?: { name: string } | null;
}

function SortableRow({
  category,
}: {
  category: CategoryRow;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: category.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      data-dragging={isDragging}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:bg-muted/50 data-[dragging=true]:shadow-md"
    >
      <TableCell className="w-10">
        <button
          {...attributes}
          {...listeners}
          className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted"
        >
          <IconGripVertical className="size-4" />
          <span className="sr-only">Drag to reorder</span>
        </button>
      </TableCell>
      <TableCell>
        <div className="relative size-10 overflow-hidden rounded-md border bg-muted">
          <Image
            src={category.image_url || PLACEHOLDER_IMG}
            alt={category.name}
            fill
            sizes="40px"
            className="object-cover"
          />
        </div>
      </TableCell>
      <TableCell className="font-medium">{category.name}</TableCell>
      <TableCell className="font-mono text-xs text-muted-foreground">
        {category.slug}
      </TableCell>
      <TableCell className="text-muted-foreground">
        {category.parent?.name ?? "—"}
      </TableCell>
      <TableCell>
        <ToggleActiveButton id={category.id} isActive={category.is_active} />
      </TableCell>
      <TableCell>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/admin/categories/${category.id}/edit`}>
              <IconPencil className="size-4" />
            </Link>
          </Button>
          <DeleteCategoryButton id={category.id} name={category.name} />
        </div>
      </TableCell>
    </TableRow>
  );
}

export function CategorySortableTable({
  categories,
}: {
  categories: CategoryRow[];
}) {
  const sortableId = useId();
  const [items, setItems] = useState(categories);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
    useSensor(KeyboardSensor)
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((c) => c.id === active.id);
    const newIndex = items.findIndex((c) => c.id === over.id);
    setItems((prev) => arrayMove(prev, oldIndex, newIndex));
    setDirty(true);
  }

  const handleSave = async () => {
    setSaving(true);
    const result = await updateCategorySortOrders(items.map((c) => c.id));
    setSaving(false);
    if (result.success) {
      toast.success("Category order saved");
      setDirty(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {dirty && (
        <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 px-4 py-2.5">
          <p className="text-sm text-muted-foreground">
            You have unsaved changes to the category order.
          </p>
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Order"}
          </Button>
        </div>
      )}

      <div className="overflow-hidden rounded-lg border">
        <DndContext
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={handleDragEnd}
          sensors={sensors}
          id={sortableId}
        >
          <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10" />
              <TableHead className="w-14" />
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Parent</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  No categories yet.
                </TableCell>
              </TableRow>
            ) : (
              <SortableContext items={items.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                {items.map((cat) => (
                  <SortableRow key={cat.id} category={cat} />
                ))}
              </SortableContext>
            )}
          </TableBody>
          </Table>
        </DndContext>
      </div>
    </div>
  );
}
