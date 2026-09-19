import Link from "next/link";
import { SUPPORT_EMAIL } from "@/lib/demo-mode";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Reset password",
  description: "Reset a CareProof account password.",
  path: "/forgot-password",
  noIndex: true,
});

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-3xl font-semibold text-ink">Reset your password</h1>
      <p className="mt-3 text-sm text-stone-600">
        Email {SUPPORT_EMAIL} from the address on your account and we will send a reset link. We do not put reset links
        in this form yet.
      </p>
      <p className="mt-6 text-sm">
        <Link href="/login" className="text-teal">
          Back to log in
        </Link>
        {" · "}
        <Link href="/register" className="text-teal">
          Create an account
        </Link>
      </p>
    </div>
  );
}
