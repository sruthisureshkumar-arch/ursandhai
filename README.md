# Ur Sandhai — prototype

A working prototype for **Ur Sandhai** ("our marketplace"), a hyperlocal, crowd-sourced
market intelligence app for smallholder farmers, built for the *AI for Bharat* hackathon
(AgriTech track), submitted as an individual entry.

**Live demo:** https://sruthisureshkumar-arch.github.io/ursandhai/
**Write-up (tools, APIs, datasets):** [WRITEUP.md](./WRITEUP.md)

## What this is

A single-file, self-contained web prototype (`index.html`) with a warm, editorial
olive-and-cream interface — open it directly in a browser, no build step, no server
required.

**What's real:**
- Haversine-based 10km geo-radius filtering of crowd-sourced reports
- Time-bucketed price analysis to surface the best-selling window of the day
- Crop priority scoring (price level, demand signal, local supply pressure)
- Automatic fallback to a government (Agmarknet-style) baseline price when local
  crowd data is too sparse
- A live SVG map plotting real bearing/distance from the farmer's location
- Bilingual (English + Tamil) recommendation output
- **Fair Offer Check** — compares a buyer's offered price to the live local average
- **Sell Together nudge** — flags real oversupply and suggests coordinating a sale
- **Live price trend** — a real linear-regression model run on crowd reports
- **Price-board OCR** — Tesseract.js reads a photographed price board in-browser

**What's currently stood in for** (clearly labeled in the UI), pending an AWS account:
- Voice capture uses the browser's free Web Speech API instead of Amazon Transcribe + Comprehend
- "Read aloud" uses the browser's free speech synthesis instead of Amazon Polly
- The price trend is an OLS regression instead of a trained Prophet/scikit-learn model
- Crop identification from a photo (as opposed to reading a price board) is not yet built

See [WRITEUP.md](./WRITEUP.md) for the full breakdown of what's real versus mocked and
the intended production architecture (Transcribe, Comprehend, Rekognition, Textract,
Polly, Prophet + scikit-learn, Agmarknet via data.gov.in).

## Running it

Open the [live demo](https://sruthisureshkumar-arch.github.io/ursandhai/), or clone the
repo and open `index.html` directly in Chrome. Voice input and Tamil text-to-speech need
microphone permission and work best when opened as a real page (not embedded in an
iframe).

## Roadmap

- Wire in real AWS calls (Transcribe, Rekognition, Textract, Polly) behind the same
  interfaces this prototype already uses
- Add the buyer-reputation Google Maps link
- Move recommendation scoring to a proper backend with persistent storage (Supabase/Postgres)
- Swap the simple time-bucket average for a Prophet/scikit-learn forecasting model

## What's novel here

Most crowd-price apps stop at "here's today's average." Ur Sandhai adds three
mechanics built specifically for the moment a farmer is deciding whether to
sell:

- **Fair Offer Check** — standing in front of a buyer, a farmer types in the
  price being offered and gets an instant, plain-language verdict against the
  live local average (or the government baseline if there isn't enough local
  data yet), in English and Tamil. This answers the literal problem the
  project opened with: not knowing whether an offer is fair.
- **Sell Together nudge** — when enough nearby farmers are reporting the same
  crop in real volume, the app surfaces a suggestion to coordinate a shared
  sale instead of each farmer selling piecemeal into a saturated local
  market. Computed live from the same crowd reports, not a static tip.
- **Live price trend** — a real ordinary-least-squares regression run in the
  browser on whatever crowd reports currently exist, showing whether a crop's
  local price is rising, falling, or steady. It's a lightweight stand-in for
  the Prophet model planned for production, but the math is genuine and
  running on live data.

Photo price-board reading is also real now: it runs on
[Tesseract.js](https://github.com/naptha/tesseract.js), a free, open-source
OCR engine, entirely in the browser. No AWS account or API key required for
any of the above.
