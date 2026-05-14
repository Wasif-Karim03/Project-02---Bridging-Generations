// Mock application queue used by the admin dashboard until the application
// forms (Phase 3) start persisting to Drizzle. The shapes match the schema
// so swapping to real reads is a one-liner.

export type ApplicationStatus =
  | "submitted"
  | "under_review"
  | "approved"
  | "rejected"
  | "withdrawn";

export type ApplicationRow = {
  id: string;
  kind: "scholarship" | "mentor" | "student-sponsorship";
  submittedAt: Date;
  applicantName: string;
  email: string;
  summary: string;
  status: ApplicationStatus;
};

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

export const MOCK_APPLICATIONS: ApplicationRow[] = [
  {
    id: "mock-scholarship-001",
    kind: "scholarship",
    submittedAt: daysAgo(2),
    applicantName: "Rita Chakma",
    email: "rita.example@gmail.com",
    summary: "HSC 1st year applicant, Bandarban district. SSC GPA 4.83.",
    status: "submitted",
  },
  {
    id: "mock-mentor-001",
    kind: "mentor",
    submittedAt: daysAgo(5),
    applicantName: "Dr. Aman Khan",
    email: "aman.example@gmail.com",
    summary: "Math + science, 2 hrs/week, available from Spring 2026.",
    status: "under_review",
  },
  {
    id: "mock-student-001",
    kind: "student-sponsorship",
    submittedAt: daysAgo(8),
    applicantName: "Misty Tanchangya",
    email: "—",
    summary: "Grade 7 student, family income BDT 8,000/mo. Guardian: mother.",
    status: "submitted",
  },
  {
    id: "mock-mentor-002",
    kind: "mentor",
    submittedAt: daysAgo(14),
    applicantName: "Lisa Park",
    email: "lpark.example@gmail.com",
    summary: "English literature, available 1 hr/week, Toronto.",
    status: "approved",
  },
];

export type DonorListRow = {
  id: string;
  legalName: string;
  publicInitials: string;
  email: string;
  lifetimeCents: number;
  donationCount: number;
  anonymous: boolean;
};

export const MOCK_DONOR_LIST: DonorListRow[] = [
  {
    id: "donor-001",
    legalName: "Parna Chowdhury",
    publicInitials: "P.C.",
    email: "—",
    lifetimeCents: 388800,
    donationCount: 22,
    anonymous: true,
  },
  {
    id: "donor-002",
    legalName: "Ashokangkur & Shukla Barua",
    publicInitials: "A.B. & S.B.",
    email: "—",
    lifetimeCents: 240000,
    donationCount: 8,
    anonymous: false,
  },
  {
    id: "donor-003",
    legalName: "Anonymous donor",
    publicInitials: "—",
    email: "—",
    lifetimeCents: 50000,
    donationCount: 4,
    anonymous: true,
  },
];

export const APPLICATION_KIND_LABEL: Record<ApplicationRow["kind"], string> = {
  scholarship: "Scholarship",
  mentor: "Mentor",
  "student-sponsorship": "Student",
};

export const APPLICATION_STATUS_LABEL: Record<ApplicationStatus, string> = {
  submitted: "New",
  under_review: "In review",
  approved: "Approved",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};
