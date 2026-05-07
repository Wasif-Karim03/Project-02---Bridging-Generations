import { HandDrawnUnderline } from "@/components/motif/HandDrawnUnderline";
import { Avatar } from "@/components/ui/Avatar";
import type { DonorProfile } from "@/lib/content/donorProfiles";

type DonorProfileCardProps = {
  profile: DonorProfile;
};

export function DonorProfileCard({ profile }: DonorProfileCardProps) {
  const joinYear = profile.joinedDate ? new Date(profile.joinedDate).getFullYear() : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-5">
        <Avatar src={profile.photoUrl ?? undefined} name={profile.displayName} size="lg" />
        <div className="flex flex-col gap-1">
          <div className="relative inline-block">
            <h1 className="text-display-2 text-ink">{profile.displayName}</h1>
            <HandDrawnUnderline className="block h-[0.22em] w-full text-accent" />
          </div>
          {joinYear ? (
            <p className="text-meta uppercase tracking-[0.1em] text-ink-2">
              Donor since {joinYear}
            </p>
          ) : null}
        </div>
      </div>
      {profile.message?.trim() ? (
        <blockquote className="max-w-[52ch] border-l-2 border-accent pl-4">
          <p className="text-body-lg text-ink-2">&ldquo;{profile.message}&rdquo;</p>
        </blockquote>
      ) : null}
    </div>
  );
}
