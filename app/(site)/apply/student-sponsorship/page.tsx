import { redirect } from "next/navigation";

// Legacy: the standalone student-sponsorship application form is superseded
// by the auth-gated /student-signup flow. Keep this URL alive as a 307
// redirect so any old links / search results route the visitor to the new
// entry. The unused _components/ + actions.ts under this directory can be
// deleted once a few months of referrers drop to zero.

export default function StudentSponsorshipLegacyRedirect() {
  redirect("/student-signup");
}
