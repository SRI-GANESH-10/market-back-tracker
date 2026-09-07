// xirr ships no types and there is no @types/xirr.
declare module 'xirr' {
  /** Throws on degenerate cashflows or non-convergence. Returns a fraction. */
  export default function xirr(
    transactions: { amount: number; when: Date }[],
    options?: { guess?: number }
  ): number
}
