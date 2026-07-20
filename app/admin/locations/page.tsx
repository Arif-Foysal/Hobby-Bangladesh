import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconPencil, IconPlus } from "@tabler/icons-react";
import { getLocations } from "./actions";
import { ToggleActiveButton } from "./toggle-button";
import { DeleteLocationButton } from "./delete-button";

export const metadata = { title: "Locations | Admin | Hobby Bangladesh" };

const TYPE_LABEL: Record<string, string> = {
  division: "Division",
  city: "City",
  area: "Area",
};

export default async function LocationsPage() {
  const locations = await getLocations();

  // Group: divisions (sorted), then each division's children grouped by type.
  const divisions = locations.filter((l) => l.type === "division");
  const citiesByParent = new Map<string, typeof locations>();
  const areasByParent = new Map<string, typeof locations>();
  for (const l of locations) {
    if (l.type === "city" && l.parent_id) {
      const arr = citiesByParent.get(l.parent_id) ?? [];
      arr.push(l);
      citiesByParent.set(l.parent_id, arr);
    } else if (l.type === "area" && l.parent_id) {
      const arr = areasByParent.get(l.parent_id) ?? [];
      arr.push(l);
      areasByParent.set(l.parent_id, arr);
    }
  }

  return (
    <>
      <div className="flex items-center justify-between px-4 lg:px-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Locations</h2>
          <p className="text-muted-foreground">
            {divisions.length} divisions · {locations.length} locations total.
            Delivery charges apply at checkout based on the selected division.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/locations/new">
            <IconPlus className="mr-2 size-4" />
            Add Location
          </Link>
        </Button>
      </div>

      {locations.length === 0 ? (
        <div className="mx-4 mt-6 rounded-lg border-2 border-dashed border-muted-foreground/25 p-12 text-center text-muted-foreground lg:mx-6">
          <p className="font-medium">No locations yet</p>
          <p className="text-sm">
            Add a division to start configuring delivery charges.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6 px-4 lg:px-6">
          {divisions.map((division) => {
            const cities = citiesByParent.get(division.id) ?? [];
            const allAreas = locations.filter(
              (l) => l.type === "area" && cities.some((c) => c.id === l.parent_id)
            );
            return (
              <div
                key={division.id}
                className="overflow-hidden rounded-lg border"
              >
                <div className="flex items-center justify-between gap-3 border-b bg-muted/40 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">Division</Badge>
                    <span className="font-medium">{division.name}</span>
                    <span className="text-sm text-muted-foreground">
                      ৳ {division.delivery_charge.toLocaleString()} delivery
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ToggleActiveButton
                      id={division.id}
                      isActive={division.is_active}
                    />
                    <Button asChild variant="ghost" size="icon">
                      <Link href={`/admin/locations/${division.id}/edit`}>
                        <IconPencil className="size-4" />
                      </Link>
                    </Button>
                    <DeleteLocationButton
                      id={division.id}
                      name={division.name}
                    />
                  </div>
                </div>

                {cities.length === 0 && allAreas.length === 0 ? (
                  <div className="px-4 py-4 text-sm text-muted-foreground">
                    No cities or areas under this division. Customers can still
                    select it and pay ৳ {division.delivery_charge.toLocaleString()}.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>City / Area</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="w-32">
                          Delivery Charge
                        </TableHead>
                        <TableHead className="w-24">Status</TableHead>
                        <TableHead className="w-24 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cities.map((city) => {
                        const childAreas =
                          areasByParent.get(city.id) ?? [];
                        return (
                          <CityRow
                            key={city.id}
                            location={city}
                            childAreas={childAreas}
                          />
                        );
                      })}
                      {allAreas
                        .filter((a) => !a.parent_id || !cities.some((c) => c.id === a.parent_id))
                        .map((area) => (
                          <TableRow key={area.id} className="bg-muted/20">
                            <TableCell className="pl-10">{area.name}</TableCell>
                            <TableCell>
                              <Badge variant="outline">Area</Badge>
                            </TableCell>
                            <TableCell>
                              ৳ {area.delivery_charge.toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <ToggleActiveButton
                                id={area.id}
                                isActive={area.is_active}
                              />
                            </TableCell>
                            <TableCell className="text-right">
                              <Button asChild variant="ghost" size="icon">
                                <Link href={`/admin/locations/${area.id}/edit`}>
                                  <IconPencil className="size-4" />
                                </Link>
                              </Button>
                              <DeleteLocationButton
                                id={area.id}
                                name={area.name}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

function CityRow({
  location,
  childAreas,
}: {
  location: {
    id: string;
    name: string;
    type: string;
    delivery_charge: number;
    is_active: boolean;
  };
  childAreas: {
    id: string;
    name: string;
    type: string;
    delivery_charge: number;
    is_active: boolean;
  }[];
}) {
  return (
    <>
      <TableRow>
        <TableCell className="font-medium">{location.name}</TableCell>
        <TableCell>
          <Badge variant="secondary">{TYPE_LABEL[location.type] ?? location.type}</Badge>
        </TableCell>
        <TableCell>৳ {location.delivery_charge.toLocaleString()}</TableCell>
        <TableCell>
          <ToggleActiveButton
            id={location.id}
            isActive={location.is_active}
          />
        </TableCell>
        <TableCell className="text-right">
          <Button asChild variant="ghost" size="icon">
            <Link href={`/admin/locations/${location.id}/edit`}>
              <IconPencil className="size-4" />
            </Link>
          </Button>
          <DeleteLocationButton
            id={location.id}
            name={location.name}
          />
        </TableCell>
      </TableRow>
      {childAreas.map((area) => (
        <TableRow key={area.id} className="bg-muted/20">
          <TableCell className="pl-10">{area.name}</TableCell>
          <TableCell>
            <Badge variant="outline">Area</Badge>
          </TableCell>
          <TableCell>৳ {area.delivery_charge.toLocaleString()}</TableCell>
          <TableCell>
            <ToggleActiveButton
              id={area.id}
              isActive={area.is_active}
            />
          </TableCell>
          <TableCell className="text-right">
            <Button asChild variant="ghost" size="icon">
              <Link href={`/admin/locations/${area.id}/edit`}>
                <IconPencil className="size-4" />
              </Link>
            </Button>
            <DeleteLocationButton
              id={area.id}
              name={area.name}
            />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}