import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ProductImage } from "@/lib/database/types";

export function ProductCard({
  name,
  slug,
  price,
  compareAt,
  images,
}: {
  name: string;
  slug: string;
  price: number;
  compareAt: number | null;
  images: ProductImage[];
}) {
  const image = images.length > 0 ? images[0] : null;

  return (
    <Link href={`/products/${slug}`} className="group">
      <Card className="overflow-hidden transition-shadow hover:shadow-md">
        <div className="relative aspect-square overflow-hidden bg-muted">
          {image?.url ? (
            <Image
              src={image.url}
              alt={name}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-muted-foreground">
              No image
            </div>
          )}
          {compareAt && compareAt > price && (
            <Badge className="absolute left-2 top-2" variant="destructive">
              {Math.round(((compareAt - price) / compareAt) * 100)}% OFF
            </Badge>
          )}
        </div>
        <CardContent className="p-3">
          <h3 className="truncate text-sm font-medium">{name}</h3>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-semibold">৳ {price.toLocaleString()}</span>
            {compareAt && compareAt > price && (
              <span className="text-sm text-muted-foreground line-through">
                ৳ {compareAt.toLocaleString()}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
