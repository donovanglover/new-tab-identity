import { t, tCount } from '@/lib/i18n'
import { isAutoContainer } from '@/lib/isAutoContainer'
import { isCustomIdentity } from '@/lib/isCustomIdentity'

export interface IdentityCounts {
  custom: number
  random: number
  unused: number
}

/** Count custom and random identities, and how many random ones are unused.
 *
 * A container is custom when its name has no comma and a parenthesized hostname, matching the
 * popup's custom identity list. Random containers are unused when no open tab uses their cookie
 * store. Containers that are neither (e.g. default browser containers) are ignored.
 *
 * @param containers Contextual identities to count.
 * @param usedCookieStoreIds Cookie store ids of containers with at least one open tab.
 * @returns Counts of custom, random, and unused random identities.
 */
export function countIdentities(
  containers: Pick<browser.contextualIdentities.ContextualIdentity, 'name' | 'cookieStoreId'>[],
  usedCookieStoreIds: Set<string>,
): IdentityCounts {
  const counts: IdentityCounts = {
    custom: 0,
    random: 0,
    unused: 0,
  }

  for (const container of containers) {
    if (isAutoContainer(container.name)) {
      counts.random++

      if (!usedCookieStoreIds.has(container.cookieStoreId)) {
        counts.unused++
      }
    } else if (isCustomIdentity(container.name)) {
      counts.custom++
    }
  }

  return counts
}

/** Format identity counts for display in the popup.
 *
 * @param counts Counts returned by countIdentities().
 * @returns A localized summary such as "5 Custom, 40 Random (38 unused)".
 */
export function formatIdentityCounts(counts: IdentityCounts): string {
  return t('identityCounts', [
    tCount('identityCountsCustom', counts.custom),
    tCount('identityCountsRandom', counts.random),
    tCount('identityCountsUnused', counts.unused),
  ])
}
