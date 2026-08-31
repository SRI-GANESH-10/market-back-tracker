import { useState } from 'react'
import { NavBar } from '@/components/shared/NavBar'
import { ComboBox } from '@/components/shared/ComboBox'
import { INVESTEMENT_TYPES, MARKETS } from '@/constants/markets'
import { TabSelect } from '@/components/shared/TabSelect'

export const BackTester = () => {
  const [market, setMarket] = useState<string | null>(null);
  const [investmentType, setInvestmentType] = useState<string>('lumpsum');

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
      {market && <p>Selected Market: {market}</p>}
      <TabSelect options={INVESTEMENT_TYPES} value={investmentType} onChange={setInvestmentType} className='border-primary' label='Mode' />
    </div>
  )
}
