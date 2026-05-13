import { PullQuote } from "@/components/content/PullQuote";
import type { SuccessStory } from "@/lib/content/successStories";

type PullQuotePanelProps = {
  story: SuccessStory;
};

export function PullQuotePanel({ story }: PullQuotePanelProps) {
  return (
    <section className="bg-ground-3 px-4 py-16 sm:px-6 lg:px-[6%] lg:py-24">
      <div className="mx-auto max-w-[65ch]">
        <PullQuote
          quote={story.pullQuote}
          cite={
            <>
              {story.subjectName}
              {story.subjectRole ? ` · ${story.subjectRole}` : ""}
            </>
          }
        />
      </div>
    </section>
  );
}
