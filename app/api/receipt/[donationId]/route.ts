import { renderToBuffer } from "@react-pdf/renderer";
import { NextResponse } from "next/server";
import { MOCK_DONATIONS } from "@/lib/content/donationsMock";
import { getSiteSettings } from "@/lib/content/siteSettings";
import { type ReceiptData, ReceiptDocument } from "@/lib/pdf/receipt";

// Per-donation PDF receipt. In preview mode (no DB) we use the mock donation
// rows; in Phase 5 this reads from the donations table and verifies the
// requesting user owns the donation.

export async function GET(_req: Request, { params }: { params: Promise<{ donationId: string }> }) {
  const { donationId } = await params;
  // Strip any ".pdf" suffix so /api/receipt/abc.pdf works as a download URL.
  const cleanId = donationId.replace(/\.pdf$/i, "");

  // TODO (Phase 5): replace MOCK_DONATIONS with a Drizzle query scoped to
  // the requesting user. Today it's preview-only.
  const donation = MOCK_DONATIONS.find((d) => d.id === cleanId);
  if (!donation) {
    return NextResponse.json({ error: "Donation not found." }, { status: 404 });
  }

  const siteSettings = await getSiteSettings();
  const ein =
    siteSettings.ein && !siteSettings.ein.startsWith("[CONFIRM:")
      ? siteSettings.ein
      : "[Pending — apply via IRS for 501(c)(3) determination]";

  const targetLabel = donation.studentSlug
    ? `Sponsorship for student: ${donation.studentSlug}`
    : donation.projectSlug
      ? `Project: ${donation.projectSlug}`
      : "General fund";

  const data: ReceiptData = {
    donationId: cleanId,
    donorName: "Donor (preview)",
    donorEmail: "",
    amountUSD: donation.amountCents / 100,
    recurring: donation.recurring,
    occurredAt: donation.occurredAt,
    dedicationText: donation.dedicationText ?? undefined,
    targetLabel,
    orgName: siteSettings.orgName,
    orgAddress: siteSettings.mailingAddress,
    ein,
  };

  // ReceiptDocument returns a <Document> element directly; calling it as a
  // plain function avoids the JSX-in-.ts limitation and gives renderToBuffer
  // exactly the element type it expects.
  const docElement = ReceiptDocument({ data });
  const buffer = await renderToBuffer(docElement);
  return new NextResponse(buffer as unknown as BodyInit, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="bridging-generations-receipt-${cleanId}.pdf"`,
    },
  });
}
