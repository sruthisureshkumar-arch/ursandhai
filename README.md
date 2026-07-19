# Ur Sandhai — Prototype Round Write-Up

**Track:** AgriTech (crop advisory) · **Entry:** Individual
**Live demo:** https://sruthisureshkumar-arch.github.io/ursandhai/
**Video walkthrough:** https://drive.google.com/file/d/1mhEjPblgQq8T6maKfYE6Ncn8FIncTnjb/view?usp=share_link
**Source:** https://github.com/sruthisureshkumar-arch/ursandhai

## What this prototype demonstrates

Ur Sandhai, "our marketplace" in Tamil, turns hyperlocal crowd reporting
into a same-day selling decision. Farmers within roughly ten kilometres of
each other report what they're selling, at what price, and how strong
demand feels; the app converts that into a recommendation, the best window
to sell, the crop worth prioritising, and whether to hold back because a
crop is already oversupplied nearby, delivered in Tamil and English.

The build is a single self-contained HTML file: no backend, no build
step, no installation. Open it and every mechanism described below is
running in front of you within seconds.

## What's new and distinctive this round

Three mechanics move past the standard "here's today's average" price
lookup and target the exact moment a farmer decides whether to sell:

- **Fair Offer Check.** A farmer standing in front of a buyer enters the
  price on the table and receives an immediate verdict, benchmarked
  against the live local average, in English and Tamil. This is the
  project's founding problem, not knowing whether an offer is fair,
  rendered as a tool a farmer can actually use in the moment rather than
  a line in a pitch deck.
- **Sell Together.** When crowd reports show real oversupply of a crop
  nearby, the app surfaces a prompt to coordinate a shared sale instead of
  each farmer selling into a saturated market alone. It converts a penalty
  the scoring model already computes into something actionable.
- **Live price trend.** An ordinary-least-squares regression, computed in
  the browser against whatever reports currently exist for a crop, showing
  whether the local price is rising, falling, or holding steady, with a
  percent-per-day figure. A lightweight, honest stand-in for the Prophet
  model planned for production, running on live data rather than a fixed
  number.

## What's operational right now

The geo-radius filter is a genuine Haversine distance calculation,
written in plain JavaScript, holding every report to a ten-kilometre
radius and a seventy-two hour window. Prices are bucketed into two-hour
windows and averaged to surface the strongest-selling hours of the day. A
weighted scoring formula combines average price, demand strength, and a
supply-pressure penalty, so the system accounts for local oversupply
rather than chasing the single highest price. The map is a live SVG
rendering, built from the same coordinate math the scoring engine uses,
not a static illustration. Every recommendation, verdict, and nudge is
produced bilingually from the same underlying data. When fewer than five
reports exist nearby, the system falls back to a baseline mandi price
instead of extrapolating from too little signal. Photographing a price
board runs real optical character recognition through Tesseract.js, an
open-source engine executing entirely client-side, no cloud round-trip
involved. Submitted reports persist to local storage, so a demo session
survives a page refresh, with a one-click reset to the seeded data. The
layout is built to collapse to a single column under 760 pixels, since
the people this is designed for use phones, not desktops.

## Engineering choices: what's a free stand-in, and why

Two inputs, voice capture and spoken output, are deliberately built on
free, browser-native APIs instead of billed AWS services: the Web Speech
API stands in for Amazon Transcribe, listening in Tamil and transcribing
locally with the same parsing logic that would run against Transcribe's
output; the Web Speech Synthesis API stands in for Amazon Polly. That's a
calculated engineering call, not a shortcut: it proves out the entire
input-to-recommendation pipeline at zero cost before a single AWS dollar
is spent. Everything downstream of those two inputs, the scoring, the
map, the fair-offer verdicts, Sell Together, the trend regression, and the
bilingual generation, is genuine and runs independent of any external
service.

One feature from the original proposal, identifying a crop straight from
a photograph of the produce itself (distinct from reading a price board,
which is fully working), is scoped as the next milestone: the interface
already collects the input it would consume, so wiring it in is additive,
not a redesign.

## Tools, APIs, and datasets

| Layer | In this build | Planned for production |
|---|---|---|
| Frontend | Plain HTML, CSS, and JavaScript, no framework or build tool | Same, or a lightweight framework if report volume warrants it |
| Design | Figma, used to establish the visual language before implementation | Same |
| Voice input | Web Speech API (`SpeechRecognition`), free, browser-native | Amazon Transcribe (Tamil and Hindi) within the AWS free tier |
| Text-to-speech | Web Speech Synthesis API, free, browser-native | Amazon Polly within the AWS free tier |
| OCR (price boards) | Tesseract.js, open-source, executing fully client-side | Amazon Textract within the AWS free tier |
| Vision (crop identification) | Not yet built | Amazon Rekognition |
| Forecasting | A genuine OLS linear regression on crowd reports, computed client-side | Prophet and scikit-learn, retrained nightly via a free GitHub Actions workflow |
| Government dataset | A compact baseline dictionary standing in for the live feed | Agmarknet mandi prices and arrivals, drawn from data.gov.in at no cost, maintained by the Ministry of Agriculture and Farmers Welfare |
| Hosting | GitHub Pages, free static hosting | Same for the demo, plus a minimal backend once reports need to persist across visitors |
| Data storage | Browser local storage, surviving a page refresh | Supabase Postgres free tier, chosen for native geo queries |
| Fonts | Playfair Display and Inter, served from Google Fonts | Same |

## Feasibility, cost discipline, and a path to scale

Every component here runs on a free tier with no attached bill: GitHub
Pages for hosting, free CDN delivery for fonts and libraries, browser-
native speech APIs. Nothing paid is wired in, so nothing here can generate
an unexpected invoice.

The production architecture is designed to carry that discipline forward
rather than abandon it once real cloud services enter the picture. AWS
credentials would never touch the client. Every AI call would run
server-side behind authentication and rate limiting, IAM roles would be
scoped to a single service each, and a hard budget alarm would cut access
the moment spending moved past zero. Vision and speech workloads are
scoped to migrate to self-hosted, open-source equivalents, Whisper,
Tesseract, Coqui TTS, once usage outgrows the AWS free tier, keeping cost
flat rather than letting it scale with adoption.

A realistic rollout begins with a handful of villages in a single
district, using the existing crowd-report flow and the Agmarknet baseline
as the cold-start fallback. Once a district sustains enough regular
reporters to keep its data fresh, expansion proceeds district by
district, since recommendation quality depends on reporting density, not
installation count.

## Social impact

A farmer who cannot tell whether today's offer is fair is at a structural
disadvantage against a buyer who can, and Fair Offer Check closes that
exact gap in real time, in the farmer's own language, at the moment it
matters. A five to ten percent improvement in sale timing, or in catching
a lowball offer before accepting it, is a reasonable estimate of the
stakes given typical day-to-day mandi price movement (a projection from
market conditions, not yet a measured pilot result). Sell Together goes
further than a passive suggestion: the moment real oversupply is detected
nearby, its "Share to coordinate" button hands the farmer a real,
pre-filled bilingual WhatsApp message ready to send to a group, turning a
data signal into coordinated action within seconds, a genuine step toward
the bargaining leverage an organised cooperative already has.

## Scope, stated plainly

This is a working demonstration of the central idea, hyperlocal crowd
data converted into a same-day, bilingual selling decision, and the parts
that are hardest to fake, the geo-scoring math, the real OCR pipeline, the
live regression, the bilingual UX, are built and running, not mocked. It
is not yet a finished production system, and every simulated piece uses
free, zero-setup browser APIs specifically so the entire flow can be
tested end to end without an API key or a backend, with a named,
budgeted replacement for each one on the roadmap. The repository's README
carries the same real-versus-simulated breakdown, alongside instructions
for running the prototype locally.
