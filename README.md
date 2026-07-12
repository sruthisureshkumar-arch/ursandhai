# Ur Sandhai — prototype

A working prototype for **Ur Sandhai** ("our marketplace"), a hyperlocal, crowd-sourced
market intelligence app for smallholder farmers, built for the *AI for Bharat* hackathon
(Agriculture & Rural Livelihoods track).

## What this is

A single-file, self-contained web prototype (`index.html`) — open it directly in a browser,
no build step, no server required.

**What's real:**
- Haversine-based 10km geo-radius filtering of crowd-sourced reports
- Time-bucketed price analysis to surface the best-selling window of the day
- Crop priority scoring (price level, demand signal, local supply pressure)
- Automatic fallback to a government (Agmarknet-style) baseline price when local
  crowd data is too sparse
- A live SVG map plotting real bearing/distance from the farmer's location
- Bilingual (English + Tamil) recommendation output

**What's currently stood in for** (clearly labeled in the UI), pending an AWS account:
- Voice capture uses the browser's free Web Speech API instead of Amazon Transcribe + Comprehend
- "Read aloud" uses the browser's free speech synthesis instead of Amazon Polly
- Crop photo recognition is a dropdown instead of Amazon Rekognition

See the in-app note at the bottom of the recommendation panel for the intended production
architecture (Transcribe, Comprehend, Rekognition, Textract, Polly, Prophet + scikit-learn,
Agmarknet via data.gov.in).

## Running it

Just open `index.html` in Chrome. Voice input and Tamil text-to-speech need microphone
permission and work best when the file is opened as a real local file (not embedded in an
iframe).

## Roadmap

- Wire in real AWS calls (Transcribe, Rekognition, Textract, Polly) behind the same
  interfaces this prototype already uses
- Add the buyer-reputation Google Maps link
- Move recommendation scoring to a proper backend with persistent storage (Supabase/Postgres)
- Swap the simple time-bucket average for a Prophet/scikit-learn forecasting model
