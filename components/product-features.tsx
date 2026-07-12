import {
  IconRocket,
  IconShieldCheck,
  IconTools,
  IconPackage,
} from "@tabler/icons-react";
import type { ProductFeature } from "@/lib/database/types";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  rocket: IconRocket,
  shield: IconShieldCheck,
  tools: IconTools,
  package: IconPackage,
};

function getIcon(name: string) {
  return iconMap[name] ?? IconRocket;
}

export function ProductFeatures({ features }: { features: ProductFeature[] }) {
  if (!features || features.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-12 lg:px-6">
      <h2 className="font-display text-2xl font-bold tracking-tight">
        Key Features
      </h2>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f, i) => {
          const Icon = getIcon(f.icon);
          return (
            <div
              key={i}
              className="flex flex-col gap-3 rounded-xl border bg-card p-5 transition-shadow hover:shadow-md"
            >
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="size-5 text-primary" />
              </div>
              <h3 className="font-semibold">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {f.text}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
