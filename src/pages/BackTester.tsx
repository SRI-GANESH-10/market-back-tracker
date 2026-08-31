import { useState } from 'react'
import { NavBar } from '@/components/shared/NavBar'
import { ComboBox } from '@/components/shared/ComboBox'
import { INVESTEMENT_TYPES, MARKETS } from '@/constants/markets'
import { TabSelect } from '@/components/shared/TabSelect'
import { InputLabel } from '@/components/shared/Inputlabel'
import { DateLabel } from '@/components/shared/DateLabel'
import { useMarketCagr } from '@/hooks/useMarketCagr'
import { Button } from '@/components/ui/button'

export const BackTester = () => {
  const [market, setMarket] = useState<string | null>(null);
  const [investmentType, setInvestmentType] = useState<string>('lumpsum');
  const [amount, setAmount] = useState<number | string>(0);
  const [date, setDate] = useState<Date | undefined>(undefined);

  const [submitted, setSubmitted] = useState<{ market: string; date: Date; amount: number } | null>(null)
  const { startRow, endRow, firstDate, years, finalValue, cagr } = useMarketCagr(
    submitted?.market ?? null,
    submitted?.date,
    submitted?.amount ?? 0
  )

  const canRun = !!market && !!date && Number(amount) > 0;

  return (
    <div className="p-8 space-y-4">
      <NavBar/>
      <ComboBox
        options={MARKETS}
        value={market}
        onChange={setMarket}
        placeholder="Select a market"
        className="w-64"
      />
      <TabSelect options={INVESTEMENT_TYPES} value={investmentType} onChange={setInvestmentType} className='border-primary' label='Mode' />
      <InputLabel value={amount} onChange={setAmount} label='Amount' placeholder='Enter amount' className='w-64' type='number' nonNegative />
      <DateLabel date={date} onChange={setDate} label='Select Date' className='w-64' />

      <Button
        disabled={!canRun}
        onClick={() => setSubmitted({ market: market!, date: date!, amount: Number(amount) })}
      >
        Backtest
      </Button>
    </div>
  )
}
