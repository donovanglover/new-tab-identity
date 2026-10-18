/** Validate and normalize a user-provided new tab URL.
 *
 * URLs without a scheme are treated as https, and only http and https are allowed.
 *
 * @param input URL typed by the user.
 * @returns The normalized URL, or undefined when empty or invalid.
 */
export function sanitizeNewTabUrl(input: string): string | undefined {
  const trimmed = input.trim()

  if (trimmed === '') {
    return undefined
  }

  const candidate = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`

  let url: URL

  try {
    url = new URL(candidate)
  } catch {
    return undefined
  }

  return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : undefined
}
