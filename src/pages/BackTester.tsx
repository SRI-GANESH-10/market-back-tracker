import { useActionState, useState } from 'react'
import { NavBar } from '@/components/shared/NavBar'
import { ComboBox } from '@/components/shared/ComboBox'
import { INVESTEMENT_TYPES, MARKETS } from '@/constants/markets'
import { TabSelect } from '@/components/shared/TabSelect'
import { InputLabel } from '@/components/shared/Inputlabel'
import { DateLabel } from '@/components/shared/DateLabel'
import { useMarketCagr } from '@/hooks/useMarketCagr'
import { Button } from '@/components/ui/button'
import { StatCard } from '@/components/shared/StatCard'
import { GrowthChart } from '@/components/shared/GrowthChart'
import { useAnimatedSeries } from '@/hooks/useAnimatedSeries'

type InvestmentType = 'lumpsum' | 'sip'

type Submission = {
  market: string
  date: Date
  amount: number
}

const FieldCard = ({ children }: { children: React.ReactNode }) => (
  <div className="border p-4">{children}</div>
)

export const BackTester = () => {
  // Inputs
  const [market, setMarket] = useState<string | null>(null)
  const [investmentType, setInvestmentType] = useState<InvestmentType>('lumpsum')
  const [amount, setAmount] = useState<number | string>(0)
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [sipDays, setSipDays] = useState<number | string>(30)
  const [submitted, setSubmitted] = useState<Submission | null>(null)

  const { seriesData,startRow, endRow, years, finalValue, cagr } = useMarketCagr(
    submitted?.market ?? null,
    submitted?.date,
    submitted?.amount ?? 0
  )

  const { currentData, visibleData, isPlaying} = useAnimatedSeries(seriesData);

  const isSip = investmentType === 'sip'
  const canRun = !!market && !!date && Number(amount) > 0

  const handleBacktest = () => {
    if (!canRun) return
    setSubmitted({ market: market!, date: date!, amount: Number(amount) })
  }

  const profit = finalValue !== undefined ? finalValue - Number(submitted?.amount ?? 0) : undefined

  const stats = [
    { title: 'CAGR', value: currentData?.cagr !== null ? `${currentData?.cagr}%` : 'N/A' },
    { title: 'Final Value', value: currentData?.finalValue !== undefined ? currentData?.finalValue.toFixed(2) : 'N/A' },
    // { title: 'Profit', value: profit !== undefined ? profit.toFixed(2) : 'N/A' },
    // { title: 'Years', value: currentData?.years ?? 'N/A' },
  ]

  return (
    <div className="p-8 space-y-6">
      <NavBar/>
      <ComboBox
        options={MARKETS}
        value={market}
        onChange={setMarket}
        placeholder="Select a market"
        className="w-64"
      />
      <Button disabled={!canRun} onClick={handleBacktest}>
        Backtest
      </Button>

      <div className="grid grid-cols-4">
        <FieldCard>
          <TabSelect
            label="Mode"
            options={INVESTEMENT_TYPES}
            value={investmentType}
            onChange={(value) => setInvestmentType(value as InvestmentType)}
            className="border-primary"
          />
        </FieldCard>

        <FieldCard>
          <InputLabel
            label="Amount"
            placeholder="Enter amount"
            value={amount}
            onChange={setAmount}
            className="w-64"
            type="number"
            nonNegative
          />
        </FieldCard>

        <FieldCard>
          <DateLabel
            label="Select Date"
            date={date}
            onChange={setDate}
            className="w-64"
          />
        </FieldCard>

        <FieldCard>
          <InputLabel
            label="SIP Days"
            placeholder="Enter SIP Days"
            value={sipDays}
            onChange={setSipDays}
            className="w-64"
            type="number"
            nonNegative
            disabled={!isSip}
          />
        </FieldCard>
      </div>

      <div className="grid grid-cols-4">
        {stats.map((stat) => (
          <FieldCard key={stat.title}>
            <StatCard title={stat.title} value={stat.value} className="w-full" />
          </FieldCard>
        ))}
      </div>

      {seriesData?.length ? (
        <FieldCard>
          <GrowthChart data={visibleData} />
        </FieldCard>
      ) : null}
    </div>
  )
}