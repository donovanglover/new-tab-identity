import type { IMullvadServerWireguard } from '@/types/MullvadServer'
import type { StoredLocation } from '@/types/StorageAll'

/** Whether a server belongs to the configured location.
 *
 * When no location is configured every server matches. A city without a
 * country never matches, so an incomplete configuration fails closed.
 *
 * @param server Server to check.
 * @param country Configured country, or `null` when any country is allowed.
 * @param city Configured city, or `null` when any city is allowed.
 * @returns Whether the server can be used for the configured location.
 */
export function serverInLocation(
  server: IMullvadServerWireguard,
  country: StoredLocation | null,
  city: StoredLocation | null,
): boolean {
  if (country === null) {
    return city === null
  }

  if (server.country_code !== country.code) {
    return false
  }

  return city === null || server.city_code === city.code
}
