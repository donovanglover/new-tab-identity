/** Convert an ISO 3166-1 alpha-2 country code to its emoji flag.
 *
 * @param code Two-letter country code, case-insensitive.
 * @returns The flag emoji, or an empty string if the code is not two letters.
 */
export function countryFlag (code: string): string {
  if (code.length !== 2) {
    return ''
  }

  return [...code.toUpperCase()].map(char => String.fromCodePoint(char.charCodeAt(0) + 127397)).join('')
}
