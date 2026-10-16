/** Open a new tab in an existing contextual identity.
 *
 * @param identity Identity to open the tab in.
 * @returns The created tab.
 */
export async function newTabWithIdentity (identity: browser.contextualIdentities.ContextualIdentity): Promise<browser.tabs.Tab> {
  return browser.tabs.create({
    url: 'https://am.i.mullvad.net/connected',
    cookieStoreId: identity.cookieStoreId
  })
}
