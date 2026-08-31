import { useState } from 'react'
import { NavBar } from '@/components/shared/NavBar'
import { ComboBox } from '@/components/shared/ComboBox'
import { INVESTEMENT_TYPES, MARKETS } from '@/constants/markets'
import { TabSelect } from '@/components/shared/TabSelect'
import { InputLabel } from '@/components/shared/Inputlabel'
import { DateLabel } from '@/components/shared/DateLabel'

export const BackTester = () => {
  const [market, setMarket] = useState<string | null>(null);
  const [investmentType, setInvestmentType] = useState<string>('lumpsum');
  const [amount, setAmount] = useState<number | string>(0);
  const [date, setDate] = useState<Date | undefined>(undefined);

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
    </div>
  )
}
