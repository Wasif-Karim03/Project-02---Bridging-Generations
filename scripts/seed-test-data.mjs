#!/usr/bin/env node
/**
 * One-shot seed for the multi-role dashboards. Creates a realistic spread
 * of users + related data so the admin / donor / mentor / accountant /
 * media surfaces all have something to render.
 *
 * Env required:
 *   DATABASE_URL — Neon Postgres
 *   CLERK_SECRET_KEY — Clerk Admin API
 *
 * Idempotent: if a Clerk user already exists with the same email, the
 * script reuses it. DB inserts use ON CONFLICT to upsert.
 */
import postgres from "postgres";

const SEED_PASSWORD = "Seed2026KX9pLm3vQwTr"; // shared across all seeded test accounts
const CLERK_KEY = process.env.CLERK_SECRET_KEY;
const DB_URL = process.env.DATABASE_URL;
if (!CLERK_KEY || !DB_URL) {
  console.error("Missing CLERK_SECRET_KEY or DATABASE_URL");
  process.exit(1);
}

const sql = postgres(DB_URL, { max: 1, prepare: false });

// Helpers --------------------------------------------------------------------

async function createClerkUser({ email, firstName, lastName }) {
  // Try to create. If 422 with "form_identifier_exists" we look it up
  // instead (idempotency).
  const create = await fetch("https://api.clerk.com/v1/users", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${CLERK_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email_address: [email],
      password: SEED_PASSWORD,
      first_name: firstName,
      last_name: lastName,
      skip_password_checks: true,
      skip_password_requirement: false,
    }),
  });
  if (create.ok) {
    const data = await create.json();
    return { id: data.id, isNew: true };
  }
  // Look up by email
  const lookup = await fetch(
    `https://api.clerk.com/v1/users?email_address=${encodeURIComponent(email)}`,
    {
      headers: { Authorization: `Bearer ${CLERK_KEY}` },
    },
  );
  if (!lookup.ok) {
    const errBody = await create.text();
    throw new Error(`Clerk create failed: ${errBody}`);
  }
  const list = await lookup.json();
  if (!Array.isArray(list) || list.length === 0) {
    throw new Error(`Could not find existing Clerk user for ${email}`);
  }
  return { id: list[0].id, isNew: false };
}

async function upsertDbUser({ clerkUserId, role, status, email, displayName, phone, studentSlug }) {
  const rows = await sql`
    INSERT INTO users (clerk_user_id, role, status, email, display_name, phone, student_slug)
    VALUES (${clerkUserId}, ${role}, ${status}, ${email}, ${displayName}, ${phone}, ${studentSlug})
    ON CONFLICT (clerk_user_id) DO UPDATE
      SET role = EXCLUDED.role,
          status = EXCLUDED.status,
          email = EXCLUDED.email,
          display_name = EXCLUDED.display_name,
          phone = EXCLUDED.phone,
          student_slug = EXCLUDED.student_slug,
          updated_at = NOW()
    RETURNING id
  `;
  return rows[0].id;
}

// The plan ------------------------------------------------------------------

const USERS = [
  // Admins
  {
    role: "admin",
    status: "active",
    email: "bridginggeneration20+admin2@gmail.com",
    firstName: "Tasnim",
    lastName: "Hossain",
    displayName: "Tasnim Hossain",
    phone: "+8801711111111",
  },
  {
    role: "donor", // pending admin signups start as donors per upsertUserFromClerk
    status: "pending",
    email: "bridginggeneration20+admin-pending@gmail.com",
    firstName: "Pending",
    lastName: "Admin",
    displayName: "Rashed Ali (admin candidate)",
    phone: "+8801722222222",
  },
  // Donors
  {
    role: "donor",
    status: "active",
    email: "bridginggeneration20+donor1@gmail.com",
    firstName: "Lena",
    lastName: "Park",
    displayName: "Lena Park",
    phone: "+12025550101",
    donorProfile: {
      legalName: "Lena S. Park",
      publicInitials: "LP",
      dedicationText: "In memory of my grandmother.",
      anonymous: false,
      address: "1428 Lincoln Ave, Oak Park, IL 60302",
      occupation: "Software engineer",
      newsletter: true,
      preferred_contact: "email",
    },
  },
  {
    role: "donor",
    status: "active",
    email: "bridginggeneration20+donor2@gmail.com",
    firstName: "Aarav",
    lastName: "Mehta",
    displayName: "Aarav Mehta",
    phone: "+447700900123",
    donorProfile: {
      legalName: "Aarav N. Mehta",
      publicInitials: "AM",
      dedicationText: null,
      anonymous: true,
      address: "12 Elm Court, London E14 9XX, UK",
      occupation: "Engineer",
      newsletter: false,
      preferred_contact: "phone",
    },
  },
  {
    role: "donor",
    status: "pending",
    email: "bridginggeneration20+donor-pending@gmail.com",
    firstName: "Maya",
    lastName: "Tanaka",
    displayName: "Maya Tanaka",
    phone: "+819012345678",
  },
  // Students — active two are linked to real Keystatic slugs
  {
    role: "student",
    status: "active",
    email: "bridginggeneration20+student1@gmail.com",
    firstName: "Adhara",
    lastName: "Barua",
    displayName: "Adhara Barua",
    studentSlug: "adhara-barua",
  },
  {
    role: "student",
    status: "active",
    email: "bridginggeneration20+student2@gmail.com",
    firstName: "Anika",
    lastName: "Rahman",
    displayName: "Anika Rahman",
    studentSlug: "anika",
  },
  {
    role: "student",
    status: "pending",
    email: "bridginggeneration20+student-pending@gmail.com",
    firstName: "Joya",
    lastName: "Chowdhury",
    displayName: "Joya Chowdhury",
    studentReg: {
      studentName: "Joya Chowdhury",
      dateOfBirth: "2010-03-12",
      grade: "10",
      school: "Chittagong Govt. High School",
      ethnicity: "Bengali",
      isOrphan: false,
      guardianName: "Faruque Chowdhury",
      guardianRelation: "Father",
      guardianOccupation: "Farmer",
      guardianPhone: "+8801911223344",
      address: "Village Rangamati, Chittagong",
      message: "I want to be a doctor and serve my village.",
      hobby: "Reading",
      lifeTarget: "Become a medical doctor",
    },
  },
  // Mentors
  {
    role: "mentor",
    status: "active",
    email: "bridginggeneration20+mentor1@gmail.com",
    firstName: "Priya",
    lastName: "Iyer",
    displayName: "Priya Iyer",
    phone: "+919876543210",
    mentorApplication: {
      name: "Priya Iyer",
      email: "bridginggeneration20+mentor1@gmail.com",
      country: "India",
      occupation: "High school math teacher",
      educationStatus: "MSc Mathematics",
      subjects: "Math, Science",
      hoursPerWeek: "2-3",
      startTerm: "Spring 2026",
      whyMentor:
        "I want to share my passion for math with students who don't have access to good teachers.",
      status: "approved",
    },
    mentorBio: "Math teacher with 8 years of experience; loves making algebra click.",
    assignments: ["adhara-barua", "anika"],
  },
  {
    role: "donor",
    status: "pending",
    email: "bridginggeneration20+mentor-pending@gmail.com",
    firstName: "Diego",
    lastName: "Alvarez",
    displayName: "Diego Alvarez (mentor candidate)",
    phone: "+34666777888",
    mentorApplication: {
      name: "Diego Alvarez",
      email: "bridginggeneration20+mentor-pending@gmail.com",
      country: "Spain",
      occupation: "University student",
      educationStatus: "BSc Computer Science, year 3",
      subjects: "English, Computer basics",
      hoursPerWeek: "1-2",
      startTerm: "Summer 2026",
      whyMentor: "I had mentors when I was younger and want to give back.",
      status: "submitted",
    },
  },
  // Accountants
  {
    role: "accountant",
    status: "active",
    email: "bridginggeneration20+accountant1@gmail.com",
    firstName: "Riya",
    lastName: "Sen",
    displayName: "Riya Sen",
    phone: "+8801933445566",
    accountantProfile: {
      fullName: "Riya Sen",
      phone: "+8801933445566",
      address: "Dhaka, Bangladesh",
      photoUrl: null,
      startDate: "2026-01-15",
      expectedEndDate: "2026-12-31",
      whyAccountant: "Detail-oriented; volunteered as treasurer for a student club in college.",
    },
  },
  {
    role: "accountant",
    status: "pending",
    email: "bridginggeneration20+accountant-pending@gmail.com",
    firstName: "Lin",
    lastName: "Zhao",
    displayName: "Lin Zhao",
    phone: "+8613888888888",
    accountantProfile: {
      fullName: "Lin Zhao",
      phone: "+8613888888888",
      address: "Shanghai, China",
      photoUrl: null,
      startDate: "2026-04-01",
      expectedEndDate: null,
      whyAccountant: "CPA candidate; want to volunteer my expertise.",
    },
  },
  // Media
  {
    role: "media",
    status: "active",
    email: "bridginggeneration20+media1@gmail.com",
    firstName: "Sara",
    lastName: "Khan",
    displayName: "Sara Khan",
    phone: "+8801955667788",
    mediaProfile: {
      fullName: "Sara Khan",
      phone: "+8801955667788",
      address: "Chittagong, Bangladesh",
      photoUrl: null,
      startDate: "2026-02-01",
      expectedEndDate: null,
      whyMedia: "Photojournalism background; want to document the program's impact.",
    },
    folders: [
      {
        name: "School visit — Feb 2026",
        eventName: "Quarterly partner-school visit",
        eventDate: "2026-02-14",
        description: "Adhara's school + community room.",
        items: [
          {
            kind: "image",
            url: "https://drive.example.com/photo-1.jpg",
            title: "Classroom panorama",
          },
          { kind: "image", url: "https://drive.example.com/photo-2.jpg", title: "Math session" },
          { kind: "link", url: "https://drive.example.com/folder", title: "Full Drive folder" },
        ],
      },
      {
        name: "Year-end gathering 2025",
        eventName: "Year-end donor + student gathering",
        eventDate: "2025-12-20",
        description: "Annual gathering. ~80 attendees.",
        items: [
          { kind: "image", url: "https://drive.example.com/yearend-1.jpg", title: "Group photo" },
        ],
      },
    ],
  },
  {
    role: "media",
    status: "pending",
    email: "bridginggeneration20+media-pending@gmail.com",
    firstName: "Imran",
    lastName: "Hossain",
    displayName: "Imran Hossain",
    phone: "+8801977889900",
    mediaProfile: {
      fullName: "Imran Hossain",
      phone: "+8801977889900",
      address: "Dhaka, Bangladesh",
      photoUrl: null,
      startDate: null,
      expectedEndDate: null,
      whyMedia: "Filmmaker — want to make short documentaries on student stories.",
    },
  },
];

// Execute -------------------------------------------------------------------

async function run() {
  console.log(`Seeding ${USERS.length} users + related data\n`);
  const ctx = {}; // map of email → { dbId, clerkId }

  // Pass 1: users + role-specific profile rows
  for (const u of USERS) {
    process.stdout.write(`  ${u.role.padEnd(10)} ${u.status.padEnd(7)} ${u.email} … `);
    try {
      const clerk = await createClerkUser({
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
      });
      const dbId = await upsertDbUser({
        clerkUserId: clerk.id,
        role: u.role,
        status: u.status,
        email: u.email,
        displayName: u.displayName,
        phone: u.phone ?? null,
        studentSlug: u.studentSlug ?? null,
      });
      ctx[u.email] = { dbId, clerkId: clerk.id, ...u };

      // Per-role profile / application inserts
      if (u.donorProfile) {
        const p = u.donorProfile;
        await sql`
          INSERT INTO donor_profiles (user_id, legal_name, public_initials, dedication_text, anonymous, address, occupation, newsletter_opt_in, preferred_contact_method)
          VALUES (${dbId}, ${p.legalName}, ${p.publicInitials}, ${p.dedicationText}, ${p.anonymous}, ${p.address}, ${p.occupation}, ${p.newsletter}, ${p.preferred_contact})
          ON CONFLICT (user_id) DO UPDATE
            SET legal_name = EXCLUDED.legal_name,
                public_initials = EXCLUDED.public_initials,
                dedication_text = EXCLUDED.dedication_text,
                anonymous = EXCLUDED.anonymous,
                address = EXCLUDED.address,
                occupation = EXCLUDED.occupation,
                newsletter_opt_in = EXCLUDED.newsletter_opt_in,
                preferred_contact_method = EXCLUDED.preferred_contact_method,
                updated_at = NOW()
        `;
      }
      if (u.studentReg) {
        const r = u.studentReg;
        await sql`
          INSERT INTO student_registrations (applicant_user_id, student_name, date_of_birth, grade, school, ethnicity, is_orphan, guardian_name, guardian_relation, guardian_occupation, guardian_phone, address, message, hobby, life_target, status)
          VALUES (${dbId}, ${r.studentName}, ${r.dateOfBirth}, ${r.grade}, ${r.school}, ${r.ethnicity}, ${r.isOrphan}, ${r.guardianName}, ${r.guardianRelation}, ${r.guardianOccupation}, ${r.guardianPhone}, ${r.address}, ${r.message}, ${r.hobby}, ${r.lifeTarget}, 'submitted')
          ON CONFLICT DO NOTHING
        `;
      }
      if (u.mentorApplication) {
        const m = u.mentorApplication;
        const inserted = await sql`
          INSERT INTO mentor_applications (name, email, country, occupation, education_status, subjects, hours_per_week, start_term, why_mentor, status, approved_user_id, approved_at)
          VALUES (${m.name}, ${m.email}, ${m.country}, ${m.occupation}, ${m.educationStatus}, ${m.subjects}, ${m.hoursPerWeek}, ${m.startTerm}, ${m.whyMentor}, ${m.status}, ${m.status === "approved" ? dbId : null}, ${m.status === "approved" ? new Date() : null})
          ON CONFLICT DO NOTHING
          RETURNING id
        `;
        if (m.status === "approved" && inserted[0] && u.mentorBio !== undefined) {
          await sql`
            INSERT INTO mentors (user_id, application_id, bio)
            VALUES (${dbId}, ${inserted[0].id}, ${u.mentorBio ?? null})
            ON CONFLICT (user_id) DO UPDATE SET bio = EXCLUDED.bio
          `;
        }
      }
      if (u.accountantProfile) {
        const a = u.accountantProfile;
        await sql`
          INSERT INTO accountant_profiles (user_id, full_name, phone, address, photo_url, start_date, expected_end_date, why_accountant)
          VALUES (${dbId}, ${a.fullName}, ${a.phone}, ${a.address}, ${a.photoUrl}, ${a.startDate}, ${a.expectedEndDate}, ${a.whyAccountant})
          ON CONFLICT (user_id) DO UPDATE SET updated_at = NOW()
        `;
      }
      if (u.mediaProfile) {
        const m = u.mediaProfile;
        await sql`
          INSERT INTO media_profiles (user_id, full_name, phone, address, photo_url, start_date, expected_end_date, why_media)
          VALUES (${dbId}, ${m.fullName}, ${m.phone}, ${m.address}, ${m.photoUrl}, ${m.startDate}, ${m.expectedEndDate}, ${m.whyMedia})
          ON CONFLICT (user_id) DO UPDATE SET updated_at = NOW()
        `;
      }

      console.log(
        `ok (db=${dbId.slice(0, 8)} clerk=${clerk.id.slice(0, 16)}${clerk.isNew ? " new" : " reused"})`,
      );
    } catch (err) {
      console.log("FAILED:", err.message);
    }
  }

  // Pass 2: mentor assignments + reports + calls (needs ctx)
  const mentor1 = ctx["bridginggeneration20+mentor1@gmail.com"];
  if (mentor1) {
    const [mentorRow] = await sql`SELECT id FROM mentors WHERE user_id = ${mentor1.dbId}`;
    if (mentorRow) {
      const mid = mentorRow.id;
      console.log(`\n  Mentor assignments for ${mentor1.email}…`);
      for (const slug of mentor1.assignments) {
        await sql`
          INSERT INTO mentor_student_assignments (mentor_id, student_slug, assigned_at)
          VALUES (${mid}, ${slug}, NOW())
          ON CONFLICT DO NOTHING
        `;
        console.log(`    assigned → ${slug}`);
      }
      // 2 weekly reports + 2 mentor_calls for one student
      console.log(`  Weekly reports + mentor calls for adhara-barua…`);
      await sql`
        INSERT INTO weekly_reports (mentor_id, student_slug, week_of, attendance, study_notes, action_items)
        VALUES (${mid}, 'adhara-barua', NOW() - INTERVAL '14 days', 'full', 'Working on algebra. Solid week.', 'Continue chapter 3 exercises.'),
               (${mid}, 'adhara-barua', NOW() - INTERVAL '7 days', 'partial', 'Missed Wednesday — school exam.', 'Catch up on missed problem set.')
        ON CONFLICT DO NOTHING
      `;
      await sql`
        INSERT INTO mentor_calls (mentor_id, student_slug, called_at, next_call_due_at, answers, notes)
        VALUES (
          ${mid}, 'adhara-barua',
          NOW() - INTERVAL '14 days', NOW() + INTERVAL '1 day',
          ${{ q1: "Doing well overall.", q2: "Discussed chapter 3.", q3: "No concerns.", q4: "Math competition!" }},
          'Stable progress.'
        ),
        (
          ${mid}, 'adhara-barua',
          NOW() - INTERVAL '2 days', NOW() + INTERVAL '13 days',
          ${{ q1: "Tired but focused.", q2: "Trig basics.", q3: "Late nights revising for exam.", q4: "Wants to enter olympiad." }},
          'Suggested earlier sleep, better study schedule.'
        )
      `;
    }
  }

  // Pass 3: donations attributed to donor1 + donor2
  const donor1 = ctx["bridginggeneration20+donor1@gmail.com"];
  const donor2 = ctx["bridginggeneration20+donor2@gmail.com"];
  if (donor1 && donor2) {
    console.log(`\n  Donations…`);
    await sql`
      INSERT INTO donations (occurred_at, donor_user_id, donor_email, amount_cents, currency, source, status, student_slug, dedication_text)
      VALUES
        (NOW() - INTERVAL '40 days', ${donor1.dbId}, ${donor1.email}, 10000, 'usd', 'stripe', 'succeeded', 'adhara-barua', 'Keep going!'),
        (NOW() - INTERVAL '20 days', ${donor1.dbId}, ${donor1.email}, 5000, 'usd', 'stripe', 'succeeded', 'adhara-barua', null),
        (NOW() - INTERVAL '10 days', ${donor1.dbId}, ${donor1.email}, 7500, 'usd', 'stripe', 'succeeded', 'anika', null),
        (NOW() - INTERVAL '6 days', ${donor2.dbId}, ${donor2.email}, 15000, 'usd', 'stripe', 'succeeded', 'anika', 'Anonymous, in memory.')
    `;
    console.log(`    4 donations created`);
  }

  // Pass 4: manual donation entries (by accountant1)
  const acc1 = ctx["bridginggeneration20+accountant1@gmail.com"];
  if (acc1) {
    console.log(`\n  Manual donation ledger entries…`);
    await sql`
      INSERT INTO manual_donation_entries (recorded_by, occurred_at, donor_email, donor_name, amount_cents, currency, method, student_slug, notes)
      VALUES
        (${acc1.dbId}, NOW() - INTERVAL '30 days', 'asma.malik@example.com', 'Asma Malik', 50000, 'usd', 'Bank transfer', 'adhara-barua', 'Ref: BR-1042'),
        (${acc1.dbId}, NOW() - INTERVAL '25 days', null, 'Cash drop (anonymous)', 8000, 'usd', 'Cash', null, 'Donor preferred anonymous'),
        (${acc1.dbId}, NOW() - INTERVAL '14 days', 'chowdhury.foundation@example.org', 'Chowdhury Foundation', 200000, 'usd', 'Cheque', null, 'Annual grant')
    `;
    console.log(`    3 manual entries created`);
  }

  // Pass 5: media folders + items
  const media1 = ctx["bridginggeneration20+media1@gmail.com"];
  if (media1 && media1.folders) {
    console.log(`\n  Media folders for ${media1.email}…`);
    for (const f of media1.folders) {
      const [folder] = await sql`
        INSERT INTO media_folders (owner_user_id, name, event_name, event_date, description)
        VALUES (${media1.dbId}, ${f.name}, ${f.eventName}, ${f.eventDate}, ${f.description})
        ON CONFLICT DO NOTHING
        RETURNING id
      `;
      if (folder) {
        for (const i of f.items) {
          await sql`
            INSERT INTO media_items (folder_id, uploaded_by, kind, url, title)
            VALUES (${folder.id}, ${media1.dbId}, ${i.kind}, ${i.url}, ${i.title})
          `;
        }
        console.log(`    folder "${f.name}" with ${f.items.length} item(s)`);
      }
    }
  }

  await sql.end({ timeout: 5 });
}

run().catch((e) => {
  console.error("fatal:", e);
  process.exit(1);
});
