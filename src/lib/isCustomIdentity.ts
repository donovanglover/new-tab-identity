import { identityParts } from '@/lib/identityParts'
import { isAutoContainer } from '@/lib/isAutoContainer'

/** Whether a container name belongs to a custom identity created by the addon.
 *
 * Custom identities have no comma and keep a parenthesized relay hostname, unlike default
 * browser containers (e.g. "Personal"), which have neither.
 *
 * @param name Container name to check.
 * @returns Whether the name belongs to an addon-managed custom identity.
 */
export function isCustomIdentity (name: string): boolean {
  return !isAutoContainer(name) && identityParts(name).hostname !== undefined
}
