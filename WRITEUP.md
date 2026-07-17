# Ur Sandhai — Prototype Round Write-Up

**Track:** Agriculture & Rural Livelihoods
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

## What's actually working right now

- **Geo-radius filtering.** Every report carries a coordinate offset from the
  selected village. A real Haversine distance calculation filters reports to
  a 10km radius and a 72-hour window, written in plain JavaScript with no
  mapping library.
- **Time-window price analysis.** Reports are bucketed into two-hour windows
  and averaged against a baseline to surface which hours are currently
  fetching the best prices.
- **Crop priority scoring.** A weighted formula combines average price,
  demand strength (high/medium/low), and a supply-pressure penalty so the
  app doesn't just recommend whichever crop happens to be selling for the
  most; it also accounts for oversupply nearby.
- **Live SVG map.** The 10km radius, the farmer's position, and every nearby
  report are rendered as a real vector map generated from the same
  coordinate math the scoring logic uses, not a static image.
- **Bilingual output.** Every recommendation is generated in both English
  and Tamil from the same underlying data.
- **Government baseline fallback.** When fewer than five reports exist
  nearby, the app falls back to baseline mandi prices rather than guessing
  from thin data. In production this baseline is pulled from Agmarknet.

## What's mocked for this round, and why

Two categories of AWS AI services from the original proposal are stood in
with free browser APIs for this demo, since wiring up billed cloud services
for a prototype round didn't seem like the right place to spend the team's
limited AWS free-tier hours:

- **Voice input** uses the browser's Web Speech API
  (`SpeechRecognition`) instead of Amazon Transcribe. It listens in Tamil,
  transcribes locally in the browser, and the same regex-based parsing that
  would run against Transcribe's output extracts a price from the
  transcript.
- **Spoken recommendations** use the Web Speech Synthesis API instead of
  Amazon Polly, reading the Tamil recommendation aloud with a `ta-IN` voice.

Everything downstream of those two inputs, meaning the scoring, the map, and
the bilingual text generation, is real and does not depend on any external
service.

Two more pieces from the proposal, photo-based crop and price-board reading
(Rekognition and Textract) and the next-day forecasting model (Prophet and
scikit-learn), are not wired into this build yet. They're scoped as the next
milestone rather than mocked, since the report form already asks for the
data those pieces would extract.

## Tools, APIs, and datasets

| Layer | What's used now | What's planned for production |
|---|---|---|
| Frontend | Plain HTML, CSS, and JavaScript, no framework or build tool | Same, or a lightweight framework if the report volume grows |
| Design | Figma, used to prototype the visual language before implementing it in code | Same |
| Voice input | Web Speech API (`SpeechRecognition`), free, browser-native | Amazon Transcribe (Tamil/Hindi) within the AWS free tier |
| Text-to-speech | Web Speech Synthesis API, free, browser-native | Amazon Polly within the AWS free tier |
| Vision / OCR | Not yet implemented | Amazon Rekognition (crop identification) and Textract (price board / slip reading) |
| Forecasting | Not yet implemented; current scoring is a weighted formula, not a trained model | Prophet and scikit-learn, retrained nightly on crowd reports via a free GitHub Actions workflow |
| Government dataset | A small hard-coded baseline dictionary standing in for the real feed | Agmarknet mandi prices and arrivals, pulled from data.gov.in at no cost, maintained by the Ministry of Agriculture and Farmers Welfare |
| Hosting | GitHub Pages, free static hosting | Same for the demo; a small backend (Lambda or similar) once reports need to persist across visitors |
| Data storage | In-memory JavaScript array, resets on page reload | Supabase Postgres free tier, chosen for built-in geo queries |
| Fonts | Playfair Display and Inter, served from Google Fonts | Same |

## Honest note on scope

This is a working demonstration of the core idea, hyperlocal crowd data
turned into a same-day, bilingual selling recommendation, not a finished
production system. The parts that are mocked are mocked with free,
zero-setup browser APIs specifically so a judge can test the full flow
without needing API keys or a backend. The README in this repository lists
the same real-vs-mocked breakdown alongside instructions for running the
prototype locally.
