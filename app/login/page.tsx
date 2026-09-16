import Link from "next/link";
import { auth } from "@/auth";
import { GuestBrowsePanel } from "@/components/guest-browse";
import { loginAction } from "@/lib/actions";
import { loginNextLinks, loginNextNotice, loginNextShows } from "@/lib/login-next";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Log in",
  description: "Log in to CareProof.",
  path: "/login",
  noIndex: true,
});

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; callbackUrl?: string }>;
}) {
  const query = await searchParams;
  const session = await auth();
  const showLoginNext = loginNextShows({ isFamily: session?.user?.role === "FAMILY" });
  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-3xl font-semibold text-ink">Log in</h1>
      <p className="mt-2 text-sm text-stone-500">
        Demo family: family@careproof.com.au · Demo carer: carer@careproof.com.au · Password: CareProof123!
      </p>
      {query.error ? <p className="mt-4 text-sm text-clay">Those details did not match.</p> : null}
      <form action={loginAction} className="mt-6 space-y-4 rounded-2xl border border-line bg-card p-5">
        <input type="hidden" name="callbackUrl" value={query.callbackUrl ?? "/dashboard"} />
        <label className="block text-sm">
          Email
          <input name="email" type="email" required className="mt-1 w-full rounded-lg border border-line px-3 py-2" />
        </label>
        <label className="block text-sm">
          Password
          <input name="password" type="password" required className="mt-1 w-full rounded-lg border border-line px-3 py-2" />
        </label>
        <button className="w-full rounded-xl bg-teal py-2.5 font-medium text-white" type="submit">
          Log in
        </button>
      </form>
      <p className="mt-4 text-sm">
        New here? <Link href="/register" className="text-teal">Create an account</Link>
      </p>
      {showLoginNext ? (
        <div className="mt-6 rounded-xl bg-sage p-3 text-sm">
          <p>{loginNextNotice()}</p>
          <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            {loginNextLinks().map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="font-medium text-teal hover:underline">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <GuestBrowsePanel />
      )}
    </div>
  );
}
