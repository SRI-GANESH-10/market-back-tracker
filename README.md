# Market Back Tracker

Backtest a lumpsum or a SIP against any Indian mutual fund's real NAV history,
and watch the portfolio replay day by day.

**Live:** https://market-back-tracker.vercel.app/

Search a fund, pick an amount, a start date and a mode. The chart replays every
NAV day from that date to today, with the portfolio value and the amount
invested drawn against each other — the gap between the two lines is the return.

## What it does

- **Lumpsum** — one purchase on the start date, annualised with **CAGR**.
- **Monthly / weekly SIP** — an instalment on every due date, annualised with **XIRR**.
- **Annual step-up** — raise the instalment by a fixed % on each anniversary of
  the first one.
- Tracks units held, total invested, average cost per unit, and absolute return
  on **every** NAV day, not just at the end.
- A purchase log beside the chart: every instalment, its date, its NAV and the
  units it bought.
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

The difference is not academic. Measured on NIFTYBEES from 2021-01-01, same
₹3,45,000 total outlay either way — one purchase, or 69 monthly instalments of
₹5,000:

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

- A due date on a **holiday or weekend** fills on the next day the fund
  published a NAV, and the following due date is unaffected — 1st, 8th,
  (15th closed → 16th), then the **22nd**, not the 23rd.
- A gap **longer than one interval** skips the missed instalment rather than
  buying on consecutive days to catch up. You cannot retroactively buy on a day
  the fund did not price.

Step-up is a function of the *elapsed years since the first instalment*, not a
running multiplier — `base * (1 + pct)^floor(years)`. Accumulating a factor per
instalment would drift with the schedule; this way the 13th monthly instalment
is the first stepped-up one whatever the calendar did in between.

## Data

NAVs come from [mfapi.in](https://www.mfapi.in/), an open AMFI mirror — the fund
list on load, then a scheme's full NAV history on demand.

AMFI publishes **37,882** schemes, which is not a list anyone can pick from. Two
passes cut it to **14,116**:

- **Regular plans** are dropped. A regular plan is the same portfolio as its
  direct plan with the distributor commission baked into the NAV, so it is
  strictly the worse twin of a fund already in the list.
- **IDCW / dividend plans** are dropped. Their NAV falls on every payout, so a
  NAV-only backtest of one understates the return by exactly the distributions
  it cannot see. Growth plans reinvest internally and their NAV is a total
  return, which is what the engine assumes.

What is left is still ~14k entries, so the list is fetched once and cached in
`localStorage` (1.25 MB, against a 5.5 MB raw response) under a versioned key —
bumping the key is what ships a changed filter to people who already have the
old list. The combobox renders 50 rows at a time and tells you how many it is
hiding, so typing narrows rather than scrolling.

Dates arrive as `DD-MM-YYYY` and newest-first; they are converted to ISO and
reversed once at the fetch boundary, so nothing downstream has to know that.

**Known limitations:** no expense ratio is added on top (it is already inside the
NAV), but no exit load, stamp duty, or capital-gains tax is modelled, and every
instalment is assumed to fill at that day's published NAV.

### Why mutual funds and not ETFs

The first two versions tracked five Nippon India ETFs, and before that the
indices themselves.

Dropping the indices was the bigger correction: `^NSEI` and friends are *price*
indices that exclude dividends, so every return they produce is too low. Against
dividend-adjusted `NIFTYBEES` over the same 17.7-year window the understatement
was **0.82% a year** — 12.32% vs 13.14% CAGR. Compounded over 17 years that is
not a rounding error.

ETFs fixed that, but five of them is a demo, not a tool — nobody's actual
portfolio is five Nippon ETFs. AMFI's NAV feed covers what people really hold,
needs no scraping, and goes back further than Yahoo's 2009 floor for the ETFs.
The trade is daily NAVs instead of intraday closes, which a daily backtest never
needed.

`scripts/fetch_data.py` and its nightly workflow still refresh the five ETF
files under `public/data/` — kept as the fallback dataset, unused by the app
since the migration.

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

No API key and no backend — mfapi.in is public and called straight from the
browser.

Refreshing the fallback ETF data needs Python:

```bash
pip install -r requirements.txt
python scripts/fetch_data.py
```

Other scripts: `npm run build`, `npm run typecheck`, `npm run lint`.

## Layout

```
src/lib/backtest.ts          the whole simulation: schedule, units, CAGR, XIRR
src/lib/mfapi.ts             fund list + NAV history, filtering and caching
src/lib/shareUrl.ts          run <-> query string, with every field validated
src/hooks/useFunds.ts        the cached fund list
src/hooks/useNavHistory.ts   one scheme's NAVs, with stale-response guarding
src/hooks/useBacktest.ts     fetch + memoise runBacktest
src/hooks/useAnimatedSeries  day-by-day replay with a live speed control
src/components/shared/       chart, hero figures, inputs, replay controls
scripts/fetch_data.py        yfinance -> public/data/*.json (fallback dataset)
```

`src/lib/backtest.ts` is pure — no React, no fetching — so it runs under plain
`node` and holds every rule described above.
