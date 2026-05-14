// Thin re-export so admin page imports stay local. Phase 5/6 will swap
// the mock data here for real Drizzle reads (applications, donor_profiles,
// donations).
export {
  APPLICATION_KIND_LABEL,
  APPLICATION_STATUS_LABEL,
  type ApplicationRow,
  type ApplicationStatus,
  type DonorListRow,
  MOCK_APPLICATIONS,
  MOCK_DONOR_LIST,
} from "@/lib/content/applicationsMock";
export { formatDonationAmount } from "@/lib/content/donationsMock";
