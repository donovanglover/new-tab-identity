/** Split a container name into its custom part and relay hostname.
 *
 * Names are generated as `"{custom} ({hostname})"` or `"City, Country (hostname)"`.
 *
 * @param name Container name to split.
 * @returns The custom part and the hostname, which is `undefined` when the name has no parenthesized part.
 */
export function identityParts (name: string): { custom: string, hostname: string | undefined } {
  const match = /\(([^)]+)\)/.exec(name)

  if (match === null) {
    return {
      custom: name.trim(),
      hostname: undefined
    }
  }

  return {
    custom: name.slice(0, match.index).trim(),
    hostname: match[1]
  }
}
