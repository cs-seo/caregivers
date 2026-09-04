import Link from "next/link";
import { auth, signOut } from "@/auth";
import { SITE_NAME } from "@/lib/constants";

const nav = [
  { href: "/caregivers", label: "Find carers" },
  { href: "/care-requests", label: "Care requests" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/trust-and-safety", label: "Trust" },
];

export async function SiteHeader() {
  const session = await auth();

  return (
    <header className="border-b border-line bg-card/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-4">
        <Link href="/" className="flex items-baseline gap-2 no-underline">
          <span className="text-xl font-semibold tracking-tight text-teal">{SITE_NAME}</span>
          <span className="hidden text-xs text-stone-500 sm:inline">Australia</span>
        </Link>
        <nav className="hidden items-center gap-5 text-sm text-stone-700 md:flex">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-teal">
              {item.label}
            </Link>
          ))}
        </nav>
        <details className="relative md:hidden">
          <summary className="cursor-pointer list-none rounded-full border border-line px-3 py-1.5 text-sm text-stone-700">
            Menu
          </summary>
          <div className="absolute right-0 z-20 mt-2 w-48 rounded-xl border border-line bg-card p-3 text-sm shadow-lg">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className="block rounded-lg px-2 py-1.5 hover:bg-sage">
                {item.label}
              </Link>
            ))}
          </div>
        </details>
        <div className="flex items-center gap-3 text-sm">
          {session?.user ? (
            <>
              <Link href="/dashboard" className="text-stone-700 hover:text-teal">
                Dashboard
              </Link>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button className="text-stone-500 hover:text-teal" type="submit">
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="text-stone-700 hover:text-teal">
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-teal px-4 py-2 font-medium text-white no-underline hover:bg-teal-deep"
              >
                Join
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
