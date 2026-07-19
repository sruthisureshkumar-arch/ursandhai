// agmarknet-proxy.js — Cloudflare Worker
//
// STATUS: written for the record, not deployed. The live prototype
// (ur_sandhai_prototype.html / index.html) uses a static, dated Tamil Nadu
// mandi price snapshot baked directly into the BASELINE object instead of
// this proxy, for two honest reasons: government mandi price data refreshes
// about once a day, not continuously, so a live proxy buys less than it
// sounds like; and a new network dependency is a new way for a live demo to
// break in front of judges. This file is the production path — exactly how
// Ur Sandhai would pull live Agmarknet data safely once there's time to
// deploy and test it end to end.
//
// WHAT THIS SOLVES
// The data.gov.in Agmarknet API needs an API key. Calling it straight from
// browser JS would either expose that key in this repo's public source, or
// fail outright, since the API is widely reported not to return CORS
// headers permissive enough for direct browser fetches. This Worker sits in
// between: it holds the key server-side as a Cloudflare secret (never
// committed to git), calls the government API on the app's behalf, and
// returns just the price JSON with CORS headers a browser will accept.
//
// DEPLOY (not yet done for this submission)
//   1. npm install -g wrangler          (Cloudflare's CLI, free)
//   2. wrangler init                    (or use the dashboard's quick-create)
//   3. wrangler secret put AGMARKNET_API_KEY
//        — paste a free key from https://data.gov.in (Sign Up → My Account → API Keys)
//   4. wrangler deploy
//   5. In ur_sandhai_prototype.html, replace the static BASELINE object with
//      a fetch() to this Worker's URL, falling back to the current static
//      snapshot if the request fails — so a network hiccup during a demo
//      degrades gracefully instead of breaking the page.
//
// One exported handler, no framework, no build step: consistent with the
// rest of this project's zero-build approach.

// "Current Daily Price of Various Commodities" dataset on data.gov.in
const AGMARKNET_RESOURCE_ID = "9ef84268-d588-465a-a308-a864a43d0070";

// Lock this to the real GitHub Pages origin once deployed, instead of "*".
const ALLOWED_ORIGIN = "https://sruthisureshkumar-arch.github.io";

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders() });
    }

    const url = new URL(request.url);
    const state = url.searchParams.get("state") || "Tamil Nadu";
    const commodity = url.searchParams.get("commodity") || "";
    const limit = url.searchParams.get("limit") || "50";

    if (!env.AGMARKNET_API_KEY) {
      return json(
        { error: "Server is missing AGMARKNET_API_KEY. Set it with `wrangler secret put AGMARKNET_API_KEY`." },
        500
      );
    }

    const upstream = new URL(`https://api.data.gov.in/resource/${AGMARKNET_RESOURCE_ID}`);
    upstream.searchParams.set("api-key", env.AGMARKNET_API_KEY);
    upstream.searchParams.set("format", "json");
    upstream.searchParams.set("limit", limit);
    upstream.searchParams.set("filters[state]", state);
    if (commodity) upstream.searchParams.set("filters[commodity]", commodity);

    try {
      const res = await fetch(upstream.toString());
      if (!res.ok) {
        return json({ error: `Agmarknet upstream returned ${res.status}` }, 502);
      }
      const data = await res.json();
      // Cache for an hour at the edge — the source data itself only
      // refreshes about once a day, so there's no benefit to hitting the
      // government API more often than that.
      return json(data, 200, { "Cache-Control": "public, max-age=3600" });
    } catch (err) {
      return json({ error: "Could not reach the Agmarknet API.", detail: String(err) }, 502);
    }
  },
};

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function json(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders(), ...extraHeaders },
  });
}
