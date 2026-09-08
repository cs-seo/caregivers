import Link from "next/link";
import { GuestBrowsePanel } from "@/components/guest-browse";
import { registerAction } from "@/lib/actions";
import { parseRegisterRole } from "@/lib/for-carers";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Create an account",
  description: "Join CareProof as a family or a carer.",
  path: "/register",
  noIndex: true,
});

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; role?: string }>;
}) {
  const query = await searchParams;
  const role = parseRegisterRole(query.role);
  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-3xl font-semibold text-ink">Join CareProof</h1>
      {query.error === "exists" ? <p className="mt-3 text-sm text-clay">That email is already registered.</p> : null}
      <form action={registerAction} className="mt-6 space-y-4 rounded-2xl border border-line bg-card p-5">
        <label className="block text-sm">
          Full name
          <input name="name" required className="mt-1 w-full rounded-lg border border-line px-3 py-2" />
        </label>
        <label className="block text-sm">
          Email
          <input name="email" type="email" required className="mt-1 w-full rounded-lg border border-line px-3 py-2" />
        </label>
        <label className="block text-sm">
          Password (8+ characters)
          <input name="password" type="password" minLength={8} required className="mt-1 w-full rounded-lg border border-line px-3 py-2" />
        </label>
        <fieldset className="text-sm">
          <legend className="mb-2">I am</legend>
          <label className="mr-4">
            <input type="radio" name="role" value="FAMILY" defaultChecked={role === "FAMILY"} /> Family hiring care
          </label>
          <label>
            <input type="radio" name="role" value="CAREGIVER" defaultChecked={role === "CAREGIVER"} /> A carer
          </label>
        </fieldset>
        <button className="w-full rounded-xl bg-teal py-2.5 font-medium text-white" type="submit">
          Create account
        </button>
      </form>
      <p className="mt-4 text-sm">
        Already registered? <Link href="/login" className="text-teal">Log in</Link>
      </p>
      <GuestBrowsePanel />
    </div>
  );
}
