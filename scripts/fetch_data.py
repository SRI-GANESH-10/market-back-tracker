import yfinance as yf
import json
import os

# Registry of ETFs — add new ones here later, that's it.
# ETFs rather than raw indices: they are what you can actually buy, and
# auto_adjust folds their dividends back into the close.
INDICES = {
    "niftybees": {"ticker": "NIFTYBEES.NS", "label": "Nifty 50 BeES", "start": "2001-12-28"},
    "juniorbees": {"ticker": "JUNIORBEES.NS", "label": "Nifty Next 50 Junior BeES", "start": "2003-02-21"},
    "bankbees": {"ticker": "BANKBEES.NS", "label": "Nifty Bank BeES", "start": "2004-01-01"},
    "goldbees": {"ticker": "GOLDBEES.NS", "label": "Gold BeES", "start": "2007-01-01"},
    "mid150bees": {"ticker": "MID150BEES.NS", "label": "Nifty Midcap 150 BeES", "start": "2019-01-31"},
}

OUTPUT_DIR = "public/data"
os.makedirs(OUTPUT_DIR, exist_ok=True)

for index_id, info in INDICES.items():
    ticker = info["ticker"]
    start = info["start"]

    print(f"Fetching {info['label']} ({ticker}) from {start}...")

    try:
        df = yf.download(ticker, start=start, progress=False, auto_adjust=True)

        if df.empty:
            print(f"  ⚠️  No data returned for {ticker}, skipping.")
            continue

        records = [
            {"date": str(date.date()), "close": round(float(row["Close"].iloc[0]) if hasattr(row["Close"], 'iloc') else float(row["Close"]), 2)}
            for date, row in df.iterrows()
        ]

        filepath = os.path.join(OUTPUT_DIR, f"{index_id}.json")
        with open(filepath, "w") as f:
            json.dump(records, f)

        print(f"  ✅ Saved {len(records)} records → {filepath}")

    except Exception as e:
        print(f"  ❌ Failed to fetch {ticker}: {e}")

print("\nDone. Files saved in ./data/")