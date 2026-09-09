import { useState } from 'react'
import { NavBar } from '@/components/shared/NavBar'
import { ComboBox } from '@/components/shared/ComboBox'
import { INVESTEMENT_TYPES, MARKETS, SIP_FREQUENCIES } from '@/constants/markets'
import { TabSelect } from '@/components/shared/TabSelect'
import { InputLabel } from '@/components/shared/Inputlabel'
import { DateLabel } from '@/components/shared/DateLabel'
import { useBacktest } from '@/hooks/useBacktest'
import { Button } from '@/components/ui/button'
import { FieldCard } from '@/components/shared/FieldCard'
import { BacktestResult } from '@/components/shared/BacktestResult'
import type { InvestmentMode } from '@/lib/backtest'

type InvestmentType = 'lumpsum' | 'sip'
type SipFrequency = (typeof SIP_FREQUENCIES)[number]['value']

type Submission = {
  market: string
  date: Date
  amount: number
  mode: InvestmentMode
}

export const BackTester = () => {
  const [market, setMarket] = useState<string | null>(null)
  const [investmentType, setInvestmentType] = useState<InvestmentType>('lumpsum')
  const [amount, setAmount] = useState<number | string>(0)
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [sipFrequency, setSipFrequency] = useState<SipFrequency>('monthly')
  const [submitted, setSubmitted] = useState<Submission | null>(null)
  const [runId, setRunId] = useState(0)
  // playback only -- deliberately not part of Submission, so changing it does
  // not re-run the backtest or rewind the replay
  const [speed, setSpeed] = useState(1)

  const { seriesData, returnMetric } = useBacktest(
    submitted?.market ?? null,
    submitted?.date,
    submitted?.amount ?? 0,
    submitted?.mode ?? 'lumpsum'
  )

  const isSip = investmentType === 'sip'
  const canRun = !!market && !!date && Number(amount) > 0

  const handleBacktest = () => {
    if (!canRun) return
    setSubmitted({
      market: market!,
      date: date!,
      amount: Number(amount),
      mode: isSip ? sipFrequency : 'lumpsum',
    })
    setRunId((n) => n + 1)
  }

  return (
    <div className="p-4 space-y-6 sm:p-8">
      <NavBar/>
      <ComboBox
        options={MARKETS}
        value={market}
        onChange={setMarket}
        placeholder="Select a market"
        className="w-full sm:w-64"
      />
      <Button disabled={!canRun} onClick={handleBacktest}>
        Backtest
      </Button>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
            label={isSip ? 'Amount per instalment' : 'Amount'}
            placeholder="Enter amount"
            value={amount}
            onChange={setAmount}
            className="w-full sm:w-64"
            type="number"
            nonNegative
          />
        </FieldCard>

        <FieldCard>
          <DateLabel
            label={isSip ? 'First instalment' : 'Select Date'}
            date={date}
            onChange={setDate}
            className="w-full sm:w-64"
          />
        </FieldCard>

        <FieldCard>
          <TabSelect
            label="Frequency"
            options={SIP_FREQUENCIES}
            value={sipFrequency}
            onChange={(value) => setSipFrequency(value as SipFrequency)}
            className="border-primary"
            disabled={!isSip}
          />
        </FieldCard>
      </div>

      <BacktestResult
        seriesData={seriesData}
        returnMetric={returnMetric}
        runId={runId}
        speed={speed}
        onSpeedChange={setSpeed}
      />
    </div>
  )
}
