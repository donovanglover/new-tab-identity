# New Tab Identity

Browse the web from multiple VPN locations simultaneously. Goes well with [Librewolf](https://librewolf.net/).

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

Use the extension popup to create new identities and delete old ones.

## Contributing

Run `npm ci` to do a clean install and use the `lint` and `test` scripts to check your work.

## Todo

- [x] Warn when trying to delete an identity/container that has active tabs
  - There is now a button that only deletes containers that don't have associated tabs
- [x] Remove overflow-y-scroll
- [x] Cycle between locations for a certain country/city
- [ ] Warn user if current container is no longer in the list of servers (offline or removed) and therefore can't be proxied
- [ ] Write logic so it's possible to switch the proxy of an existing container with `browser.contextualIdentities.update()`
