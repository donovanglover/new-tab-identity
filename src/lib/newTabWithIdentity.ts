/** Open a new tab in an existing contextual identity.
 *
 * Firefox rejects `about:newtab` when passed explicitly, so omitting the URL
 * opens the new tab page.
 *
 * @param identity Identity to open the tab in.
 * @param url URL to open; omit to open the new tab page.
 * @returns The created tab.
 */
export async function newTabWithIdentity (identity: browser.contextualIdentities.ContextualIdentity, url?: string): Promise<browser.tabs.Tab> {
  if (url === undefined) {
    return browser.tabs.create({
      cookieStoreId: identity.cookieStoreId
    })
  }

  return browser.tabs.create({
    url,
    cookieStoreId: identity.cookieStoreId
  })
}
