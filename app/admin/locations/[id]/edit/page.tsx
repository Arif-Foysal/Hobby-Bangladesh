import { notFound } from "next/navigation";
import { getLocation, getLocations } from "../../actions";
import { LocationForm } from "../../location-form";

export default async function EditLocationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [location, locations] = await Promise.all([
    getLocation(id),
    getLocations(),
  ]);

  if (!location) notFound();

  return <LocationForm location={location} parents={locations} />;
}