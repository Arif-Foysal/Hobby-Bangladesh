import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@/components/ui/table";

export function ProductSpecs({
  attributes,
}: {
  attributes: Record<string, string[]>;
}) {
  const entries = Object.entries(attributes);
  if (entries.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-12 lg:px-6">
      <h2 className="font-display text-2xl font-bold tracking-tight">
        Specifications
      </h2>
      <div className="mt-6 overflow-hidden rounded-xl border">
        <Table>
          <TableBody>
            {entries.map(([key, values]) => (
              <TableRow key={key}>
                <TableHead className="w-40 font-medium text-foreground">
                  {key}
                </TableHead>
                <TableCell>{values.join(", ")}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
