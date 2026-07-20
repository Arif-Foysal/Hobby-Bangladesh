import { getLocations } from "../actions";
import { LocationForm } from "../location-form";

export default async function NewLocationPage() {
  const locations = await getLocations();
  return <LocationForm parents={locations} />;
}