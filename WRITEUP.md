# Ur Sandhai — Prototype Round Write-Up

**Track:** AgriTech (crop advisory)
**Live demo:** https://sruthisureshkumar-arch.github.io/ursandhai/
**Source:** https://github.com/sruthisureshkumar-arch/ursandhai

## What this prototype demonstrates

Ur Sandhai lets farmers within about ten kilometres of each other share what
they're selling, at what price, and how strong the demand feels, then turns
those reports into a same-day recommendation: the best time to sell, the crop
worth prioritising, and whether to hold back because too many neighbours are
already offering the same thing. The recommendation is spoken and shown in
both Tamil and English.

This build is a single self-contained HTML file. There's no backend and no
build step, by design, so a judge can open it and see the full logic running
in a few seconds without installing anything.

## What's new and novel in this round

Three mechanics go beyond "here's the average price today," aimed directly
at the moment a farmer is deciding whether to sell:

- **Fair Offer Check.** A farmer standing in front of a buyer types in the
  price being offered and gets an instant verdict, comparing it to the live
  local average (or the government baseline if there isn't enough local data
  yet) with a plain-language explanation in English and Tamil. This is the
  literal problem the project opened with, made into a usable tool rather
  than a paragraph: not knowing whether an offer is fair.
- **Sell Together nudge.** When enough nearby farmers are reporting the same
  crop in real volume, the app surfaces a suggestion to coordinate a shared
  sale instead of each farmer selling piecemeal into a saturated local
  market. It's computed live from the same crowd reports already being
  collected, turning an oversupply penalty the scoring model already
  computes into a positive, actionable feature instead of just a warning.
- **Live price trend.** A real ordinary-least-squares regression, run in the
  browser on whatever crowd reports currently exist for a crop, showing
  whether the local price is rising, falling, or steady, with a percent-per-
  day figure. It's a lightweight stand-in for the Prophet model planned for
  production, but the regression is genuine and runs on live data, not a
  canned number.

## What's actually working right now

- **Geo-radius filtering.** A real Haversine distance calculation filters
  reports to a 10km radius and a 72-hour window, written in plain JavaScript
  with no mapping library.
- **Time-window price analysis.** Reports are bucketed into two-hour windows
  and averaged against a baseline to surface which hours are currently
  fetching the best prices.
- **Crop priority scoring.** A weighted formula combines average price,
  demand strength, and a supply-pressure penalty so the app accounts for
  oversupply nearby rather than just chasing the highest price.
- **Live SVG map.** The radius, the farmer's position, and every nearby
  report are rendered as a real vector map generated from the same
  coordinate math the scoring logic uses, not a static image.
- **Bilingual output** in both English and Tamil, generated from the same
  underlying data, across the recommendation, the fair-offer check, and the
  sell-together nudge.
- **Government baseline fallback** when fewer than five reports exist
  nearby, rather than guessing from thin data.
- **In-browser price-board OCR.** Photographing a price board runs the image
  through Tesseract.js, a free open-source OCR engine, entirely client-side,
  and reads a price straight into the form. No AWS account, API key, or
  server round-trip involved.

## What's mocked for this round, and why

Voice input and spoken output are stood in with free browser APIs, since
wiring up billed cloud services for a prototype round didn't seem like the
right place to spend the team's limited AWS free-tier hours:

- **Voice input** uses the browser's Web Speech API (`SpeechRecognition`)
  instead of Amazon Transcribe, listening in Tamil and transcribing locally,
  with the same regex-based parsing that would run against Transcribe's
  output extracting a price from the transcript.
- **Spoken recommendations** use the Web Speech Synthesis API instead of
  Amazon Polly, reading the Tamil recommendation aloud with a `ta-IN` voice.

Everything downstream of those two inputs, meaning the scoring, the map, the
fair-offer check, the sell-together nudge, the trend regression, and the
bilingual text generation, is real and does not depend on any external
service.

One piece from the original proposal, identifying a crop from a photo of the
produce itself (as opposed to reading text off a price board, which now
works), is not wired into this build yet. It's scoped as the next milestone.

## Tools, APIs, and datasets

| Layer | What's used now | What's planned for production |
|---|---|---|
| Frontend | Plain HTML, CSS, and JavaScript, no framework or build tool | Same, or a lightweight framework if report volume grows |
| Design | Figma, used to prototype the visual language before implementing it in code | Same |
| Voice input | Web Speech API (`SpeechRecognition`), free, browser-native | Amazon Transcribe (Tamil/Hindi) within the AWS free tier |
| Text-to-speech | Web Speech Synthesis API, free, browser-native | Amazon Polly within the AWS free tier |
| OCR (price boards) | Tesseract.js, free, open-source, runs fully in the browser | Amazon Textract within the AWS free tier |
| Vision (crop ID) | Not yet implemented | Amazon Rekognition |
| Forecasting | A real OLS linear regression on crowd reports, computed client-side | Prophet and scikit-learn, retrained nightly via a free GitHub Actions workflow |
| Government dataset | A small hard-coded baseline dictionary standing in for the real feed | Agmarknet mandi prices and arrivals, pulled from data.gov.in at no cost, maintained by the Ministry of Agriculture and Farmers Welfare |
| Hosting | GitHub Pages, free static hosting | Same for the demo; a small backend (Lambda or similar) once reports need to persist across visitors |
| Data storage | In-memory JavaScript array, resets on page reload | Supabase Postgres free tier, chosen for built-in geo queries |
| Fonts | Playfair Display and Inter, served from Google Fonts | Same |

## Honest note on scope

This is a working demonstration of the core idea, hyperlocal crowd data
turned into a same-day, bilingual selling decision, not a finished
production system. The parts that are mocked are mocked with free,
zero-setup browser APIs specifically so a judge can test the full flow
without needing API keys or a backend. The README in this repository lists
the same real-vs-mocked breakdown alongside instructions for running the
prototype locally.
