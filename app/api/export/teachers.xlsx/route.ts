import ExcelJS from "exceljs";
import { NextResponse } from "next/server";
import { getAllSchools } from "@/lib/content/schools";
import { getAllTeachers } from "@/lib/content/teachers";

// Admin export of the teacher panel.

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

export async function GET() {
  const [teachers, schools] = await Promise.all([getAllTeachers(), getAllSchools()]);
  const schoolName = new Map(schools.map((s) => [s.id, s.name]));

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Bridging Generations";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Teachers");
  sheet.columns = [
    { header: "Name", key: "name", width: 28 },
    { header: "School", key: "school", width: 36 },
    { header: "Major / Subject", key: "major", width: 24 },
    { header: "Education", key: "education", width: 36 },
    { header: "Started teaching", key: "started", width: 18 },
    { header: "Notes", key: "notes", width: 50 },
  ];
  sheet.getRow(1).font = { bold: true };

  for (const t of teachers) {
    let started = "—";
    if (t.startedTeaching) {
      const d = new Date(t.startedTeaching);
      started = Number.isNaN(d.getTime()) ? t.startedTeaching : dateFormatter.format(d);
    }
    sheet.addRow({
      name: t.name,
      school: t.schoolId ? (schoolName.get(t.schoolId) ?? t.schoolId) : "—",
      major: t.major || "—",
      education: t.educationStatus || "—",
      started,
      notes: t.bio || "—",
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return new NextResponse(buffer as unknown as BodyInit, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="bridging-generations-teachers-${new Date().toISOString().slice(0, 10)}.xlsx"`,
    },
  });
}
