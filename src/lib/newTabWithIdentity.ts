/** Open a new tab in an existing contextual identity.
 *
 * @param identity Identity to open the tab in.
 * @param url URL to open.
 * @returns The created tab.
 */
export async function newTabWithIdentity (identity: browser.contextualIdentities.ContextualIdentity, url = 'https://am.i.mullvad.net/connected'): Promise<browser.tabs.Tab> {
  return browser.tabs.create({
    url,
    cookieStoreId: identity.cookieStoreId
  })
}
