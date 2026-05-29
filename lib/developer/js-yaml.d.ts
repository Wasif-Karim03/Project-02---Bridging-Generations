// Minimal ambient types for the transitive `js-yaml` dependency (no @types
// installed, and we don't add deps without sign-off). Covers only what the
// developer editor uses: load() and dump().
declare module "js-yaml" {
  export function load(input: string): unknown;
  export function dump(
    obj: unknown,
    opts?: {
      indent?: number;
      lineWidth?: number;
      noRefs?: boolean;
      sortKeys?: boolean;
      quotingType?: '"' | "'";
      forceQuotes?: boolean;
    },
  ): string;
  const _default: { load: typeof load; dump: typeof dump };
  export default _default;
}
