import Link from "next/link";
import Image from "next/image";

export function BrandLogo({
  logoUrl,
  className,
}: {
  logoUrl?: string | null;
  className?: string;
}) {
  return (
    <Link href="/" className={`flex items-center gap-2 ${className ?? ""}`}>
      {logoUrl ? (
        <Image
          src={logoUrl}
          alt="Hobby Bangladesh"
          width={140}
          height={32}
          priority
          className="h-7 w-auto object-contain sm:h-8"
        />
      ) : (
        <>
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-4"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="text-base font-bold tracking-tight">
            Hobby<span className="text-primary">BD</span>
          </span>
        </>
      )}
    </Link>
  );
}