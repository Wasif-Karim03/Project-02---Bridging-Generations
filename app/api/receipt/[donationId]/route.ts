import { renderToBuffer } from "@react-pdf/renderer";
import { NextResponse } from "next/server";
import { isDbConfigured } from "@/db/client";
import { getCurrentDbUser } from "@/lib/auth";
import { MOCK_DONATIONS } from "@/lib/content/donationsMock";
import { getSiteSettings } from "@/lib/content/siteSettings";
import { getStudentBySlug } from "@/lib/content/students";
import { getDonationById } from "@/lib/db/queries/donations";
import { getUserById } from "@/lib/db/queries/users";
import { donorCodeForUuid } from "@/lib/donor/donorCode";
import { type ReceiptData, ReceiptDocument } from "@/lib/pdf/receipt";

// Per-donation PDF receipt. In preview mode (no DB) we use the mock donation
// rows so the dashboard is demoable. In DB mode we look up the real donation
// and require the requesting user to be either the donor or an admin.

export async function GET(_req: Request, { params }: { params: Promise<{ donationId: string }> }) {
  const { donationId } = await params;
  // Strip any ".pdf" suffix so /api/receipt/abc.pdf works as a download URL.
  const cleanId = donationId.replace(/\.pdf$/i, "");

  const usingMockData = !isDbConfigured();
  const requester = usingMockData ? null : await getCurrentDbUser();

  let donorName = "Donor";
  let donorEmail = "";
  let donorCode: string | undefined;
  let amountCents: number;
  let recurring: boolean;
  let occurredAt: Date;
  let dedicationText: string | null | undefined;
  let studentSlug: string | null;
  let projectSlug: string | null;

  if (usingMockData) {
    const donation = MOCK_DONATIONS.find((d) => d.id === cleanId);
    if (!donation) {
      return NextResponse.json({ error: "Donation not found." }, { status: 404 });
    }
    donorName = "Donor (preview)";
    amountCents = donation.amountCents;
    recurring = donation.recurring;
    occurredAt = donation.occurredAt;
    dedicationText = donation.dedicationText;
    studentSlug = donation.studentSlug;
    projectSlug = donation.projectSlug;
  } else {
    const donation = await getDonationById(cleanId);
    if (!donation) {
      return NextResponse.json({ error: "Donation not found." }, { status: 404 });
    }
    if (!requester) {
      return NextResponse.json({ error: "Sign in to download a receipt." }, { status: 401 });
    }
    // Enforce ownership — donors can only download their own receipts.
    // Admin/IT can download any (for board reconciliation + reissue requests).
    const isOwner = donation.donorUserId === requester.id;
    const isAdmin = requester.role === "admin" || requester.role === "it";
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Not authorized for this receipt." }, { status: 403 });
    }
    const donorRow = donation.donorUserId ? await getUserById(donation.donorUserId) : null;
    donorName = donorRow?.displayName ?? "Donor";
    donorEmail = donorRow?.email ?? "";
    donorCode = donorRow ? donorCodeForUuid(donorRow.id) : undefined;
    amountCents = donation.amountCents;
    recurring = donation.recurring;
    occurredAt = donation.occurredAt;
    dedicationText = donation.dedicationText;
    studentSlug = donation.studentSlug;
    projectSlug = donation.projectSlug;
  }

  const siteSettings = await getSiteSettings();
  const ein =
    siteSettings.ein && !siteSettings.ein.startsWith("[CONFIRM:")
      ? siteSettings.ein
      : "[Pending — apply via IRS for 501(c)(3) determination]";

  // Resolve a friendly target label using the Keystatic student name when available.
  let targetLabel: string;
  if (studentSlug) {
    const student = await getStudentBySlug(studentSlug);
    targetLabel = `Sponsorship for ${student?.displayName ?? studentSlug}`;
  } else if (projectSlug) {
    targetLabel = `Project: ${projectSlug}`;
  } else {
    targetLabel = "General fund";
  }

  const data: ReceiptData = {
    donationId: cleanId,
    donorCode,
    donorName,
    donorEmail,
    amountUSD: amountCents / 100,
    recurring,
    occurredAt,
    dedicationText: dedicationText ?? undefined,
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
