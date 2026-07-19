# Ur Sandhai

A working prototype of **Ur Sandhai** ("our marketplace"), a hyperlocal,
crowd-sourced market intelligence platform for smallholder farmers, built
for the *AI for Bharat* hackathon, AgriTech track, submitted as an
individual entry.

**Live demo:** https://sruthisureshkumar-arch.github.io/ursandhai/
**Write-up (tools, APIs, datasets):** [WRITEUP.md](./WRITEUP.md)

## What this is

A single-file, self-contained web prototype (`index.html`) with a warm,
editorial interface in olive and cream. Open it directly in a browser:
no build step, no server, no installation.

**Operational right now:**
- Haversine-based 10km geo-radius filtering of crowd-sourced reports
- Time-bucketed price analysis surfacing the strongest-selling window of the day
- Crop priority scoring across price level, demand signal, and local supply pressure
- Automatic fallback to a government-style (Agmarknet) baseline price when local
  crowd data is too sparse to trust
- A live SVG map plotting real bearing and distance from the farmer's location
- Bilingual (English and Tamil) recommendation output
- **Fair Offer Check** — benchmarks a buyer's offered price against the live local average
- **Sell Together** — detects real oversupply nearby and prompts coordinated selling
- **Live price trend** — a genuine linear-regression model computed on crowd reports
- **Price-board OCR** — Tesseract.js reads a photographed price board client-side
- Reports persist to `localStorage`, so a demo session survives a page refresh, with a
  one-click reset to the seeded sample data
- A CSS breakpoint collapses the layout to a single column under 760px, built for the
  reality that the intended users are on phones, not desktops (implemented with a
  standard media query; worth a quick check on an actual device before you demo it,
  since it hasn't been screenshot-verified there)

**Simulated for this round** (clearly labeled in the interface), pending an AWS account:
- Voice capture uses the browser's free Web Speech API in place of Amazon Transcribe and Comprehend
- Read-aloud uses the browser's free speech synthesis in place of Amazon Polly
- The price trend is an OLS regression standing in for a trained Prophet/scikit-learn model
- Crop identification from a photo, distinct from reading a price board, which now works,
  is not yet built

See [WRITEUP.md](./WRITEUP.md) for the complete breakdown of what's operational versus
simulated, and the intended production architecture: Transcribe, Comprehend, Rekognition,
Textract, Polly, Prophet, scikit-learn, and Agmarknet via data.gov.in.

## Feasibility and cost discipline

Every component here runs on a free tier with no bill attached: GitHub Pages, free CDN
delivery for fonts and libraries, browser-native speech APIs. The production plan carries
that discipline forward rather than abandoning it: AWS credentials never touch the
client, every AI call runs server-side behind authentication and rate limits, IAM is
scoped per service, and a budget alarm cuts access the moment spending moves past zero.
See [WRITEUP.md](./WRITEUP.md) for the rollout plan and the social impact case.

## Running it

Open the [live demo](https://sruthisureshkumar-arch.github.io/ursandhai/), or clone the
repository and open `index.html` directly in Chrome. Voice input and Tamil text-to-speech
require microphone permission and work best as a real page rather than an embedded iframe.

## Roadmap

- Deploy `agmarknet-proxy.js`, a Cloudflare Worker already written and included in this repo, so the baseline price object can pull live data.gov.in Agmarknet figures behind a server-held API key instead of a dated static snapshot (see the file's header comment for the exact deploy steps and the reasoning for not wiring it in live for this round)
- Wire in real AWS calls (Transcribe, Rekognition, Textract, Polly) behind the interfaces
  this prototype already exposes
- Add the buyer-reputation Google Maps link
- Move recommendation scoring to a backend with persistent storage (Supabase/Postgres)
- Replace the time-bucket average with a Prophet/scikit-learn forecasting model
- Give farmers a way to actually contact each other through the Sell Together nudge

## What sets this apart

Most crowd-price tools stop at reporting today's average. Ur Sandhai adds three
mechanics built for the exact moment a farmer decides whether to sell:

- **Fair Offer Check** puts the project's founding problem directly in a farmer's hands:
  standing in front of a buyer, they enter the price on offer and get an instant,
  bilingual verdict against the live local average.
- **Sell Together** watches for genuine oversupply among nearby crowd reports and
  surfaces a prompt to coordinate a shared sale, turning a penalty the scoring model
  already computes into something actionable, though it remains a prompt rather than a
  coordination tool: it doesn't yet connect farmers to one another directly.
- **Live price trend** is a real ordinary-least-squares regression, run in the browser
  against whatever crowd reports currently exist, rather than a static number.

Price-board reading is also genuine: it runs on
[Tesseract.js](https://github.com/naptha/tesseract.js), an open-source OCR engine,
entirely in the browser. No AWS account or API key required for any of the above.
