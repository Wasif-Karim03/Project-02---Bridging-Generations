# Site content coverage — what the `/developer` editor can and can't edit

Audited every public page + the global nav/footer + the translation files. The
editor edits the **CMS (Keystatic)**. The site also has copy and a few images
baked into the **code** and the **translation files** — the editor can't reach
those until they're moved into the CMS (a code change per item).

---

## ✅ Fully editable today (all CMS-backed)

Everything that is real, changing content is already editable in `/developer`:

| Editor section | Drives these pages |
| --- | --- |
| Home stats & hero | home big numbers + hero headline/eyebrow/subhead |
| Site settings | org name, mission, vision, EIN, address, emails, phone/WhatsApp, social links, footer tagline, shared microcopy |
| Students / Schools / Teachers | /students, /students/[name], /schools/[name] data + portraits |
| Projects | /projects cards + hero images |
| Team members (board/mentors) | /about team, /mentors people + portraits |
| Gallery | /gallery photos + captions |
| Blog posts / Success stories / Activities | those pages' articles, bodies, cover images |
| Testimonials | testimonial quotes + photos site-wide |
| Donor profiles | /donors/[name] pages |
| Donate / Contact / Donors / Donation journey pages | their headlines, intros, FAQs, notes, year timeline |
| Projects / Scholarships / Students page text | rules, eligibility, overviews, spotlight band |
| Privacy / Terms | full policy bodies |

So: **people, photos, numbers, stories, contact details, and the main page text
bodies are all editable.** That's the stuff that actually changes.

---

## ❌ Not editable yet (lives in code / translation files)

These are mostly **fixed page furniture** — section headings, slogans, button
labels — that rarely changes. Three categories:

### 1. Hardcoded copy in the page code (the largest group)
Per page, the parts NOT in the CMS:

- **Home:** the rotating hero carousel slides, section eyebrows/headlines ("Our mission", "Our projects", "Gallery", testimonial headline), the bottom "Join us / Sponsor a child" call-to-action panel.
- **About:** hero eyebrow/headline/body, "Our Mission"/"Our Vision" labels, the Transparency + Governance + Leadership section headings/intros, bottom CTA panel.
- **Mission & Vision page:** the entire page (all copy is in translation files).
- **Mentors:** almost the whole page (hero, "how it works" steps, CTA).
- **Students / Projects / Schools / Scholarships:** the hero titles, section eyebrows ("About this school", "Teachers", "Students", "Overview", "Eligibility"), and the bottom CTA panel on each.
- **Donate / Thank-you / Donors / Contact:** section labels ("Give", "Other ways to give", "Pass it on", "Reach out", "Send a message"), form field labels, trust-strip text, CTA panels.
- **Activities / Testimonials / Success stories:** hero eyebrow/title/description + CTA panel.
- **Apply pages** (mentor / scholarship): all hero + description copy.
- **404 page:** the whole "somewhere in the Hill Tracts" message + the suggested links.

### 2. Translation files (`messages/en.json`, `bn.json`)
~140 strings across 10 sections: **nav** labels, **footer** link labels/headings, **mission-vision** (whole page), **blog/gallery** hero + filter labels, **donation-journey** hero labels, **students** directory filters, and **common** UI words. These are editable in principle but live outside the CMS.

### 3. Static hero images (fixed file paths, not CMS image fields)
Only ~5, but they're prominent:
- `/home-hero.jpg`, `/home-mission.jpg` (home + about + mission-vision heroes)
- `/activity-visit.jpg` (mentors hero)
- `/donors-hero.jpg` (donation-journey hero)
- `/project-scholarship.jpg` (scholarships hero)

---

## Why this is the case
The site was built with most "chrome" text written directly into the page code
and translation files, and only the *data* (students, projects, etc.) and the
main page bodies put into the CMS. The editor was built to cover the CMS, so it
matches the CMS exactly — but the CMS was never meant to hold the section
headings, slogans, and hero images. Making those editable means moving each one
into the CMS and pointing the page at it.
