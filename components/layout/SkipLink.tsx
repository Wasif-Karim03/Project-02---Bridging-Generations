export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-accent focus:px-4 focus:py-2 focus:text-[19px] focus:font-bold focus:leading-none focus:text-white focus:outline-2 focus:outline-offset-[3px] focus:outline-accent-2"
    >
      Skip to main content
    </a>
  );
}
