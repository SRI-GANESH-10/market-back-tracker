import yfinance as yf
import json
import os

# Registry of indices — add new ones here later, that's it
INDICES = {
    "nifty50": {"ticker": "^NSEI", "label": "Nifty 50", "start": "1996-01-01"},
    "midcap100": {"ticker": "NIFTY_MIDCAP_100.NS", "label": "Nifty Midcap 100", "start": "1996-01-01"},
    "smallcap250": {"ticker": "NIFTYSMLCAP250.NS", "label": "Nifty Smallcap 250", "start": "1996-01-01"},
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