"use server";

import { redirect } from "next/navigation";
import type { StudentApplicationState } from "@/app/student-signup/details/actions";
import { getDb, isDbConfigured } from "@/db/client";
import { studentRegistrations } from "@/db/schema";
import { getCurrentDbUser, requireRole } from "@/lib/auth";
import { sendEmail } from "@/lib/forms/server";
import { isNextControlFlowError } from "@/lib/nextControlFlow";
import { studentCodeForUuid } from "@/lib/student/studentCode";

// A mentor registers a student on the student's behalf. Same questions as the
// public /student-signup flow, but NO account is created — we persist a
// `student_registrations` row with applicantUserId = null. From there it flows
// through the exact same path as a self-registered student: it shows in the
// admin Applications queue, and once approved it auto-publishes to /students.

const MAX_PHOTO_BYTES = 4 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function field(formData: FormData, name: string, max: number): string {
  return String(formData.get(name) ?? "")
    .trim()
    .slice(0, max);
}

async function readPhoto(
  formData: FormData,
): Promise<{ data: string; mime: string } | { error: string } | null> {
  const photo = formData.get("photo");
  if (!(photo instanceof File) || photo.size === 0) return null;
  if (photo.size > MAX_PHOTO_BYTES) {
    return { error: "Photo is larger than 4MB. Please use a smaller image." };
  }
  if (!ALLOWED_PHOTO_TYPES.has(photo.type)) {
    return { error: "Photo must be a JPG, PNG, or WebP image." };
  }
  const buf = Buffer.from(await photo.arrayBuffer());
  return { data: buf.toString("base64"), mime: photo.type };
}

export async function mentorRegisterStudentAction(
  _prev: StudentApplicationState | null,
  formData: FormData,
): Promise<StudentApplicationState> {
  try {
    await requireRole("mentor");

    const studentName = field(formData, "studentName", 120);
    const gender = field(formData, "gender", 20);
    const dateOfBirth = field(formData, "dateOfBirth", 40);
    const ethnicity = field(formData, "ethnicity", 80);
    const isOrphan = formData.get("isOrphan") === "yes" || formData.get("isOrphan") === "on";
    const fatherName = field(formData, "fatherName", 120);
    const motherName = field(formData, "motherName", 120);
    const parentsContact = field(formData, "parentsContact", 40);
    const village = field(formData, "village", 200);
    const postOffice = field(formData, "postOffice", 160);
    const policeStation = field(formData, "policeStation", 160);
    const district = field(formData, "district", 120);
    const grade = field(formData, "grade", 40);
    const currentRollNo = field(formData, "currentRollNo", 60);
    const formerRollNo = field(formData, "formerRollNo", 60);
    const totalStudents = field(formData, "totalStudents", 40);
    const school = field(formData, "school", 200);
    const fatherProfession = field(formData, "fatherProfession", 160);
    const motherProfession = field(formData, "motherProfession", 160);
    const familyIncome = field(formData, "familyIncome", 80);
    const purpose = field(formData, "purpose", 2000);
    const requiredAmount = field(formData, "requiredAmount", 60);
    const amountNature = field(formData, "amountNature", 20);
    const perInstallment = field(formData, "perInstallment", 60);
    const durationValue = field(formData, "durationValue", 40);
    const durationUnit = field(formData, "durationUnit", 20);
    const guardianName = field(formData, "guardianName", 120);
    const guardianPhone = field(formData, "guardianPhone", 40);
    const guardianAddress = field(formData, "guardianAddress", 2000);
    const phone = field(formData, "phone", 40);
    const email = field(formData, "email", 255);
    const message = field(formData, "message", 4000);
    const declarationAccepted =
      formData.get("declaration") === "yes" || formData.get("declaration") === "on";

    const requiredFields: Array<[string, string]> = [
      ["Full name", studentName],
      ["Gender", gender],
      ["Date of birth", dateOfBirth],
      ["Ethnicity", ethnicity],
      ["Father's name", fatherName],
      ["Mother's name", motherName],
      ["Parents' contact", parentsContact],
      ["Village / area", village],
      ["Post office", postOffice],
      ["Police station / upazila", policeStation],
      ["District", district],
      ["Class", grade],
      ["Current roll no.", currentRollNo],
      ["Total students in class", totalStudents],
      ["School / institute", school],
      ["Father's profession", fatherProfession],
      ["Mother's profession", motherProfession],
      ["Family monthly income", familyIncome],
      ["Purpose", purpose],
      ["Required amount", requiredAmount],
      ["Payment type", amountNature],
      ["Guardian's name", guardianName],
      ["Guardian's contact", guardianPhone],
      ["Guardian's address", guardianAddress],
      ["Student contact", phone],
      ["Email", email],
    ];
    const missing = requiredFields.find(([, value]) => !value);
    if (missing) return { ok: false, error: `${missing[0]} is required.` };

    if (amountNature === "installments") {
      if (!perInstallment) return { ok: false, error: "Per installment is required." };
      if (!durationValue) return { ok: false, error: "Duration is required." };
    }
    if (!declarationAccepted) {
      return { ok: false, error: "Please confirm the declaration before submitting." };
    }

    const photo = await readPhoto(formData);
    if (photo && "error" in photo) return { ok: false, error: photo.error };
    if (!photo) return { ok: false, error: "A passport-style photo is required." };

    const composedAddress =
      [village, postOffice, policeStation, district].filter(Boolean).join(", ") || "—";

    if (!isDbConfigured()) {
      redirect("/dashboard/mentor/register-student?ok=1");
    }

    // No student account is created — the row stands alone (applicantUserId
    // null). Generate the registration id up front so the auto registration
    // number is derived from it.
    const regId = crypto.randomUUID();
    const studentCode = studentCodeForUuid(regId);
    const mentor = await getCurrentDbUser();

    const db = getDb();
    try {
      await db.insert(studentRegistrations).values({
        id: regId,
        applicantUserId: null,
        registrationNo: studentCode,
        studentName,
        gender: gender || null,
        dateOfBirth: dateOfBirth || null,
        ethnicity: ethnicity || null,
        isOrphan,
        fatherName: fatherName || null,
        motherName: motherName || null,
        parentsContact: parentsContact || null,
        fatherProfession: fatherProfession || null,
        motherProfession: motherProfession || null,
        village: village || null,
        postOffice: postOffice || null,
        policeStation: policeStation || null,
        district: district || null,
        address: composedAddress,
        grade,
        currentRollNo: currentRollNo || null,
        formerRollNo: formerRollNo || null,
        totalStudents: totalStudents || null,
        school,
        familyIncome: familyIncome || null,
        purpose: purpose || null,
        requiredAmount: requiredAmount || null,
        amountNature: amountNature || null,
        perInstallment: perInstallment || null,
        durationValue: durationValue || null,
        durationUnit: durationUnit || null,
        guardianName: guardianName || "—",
        guardianPhone: guardianPhone || parentsContact || null,
        guardianAddress: guardianAddress || null,
        phone: phone || null,
        email: email || null,
        message: message || null,
        studentSignature: "Declaration accepted",
        photoData: photo.data,
        photoMimeType: photo.mime,
      });
    } catch (err) {
      console.error("[mentor/register-student] insert failed", err);
      return { ok: false, error: "Could not save the student. Please try again." };
    }

    // Best-effort board notification — never blocks the registration.
    const orgEmail = process.env.RESEND_FROM_EMAIL ?? "contact@bridginggenerations.org";
    await sendEmail({
      to: orgEmail,
      subject: `New student registered by a mentor · ${studentName} (${studentCode})`,
      text: [
        `${studentName} was registered by mentor ${mentor?.displayName ?? mentor?.email ?? "(unknown)"}.`,
        "",
        `Student ID: ${studentCode}`,
        `Class: ${grade}`,
        `School: ${school}`,
        `Guardian: ${guardianName || "—"}${guardianPhone ? ` · ${guardianPhone}` : ""}`,
        `Required amount: ${requiredAmount || "—"}`,
        "",
        "Review in the admin queue: https://brigen.org/dashboard/admin",
      ].join("\n"),
    }).catch(() => {});

    redirect("/dashboard/mentor/register-student?ok=1");
  } catch (err) {
    if (isNextControlFlowError(err)) throw err;
    console.error("[mentor/register-student] failed", err);
    return { ok: false, error: err instanceof Error ? err.message : "Could not register student." };
  }
}
