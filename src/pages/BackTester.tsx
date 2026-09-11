import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { NavBar } from '@/components/shared/NavBar'
import { ComboBox } from '@/components/shared/ComboBox'
import { INVESTEMENT_TYPES, MARKETS, SIP_FREQUENCIES } from '@/constants/markets'
import { ChipSelect } from '@/components/shared/ChipSelect'
import { InputLabel } from '@/components/shared/Inputlabel'
import { TabSelect } from '@/components/shared/TabSelect'
import { DateLabel } from '@/components/shared/DateLabel'
import { useBacktest } from '@/hooks/useBacktest'
import { Button } from '@/components/ui/button'
import { RotateCcw } from 'lucide-react'
import { FieldCard } from '@/components/shared/FieldCard'
import { BacktestResult } from '@/components/shared/BacktestResult'
import type { InvestmentMode } from '@/lib/backtest'
import { readParams, toSearch } from '@/lib/shareUrl'

import { cn } from '@/lib/utils'
import { DEFAULT_INVESTEMENT_CHIPS } from '@/constants/common'

type InvestmentType = 'lumpsum' | 'sip'
type SipFrequency = (typeof SIP_FREQUENCIES)[number]['value']

type Submission = {
  market: string
  date: Date
  amount: number
  mode: InvestmentMode
  stepUpPer: number
}

const initial = window.location.search ? readParams(window.location.search) : null

export const BackTester = () => {
  const [market, setMarket] = useState<string | null>(initial?.market ?? null)
  const [investmentType, setInvestmentType] = useState<InvestmentType>(
    initial?.mode === 'lumpsum' ? 'lumpsum' : 'sip'
  )
  const [amount, setAmount] = useState<number | string>(initial?.amount ?? '')
  const [stepUpPer, setStepUpPer] = useState<number | string>(initial?.stepUpPer || '')
  const [date, setDate] = useState<Date | undefined>(initial?.date)
  const [sipFrequency, setSipFrequency] = useState<SipFrequency>(
    !initial || initial.mode === 'lumpsum' ? 'monthly' : initial.mode
  )
  const [submitted, setSubmitted] = useState<Submission | null>(initial)
  const [runId, setRunId] = useState(0)

  const [speed, setSpeed] = useState(1)

  const { seriesData, returnMetric } = useBacktest(
    submitted?.market ?? null,
    submitted?.date,
    submitted?.amount ?? 0,
    submitted?.mode ?? 'lumpsum',
    submitted?.stepUpPer ?? 0
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
      stepUpPer: isSip ? Number(stepUpPer) || 0 : 0,
    })
    setRunId((n) => n + 1)
  }

  const handleReset = () => {
    setMarket(null)
    setAmount('')
    setDate(undefined)
    setInvestmentType('sip')
    setSipFrequency('monthly')
    setStepUpPer('')
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
        <Button size="sm" disabled={!canRun} onClick={handleBacktest} className={'rounded-none'}>
          Backtest
        </Button>
        <Button size="sm" variant="outline" onClick={handleReset} className={'rounded-none'}>
          <RotateCcw />
          Reset
        </Button>
      </NavBar>
      <BacktestResult
        key={runId}
        seriesData={seriesData}
        returnMetric={returnMetric}
        speed={speed}
        onSpeedChange={setSpeed}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <FieldCard className="flex flex-col gap-4">
            <TabSelect
              label="Mode"
              options={INVESTEMENT_TYPES}
              value={investmentType}
              onChange={(value) => setInvestmentType(value as InvestmentType)}
              className="border-primary/15 w-full"
            />
            <ChipSelect
              label="Every"
              options={SIP_FREQUENCIES}
              value={sipFrequency}
              onChange={(value) => setSipFrequency(value as SipFrequency)}
              disabled={!isSip}
            />
          </FieldCard>

          <FieldCard className="flex flex-col gap-4">
            <InputLabel
              label={isSip ? 'Amount per instalment' : 'Amount'}
              placeholder="Enter amount"
              value={amount}
              onChange={setAmount}
              className="w-full"
              type="number"
              nonNegative
            />

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {DEFAULT_INVESTEMENT_CHIPS.map((chip) => (
                  <Button
                    key={chip.value}
                    variant="outline"
                    size="sm"
                    className="rounded-full text-muted-foreground"
                    onClick={() => setAmount(chip.value)}
                  >
                    {chip.label}
                  </Button>
                ))}
              </div>

              <InputLabel
                label="Step-up"
                placeholder="%/yr"
                value={stepUpPer}
                onChange={setStepUpPer}
                type="number"
                nonNegative
                disabled={!isSip}
                className="w-24 rounded-full text-right"
                inputClassName={cn('flex-row items-center w-auto', !isSip && 'opacity-50')}
                max={100}
              />
            </div>
          </FieldCard>

          <FieldCard className="flex flex-col gap-4">
            <DateLabel
              label={isSip ? 'First instalment' : 'Select Date'}
              date={date}
              onChange={setDate}
              className="w-full rounded-none"
            />
            {date && (
              <p className="mt-2 text-xs text-muted-foreground">
                {isSip
                  ? `${SIP_FREQUENCIES.find((f) => f.value === sipFrequency)?.label} from ${format(date, 'dd MMM yyyy')}`
                  : `One purchase on ${format(date, 'dd MMM yyyy')}`}
              </p>
            )}
          </FieldCard>
        </div>
      </BacktestResult>
    </div>
  )
}
