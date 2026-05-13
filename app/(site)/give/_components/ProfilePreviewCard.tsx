"use client";

import { Avatar } from "@/components/ui/Avatar";

type ProfilePreviewCardProps = {
  name: string;
  photoUrl: string;
  message: string;
  isAnonymous: boolean;
};

export function ProfilePreviewCard({
  name,
  photoUrl,
  message,
  isAnonymous,
}: ProfilePreviewCardProps) {
  const displayName = isAnonymous ? "Anonymous" : name || "Your name";
  const validPhoto = photoUrl && /^https?:\/\/.+/.test(photoUrl) ? photoUrl : undefined;

  return (
    <div className="flex flex-col gap-6 border border-hairline bg-ground-2 p-6">
      <p className="text-meta uppercase tracking-[0.1em] text-ink-2">Profile preview</p>
      <div className="flex items-center gap-4">
        <Avatar src={validPhoto} name={isAnonymous ? undefined : displayName} size="lg" />
        <div className="flex flex-col gap-1">
          <p className="text-heading-4 text-ink">{displayName}</p>
          <p className="text-meta text-ink-2">Donor</p>
        </div>
      </div>
      {!isAnonymous && message.trim() ? (
        <blockquote className="border-l-2 border-accent pl-4">
          <p className="text-body text-ink-2">&ldquo;{message}&rdquo;</p>
        </blockquote>
      ) : (
        <p className="text-meta italic text-ink-2">
          {isAnonymous
            ? "Anonymous donors are not shown publicly."
            : "Add an optional message above to show it here."}
        </p>
      )}
    </div>
  );
}
