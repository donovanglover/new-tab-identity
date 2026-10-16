import { isAutoContainer } from '@/lib/isAutoContainer'

export interface IdentityCounts {
  custom: number
  random: number
  unused: number
}

/** Count custom and random identities, and how many random ones are unused.
 *
 * A container is custom when its name has no comma, matching the delete button's keep rule.
 * Random containers are unused when no open tab uses their cookie store.
 *
 * @param containers Contextual identities to count.
 * @param usedCookieStoreIds Cookie store ids of containers with at least one open tab.
 * @returns Counts of custom, random, and unused random identities.
 */
export function countIdentities (containers: Pick<browser.contextualIdentities.ContextualIdentity, 'name' | 'cookieStoreId'>[], usedCookieStoreIds: Set<string>): IdentityCounts {
  const counts: IdentityCounts = {
    custom: 0,
    random: 0,
    unused: 0
  }

  for (const container of containers) {
    if (isAutoContainer(container.name)) {
      counts.random++

      if (!usedCookieStoreIds.has(container.cookieStoreId)) {
        counts.unused++
      }
    } else {
      counts.custom++
    }
  }

  return counts
}

/** Format identity counts for display in the popup.
 *
 * @param counts Counts returned by countIdentities().
 * @returns A summary such as "5 Custom, 40 Random (38 unused)".
 */
export function formatIdentityCounts (counts: IdentityCounts): string {
  return `${counts.custom} Custom, ${counts.random} Random (${counts.unused} unused)`
}
