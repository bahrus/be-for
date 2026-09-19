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

## Bruce's Response I

One possible correction:  I think we established in other chats that streamHTML does exist in Chrome Canary with flags set, the flags pictured in the README.md.  But I have verified that the proposal I linked to, which allows for client side includes via attributes, is not yet even in Chrome Canary, nor can I find a roadmap for when it will be.

I realize, with the help of your feedback, that my proposal / README.md suffered from at least one fatal flaw, and that it is also suffers from a vague sense of purpose.

You raised the prospect that be-for could serve as a polyfill for the linked proposal.  I reread the proposal, carefully this time, and I think it would be quite difficult to polyfill certain pieces of it -- in particular the mutation observer enhancements, the fragment-src CSP level protections for specifying allowed domains to pull from, without which having a sanitize=unsafe attribute is probably not viable.

What I was thinking more vaguely is that be-for would provide some value-add on top of this standard, and utilize it as much as possible as it rolls out (eliminating no longer needed code by setting the attributes dynamically), still providing some value-add and until it rolls out, serving as a  kind of shoddy polyfill, probably too different from the proposal to call it a proper polyfill.

For now, I think we need to rest on the importmap / relative path security checks that pipe-in relies on (hopefully).

The fatal flaw is that, based on the specs, should the browser start implementing it:

```html
<template 
    src=bahrus/3c9ed8541984b8cd38bc848edacf741a/raw/96ff1c5eb7234a0c68d824ab76ca9be54b29300b/test.html 
    be-for="options" 
    be-for-method="setHTMLUnsafe"
    be-for-hint="body select"
    be-for-edit-protocol=gist
>
    ...the contents of the link
</template>
<a href="urlToEditGist">Edit test.html</a>
```

would be problematic.  The browser wouldn't see the "for" attribute, and think that in needs to start streaming the url before the template element.  So this "polyfill" wouldn't be forward compatible at all.

I'm thinking pipe-in should acquire a new attribute, pipe-in-for, that can target a processing instruction comment.  And the associated hint.  So it becomes a shoddy polyfill for the proposal.

So the value add that be-for provides is simply being able to take some string that represents a resource, and manipulate it so that url that is streamed or buffered in is the raw or api or the page url, and it takes care of setting pipe-in's url to the proper value and creating the proper edit link.  What are your thoughts.

## Claude's Response

Your fatal-flaw read is right, and sharper than I gave it credit for — I went
back to the explainer specifically checking whether `src` is gated by `for`
at all, and it's explicit:

> "An HTML `<template>` is active if it has a `for` attribute, a `src`
> attribute, **or both**."

> "**In-place Include (empty `for=""` / `for` omitted)**: Inserts the content
> in-place at the template's position in the HTML stream."

So `src` alone activates it, `for` being entirely absent doesn't mean inert —
it means *in-place*. A future browser that ships even a first slice of this
would take your `<template src=… be-for="options">` and splice the fetched
content in at the template's own spot, at the bottom of the page, ignoring
`be-for` entirely (it doesn't know that attribute exists) — the opposite of
what you want. I owe you a correction on my own point 1 last message: I said
"no notes here" on `src` + `be-for`; I hadn't checked this interaction and
should have. Good catch. Also confirmed for you: the explainer has **zero**
discussion of non-supporting-browser behavior or a polyfill path — this is
early enough that there's nothing to lean on there.

### The pivot is right, and it's a real simplification, not just a workaround

Pushing marker-targeting (`pipe-in-for` + hint) down into `pipe-in` itself,
and narrowing `be-for` to "resolve a reference → configure pipe-in's real
attributes → build the edit link," is better than what `gist-in` does today,
independent of the forward-compat problem:

- `gist-in.js` currently **duplicates** `pipe-in`'s job — it has its own
  `#findMarker`, its own fetch (`fetchText`/`get()`), its own
  sanitize-and-splice (`setInto`). Two implementations of "fetch, sanitize,
  insert." Your pivot collapses that to one: `pipe-in` gains marker-targeting,
  `gist-in`'s `#findMarker`/`replaceWith` logic moves *into* `pipe-in.js`, and
  `be-for` stops touching the DOM at all.
- It also resolves my own open "should `buffer` default to true or false"
  question from last message — there's no real choice left to make. A
  `<?marker>` PI node has no live streaming sink (you can't call
  `.streamHTML()` on a comment), so **`pipe-in-for` targeting is inherently
  the one-shot path** — fetch fully, sanitize into a detached scratch element,
  splice in once. That's exactly `fetch-and-set.js`'s existing
  `fetchText`/`setInto`, so `pipe-in.js` internally calling *its own*
  `fetch-and-set.js` for the `pipe-in-for` case (instead of `gist-in`
  importing it separately) is the natural implementation — reuse, not new
  code. Self-targeting keeps real streaming exactly as it works today.
  `sanitize`/`buffer` as *be-for's own* attributes mostly evaporate; they were
  standing in for a choice that turns out not to exist once targeting a
  marker implies one-shot.
- This also matches your own framing better than "polyfill" ever did:
  `pipe-in` is the "shoddy, evolving stand-in for the platform primitive" (as
  it already was for streaming) — `be-for` is a value-add layer *above* it
  that never tries to reimplement platform mechanics (mutation observation,
  `fragment-src` CSP) at all. That's a real answer to "vague sense of
  purpose": be-for's purpose is now exactly one sentence — turn a reference to
  a git-hosted resource into the right `pipe-in`/`pipe-in-for` attributes plus
  an edit link.

### Two things this pivot exposes that need a decision

**1. The security gate has to move too, and needs one new allowlist.**
Once `be-for` resolves `githubpages://bahrus/…` down to a literal
`https://raw.githubusercontent.com/…` (or `api.github.com`/`.github.io`) URL
and does `enhancedElement.setAttribute('pipe-in', resolvedUrl)`, that's now
indistinguishable — as far as `pipe-in.js`'s own `isOverrideTrusted` is
concerned — from an author hand-typing that URL directly. Today that's a
**bare cross-origin `https://` URL**, which `pipe-in.js:65` explicitly refuses
the unsafe-method/custom-sanitizer override for. Your flagship example
(preserving `<option>`) needs that override. So either:
  - **(a)** `pipe-in.js`'s `isOverrideTrusted` grows a small pinned-host
    allowlist — `gist.githubusercontent.com`, `api.github.com`,
    `raw.githubusercontent.com`, `*.github.io` — the same "fixed,
    never-attacker-steerable host" reasoning `gist-in`'s original security
    section already used, just relocated from `gist-in`'s bespoke check into
    `pipe-in`'s shared one so *anyone* using `pipe-in-for` with a
    `be-for`-resolved URL benefits, not just `be-for` itself; or
  - **(b)** `be-for` requires/injects an import-map entry for the resolved
    host and sets `pipe-in` to a bare specifier instead of the literal URL, so
    it clears the *existing* import-map trust category with zero `pipe-in`
    changes.

  (a) is less machinery and generalizes past `be-for`; (b) needs no `pipe-in`
  change but pushes real complexity onto `be-for` (dynamically-injected import
  maps are shaky — browsers only reliably honor one, present before first use)
  or onto the page author (pre-declare the mapping themselves). I'd go with
  (a). This is also the direct resolution of the open question from my last
  message about the dropped `gist://`-trusted-by-construction rule — it
  wasn't a `be-for` README omission, it belongs one layer down now.

**2. Does setting `pipe-in`/`pipe-in-for` attributes dynamically actually get
picked up?** Checked rather than assumed: `mount-observer`'s
`MountObserver.ts` configures its `MutationObserver` with
`{childList: true, attributes: true, subtree: true}` and explicitly handles
`mutation.type === 'attributes'` by mounting newly-matching elements. So yes —
`be-for`'s `hydrate()` computing the resolved URL and calling
`enhancedElement.setAttribute('pipe-in', resolvedUrl)` (+ `pipe-in-for`, hint,
method) will be picked up by the same live-attribute machinery that already
lets `be-persistent`'s rules react to attribute changes. Confirmed, not just
hoped-for.

### One naming question I don't want to decide for you

For the `setHTML`/`setHTMLUnsafe` choice in `pipe-in-for` mode: should
`pipe-in` just grow those two as **more values of its existing
`[base]-method`** enum (meaningful only when `pipe-in-for` is present,
alongside the stream* ones), or should `be-for` expose its *own* simpler
convenience attribute (`be-for-unsafe`, or a `sanitize`-shaped one per the
spec's naming) that translates to the right `pipe-in-method` underneath? The
first keeps one vocabulary in one place; the second keeps `be-for`'s surface
closer to the spec's own naming, which was the original point of piggybacking
on it. Which do you want?

