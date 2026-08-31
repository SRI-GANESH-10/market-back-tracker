// financejs ships XIRR at runtime but omits it from its bundled .d.ts.
import 'financejs'

declare module 'financejs' {
  interface Finance {
    /** IRR for cash flows at irregular intervals. Returns a percentage, e.g. 14.11 */
    XIRR(cashFlows: number[], dates: Date[], guess?: number): number
  }
}
