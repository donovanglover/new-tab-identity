export interface IdentityColorOption {
  color: string
  colorCode: string
}

export interface IdentityIconOption {
  icon: string
  iconUrl: string
}

export interface IdentityAppearanceOptions {
  colors: IdentityColorOption[]
  icons: IdentityIconOption[]
}

export interface IdentityAppearanceChange {
  color?: string
  icon?: string
}

interface SupportedIdentityAppearanceApi {
  getSupportedColors: () => Promise<IdentityColorOption[]>
  getSupportedIcons: () => Promise<IdentityIconOption[]>
}

/** Retrieve the colors and icons Firefox supports for contextual identities.
 *
 * @returns The supported colors with their hex codes, and icons with their URLs.
 */
export async function getIdentityAppearanceOptions(): Promise<IdentityAppearanceOptions> {
  const api = browser.contextualIdentities as typeof browser.contextualIdentities &
    SupportedIdentityAppearanceApi
  const [colors, icons] = await Promise.all([api.getSupportedColors(), api.getSupportedIcons()])

  return { colors, icons }
}
