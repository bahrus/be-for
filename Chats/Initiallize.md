# Initialize

## Bruce's Ask

To tie up loose ends, I asked for [Claude's input](../../git-in/Chats/NameForPackage.md) as something to generalize on [gist-in](../../git-in/).

I decided to reuse a deprecated package I created a while ago called "be-for".

I've updated the README.md to reflect how I see this working.  Note that there are some significant differences with how gist-in worked.  It's unclear to me if fifteenth page is helpful or not still (maybe it is).

I added a link to the README.md to an [important link](https://github.com/WICG/declarative-partial-updates/blob/main/fragment-include-explainer.md) that I recommend becoming familiar with first.  Notice that proposal has attributes like "buffer" "sanitize" which I would like us to piggy back on.  I did not update the README.md to reflect that.  Please add your thoughts on how we could do this without losing the functionality of pipe-in (and gist-in).

Please add your thoughts / feedback / concerns / clarifications needed first below before proceeding with implementation.

## Claude's Thoughts

I read the explainer before writing any of this up — it's short but precise
about attribute names/semantics, worth quoting exactly since the details
matter for the mapping below:

> **`for`** — omitted (inert), `for=""`, or `for="target-name"`: whether/where
> the template is active.
> **`src`** — a URL; when present the template fetches its payload over the
> network instead of using inline content.
> **`buffer`** (boolean) — absent (default): streaming, content is
> progressively parsed and inserted into the live DOM as chunks arrive.
> Present: the browser parses fully into the template's own `content`
> fragment, then clones and inserts it **once**, atomically.
> **`sanitize`** — omitted or `sanitize=""`: sanitized by default when `src`
> is present (opposite default for inline content). `sanitize="unsafe"` opts
> out.
> Also: `nonce`, `crossorigin`, `referrerpolicy` (standard subresource
> attributes), `<?start name>`/`<?end>`/`<?marker name>` PI syntax for
> targeting, and a proposed CSP `fragment-src` directive.

### 1. `src` + `be-for="…"` (≈ the proposal's `for`) — you already got this right

I didn't understand the attribute-role swap versus `gist-in` until I read the
explainer: the real proposal's targeting attribute is **`for`**, and
`be-for`'s own name is a pun on that — it's a polyfill *for* the `for`
attribute, the same way `pipe-in` polyfills streaming. So `be-for="options"`
being the marker name (not the URL) isn't a break from the family convention,
it's you already anticipating the spec's actual shape. Good — no notes here,
just flagging that I now see why it's structured this way, since it wasn't
obvious from the README prose alone.

### 2. `buffer` maps cleanly onto a split that already exists in the code — recommend defaulting the *opposite* way the spec does, for a concrete reason

This is the good news: `buffer`'s two modes aren't a new thing to build, they're names for two things you already have:

- **`buffer` absent (streaming)** → `pipe-in.js`'s own `hydrate()` — real
  `TransformStream` chunk piping into `target.streamHTML()` etc., with the
  `aria-busy`/`[base]-state` loading→streaming→complete progression.
- **`buffer` present** → exactly what `fetch-and-set.js` + `gist-in.js`
  already do — fetch fully, sanitize into a detached scratch element via the
  real, shipping `setHTML`/`setHTMLUnsafe`, insert once.

**Concern:** `fetch-and-set.js`'s own doc comment says `pipe-in.js`'s
`streamHTML`-family methods were checked against a real, current browser
(Chrome/153) and **don't exist anywhere yet** — only `setHTML`/`setHTMLUnsafe`
(the Sanitizer API) are real today. The spec defaults to streaming
(`buffer` absent). If `be-for` follows that default, the common case silently
no-ops in every real browser until `streamHTML` ships somewhere. I'd default
`be-for` to the buffered/one-shot path regardless of what the spec defaults
to, document it as a deliberate, temporary, browser-support-driven deviation,
and revisit the default once streaming is real. Both modes are worth
implementing (the streaming one costs little given `pipe-in.js` already
exists), just not as the default yet.

### 3. `sanitize` — rename `be-for`'s own surface, but leave `pipe-in`'s alone

`pipe-in`'s `[base]-method` conflates two independent things: *safety*
(`streamHTML` vs `streamHTMLUnsafe`) and *position relative to the enhanced
element itself* (replace/before/prepend/append/after) — a concept the
`for`/marker model has no equivalent of at all (position is just "wherever
the matched marker/range is"). So I don't think `pipe-in` itself should change
its own attribute grammar to match the spec — it's a more general "stream a
URL into *myself*" tool the spec doesn't fully cover, and `[base]-method`
earns its complexity there. Only `be-for`, whose insertion model is
marker-based like the spec's, should speak the spec's plain
`sanitize` / `sanitize="unsafe"` boolean — internally translating to
`unsafe: true` for `fetchAndSet`/`setInto`, same as today's
`be-for-method="setHTMLUnsafe"`. Net effect: `be-for`'s own attribute count
goes *down* (one boolean instead of a 12-value method enum), and `pipe-in`
loses nothing.

### 4. Is `fifteenth` still helpful? Yes — but I'd narrow its job, not keep it as-is

Today (`gist-in.js:71-106`) the split is by *source*: a `gist://` URL calls
`fifteenth`'s `get()` (whole-value, one-shot, no streaming notion at all);
everything else calls `fetch-and-set.js`'s `fetchText()` (a real, plain
fetch). That means a gist source is *permanently* locked into the one-shot
path — it could never stream even once `streamHTML` is real, and it can never
use `readVia:'api'` (the fresher, read-your-own-write path from the
`fifteenth`/`be-persistent` chats) because `get()` doesn't expose that choice
to a caller who only wants the URL.

What I'd rather see `fifteenth` do here: **resolve an address, not perform
the fetch.** For `gist://…`/`githubpages://…` in `src`, ask `fifteenth` for
the real `https://` URL it would have fetched (its already-built raw-form /
`readVia` / owner-repo-path logic — this part is pure string logic, no
network), plus an `Authorization` header when the target is private (via the
`getToken` hooks both protocols already have — note this only ever applies to
an `api.github.com`-resolved URL; `raw.githubusercontent.com` rejects
`Authorization` outright at the CORS-preflight level, confirmed in the
`fifteenth` chat). Hand that resolved URL(+header) to the *same* fetch path
everything else uses — `pipe-in`'s streaming fetch or `fetchAndSet`,
whichever `buffer` selects — instead of forking. That gets gist/githubpages
sources the same `buffer` choice and the same private-content support as any
other source, instead of a permanently separate, more limited code path.

**Concern / real gap this exposes:** neither piece exists today.
`gist.ts`/`githubpages.ts` only expose "fetch and return the value," not
"resolve and tell me the URL + header without fetching" — that's a small but
real new export on the `fifteenth` side. And `pipe-in.js`'s own `fetch()` call
(`pipe-in.js:146`) takes no headers at all today, so private-content auth
can't reach it yet regardless. Neither is hard, but both are scoped work items
I don't want to gloss over.

**Given `streamHTML` doesn't exist in real browsers yet anyway** (point 2),
there's a cheaper interim option: keep `gist-in.js`'s existing pattern (call
`get()` directly) for the `buffer`-present/one-shot path *only* — proven code,
ships today — and defer the "resolve-without-fetching" work until the
streaming path is worth building for real. Which of these do you want: the
fuller unification now, or the cheaper reuse-what-already-works version, with
unification revisited once streaming actually ships?

### 5. Security gate: was dropping the `gist://`-trusted-by-construction rule intentional?

`gist-in`'s README security list had three trust categories; `be-for`'s has
two — the third (a `gist://` USL is trusted because its real destination is
always the fixed `gist.githubusercontent.com` host, never attacker-steerable)
is gone. If that's deliberate — `src` going forward only ever takes a literal
URL or an import-map bare specifier, never a raw `gist://`/`githubpages://`
string — say so and I'll leave it out. If it was just lost in adapting the
README, I'd restore it and extend it to `githubpages://` (equally
fixed-host — always `api.github.com` / `raw.githubusercontent.com` /
`<owner>.github.io`, never attacker-influenced by the owner/path text),
otherwise a `fifteenth`-resolved URL from point 4 would need to *also* fake an
import-map entry just to clear the trust gate, which seems like friction you
don't want.

### Two small things, not questions

- The prose right after the flagship example still explains "why the URL
  above is a `gist://` USL" — but the code block above it no longer uses one
  (it uses the bare-specifier-via-importmap form now). Leftover from the
  gist-in→be-for pass; worth a fix once the design settles, not urgent.
- `package.json` is still the *original* deprecated `be-for` (a 2023-era
  "inline formula evaluation" tool — `trans-render`, `xtal-element`,
  `be-enhanced`, none of which exist in the current stack). It'll need a full
  rewrite to the modern shape (`assign-gingerly`, `be-hive`, `mount-observer`,
  `pipe-in`, `fifteenth`, `roundabout-lib`) before anything can actually run —
  flagging so it's not a surprise mid-implementation, not asking anything.

### Summary of what I need from you

1. Fuller `fifteenth`-resolves-address unification now, or reuse `gist-in`'s
   existing `get()`-based one-shot pattern and defer unification until
   streaming is real (point 4)?
2. Keep (and extend to `githubpages://`) the USL-trusted-by-construction
   security-gate rule, or is relying purely on import-map bare specifiers for
   `src` the intended direction now (point 5)?
3. Anything about the `buffer`-defaults-opposite-the-spec call (point 2) you'd
   push back on?