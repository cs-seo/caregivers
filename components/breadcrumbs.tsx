import Link from "next/link";

export function Breadcrumbs({
  items,
}: {
  items: { name: string; href?: string }[];
}) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6 text-sm text-stone-500">
      <ol className="flex flex-wrap gap-1">
        {items.map((item, index) => (
          <li key={`${item.name}-${index}`} className="flex items-center gap-1">
            {index > 0 && <span aria-hidden>/</span>}
            {item.href ? (
              <Link href={item.href} className="hover:text-teal">
                {item.name}
              </Link>
            ) : (
              <span className="text-stone-700">{item.name}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
