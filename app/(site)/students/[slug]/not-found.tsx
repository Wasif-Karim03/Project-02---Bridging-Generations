import { Link } from "next-view-transitions";

export default function StudentNotFound() {
  return (
    <main className="bg-ground px-4 py-24 sm:px-6 lg:px-[6%] lg:py-32">
      <div className="mx-auto flex max-w-[640px] flex-col gap-6 border-t border-hairline pt-12">
        <p className="text-meta uppercase tracking-[0.12em] text-ink-2">Student not found</p>
        <h1 className="text-balance text-display-2 text-ink">
          That student isn't in the directory.
        </h1>
        <p className="max-w-[44ch] text-body-lg text-ink-2">
          The roster changes as students enrol and graduate. The directory of currently sponsored
          students lives at{" "}
          <Link href="/students" className="text-accent underline">
            /students
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
