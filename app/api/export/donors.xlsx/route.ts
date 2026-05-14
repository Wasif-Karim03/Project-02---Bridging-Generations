import ExcelJS from "exceljs";
import { NextResponse } from "next/server";
import { MOCK_DONOR_LIST } from "@/lib/content/applicationsMock";

// Admin export of donors. In preview mode (no DB) uses mock list. Phase 5
// replaces with Drizzle reads from donor_profiles + a donations aggregate.

export async function GET() {
  const donors = MOCK_DONOR_LIST;

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Bridging Generations";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Donors");
  sheet.columns = [
    { header: "Legal name", key: "legalName", width: 36 },
    { header: "Public initials", key: "publicInitials", width: 18 },
    { header: "Email", key: "email", width: 32 },
    { header: "Lifetime (USD)", key: "lifetime", width: 16 },
    { header: "Gifts", key: "count", width: 8 },
    { header: "Anonymous on /donors", key: "anonymous", width: 22 },
  ];
  sheet.getRow(1).font = { bold: true };

  for (const d of donors) {
    sheet.addRow({
      legalName: d.legalName,
      publicInitials: d.publicInitials,
      email: d.email,
      lifetime: (d.lifetimeCents / 100).toFixed(2),
      count: d.donationCount,
      anonymous: d.anonymous ? "Yes" : "No",
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return new NextResponse(buffer as unknown as BodyInit, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="bridging-generations-donors-${new Date().toISOString().slice(0, 10)}.xlsx"`,
    },
  });
}
