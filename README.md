# Market Back Tracker

Backtest a lumpsum or a SIP against 17 years of real Indian ETF data, and watch
the portfolio replay day by day.

**Live:** https://market-back-tracker.vercel.app/

Pick an ETF, an amount, a start date and a mode. The chart replays every trading
day from that date to today, with the portfolio value and the amount invested
drawn against each other — the gap between the two lines is the return.

## What it does

- **Lumpsum** — one purchase on the start date, annualised with **CAGR**.
- **Monthly / weekly SIP** — an instalment on every due date, annualised with **XIRR**.
- Tracks units held, total invested, average cost per unit, and absolute return
  on **every** trading day, not just at the end.
- Playback speed from 1.0x to 4.0x, adjustable mid-replay; pause, resume, skip to
  the end, or replay a finished run.
- Every run is a URL. Share one and it opens on the same chart, already running.

### CAGR for lumpsum, XIRR for SIP

These are not interchangeable, and using one for both is the most common error in
a backtester.

A lumpsum has a single cashflow, so a compound annual growth rate describes it
exactly. A SIP's rupees each sat invested for a different length of time — the
first instalment for the full period, the last one for a few weeks — so CAGR has
no meaningful denominator. XIRR solves for the one rate that discounts every
dated cashflow back to zero, which is the only fair annualisation of an
irregular series.

The difference is not academic. NIFTYBEES from 2021-01-01, same ₹3,45,000 total
outlay either way — one purchase, or 69 monthly instalments of ₹5,000:

| mode | invested | value | absolute | annualised |
|---|---|---|---|---|
| Lumpsum | ₹3,45,000 | ₹6,15,197 | +78.32% | **CAGR 10.69%** |
| Monthly SIP | ₹3,45,000 | ₹4,21,658 | +22.22% | **XIRR 7.02%** |

A 78% headline against a 22% one reads like the lumpsum won by three times over.
It didn't: those rupees were invested for the full 5.7 years, while the SIP's
average rupee was invested for roughly half that. Annualised, the real gap is
10.69% against 7.02% — and even that is mostly a verdict on January 2021 being a
good entry, which you only know in hindsight. The annualised figures are the
comparable ones; the absolute ones are not.

Both share one actual/365 day count. They disagreed by 0.09% on an identical
trade until that was unified.

### The SIP schedule

Due dates are always computed as `startDate + n intervals`, never as
`previousDueDate + 1 interval`. That matters at month ends:

```
anchored on the 31st   ->  31 Jan   28 Feb   31 Mar   30 Apr   31 May
stepped from previous  ->  31 Jan   28 Feb   28 Mar   28 Apr   28 May
```

`addMonths(Jan 31, 1)` clamps to Feb 28, and stepping on from there loses the
anchor permanently. Stepping from the start date returns to the 31st in March.

Two more rules fall out of the same loop:

- A due date on a **holiday or weekend** fills on the next trading day, and the
  following due date is unaffected — 1st, 8th, (15th closed → 16th), then the
  **22nd**, not the 23rd.
- A closure **longer than one interval** skips the missed instalment rather than
  buying on consecutive days to catch up. You cannot retroactively buy on a day
  the market was shut.

## Data

Daily closes for five Nippon India ETFs, fetched with
[yfinance](https://github.com/ranaroussi/yfinance) with `auto_adjust=True`, so
dividends are folded back into the close and every figure here is a total return.

| ETF | symbol | tracks | rows | from |
|---|---|---|---|---|
| Nifty 50 BeES | `NIFTYBEES` | Nifty 50 | 4,364 | 2009-01-02 |
| Junior BeES | `JUNIORBEES` | Nifty Next 50 | 4,364 | 2009-01-02 |
| Bank BeES | `BANKBEES` | Nifty Bank | 4,364 | 2009-01-02 |
| Gold BeES | `GOLDBEES` | gold | 4,363 | 2009-01-02 |
| Midcap 150 BeES | `MID150BEES` | Nifty Midcap 150 | 1,767 | 2019-02-04 |

A GitHub Actions workflow refreshes all five nightly at 00:00 IST and commits the
result, so the deployed app is never more than a day stale. The job fails rather
than commits if any file comes back under 1,000 rows — `fetch_data.py` swallows
per-ticker errors, so without that gate a truncated file would ship looking fine.

### Why ETFs and not the indices

The first version tracked the indices themselves — `^NSEI` and friends. Those are
*price* indices: they exclude dividends, so every return they produce is too low.
Measured against dividend-adjusted `NIFTYBEES` over the same 17.7-year window, the
understatement was **0.82% a year** — 12.32% vs 13.14% CAGR. Compounded over 17
years that is not a rounding error.

ETFs fix it and are more honest besides: they are what you can actually buy, and
their price already carries the expense ratio and tracking error an index does
not. The cost is history — Yahoo serves these from 2009-01-02 regardless of
inception, so NIFTYBEES loses its 2001-2008 years.

**Known limitations:** no brokerage, STT, or capital-gains tax is modelled, and
the SIP assumes every instalment fills at that day's close.

## Stack

React 19 · TypeScript · Vite · Tailwind 4 · shadcn/ui on Base UI · Recharts ·
date-fns · [xirr](https://github.com/RayDeCampo/nodejs-xirr)

### On not using financejs

The first version used `financejs` for both metrics. Reading its source turned up
two silent failure modes in `XIRR`:

```js
var xirr = guess_last.toFixed(5) != guess.toFixed(5) ? null : guess*100;
return Math.round(xirr * 100) / 100;        // null -> Math.round(0)/100 -> 0
```

Non-convergence returns **`0`**, not `null` — a plausible-looking wrong answer
for a money figure. And when Newton's guess walks below `-1`,
`Math.pow(negative, fractional)` is `NaN`, whereupon the loop guard compares
`"NaN" != "NaN"`, reads as converged, and leaks the `NaN` out.

`xirr` throws on degenerate cashflows and on non-convergence instead, which
deleted ~30 lines of defensive wrapping. CAGR needs no library at all:

```ts
const cagr = (start: number, end: number, years: number) => (end / start) ** (1 / years) - 1
```

## Running it

```bash
npm install
npm run dev
```

Refreshing the data locally needs Python:

```bash
pip install -r requirements.txt
python scripts/fetch_data.py
```

Other scripts: `npm run build`, `npm run typecheck`, `npm run lint`.

## Layout

```
src/lib/backtest.ts          the whole simulation: schedule, units, CAGR, XIRR
src/lib/shareUrl.ts          run <-> query string, with every field validated
src/hooks/useBacktest.ts     fetch + memoise runBacktest
src/hooks/useAnimatedSeries  day-by-day replay with a live speed control
src/components/shared/       chart, hero figures, inputs, replay controls
scripts/fetch_data.py        yfinance -> public/data/*.json
```

`src/lib/backtest.ts` is pure — no React, no fetching — so it runs under plain
`node` and holds every rule described above.
