import { Finance } from 'financejs'

export const calculateCagr = ({initialValue, finalValue, years}:{initialValue: number, finalValue: number, years: number}) =>{
    const fn = new Finance();
    return fn.CAGR(initialValue, finalValue, years);
}
