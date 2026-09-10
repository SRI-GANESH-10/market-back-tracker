import { useEffect, useState } from 'react'
import { NavBar } from '@/components/shared/NavBar'
import { ComboBox } from '@/components/shared/ComboBox'
import { INVESTEMENT_TYPES, MARKETS, SIP_FREQUENCIES } from '@/constants/markets'
import { TabSelect } from '@/components/shared/TabSelect'
import { InputLabel } from '@/components/shared/Inputlabel'
import { DateLabel } from '@/components/shared/DateLabel'
import { useBacktest } from '@/hooks/useBacktest'
import { Button } from '@/components/ui/button'
import { RotateCcw } from 'lucide-react'
import { FieldCard } from '@/components/shared/FieldCard'
import { BacktestResult } from '@/components/shared/BacktestResult'
import type { InvestmentMode } from '@/lib/backtest'
import { readParams, toSearch } from '@/lib/shareUrl'

type InvestmentType = 'lumpsum' | 'sip'
type SipFrequency = (typeof SIP_FREQUENCIES)[number]['value']

type Submission = {
  market: string
  date: Date
  amount: number
  mode: InvestmentMode
}

const initial = window.location.search ? readParams(window.location.search) : null

export const BackTester = () => {
  const [market, setMarket] = useState<string | null>(initial?.market ?? null)
  const [investmentType, setInvestmentType] = useState<InvestmentType>(
    initial?.mode === 'lumpsum' ? 'lumpsum' : 'sip'
  )
  const [amount, setAmount] = useState<number | string>(initial?.amount ?? '')
  const [date, setDate] = useState<Date | undefined>(initial?.date)
  const [sipFrequency, setSipFrequency] = useState<SipFrequency>(
    !initial || initial.mode === 'lumpsum' ? 'monthly' : initial.mode
  )
  const [submitted, setSubmitted] = useState<Submission | null>(initial)
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

  const handleReset = () => {
    setMarket(null)
    setAmount('')
    setDate(undefined)
    setInvestmentType('sip')
    setSipFrequency('monthly')
    setSubmitted(null)
    setRunId((n) => n + 1)
  }
  useEffect(() => {
    if (!submitted) return window.history.replaceState(null, '', window.location.pathname)
    window.history.replaceState(null, '', toSearch(submitted))
  }, [submitted])

  return (
    <div className="p-4 space-y-6 sm:p-8">
      <NavBar shareUrl={submitted ? window.location.href : undefined}>
        <ComboBox
          options={MARKETS}
          value={market}
          onChange={setMarket}
          placeholder="Select a market"
          className="w-40 sm:w-56"
        />
      </NavBar>
      <BacktestResult
        key={runId}
        seriesData={seriesData}
        returnMetric={returnMetric}
        speed={speed}
        onSpeedChange={setSpeed}
      >
        <div className="flex items-center gap-2">
          <Button disabled={!canRun} onClick={handleBacktest}>
            Backtest
          </Button>
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw />
            Reset
          </Button>
        </div>

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
      </BacktestResult>
    </div>
  )
}
