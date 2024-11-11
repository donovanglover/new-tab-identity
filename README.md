# New Tab Identity

Browse the web from multiple VPN locations simultaneously. Goes well with [Librewolf](https://librewolf.net/).

> NOTE: There is a bug in Firefox versions 129, 130, and 131 that leaks DNS requests. [This is fixed in Firefox 132](https://bugzilla.mozilla.org/show_bug.cgi?id=1910593). If you are using an older version, you should set `network.dns.native_https_query` to `false` to avoid DNS leaks.

## Features

- Open new container tabs with different VPN locations.
- Visit the same website with different VPN locations.

### Supported Providers

- [Mullvad VPN](https://mullvad.net)

## Installation

1. `git clone https://github.com/donovanglover/new-tab-identity && cd new-tab-identity`
2. `npm ci && npm run build`
3. Go to `about:addons`, press the gear icon on the right and press "Install Add-on From File..."

## Usage

1. Use the extension popup to create new identities and delete old ones.
2. Right click on links to open them with an unused random location.
3. For everything else, use the built-in containers functionality to open new tabs in existing containers.

## Contributing

Run `npm ci` to do a clean install and use the `lint` and `test` scripts to check your work.

## Todo

- [x] Add button to delete containers that don't have associated tabs
- [x] Remove `overflow-y: scroll;` from popup
- [x] Cycle between country locations by default
- [ ] Add options button that opens dialog in react view OR include options at bottom?
- [ ] Add option to cycle between city locations
- [ ] Don't auto-delete containers if user renames them
- [ ] Don't auto-delete containers that aren't managed by the addon?
- [ ] Make it easier for users to rename containers?
- [ ] Warn user if current container is no longer in the list of servers (offline or removed) and therefore can't be proxied
- [ ] Write logic so it's possible to switch the proxy of an existing container with `browser.contextualIdentities.update()`
- [ ] Add option to customize new tab (`about:blank`, mullvad status, etc.)
- [ ] Add option to customize colors
- [ ] Add option to customize icons
- [ ] Add option to customize container name format
- [ ] Add option to customize context menu
