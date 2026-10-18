# AGENTS.md

Firefox-only MV2 WebExtension: container tabs are routed through random Mullvad WireGuard
SOCKS5 relays. React popup + background script bundled by Vite.

## Commands

- `npm ci` — `@donovanglover/base16-tailwind` resolves from JSR via `.npmrc`.
- `npm test` — Vitest. Coverage is always on with 100% thresholds for `lib/**`, `components/**`,
  and `types/**`, so new code there needs tests or the suite fails.
- `npm run lint` — `oxlint` → `npm run build` → `web-ext lint` on `dist/`.
- `npm run build` — Vite build + `web-ext build` into `dist/`.
- `npm run dev` is only a watch-mode build (no dev server); launch the extension separately with
  `npm start` (`web-ext run` against `dist/`).

## Architecture

- Vite root is `src/`; `src/public/` is copied verbatim to `dist/`. Entrypoints: `src/background.ts`
  and `src/index.html` → `src/app/layout.tsx` → `src/app/page.tsx`.
- Container names created by `lib/newTabWithServer.ts` are parsed by `background.ts` to derive the
  proxy host; changing the `"City, Country (hostname)"` format breaks proxying.
- `@/` maps to `src/` in `vite.config.ts` and `tsconfig.json`; Vitest config lives in
  `vite.config.ts` and tests mirror `src/` under `tests/`.
- Browser API types come from `@types/firefox-webext-browser`; tests stub the global with
  `vi.stubGlobal('browser', ...)`.
- Firefox clamps browser-action popups to 800×600; the wrapper in `src/app/layout.tsx` is capped
  at that size and taller content scrolls.

## Business logic

- `storage.sync.country` / `city` hold `{ code, name } | null`; `city` requires `country`.
  `null` / `null` means any location.
- Grid clicks, the identity name button, Enter, and the footer open button default to
  `about:newtab`, which is opened by omitting `url` in `tabs.create`.
  `storage.local.identityUrls` maps `cookieStoreId` to a per-identity override used by the footer
  open button; the context menu always opens the clicked link/page instead. Inputs without a
  scheme get https prepended, and only http(s) URLs are accepted (`lib/sanitizeNewTabUrl.ts`).
  Entries are removed with their identity; orphaned keys are not pruned, like `used`.
- The popup is the only settings UI: one `<select>` whose value encodes the scope —
  `""` (any), `"de"` (country), `"de:ber"` (city). Country options show flags; city options use
  a `— ` prefix and appear only for countries with more than one city.
- A configured location missing from the server list stays selected in the dropdown and is
  not reset automatically.
- The context menu title shows the city name if set, otherwise the country name; it is rebuilt
  on `storage.onChanged` for `country`, `city`, and `servers`.
- When the configured location has no servers in the stored list, the menu item is disabled
  and the click handler does nothing. The setting is never substituted or auto-cleared.
- Picking (`lib/nextUnusedServer.ts`): choose a random unused location, then a random relay
  within it. When all locations in the pool have been used, they become available again.
- Dedupe unit follows scope: any/country dedupes city keys (`{country_code}-{city_code}`);
  a specific city dedupes relay hostnames.
- `storage.local.used` entries are not freed when containers/tabs are deleted and stale keys are
  not pruned; only exhaustion removes keys, and only those in the current pool. When `usedAt` is
  more than 1 hour old, `used` is treated as empty on the next pick.
- Context menu picks are serialized through `contextMenuQueue`.
- Popup grid buttons are explicit one-off opens (uniform random within the clicked
  country/city) and do not touch the ledger. The identity name button and Enter open with the
  configured location using the `used` ledger, deduping by city key (any/country) or relay
  hostname (specific city); an empty pool shows an error toast.
- `newTabWithServer` accepts an optional custom identity name: the container is named
  `{name} ({hostname})`. Names are stripped of parentheses and commas, trimmed, and capped at
  20 characters; an empty result falls back to the generated format. Custom names contain no
  comma, so the delete button keeps them. The popup input applies the same sanitation live while
  typing but does not trim, so trailing spaces survive between keystrokes; names are trimmed when
  the container is created or renamed. The typed name is used by grid clicks, the identity name
  button, and Enter.
- The delete button only removes containers whose name matches the generated `City, Country
(hostname)` format; renamed containers and containers created outside the addon are kept.
- The popup shows `{custom} Custom, {random} Random ({unused} unused)` under the title; a custom
  identity has no comma and a parenthesized hostname, and an unused identity is a random one with
  no open tabs and no in-progress or interrupted downloads. Containers without a hostname (e.g.
  default browser containers) are ignored.
- Custom identities are listed in the popup footer. Renaming updates only the custom part and
  always preserves the `(hostname)` suffix; delete is disabled while the identity has open tabs
  or in-progress or interrupted downloads, and the open button starts a new tab in that identity
  and closes the popup.
- Each custom identity row starts with a button showing the container's real icon masked in its
  real color. It opens a picker for both color and icon; changes call
  `contextualIdentities.update` and keep the other property untouched. Options come from
  `getSupportedColors()` / `getSupportedIcons()`; the minimum Firefox version is 153.
- Each custom identity row has a city select; choosing a city re-points the identity to a random
  relay in it by rewriting the `(hostname)` suffix, changing the proxy for the container's
  subsequent requests.
- `fetchMullvad()` returns active WireGuard relays only, shuffled; the list refreshes when
  older than 1 hour (background) or 60 seconds (popup button).
- `blockDefault` makes the default profile blackhole requests instead of going direct.

## Design Decisions

- Container colors and icons are intentionally random; there is no customization. Random colors
  become familiar over time, while choosing would only add a decision with no benefit.
- The country grid order is intentionally random: it reshuffles when the server list refreshes, so
  no country is always first. Alphabetical order would bias picking toward early entries;
  `<select>` dropdowns are alphabetical only for scannability.
- Cleanup is manual because custom identities are managed in the popup, where they are listed and
  can be renamed, deleted, or changed to a different server.

## Conventions

- No semicolons, single quotes, space before function parens (`function foo ()`); JSDoc on exported
  lib functions.
- Form controls use visible labels above the control.
- Tailwind uses the base16 palette (`bg-100`, `text-700`, `base16-selenized-black`), not default
  Tailwind colors.
