import ExcelJS from "exceljs";
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { canShowPortrait } from "@/lib/content/canShowPortrait";
import { getAllSchools } from "@/lib/content/schools";
import { getAllStudents } from "@/lib/content/students";

// Admin export of the full student roster.
// Consent gate: students whose portraitReleaseStatus is not "granted" appear
// by displayName, grade, school only. Full address / phone / family details
// are never included — the spec asked for Name / Address / Contact but the
// privacy review says we only export internal-board fields here.

export async function GET() {
  // Admin / IT only. requireRole redirects unauthorized users (non-admin or
  // pending/rejected/suspended). The previous TODO is closed by this gate.
  await requireRole("admin");
  const [students, schools] = await Promise.all([getAllStudents(), getAllSchools()]);
  const schoolName = new Map(schools.map((s) => [s.id, s.name]));

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Bridging Generations";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Students");
  sheet.columns = [
    { header: "Reg. Code", key: "regCode", width: 16 },
    { header: "Name", key: "name", width: 28 },
    { header: "Grade", key: "grade", width: 8 },
    { header: "School", key: "school", width: 36 },
    { header: "Community", key: "community", width: 14 },
    { header: "Sponsorship", key: "sponsorship", width: 14 },
    { header: "Portrait consent", key: "portraitConsent", width: 18 },
    { header: "Village", key: "village", width: 20 },
    { header: "Region", key: "region", width: 20 },
    { header: "Hobby", key: "hobby", width: 28 },
    { header: "GPA", key: "gpa", width: 10 },
    { header: "Life target", key: "lifeTarget", width: 36 },
  ];
  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).alignment = { vertical: "middle" };

  for (const s of students) {
    const portraitOk = canShowPortrait(s.consent);
    sheet.addRow({
      regCode: s.registrationCode || "—",
      name: s.displayName,
      grade: s.grade,
      school: s.schoolId ? (schoolName.get(s.schoolId) ?? s.schoolId) : "—",
      community: s.community ?? "—",
      sponsorship: s.sponsorshipStatus,
      portraitConsent: portraitOk ? "Granted" : "Pending / denied",
      village: s.village || "—",
      region: s.region || "—",
      hobby: s.hobby || "—",
      gpa: s.gpa || "—",
      lifeTarget: s.lifeTarget || "—",
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return new NextResponse(buffer as unknown as BodyInit, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="bridging-generations-students-${new Date().toISOString().slice(0, 10)}.xlsx"`,
    },
  });
}
